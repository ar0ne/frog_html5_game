;(function() {
    "use strict"

    window.addEventListener('load', function () {
        new Game();
    });

    var Game = function () {
        var canvas = document.getElementById('canvas');
        var screen = canvas.getContext('2d');

        var self = this;

        this.gameSize = {
            width:  canvas.width,
            height: canvas.height
        };

        this.block_height = this.gameSize.height / 15;   // 32px

        this.lives = 0;

        this.bodies = [];

        var tick = function () {   
            self.update();
            self.draw(screen, self.gameSize);
            requestAnimationFrame(tick);
        };

        this.menu(screen);

        window.addEventListener("mousedown", doMouseDown, false);

        function doMouseDown(event) {

            var x = event.pageX - canvas.offsetLeft,
                y = event.pageY - canvas.offsetTop;

                if (x >= self.gameSize.width / 2 - 95  && x <= self.gameSize.width / 2 + 100 &&
                    y >= self.gameSize.height / 2 - 45 && y <= self.gameSize.height / 2 + 40) {

                    self.bodies = self.bodies.concat(load_level( self, LEVELS.level_1 ));

                    tick();
                }

            window.removeEventListener("mousedown", doMouseDown, false);
        }

    };

    Game.prototype = {

        update: function() {

            for(var i = 0; i < this.bodies.length; i++ ) {
                this.bodies[i].update();
            }

            for(var i = 0; i < this.bodies.length - 1; i++) {
                for(var j= i+1; j < this.bodies.length; j++ ) {

                    if ( this.bodies[i] instanceof Player || this.bodies[j] instanceof Player ) {

                       if ( this.bodies[i] instanceof Wall ) {

                            if ( this.isCollided(this.bodies[i], this.bodies[j])) {

                                if ( this.bodies[i].speedX !== 0 || this.bodies[i].speedY !== 0) {

                                    this.bodies.splice(j, 1);
                                    this.bodies.splice(i, 1);
                                  
                                } else {

                                    this.bodies[j].position = JSON.parse(JSON.stringify(this.bodies[j].old_position));

                                }
                            }

                        } else if( this.bodies[j] instanceof Wall ) {

                            if ( this.isCollided(this.bodies[i], this.bodies[j])) {

                                if( this.bodies[j].speedX !== 0 || this.bodies[j].speedY !== 0) {

                                    this.bodies.splice(j, 1);
                                    this.bodies.splice(i, 1);

                                } else {

                                    this.bodies[i].position = JSON.parse(JSON.stringify(this.bodies[i].old_position));

                                }
                            }
                        }
                    }
                }
            }

        },

        draw: function(screen, size) {
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
        menu: function (screen) {           
           
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

        this.keyborder = new Keyborder();

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
            }
            else if(this.position.x > this.gameSize.width - this.size.width) {
                this.position.x = this.gameSize.width - this.size.width;
            }
            if(this.position.y < 0 ) {
                 this.position.y = 0
            }
            else if(this.position.y > this.gameSize.height - this.size.height) {
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
        },
        this.position = options.position;

        this.speedX = options.speedX;
        this.speedY = options.speedY;


        this.timer = 0;


    };

    Wall.prototype = {
        update: function () {
            if(this.speedX === 0 && this.speedY === 0) {
                // it's something static
                return;
            }

            if (this.speedX > 0 && this.position.x > this.game.gameSize.width) {
                this.position.x = 0 - this.size.width;
            } else if (this.speedX < 0 && this.position.x < - this.size.width) {
                this.position.x = this.game.gameSize.width;
            }

            if (this.speedY > 0 && this.position.y < 0) {
                this.position.y = this.game.gameSize.height;
            } else if (this.speedY < 0 && this.position.y > this.gameSize.height) {
                this.position.y = - this.size.height;
            }


            this.timer++;

            if(this.timer % 23 == 0) {

                this.timer = 0;

                if(this.speedX > 0) {
                    this.position.x +=   this.game.block_height;
                } else if (this.speedX < 0) {
                    this.position.x += - this.game.block_height;
                }

                if(this.speedY > 0) {
                    this.position.y += - this.game.block_height;
                } else if (this.speedY < 0) {
                    this.position.y +=   this.game.block_height;
                }
            }

        },

        draw: function (screen) {
            screen.fillStyle="black";
            screen.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }

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
            DOWN:   38,
        };

    };


    var load_level = function (game, level) {

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

        for( var i = 0; i < rows; i++) {
            var speedX = level.speedX[i],
                speedY = level.speedY[i];

            for( var j = 0; j < columns; j++) {

                // empty fields
                if (level.map[i][j] === KEYS.EMPTY) {
                    continue;
                }

                if ( level.map[i][j] === KEYS.WALL_STATIC || level.map[i][j] === KEYS.WALL_MOVE_X || level.map[i][j] === KEYS.WALL_MOVE_Y) {
                    bodies.push( new Wall ({
                        game: game,
                        position: {
                            x: game.block_height * j,
                            y: game.block_height * i
                        },
                        // if field is dynamic than it have speed
                        speedX: (level.map[i][j] === KEYS.WALL_MOVE_X ? speedX : 0),
                        speedY: (level.map[i][j] === KEYS.WALL_MOVE_Y ? speedY : 0),

                    }));

                } else if(level.map[i][j] === KEYS.PLAYER){

                    bodies.push( new Player ({
                        game: game,

                        position: {
                            x: game.block_height * j,
                            y: game.block_height * i
                        }

                    }));

                } else {
                    // exit from level
                }
            }
        }
        return bodies;
    };


    /**
     *  map size 15 x 20
     *  0 - empty field
     *  1 - wall static
     *  2 - wall dynamic by axis X
     *  3 - wall dynamic by axis Y
     *  4 - player
     *  5 - exit
    **/
    var LEVELS =  {

       "level_1":  {
           "map":  [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],   // 1
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],   // 2
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],   // 3
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],   // 4
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 5
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 6
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 7
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 8
                    [1, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 9
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 10
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 11
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 12
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 13
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],   // 14
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 1],   // 15
                   ],
                "speedX": [ 0, 0, 0, 0, 0, 0, 0, 0, 2,  0,  0,  0,  0,  0,  0],
                //          1  2  3  4  5  6  7  8  9  10  11  12  13  14  15

                "speedY": [ 0, 0, 0, 0, 0, 0, 0, 0, -2,  0,  0,  0,  0,  0,  0],
                //          1  2  3  4  5  6  7  8  9  10  11  12  13  14  15
       },

       "level_2":  {
           "map":  [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0],
                    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
                    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
                    [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
                    [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1],
                    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1],
                    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                    [1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1],
                    [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
                    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                   ],
               "speedX": [ 0, 5, 0, -3, 0, 4, 0, -2, 0, 1, 0, -2, 0, 1, 0]
       },



   };




})();