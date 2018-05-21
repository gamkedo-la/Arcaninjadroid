
////    All states (ie slick moves and movements) of the player will be created here. Depending on size, might be split into separate files (for Arcane, Ninja and Android perhaps)

/////    Good format:
// mySheet = new SpriteSheet (...)
// function MyState () {...} (also give the spritesheet in this.animation)
// MyState.prototype = baseState;
// Give it to the player and try it out! :D

baseState = new State(); //give a reference to this state when declaring your custom state's prototype (see above, or below...)


////       Basic, idle Android state        ////

idleSheet = new SpriteSheet(Images.getImage("PH_Android_Idle"), 1, 2);
function IdleAndroidState() {

    this.animation = new Animation(idleSheet, { loop: true });

    this.update = function () {

        player.x += player.velocity.x;
        player.y += player.velocity.y;

        //apply some gravity. Fun fact: often times our super awesome main character will flat out ignore gravity,
        //so I feel it's ok to add it (perhaps multiple times) in the update functions of different states
        player.velocity.y += 0.75;

        player.velocity.x *= 0.85;
        player.velocity.y *= 0.85;
        if (Math.abs(player.velocity.x) < 0.1) player.velocity.x = 0;
        if (Math.abs(player.velocity.y) < 0.1) player.velocity.y = 0;
    }

    this.handleInput = function () {

        if (Input.getLeftClick()) {
            return new PunchingState();
        }

        // Basic movement
        if (Input.getKey("w")) {
            return new JumpState();
        } else if (Input.getKey("s")) {
            return new CrouchState();
        }

        if (Input.getKey("a")) {
            player.velocity.x = -player.walkSpeed;
        } else if (Input.getKey("d")) {
            player.velocity.x = player.walkSpeed;
        }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
IdleAndroidState.prototype = baseState;



///////////////////       Android crouch state      ////////////////////////
crouchSheet = new SpriteSheet(Images.getImage("PH_Android_Crouch"), 1, 1);
function CrouchState() {

    this.animation = new Animation(crouchSheet);

    this.update = function () {
    }

    this.handleInput = function () {

        if (Input.getKey("s") === false) {
            return "previous";
        }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
CrouchState.prototype = baseState;




///////////////////       Android jump state      ////////////////////////
jumpSheet = new SpriteSheet(Images.getImage("PH_Android_Idle"), 1, 2); //replace with jump at some point
function JumpState() {

    this.animation = new Animation(jumpSheet,{loop:true});
    this.fastfall = false;

    this.update = function () {
        if (this.fastfall === false) {
            player.velocity.y += 0.1;
        } else {
            player.velocity.y += 1;
        }
        player.x += player.velocity.x;
        player.y += player.velocity.y;

        player.velocity.x *= 0.85;
        player.velocity.y *= 0.85;
        if (Math.abs(player.velocity.x) < 0.1) player.velocity.x = 0;
        if (Math.abs(player.velocity.y) < 0.1) player.velocity.y = 0;
    }

    this.handleInput = function () {

        if (Input.getKeyDown("s")) {
            this.fastfall = true;
            new ParticleEmitter(player.x-10, player.y-15,fastFallParticlesConfig); //spawn fast fall blinking particles (visual only)
        }

        if (Input.getKey("a")) {
            player.velocity.x = -player.walkSpeed;
        } else if (Input.getKey("d")) {
            player.velocity.x = player.walkSpeed;
        }
    }

    this.enter = function () {
        this.fastfall = false;
        player.velocity.y = -player.jumpVelocity;
    }
    this.exit = function () {
    }
}
JumpState.prototype = baseState;



////////////////////       Android regular punch state      /////////////////////////
punchingSheet = new SpriteSheet(Images.getImage("PH_Android_Punch"), 1, 2);
function PunchingState() {

    this.animation = new Animation(punchingSheet, { fps: 16 });

    this.update = function () {

    }

    this.handleInput = function () {

        if (this.animation.isActive === false) {
            return "previous";
        }
    }

    this.enter = function () {
    }

    this.exit = function () {
    }
}
PunchingState.prototype = baseState;
