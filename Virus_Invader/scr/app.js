class VirusGame {
    constructor() {
        this.player = new Player();
        // a projectile can also be placed in array and use a foreach loop to update all it's positions to be able to shoot multiple at a time
        this.projectile = new Projectile();
        this.neutralVirus = new NeutralVirus();
        this.fireVirus = new FireVirus();
        this.bombVirus = new BombVirus();

        this.viewWidth = window.innerWidth;
        this.viewHeight = window.innerHeight;
        this.projectileImageScale = 25;

        this.mouseX = 1;
        this.mouseY = 1;

        this.score = 0;
        this.life = 3;
        this.gameState = 'pauzed'
        this.waitTime = 12; // amount of milliseconds waited each loop

        this.loop;
        this.init();
    }
    // game initialization
    init() {
        this.gameState = 'unpauzed'
        this.keyDownEvents();
        this.gameLoop();
    }

    gameLoop() {
        this.player.rotatePlayer()
        this.updatePositions();
        this.collisionDetection();
        this.loop = setTimeout(() => {
            this.gameLoop()
        }, this.waitTime);
        this.gameOver()
    }

    gameOver = () => {
        // game over
        if (this.life <= 0) {
            clearTimeout(this.loop);
            this.clearObjects();
            this.gameState = 'pauzed';
            this.makeRestartButton();
        }

    }

    makeRestartButton() {
        // restart button
        $('div').prepend('<input id = "restartButton" type = "submit" value = "Restart" />');
        $('div').css('height', '0');
        $('#restartButton').css('margin', '0');
        $('#restartButton').css('position', 'relative');
        $('#restartButton').css('left', '45vw');
        $('#restartButton').css('top', '50vh');
        $('#restartButton').css('font-size', '2em');

        // if restart is clicked, reconfigure game and start loop again
        $(document).ready(() => {
            $("#restartButton").click(() => {
                $("#restartButton").css('visibility', 'hidden');
                this.gameState = 'unpauzed';
                this.player.setPosition(this.viewWidth * 0.45, this.viewHeight * 0.50);

                this.player.visible();
                this.fireVirus.visible();
                this.neutralVirus.visible();
                this.bombVirus.visible();

                this.score = 0;
                this.life = 3;
                $('#score').text("Score: " + this.score);
                $('#life').text("Life: " + this.life);

                this.gameLoop();
            });
        });
    }
    // when the game is over or pauzed, it should make the objects invisible
    clearObjects() {
        this.player.hide();
        this.fireVirus.hide();
        this.neutralVirus.hide();
        this.bombVirus.hide();
    }

    unHideObjects() {
        this.player.visible();
        this.fireVirus.visible();
        this.neutralVirus.visible();
        this.bombVirus.visible();
    }
    // handles all the keypresses of the game
    keyDownEvents() {
        $(document).keydown((e) => {
            // up key
            if (e.keyCode === 38) {
                this.player.up = true;
            }
            // right key
            if (e.keyCode === 39) {
                this.player.right = true;
            }
            // left key
            if (e.keyCode === 37) {
                this.player.left = true;
            }
            // down key
            if (e.keyCode === 40) {
                this.player.down = true;
            }
        })
        $(document).keyup((e) => {
            if (e.keyCode === 38) {
                this.player.up = false;
            }
            if (e.keyCode === 39) {
                this.player.right = false;
            }
            if (e.keyCode === 37) {
                this.player.left = false;
            }
            if (e.keyCode === 40) {
                this.player.down = false;
            }
        })
        $(document).click((e) => {
            if (!this.projectile.alive && this.gameState == 'unpauzed') {
                this.projectile.create(this.player.x + this.projectile.projectileCenterRepositioning,
                    this.player.y + this.projectile.projectileCenterRepositioning);

                // update mouse location for next positon update event, mainly used for projectile
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
                //this.calculateRico();
                this.projectile.calculateSpeed(this.mouseX, this.mouseY);
            }

        })
    }

    // update player/projectile and enemy positions
    updatePositions() {

        // player positions
        if (this.player.up == true) {
            this.player.goUp();
        }
        if (this.player.right == true) {
            this.player.goRight();
        }
        if (this.player.left == true) {
            this.player.goLeft();
        }
        if (this.player.down == true) {
            this.player.goDown();
        }

        // porjectile positions
        if (this.projectile.alive) {
            this.projectile.changePosition(this.projectile.projectileXSpeed, this.projectile.projectileYSpeed);
        }

        // enemy positions
        if (this.neutralVirus.alive) {
            this.neutralVirus.calculateSpeed(this.player.x, this.player.y);
            this.neutralVirus.changePosition(this.neutralVirus.enemyXSpeed, this.neutralVirus.enemyYSpeed);
        }

        if (this.fireVirus.alive) {
            this.fireVirus.calculateSpeed(this.player.x, this.player.y);
            this.fireVirus.changePosition(this.fireVirus.enemyXSpeed, this.fireVirus.enemyYSpeed);
        }

        if (this.bombVirus.alive) {
            this.bombVirus.calculateSpeed(this.player.x, this.player.y);
            this.bombVirus.changePosition(this.bombVirus.enemyXSpeed, this.bombVirus.enemyYSpeed);
        }
    }

    // update the score shown on the screen
    updateScore(enemy) {
        this.score += enemy.scorePoints;
        this.life += 1;
        $('#score').text("Score: " + this.score);
        $('#life').text("Life: " + this.life);
    }

    updateLife(enemy) {
        this.life -= enemy.lifeReduction;
        $('#life').text("Life: " + this.life);
    }

    // detecting collision between an object and an enemy
    projectileIsHit(a) {
        return (a.x <= this.projectile.x &&
            this.projectile.x <= a.x + a.imageScale / 2 &&
            a.y <= this.projectile.y &&
            this.projectile.y <= a.y + a.imageScale / 2);
    }

    // detecting collision between player and enemies
    playerIsHit(a) {
        return (a.x - a.imageScale / 2 <= this.player.x &&
            this.player.x <= a.x + a.imageScale / 2 &&
            a.y - a.imageScale / 2 <= this.player.y &&
            this.player.y <= a.y + a.imageScale / 2)
    }

    // detecting collisions with enemies and out of bound projectiles
    collisionDetection() {
        // if borders are touched, remove projectile
        if (this.projectile.x >= this.viewWidth - this.projectileImageScale ||
            this.projectile.x < 0 ||
            this.projectile.y >= this.viewHeight - this.projectileImageScale ||
            this.projectile.y < 0) {
            this.projectile.remove();
        }

        // if enemy is hit, remove projectile and enemy
        // this can also be done with an array of enemies and foreach through it
        if (this.projectileIsHit(this.fireVirus)) {
            this.projectile.remove();
            this.fireVirus.remove();
            this.fireVirus.create();

            this.updateScore(this.fireVirus);
        }
        if (this.projectileIsHit(this.neutralVirus)) {

            this.projectile.remove();
            this.neutralVirus.remove();
            this.neutralVirus.create();

            this.updateScore(this.neutralVirus);
        }
        if (this.projectileIsHit(this.bombVirus)) {

            this.projectile.remove();
            this.bombVirus.remove();
            this.bombVirus.create();

            this.updateScore(this.bombVirus);
        }
        // collision detection between player and enemies
        if (this.playerIsHit(this.fireVirus)) {

            this.fireVirus.remove();
            this.fireVirus.create();

            this.updateLife(this.fireVirus);
        }
        if (this.playerIsHit(this.neutralVirus)) {

            this.neutralVirus.remove();
            this.neutralVirus.create();

            this.updateLife(this.neutralVirus);
        }
        if (this.playerIsHit(this.bombVirus)) {

            this.bombVirus.remove();
            this.bombVirus.create();

            this.updateLife(this.bombVirus);
        }
    }

};

