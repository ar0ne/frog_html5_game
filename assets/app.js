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

        this.block_height = this.gameSize.height / 15;

        this.bodies = [];

        this.bodies = this.bodies.concat(new Player(this));

        this.bodies = this.bodies.concat(createWalls(this, 6, 3))

        var tick = function () {
            self.update();
            self.draw(screen, self.gameSize);
            requestAnimationFrame(tick);
        };

        tick();
    };

    Game.prototype = {

        update: function() {

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

            if(this.timer % 12 == 0) {
                this.timer = 0;
            }

        },

        draw: function (screen) {
            screen.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }

    };


    var Wall = function (options) {
        this.game = options.game;
        this.gameSize = this.game.gameSize;
        this.size = {
            width:  this.game.block_height * 4,
            height: this.game.block_height
        };
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
            screen.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }

    };


    // count - число рядов??
    var createWalls = function (game, count, speedX) {

        var walls = [];
        for(var i = 0; i < count; i++) {
            walls.push( new Wall({
                game: game,
                position: {
                    x: 0,
                    y: game.gameSize.height - game.block_height * (3 + i*2) 
                },
                speedX: i % 2 == 0 ? speedX : - speedX
            }));
        }

        return walls;
    }






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



})();