
////    All states (ie slick moves and abilities) of the player will be created here. Depending on size, might be split into separate files (for Arcane, Ninja and Android perhaps)

/////    Good format:
// function MyState (parent, relatedStates) {...}
// MyState.prototype = baseState;
// CRUCIAL Add to PlayerStates at the end of the file, just like shown
// Give it to the player and try it out! :D

var baseState = new State(); //give a reference to this state when declaring your custom state's prototype (see above, or below...)


////       Basic, idle Android state        ////

function IdleAndroidState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerIdle"), playerIdleData, { loop: true });

    this.update = function () {

        parent.applyBasicPhysics();

    }

    this.handleInput = function () {

        if (Input.getKeyDown("z")) {
            return states.punchingState;
        }

        // Basic movement
        if (Input.getKey("up")) {
            return states.jumpState;
        } else if (Input.getKey("down")) {
            return states.crouchState;
        }

        if (Input.getKey("left")) {
            parent.flipped = true;
            parent.velocity.x = -parent.walkSpeed;
        }
        else if (Input.getKey("right")) {
            parent.flipped = false;
            parent.velocity.x = parent.walkSpeed;
        } else { parent.velocity.x = 0; }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
IdleAndroidState.prototype = baseState;



///////////////////       Android crouch state       ////////////////////////

function CrouchState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerCrouch"), playerCrouchData, {holdLastFrame:true});

    this.update = function () {

    }

    this.handleInput = function () {

        if (Input.getKey("down") === false) {
            return states.idleState;
        }

        if (Input.getKeyDown("z")) {
            return states.uppercutState;
        }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
CrouchState.prototype = baseState;




///////////////////       Android jump state      ////////////////////////

function JumpState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    //this.animation = new Animation(jumpSheet,{loop:true});
    this.animation = new Animation(parent, Images.getImage("playerJump"), playerJumpData, {loop : true}); //placeholder
    this.fastfall = false;

    this.update = function () {

        if (this.fastfall === true) {
            parent.velocity.y += 1.5; //give a boost to the fall speed
        }

        parent.applyBasicPhysics();


        if (parent.grounded) {
            return states.idleState;
        }
    }

    this.handleInput = function () {

        // Dampen the apex of the jump (thanks Matt Thorson!)
        if (Input.getKey("up")) {
            if (Math.abs(parent.velocity.y) <= 1.6) {
                //console.log("damp");
                parent.velocity.y -= 0.2;
            }
        }

        if (Input.getKeyDown("down")) {
            this.fastfall = true;
            new ParticleEmitter(parent.x - 10, parent.y - 15, fastFallParticlesConfig); //spawn fast fall blinking particles (visual only)
        }

        if (Input.getKey("left")) {
            parent.flipped = true;
            parent.velocity.x = -parent.walkSpeed;
        } else if (Input.getKey("right")) {
            parent.flipped = false;
            parent.velocity.x = parent.walkSpeed;
        }

        if (Input.getKeyDown("z")) {

            return states.sliceState;
        }


    }

    this.enter = function () {
        //console.log("enter");
        this.fastfall = false;
        parent.velocity.y = -parent.jumpVelocity;
        parent.grounded = false;
        parent.y -= 10;
    }
    this.exit = function () {
    }
}
JumpState.prototype = baseState;



////////////////////       Android regular punch state      /////////////////////////

function PunchState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerPunch"), playerPunchData);

    this.attackDamage = 100;

    this.update = function () {
        // not applying gravity here is a feature, not an error
    }

    this.handleInput = function () {

        if (this.animation.isActive === false) {
            if (Input.getKey("down")) {
                return states.crouchState;
            } else {
                return "previous";
            }
        }
    }

    this.enter = function () {
    }

    this.exit = function () {
    }
};
PunchState.prototype = baseState;


///////////////     Android uppercut (colloquially known as the "Sho-ryu-ken")      ///////////////