class Player {
    constructor() {
        this.up = false;
        this.left = false;
        this.right = false;
        this.down = false;
        this.viewWidth = window.innerWidth;
        this.viewHeight = window.innerHeight;
        this.imageScale = 61;

        this.playerspeed = 4;
        this.x = $('#player').position().left;
        this.y = $('#player').position().top;
        this.rotation = 0;
        this.rotationSpeed = 10;
    }


    // set the position of the projectile on a specific location
    setPosition(a, b) {
        this.x = b;
        this.y = b;
        $('#player').css({
            left: this.x,
            top: this.y
        });
    }
    // change the position by a and b amounts on x and y axis
    changePosition(a, b) {
        this.x += a;
        this.y += b;
        $('#player').css({
            left: this.x,
            top: this.y
        });

    }

    goUp() {
        if (this.y >= 0) {
            this.changePosition(0, -this.playerspeed);
        }
    }

    goLeft() {
        if (this.x >= 0) {
            this.changePosition(-this.playerspeed, 0);
        }
    }

    goRight() {
        if (this.x < this.viewWidth - this.imageScale) {
            this.changePosition(this.playerspeed, 0);
        }
    }

    goDown() {
        if (this.y < this.viewHeight - this.imageScale)
            this.changePosition(0, this.playerspeed);
    }

