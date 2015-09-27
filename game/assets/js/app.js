;(function() {
    "use strict"

    window.addEventListener('load', function () {
        new Game();
    });

    var Game = function () {
        var canvas = document.getElementById('canvas');
        this.screen = canvas.getContext('2d');

        var self = this;

        this.gameSize = {
            width:  canvas.width,
            height: canvas.height
        };

        this.block_height = this.gameSize.height / 15;   // 32px

        this.lives = 0;

        this.start_livecount = 3;

        this.level = 1;

        this.bodies = [];

        this.game_status = false;

        this.keyborder = new Keyborder();

        this.game_loop = function () {   

            if(self.isGameOver()) {
                console.log('Game Over');
                self.requestId = undefined;
                self.game_over();
                return;
            }

            self.update();
            self.draw(self.screen, self.gameSize);
            self.show_lives(self.screen);
            self.requestId = requestAnimationFrame(self.game_loop);
        };

        this.menu();

    };

    Game.prototype = {

        update: function() {

            if(this.isGameOver()){
                return;
            }

            for(var i = 0; i < this.bodies.length; i++ ) {
                this.bodies[i].update();
            }

            for(var i = 0; i < this.bodies.length - 1; i++) {
                for(var j = i+1; j < this.bodies.length; j++ ) {

                    if ( this.bodies[i] instanceof Player || this.bodies[j] instanceof Player ) {

                        if ( this.bodies[i] instanceof Wall ) {

                            if ( this.isCollided(this.bodies[i], this.bodies[j])) {

                                if ( this.bodies[i].speedX !== 0 || this.bodies[i].speedY !== 0) {

                                    this.lives--;
                                    this.restart_level();
                                    return;

                                } else {

                                    // if this is static wall, then replace player to old position
                                    this.bodies[j].position = JSON.parse(JSON.stringify(this.bodies[j].old_position));

                                }
                            }

                        } else if( this.bodies[j] instanceof Wall ) {

                            if ( this.isCollided(this.bodies[i], this.bodies[j])) {

                                if( this.bodies[j].speedX !== 0 || this.bodies[j].speedY !== 0) {

                                    this.lives--;
                                    this.restart_level();
                                    return;

                                } else {

                                    this.bodies[i].position = JSON.parse(JSON.stringify(this.bodies[i].old_position));

                                }
                            }
                        } 

                        if (this.bodies[i] instanceof Exit || this.bodies[j] instanceof Exit) {
                            if ( this.isCollided(this.bodies[i], this.bodies[j])) {

                                this.next_level();
                            }

                        }

                        // block connection of few players
                        if(this.bodies[i] instanceof Player && this.bodies[j] instanceof Player) {
                            if ( this.isCollided(this.bodies[i], this.bodies[j])) {
                                this.bodies[i].position = JSON.parse(JSON.stringify(this.bodies[i].old_position));
                                this.bodies[j].position = JSON.parse(JSON.stringify(this.bodies[j].old_position));
                            }
                        }
                    }
                }
            }

        },

        draw: function(screen, size) {

            if(this.isGameOver()){
                return;
            }

            screen.clearRect(0, 0, size.width, size.height);
            for(var i = 0; i < this.bodies.length; i++ ) {
                this.bodies[i].draw(screen);
            }            
        },

        addBody: function (body) {
            this.bodies.push(body);
        },

        isCollided: function (b1, b2) {
            return !(
                b1 === b2 ||
                b1.position.x + b1.size.width  <= b2.position.x  ||
                b1.position.y + b1.size.height <= b2.position.y  ||
                b1.position.x  >= b2.position.x + b2.size.width  ||
                b1.position.y  >= b2.position.y + b2.size.height
            );
        },

        menu: function () {  

            var self = this; 

            var screen = this.screen; 

            screen.font = '50px Monospace';
            // background
            screen.fillStyle = '#56E8BC';
            screen.fillRect(0, 0, this.gameSize.width, this.gameSize.height);

            // add button start
            screen.fillStyle = "#C43963";
            screen.fillRect(this.gameSize.width / 2 - 95, this.gameSize.height / 2 - 45, 200, 100);
            screen.fillStyle = "#E85682";
            screen.fillRect(this.gameSize.width / 2 - 100, this.gameSize.height / 2 - 50, 200, 100);

            screen.fillStyle = 'white';
            screen.fillText('Start', this.gameSize.width / 2 - 70, this.gameSize.height / 2 + 20);

            screen.fillText('The Frog', this.gameSize.width / 2 - 120, 100);

            screen.font = '15px Monospace';
            screen.fillText('https://github.com/ar0ne/frog_html5_game', 150, this.gameSize.height - 20); 


            window.addEventListener("mousedown", doMouseDown, false);

            function doMouseDown(event) {

                var x = event.pageX - canvas.offsetLeft,
                    y = event.pageY - canvas.offsetTop;

                if (x >= self.gameSize.width / 2 - 95  && x <= self.gameSize.width / 2 + 100 &&
                    y >= self.gameSize.height / 2 - 45 && y <= self.gameSize.height / 2 + 40) {

                    window.removeEventListener("mousedown", doMouseDown, false);

                    self.new_game();

                    // only one instance of game_loop must to be
                    if(!self.requestId) {
                        self.game_loop();
                    }

                }
                
            } 

        },

        restart_level: function () {

            if(this.isGameOver()){
                return;
            }

            this.bodies.splice(0, this.bodies.length);

            this.bodies = this.bodies.concat(this.load_level(LEVELS[this.level] ));
        },

        isGameOver: function () {
            // if lives over and game started
            if(this.lives === 0 && this.game_status) {
                return true;
            }
            return false;
        },

        next_level: function () {

            this.level++;

            this.bodies.splice(0, this.bodies.length);

            this.bodies = this.bodies.concat(this.load_level(LEVELS[this.level]));
        },

        game_over: function () {

            this.game_status = false;

            this.bodies.splice(0, this.bodies.length);

            var self = this;
            var screen = this.screen;

            screen.font = '50px Monospace';
            // background
            screen.fillStyle = '#990000';
            screen.fillRect(0, 0, this.gameSize.width, this.gameSize.height);

            // add button restart
            screen.fillStyle = "#C43963";
            screen.fillRect(this.gameSize.width / 2 - 95, this.gameSize.height / 2 - 45, 200, 100);
            screen.fillStyle = "#E85682";
            screen.fillRect(this.gameSize.width / 2 - 100, this.gameSize.height / 2 - 50, 200, 100);

            screen.fillStyle = 'white';
            screen.fillText('Game Over', this.gameSize.width / 2 - 140, this.gameSize.height / 4);
            screen.font = '30px Monospace';
            screen.fillText('Try Again', this.gameSize.width / 2 - 80, this.gameSize.height / 2 + 5);

            window.addEventListener("mousedown", doMouseDown, false);

            function doMouseDown(event) {

                var x = event.pageX - canvas.offsetLeft,
                    y = event.pageY - canvas.offsetTop;

                if (x >= self.gameSize.width / 2 - 95  && x <= self.gameSize.width / 2 + 100 &&
                    y >= self.gameSize.height / 2 - 45 && y <= self.gameSize.height / 2 + 40) {

                    window.removeEventListener("mousedown", doMouseDown, false);

                    self.menu();
                }
            }

        },

        new_game: function() {

            this.game_status = true;
           
            this.lives = this.start_livecount;

            this.bodies.splice(0, this.bodies.length);

            this.bodies = this.bodies.concat(this.load_level(LEVELS[this.level] ));
        },

        show_lives: function(screen) {

            screen.fillStyle = 'pink';
            screen.fillText('Lives: ' + this.lives, this.gameSize.width - 100, 20);

        },

        load_level: function (level) {

            var rows        = level.map.length,
                columns     = level.map[0].length,
                bodies      = [],
                KEYS        = {
                    EMPTY:          0,
                    WALL_STATIC:    1,
                    WALL_MOVE_X:    2,
                    WALL_MOVE_Y:    3,
                    PLAYER:         4,
                    EXIT:           5
                };

            for(var i = 0; i < rows; i++) {
                 var speedY = parseInt(level.speedY[i]);

                for(var j = 0; j < columns; j++) {
                    var speedX = parseInt(level.speedX[j]);
                   

                    // empty fields
                    if (level.map[i][j] === KEYS.EMPTY) {
                        continue;
                    }

                    if (level.map[i][j] === KEYS.WALL_STATIC ||
                        level.map[i][j] === KEYS.WALL_MOVE_X ||
                        level.map[i][j] === KEYS.WALL_MOVE_Y) {

                        var spX = (level.map[i][j] === KEYS.WALL_MOVE_X ? speedX : 0);
                        var spY = (level.map[i][j] === KEYS.WALL_MOVE_Y ? speedY : 0);

                        if (speedX === 0 && speedY === 0) {  // static walls
                            // add in begin of array, because move-walls must to be at top of it
                            bodies.unshift( new Wall ({
                                game: this,
                                position: {
                                    x: this.block_height * j,
                                    y: this.block_height * i
                                },
                                speedX: spX,
                                speedY: spY
                            }));

                        } else {

                             bodies.push( new Wall ({
                                game: this,
                                position: {
                                    x: this.block_height * j,
                                    y: this.block_height * i
                                },
                                speedX: spX,
                                speedY: spY
                            }));
                        }

                    } else if(level.map[i][j] === KEYS.PLAYER) {

                        bodies.push( new Player ({
                            game: this,
                            position: {
                                x: this.block_height * j,
                                y: this.block_height * i
                            }

                        }));

                    } else if(level.map[i][j] === KEYS.EXIT) {

                        bodies.push( new Exit({
                            game: this,
                            position: {
                                x: this.block_height * j,
                                y: this.block_height * i
                            }
                        }));
                    }
                }
            }
            
            return bodies;
        }

    };

    var Player = function ( options ) {

        this.game = options.game;
        this.gameSize = this.game.gameSize;
        this.size = {
            width:     this.game.block_height,
            height:    this.game.block_height
        };

        this.position = options.position;

        this.keyborder = options.game.keyborder;

        this.old_position = {};

        this.timer = 0;

    };

    Player.prototype = {
        update: function () {

            this.old_position = JSON.parse(JSON.stringify(this.position));

            if( this.timer == 0) {

                if(this.keyborder.isDown(this.keyborder.KEYS.LEFT)) {
                    this.position.x -= this.size.width;
                } else if(this.keyborder.isDown(this.keyborder.KEYS.RIGHT)) {
                    this.position.x += this.size.width;
                }

                if(this.keyborder.isDown(this.keyborder.KEYS.UP)) {
                    this.position.y += this.size.height;
                } else if(this.keyborder.isDown(this.keyborder.KEYS.DOWN)) {
                    this.position.y -= this.size.height;
                }

            }

            if(this.position.x < 0 ) {
                 this.position.x = 0
            } else if(this.position.x > this.gameSize.width - this.size.width) {
                this.position.x = this.gameSize.width - this.size.width;
            }

            if(this.position.y < 0 ) {
                 this.position.y = 0
            } else if(this.position.y > this.gameSize.height - this.size.height) {
                this.position.y = this.gameSize.height - this.size.height;
            }


            this.timer++;

            if(this.timer % 9 == 0) {
                this.timer = 0;
            }

        },

        draw: function (screen) {
            screen.fillStyle="red";
            screen.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }

    };


    var Wall = function (options) {

        this.game = options.game;
        this.gameSize = this.game.gameSize;
        this.size =  {
            width:  this.game.block_height,
            height: this.game.block_height
        };

        this.position = options.position;

        this.speedX = options.speedX;
        this.speedY = options.speedY;

    };

    Wall.prototype = {
        update: function () {
            if(this.speedX === 0 && this.speedY === 0) {
                // it's something static
                return;
            }

            if(this.speedX) {
                this.position.x += this.speedX;
            }

            if(this.speedY) {
                this.position.y += this.speedY;
            }

            if (this.speedX > 0 && this.position.x > this.game.gameSize.width) {
                this.position.x = 0 - this.size.width;
            } else if (this.speedX < 0 && this.position.x < - this.size.width) {
                this.position.x = this.game.gameSize.width;
            }

            if (this.speedY > 0 && this.position.y > this.gameSize.height ) {
                this.position.y = 0 - this.size.height;
            } else if (this.speedY < 0 && this.position.y < - this.size.height) {
                this.position.y = this.size.height + this.game.gameSize.height
            }

        },

        draw: function (screen) {
            if (this.speedX) {
                screen.fillStyle="grey";
            } else if(this.speedY) {
                screen.fillStyle="blue";
            } else {
                screen.fillStyle="black";
            }
            
            screen.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }

    };

    var Exit = function (options) {
        this.game = options.game;
        this.gameSize = this.game.gameSize;
        this.size =  {
            width:  this.game.block_height,
            height: this.game.block_height
        };

        this.position = options.position;

    };

    Exit.prototype = {
        draw: function(screen){
            screen.fillStyle="yellow";
            screen.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        },

        update: function() {}
    };


    var Keyborder = function () {

        var keyState = {};

        window.onkeydown = function (e) {
            keyState[e.keyCode] = true;
        };

        window.onkeyup = function (e) {
            keyState[e.keyCode] = false;
        };

        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        };

        this.KEYS = {
            LEFT:   37,
            RIGHT:  39,
            UP:     40,
            DOWN:   38
        };

    };


})();