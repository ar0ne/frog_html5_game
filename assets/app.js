;(function() {
    "use strict"

    window.addEventListener('load', function () {
        new Game();
    });

    var Game = function () {
        var canvas = document.getElementById('canvas');
        var screen = canvas.getContext('2d');

        this.gameSize = {
            width:  canvas.width,
            height: canvas.height
        };

        var self = this;

        this.block_height = this.gameSize.height / 15;   // 32px

        this.bodies = [];

        this.bodies = this.bodies.concat(new Player(this));

        this.bodies = this.bodies.concat(load_level( this, LEVELS.level_1 ));

        var tick = function () {
            self.update();
            self.draw(screen, self.gameSize);
            requestAnimationFrame(tick);
        };

        tick();

    };

    Game.prototype = {

        update: function() {

            for(var i = 0; i < this.bodies.length - 1; i++) {
                for(var j= i+1; j < this.bodies.length; j++ ) {
                    if (( this.bodies[i] instanceof Player || this.bodies[j] instanceof Player ) && this.isCollided(this.bodies[i], this.bodies[j])) {
                        this.bodies.splice(j, 1);
                        this.bodies.splice(i, 1);
                    }
                }
            }


            for(var i = 0; i < this.bodies.length; i++ ) {
                this.bodies[i].update();
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

    };

    var Player = function ( game) {
        this.game = game;
        this.gameSize = this.game.gameSize;
        this.size = {
            width:     this.game.block_height,
            height:    this.game.block_height
        };

        this.position = {
            x: this.gameSize.width - this.game.block_height,
            y: this.gameSize.height - this.game.block_height
        };

        this.keyborder = new Keyborder();

        this.timer = 0;

    };

    Player.prototype = {
        update: function () {

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

            if(this.timer % 5 == 0) {
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

    };

    Wall.prototype = {
        update: function () {
            if (this.speedX > 0 && this.position.x > this.game.gameSize.width) {
                this.position.x = - this.size.width;
           } else if (this.speedX < 0 && this.position.x < - this.size.width) {
                this.position.x = this.game.gameSize.width;
           }
            this.position.x += this.speedX;
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

        var rows = level.map.length,
            column  = level.map[0].length,
            walls = [];

        for( var i = 0; i < rows; i++) {
            var speedX = level.speed[i];

            for( var j = 0; j < column; j++) {
                if (  level.map[i][j] && level.map[i][j] !== 0 ) {
                    walls.push(new Wall({
                        game: game,
                        position: {
                            x: game.block_height * j,
                            y: game.block_height * i
                        },
                        speedX: speedX
                    }));
                }
            }
        }
        return walls;
    };

    var LEVELS =  {

        "level_1":  {
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
                "speed": [ 0, 5, 0, -3, 0, 4, 0, -2, 0, 1, 0, -2, 0, 1, 0]
        },
    

    };




})();