    rotatePlayer() {
        this.rotation = (this.rotation + this.rotationSpeed) % 360;
        $('#player').css('transform', 'rotate(' + this.rotation + 'deg)');
    }

    hide() {
        $('#player').css('visibility', 'hidden');
    }

    visible() {
        $('#player').css('visibility', 'visible');
    }
    // I tried to make it update all player positions here, but it gave me some errors, I need to fix this later for readability
    // updatePlayerPosition(){

    // }
}

class Projectile {
    constructor() {
        this.alive = false;
        this.speed = 9;
        this.projectileXSpeed = this.speed;
        this.projectileYSpeed = this.speed;
        this.x = 0;
        this.y = 0;
        this.projectileCenterRepositioning = 10;
    }

    // creates a projectile
    create(x, y) {
        if (this.alive == false) {
            this.alive = true;
            $('div').prepend('<img id="projectile" src = "https://www.pinclipart.com/picdir/big/567-5672052_portable-network-graphics-flame-fire-clip-art-gif.png" alt = "Projectile" > ');
            this.changePosition(x, y);
        }
    }

    // remove the projectile from the screen
    remove() {
        this.alive = false;
        $('#projectile').remove();
        this.setPosition(0, 0);
    }

    // set the position of the projectile on a specific location
    setPosition(a, b) {
        this.x = b;
        this.y = b;
        $('#projectile').css({
            left: this.x,
            top: this.y
        });
    }

    // change the position by a and b amounts on x and y axis
    changePosition(a, b) {
        this.x += a;
        this.y += b;
        $('#projectile').css({
            left: this.x,
            top: this.y
        });
    }

    calculateSpeed(a, b) {
        this.projectileYSpeed = this.speed * ((b - this.y) / Math.sqrt(Math.pow(b - this.y, 2) + Math.pow(a - this.x, 2)));
        this.projectileXSpeed = this.speed * ((a - this.x) / Math.sqrt(Math.pow(b - this.y, 2) + Math.pow(a - this.x, 2)));
    }

    hide() {
        $('#projectile').css('visibility', 'hidden');
    }

    visible() {
        $('#projectile').css('visibility', 'visible');
    }
}

class Enemy {
    constructor() {
        this.alive = false;
        this.x = 0;
        this.y = 0;
        this.speed = 2;
        this.enemyXSpeed = 1;
        this.enemyYSpeed = 1;
        this.imageScale = 90;
        this.name;
        this.scorePoints = 1;
        this.lifeReduction = 1;
    }

    // set the default position of an enemy
    defaultPosition() {
        this.setPosition(Math.floor(Math.random() * (window.innerWidth - this.imageScale)), Math.floor(Math.random() * (window.innerHeight - this.imageScale)));
    }

