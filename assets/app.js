;(function() {
    "use strict"

    window.addEventListener('load', function () {
        new Game();
    });

    var Game = function () {
        var canvas = document.getElementById('canvas');
        var screen = canvas.getContext('2d');

        this.size = {
            width:  canvas.width,
            height: canvas.height
        };

        var self = this;

        this.bodies = [];

        this.addBody(new Player(this, this.size));

        var tick = function () {
            self.update();
            self.draw(screen, self.size);
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
                drawRect(screen, this.bodies[i]);
            }
        },

        addBody: function (body) {
            this.bodies.push(body);
        },

    };

    var Player = function ( screen, gameSize ) {
        this.screen = screen;
        this.gameSize = gameSize;
        this.size = {
            width:     this.gameSize.width  / 15,
            height:    this.gameSize.width  / 15
        };

        this.position = {
            x: this.gameSize.width / 2 ,
            y: this.gameSize.height / 2 
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

            this.timer++;

            if(this.timer % 12 == 0) {
                this.timer = 0;
            }



        },
    };

    var drawRect = function (screen, body) {
        screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
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



})();