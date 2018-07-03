
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
            parent.velocity.y = -parent.jumpVelocity;
            parent.y -= 10; //lifts the player so he doesn't get insta-grounded ;)
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
        this.fastfall = false;
        parent.grounded = false;
        
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

    this.animation = new Animation(parent, Images.getImage("playerUppercut"), playerUppercutData);

    this.knockup = true;

    this.update = function () {

        if (this.animation.isActive === false) {
            if (Input.getKey("down")) {
                return states.crouchState;
            } else {
                return "previous";
            }
        }

        parent.applyBasicPhysics();
    }

    this.handleInput = function () {

    }

    this.enter = function () {

        //parent.velocity.y = -parent.jumpVelocity;
        //parent.grounded = false;
        //parent.y -= 10;

        new ParticleEmitter(parent.x + 10, parent.y - 25, fastFallParticlesConfig);
    }

    this.exit = function () {
    }

};
UppercutState.prototype = baseState;


/////////////////      Ninja slice state     ///////////////////
function SliceState(parent, relatedStates) {
    this.sliceProperty = true; //jank
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

    var target;
    let remainingSlices = 7;

    this.lockedOn = false; //modified in Character.gotHit()

    let dashAnim = new Animation(parent, Images.getImage("playerJump"), playerDashData, {loop : true});
    let lockAnim = new Animation(parent, Images.getImage("playerJump"), playerJumpData, {loop : true});
    let sliceUpAnim = new Animation(parent, Images.getImage("sliceVFXUp"), sliceVFXData, {holdLastFrame : true, ignoreFlip:true});
    let sliceDownAnim = new Animation(parent, Images.getImage("sliceVFXDown"), sliceVFXData, {holdLastFrame : true, ignoreFlip:true});
    let sliceLeftAnim = new Animation(parent, Images.getImage("sliceVFXLeft"), sliceVFXData, {holdLastFrame : true, ignoreFlip:true});
    let sliceRightAnim = new Animation(parent, Images.getImage("sliceVFXRight"), sliceVFXData, {holdLastFrame : true, ignoreFlip:true});

    this.animation = dashAnim;

    this.lockOn = function (char) {
        //this.animation = lockAnim;
        this.lockedOn = true;
        target = char;
        if (target.slicesNeeded) {remainingSlices = target.slicesNeeded; }
        else {remainingSlices = 7;}

        parent.x = target.x;
        parent.y = target.y;

        this.slice();
    }
    this.unlock = function () {
        this.animation = dashAnim;
        this.lockedOn = false;
        target.lockedOnto = false;
        //console.log("unlock");
    }

    this.update = function () {

        if (remainingSlices === 0) return states.jumpState; //if we didn't catch it because an enemy needed only a single slice
        if (parent.y > 105) {
            parent.y = GROUNDED_Y;
            return states.crouchState;
        }

        if (!dashDone && !this.lockedOn) {
            parent.x += dx;
            parent.y += dy;
            if ((dx >= 0 && parent.x > destination.x) || (dx < 0 && parent.x < destination.x) || (dy >= 0 && parent.y > destination.y) || (dy < 0 && parent.y < destination.y)) {
                this.finishDash();
            }
        } else {
            timer -= dt;
            if (timer <= 0) {
                return states.jumpState;
                //parent.applyBasicPhysics();
            }

        }

        if (parent.grounded) {
            return states.idleState;
        }

    }

    this.finishDash = function () {
        dx = dy = 0;
        dashDone = true;
        parent.x = destination.x;
        parent.y = destination.y;
        parent.boundsCheck();
    }

    this.handleInput = function () {

        if (Input.getKeyDown("z")) {

            if (this.lockedOn) {
                var nextState = this.slice();
                if (nextState) {
                    return nextState;
                }
            }
            else {
                this.reset();
            }
        }
    }
    this.reset = function () {

        timer = gravityDelay;
        this.changeDirection();
    }

    this.slice = function () {
        remainingSlices--;
        timer = gravityDelay;

        if (Input.getKey("up")) {
            this.animation = sliceUpAnim;
        }
        else if (Input.getKey("down")) {
            this.animation = sliceDownAnim;
        }
        else if (Input.getKey("left")) {
            this.animation = sliceLeftAnim;
        }
        else if (Input.getKey("right")) {
            this.animation = sliceRightAnim;
        }
        this.animation.loop();
        if (remainingSlices <= 0) {
            target.die();
            this.unlock();
            parent.velocity.y = -parent.jumpVelocity;
            parent.y -= 10; //lifts the player so he doesn't get insta-grounded ;)
            return states.jumpState;
        }
    }

    this.changeDirection = function () {

        dashDone = false;
        parent.boundsCheck();

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
        
        if (xMult === 0 && yMult === 0) {

            dashDone = true;
            timer = 0;
            return;
        }
        
        destination.x = parent.x + dashDistance * xMult;
        destination.y = parent.y + dashDistance * yMult;


        var xDiff = destination.x - parent.x;
        var yDiff = destination.y - parent.y;

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

        this.reset();
    }

    this.exit = function () {
        if (this.lockedOn) { this.unlock();}
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