    calculateSpeed(a, b) {
        this.enemyYSpeed = this.speed * ((b - this.y) / Math.sqrt(Math.pow(b - this.y, 2) + Math.pow(a - this.x, 2)));
        this.enemyXSpeed = this.speed * ((a - this.x) / Math.sqrt(Math.pow(b - this.y, 2) + Math.pow(a - this.x, 2)));
    }
}

class NeutralVirus extends Enemy {
    constructor() {
        super(name);
        this.name = "neutral_virus";
        this.init();
    }

    init() {
        this.scorePoints = 5;
        this.lifeReduction = 2;
        this.speed = 1;
        this.create();
    }
    setPosition(a, b) {
        this.x = a;
        this.y = b;
        $('.neutral_enemy').css({
            left: this.x,
            top: this.y
        });
    }

    // change the position by a and b amounts on x and y axis
    changePosition(a, b) {
        this.x += a;
        this.y += b;
        $('.neutral_enemy').css({
            left: this.x,
            top: this.y
        });
    }


    // creates an img html element with the corresponding enemy picture
    create() {
        this.alive = true;
        $('div').prepend('<img id="enemy" class="neutral_enemy" src = "https://www.pinclipart.com/picdir/big/67-675178_virus-clipart-svg-virus-png-transparent-png.png" alt = "Neutral_Virus" > ');
        this.defaultPosition();
    }

    remove() {
        this.alive = false;
        $('.neutral_enemy').remove();
    }

    hide() {
        $('.neutral_enemy').css('visibility', 'hidden');
    }
    visible() {
        $('.neutral_enemy').css('visibility', 'visible');
    }
}

class FireVirus extends Enemy {
    constructor() {
        super(name);
        this.name = "fire_virus";
        this.init();
    }

    init() {
        this.scorePoints = 10;
        this.lifeReduction = 1;
        this.speed = 1.7
        this.create()
    }

    setPosition(a, b) {
        this.x = a;
        this.y = b;
        $('.fire_enemy').css({
            left: this.x,
            top: this.y
        });
    }

    // change the position by a and b amounts on x and y axis
    changePosition(a, b) {
        this.x += a;
        this.y += b;
        $('.fire_enemy').css({
            left: this.x,
            top: this.y
        });
    }


    // creates an img html element with the corresponding enemy picture
    create() {
        this.alive = true;
        $('div').prepend('<img id="enemy" class="fire_enemy" src = "https://www.pinclipart.com/picdir/big/533-5339515_simbol-corona-virus-clipart.png" alt = "Fire_Virus" > ');
        this.defaultPosition();
    }

    remove() {
        this.alive = false;
        $('.fire_enemy').remove();
    }

    hide() {
        $('.fire_enemy').css('visibility', 'hidden');
    }

    visible() {
        $('.fire_enemy').css('visibility', 'visible');
    }
}

class BombVirus extends Enemy {
    constructor() {
        super(name);
        this.name = "bomb_virus";
        this.init();
    }

    init() {
        this.scorePoints = 1;
        this.lifeReduction = 10;
        this.speed = 0.5
        this.create()
    }

    setPosition(a, b) {
        this.x = a;
        this.y = b;
        $('.bomb_enemy').css({
            left: this.x,
            top: this.y
        });
    }

    // change the position by a and b amounts on x and y axis
    changePosition(a, b) {
        this.x += a;
        this.y += b;
        $('.bomb_enemy').css({
            left: this.x,
            top: this.y
        });
    }


    // creates an img html element with the corresponding enemy picture
    create() {
        this.alive = true;
        $('div').prepend('<img id="enemy" class="bomb_enemy" src = "https://www.pinclipart.com/picdir/big/564-5645869_pop-art-thumbs-up-clipart.png" alt = "Bomb_Virus" > ');
        this.defaultPosition();
    }

    remove() {
        this.alive = false;
        $('.bomb_enemy').remove();
    }

    hide() {
        $('.bomb_enemy').css('visibility', 'hidden');
    }

    visible() {
        $('.bomb_enemy').css('visibility', 'visible');
    }
}

$(document).ready(function () {
    const game = new VirusGame();

})