function UppercutState(parent, relatedStates) {

    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerUppercut"), playerUppercutData, { loop: false, holdLastFrame: true });

    this.knockup = true;

    this.update = function () {

        if (parent.grounded) {
            if (Input.getKey("down")) {
                return states.crouchState;
            } else {return states.idleState;}
        }

        parent.applyBasicPhysics();
    }

    this.handleInput = function () {
        if (Input.getLeftClick()) {
            if (Input.getMouseY() < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                // do something cool here :) ?
            }
        }
    }

    this.enter = function () {

        parent.velocity.y = -parent.jumpVelocity;
        parent.grounded = false;
        parent.y -= 10;

        new ParticleEmitter(parent.x + 10, parent.y - 25, fastFallParticlesConfig);
    }

    this.exit = function () {
    }

};
UppercutState.prototype = baseState;


/////////////////      Ninja slice state     ///////////////////
function SliceState(parent, relatedStates) {
    var parent = parent;
    let states = relatedStates;

    let destination = { x: 0, y: 0 };
    let theta = 0;
    let speed = 25;
    let dashDistance = 70;

    let dx = 0;
    let dy = 0;

    let gravityDelay = 1; //seconds
    let timer = gravityDelay;

    let dashDone = false;

    this.animation = new Animation(parent, Images.getImage("playerUppercut"), playerUppercutData, { loop: false, holdLastFrame: true });

    this.update = function () {

        if (parent.y > ninjaZoneBeginningY) {
            return states.jumpState;
        }
        
        parent.x += dx;
        parent.y += dy;

        if (!dashDone) { 
            if ((dx >= 0 && parent.x > destination.x) || (dx < 0 && parent.x < destination.x)) {
                dx = 0;
                parent.x = destination.x;
                dashDone = true;
            }
            if ((dy >= 0 && parent.y > destination.y) || (dy < 0 && parent.y < destination.y)) {
                dy = 0;
                parent.y = destination.y;
                dashDone = true;
            }
        } else {
            parent.applyBasicPhysics();
        }


        if (parent.grounded) {
            return states.idleState;
        }

    }

    this.handleInput = function () {

        if (Input.getKeyDown("z")) {

            return this;
        }
    }

    this.changeDirection = function () {

        dashDone = false;

        let xMult = 0;
        let yMult = 0;
        if (Input.getKey("up")) {
            yMult = -1;
        }
        else if (Input.getKey("down")) {
            yMult = 1
        }
        if (Input.getKey("left")) {
            xMult = -1;
        }
        else if (Input.getKey("right")) {
            xMult = 1;
        }
        
        if (xMult!=0 && yMult!=0) {
            xMult *= 1/Math.sqrt(2);
            yMult *= 1/Math.sqrt(2);
        }

        destination.x = parent.x + dashDistance * xMult;
        destination.y = parent.y + dashDistance * yMult;


        var xDiff = destination.x - parent.x;
        var yDiff = destination.y - parent.y;
        //console.log(xDiff**2 + yDiff**2);
        if (xDiff === 0) {
            theta = Math.PI / 2;
        } else {
            theta = Math.atan(yDiff / xDiff);
        }
        if (xDiff < 0) {
            if (yDiff < 0) {
                theta = Math.PI + theta;
            } else {
                theta = theta - Math.PI;
            }
        }
        dx = speed * Math.cos(theta);
        dy = speed * Math.sin(theta);
    }

    this.enter = function () {

        this.changeDirection();

    }

    this.exit = function () {
    }
};
SliceState.prototype = baseState;

// parent must be a Character
function PlayerStates(parent) {

    // Might refactor?
    this.idleState = new IdleAndroidState(parent, this);
    this.crouchState = new CrouchState(parent, this);
    this.uppercutState = new UppercutState(parent, this);
    this.punchingState = new PunchState(parent, this);
    this.jumpState = new JumpState(parent, this);
    this.sliceState = new SliceState(parent, this);

    this.initial = this.jumpState;
}

function DummyStates() {

}