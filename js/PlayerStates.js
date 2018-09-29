
////    All states (ie slick moves and abilities) of the player will be created here. Depending on size, might be split into separate files (for Arcane, Ninja and Android perhaps)

/////    Good format:
// function MyState (parent, relatedStates) {...}
// MyState.prototype = baseState;
// CRUCIAL Add to PlayerStates at the end of the file, just like shown
// Give it to the player and try it out! :D

const PLAYER_STUNNED_STATE_LENGTH = 0.5; // seconds

var baseState = new State(); //give a reference to this state when declaring your custom state's prototype (see above, or below...)


////       Basic, idle Android state        ////

function IdleAndroidState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerIdle2"), playerIdleData, { loop: true });

    this.update = function () {

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
        parent.applyBasicPhysics();

    }

    this.handleInput = function () {

        if (Input.getKeyDown("z")) {
            return states.punchingState;
        }

        if (Input.getKeyDown("x") && player.stats.arcaneMeter >= arcaneShotCost) {
            new ArcaneShot(player.x + (25*(parent.flipped?-1:1)),player.y);
            player.stats.addArcanePoints(-arcaneShotCost);
        }

        // Basic movement
        if (Input.getKey("up")) {
            createParticleEmitter(parent.x, parent.y + 10, jumpDustParticlesConfig); // jump thrust dust puff
            parent.velocity.y = -parent.jumpVelocity;
            parent.y -= 10; //lifts the player so he doesn't get insta-grounded ;)
            return states.jumpState;
        } else if (Input.getKey("down")) {
            return states.crouchState;
        }

        if (Input.getKey("left")) {
            parent.flipped = true;
            parent.velocity.x = -parent.walkSpeed;
            return states.walkState;
        }
        else if (Input.getKey("right")) {
            parent.flipped = false;
            parent.velocity.x = parent.walkSpeed;
            return states.walkState;
        } else { parent.velocity.x = 0; }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
IdleAndroidState.prototype = baseState;

function WalkingAndroidState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    var timeIdling = 0
    this.animation = new Animation(parent, Images.getImage("playerWalk"), playerIdleData, { loop: true });

    this.update = function () {

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
        parent.applyBasicPhysics();

    }

    this.handleInput = function () {

        if (Input.getKeyDown("z")) {
            return states.punchingState;
        }
        if (Input.getKeyDown("x") && player.stats.arcaneMeter >= arcaneShotCost) {
            new ArcaneShot(player.x + (25*(parent.flipped?-1:1)),player.y);
            player.stats.addArcanePoints(-arcaneShotCost);
        }

        // Basic movement
        if (Input.getKey("up")) {
            createParticleEmitter(parent.x, parent.y + 10, jumpDustParticlesConfig); // jump thrust dust puff
            parent.velocity.y = -parent.jumpVelocity;
            parent.y -= 10; //lifts the player so he doesn't get insta-grounded ;)
            return states.jumpState;
        } else if (Input.getKey("down")) {
            return states.crouchState;
        }

        if (Input.getKey("left")) {
            parent.flipped = true;
            //parent.velocity.x = Input.getDoublePress("left") ? -35 : -parent.walkSpeed;
            parent.velocity.x = -parent.walkSpeed;
            timeIdling = 0;
        }
        else if (Input.getKey("right")) {
            parent.flipped = false;
            //parent.velocity.x = Input.getDoublePress("right") ? 35 : parent.walkSpeed;
            parent.velocity.x = parent.walkSpeed;
            timeIdling = 0
        } else { parent.velocity.x = 0; }
        if (parent.velocity.x == 0) {
            timeIdling += 1;
            //console.log(timeIdling);
            if (timeIdling > 10) {
                return states.idleState;
            }
        }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
WalkingAndroidState.prototype = baseState;


///////////////////       Android crouch state       ////////////////////////

function CrouchState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerCrouch"), playerCrouchData, { holdLastFrame: true });

    this.update = function () {

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
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
    this.animation = new Animation(parent, Images.getImage("playerJump"), playerJumpData, { loop: true }); //placeholder
    this.fastfall = false;

    this.update = function () {

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
        if (this.fastfall === true) {
            parent.velocity.y += 1.5; //give a boost to the fall speed
        }

        parent.applyBasicPhysics();


        if (parent.grounded) {
            createParticleEmitter(parent.x, parent.y + 12, landingDustParticlesConfig); // just hit the ground fx
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
            createParticleEmitter(parent.x - 10, parent.y - 15, fastFallParticlesConfig); //spawn fast fall blinking particles (visual only)
        }

        if (Input.getKey("left")) {
            parent.flipped = true;
            parent.velocity.x = -parent.walkSpeed;
        } else if (Input.getKey("right")) {
            parent.flipped = false;
            parent.velocity.x = parent.walkSpeed;
        }

        if (Input.getKeyDown("z") && parent.canDash) {

            return states.sliceState;
        }


    }

    this.enter = function () {
        this.fastfall = false;
        parent.grounded = false;
        playerJumpSfx.play(0.2);
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

    this.attackDamage = 50;

    this.update = function () {
        // not applying gravity here is a feature, not an error

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
    }

    this.handleInput = function () {

        if (this.animation.isActive === false) {
            if (Input.getKey("down")) {
                return states.crouchState;
            } else {
                return states.idleState;
            }
        }
    }

    this.onHit = function () {

        punch_LightSfx.play();
    }
    this.enter = function () {
        if (parent != player) parent.flipped = -Math.sign(parent.x - player.x);
        whiff_LightSfx.play();
    }

    this.exit = function () {
    }
};
PunchState.prototype = baseState;


///////////////     Android uppercut (colloquially known as the "Sho-ryu-ken")      ///////////////

function UppercutState(parent, relatedStates) {

    var parent = parent;
    var states = relatedStates;
    //this.attackDamage = 1; //low because we're setting up for more

    this.animation = new Animation(parent, Images.getImage("playerUppercut2"), playerUppercutData);

    this.knockup = true;

    this.update = function () {

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
        if (this.animation.isActive === false) {
            if (Input.getKey("down")) {
                //return states.crouchState;
                return states.idleState;
            } else {
                return states.idleState;
            }
        }

        parent.applyBasicPhysics();
    }

    this.handleInput = function () {

    }

    this.onHit = function () {
        punch_UppercutSfx.play();
    }

    this.enter = function () {

        //createParticleEmitter(parent.x + 10, parent.y - 25, robotExplosionParticlesConfig1);

    }

    this.exit = function () {
    }

};
UppercutState.prototype = baseState;


/////////////////      Ninja slice state     ///////////////////
function SliceState(parent, relatedStates) {
    this.sliceProperty = true; //jankier than Lylat Cruise
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
    this.slicing = false; //true when in the middle of a slice animation

    let dashAnim = new Animation(parent, Images.getImage("playerJump"), playerDashData, { loop: true });
    let lockAnim = new Animation(parent, Images.getImage("playerJump"), playerJumpData, { loop: true });
    let sliceUpAnim = new Animation(parent, Images.getImage("sliceVFXUp"), sliceVFXData, { ignoreFlip: true });
    let sliceDownAnim = new Animation(parent, Images.getImage("sliceVFXDown"), sliceVFXData, { ignoreFlip: true });
    let sliceLeftAnim = new Animation(parent, Images.getImage("sliceVFXLeft"), sliceVFXData, { ignoreFlip: true });
    let sliceRightAnim = new Animation(parent, Images.getImage("sliceVFXRight"), sliceVFXData, { ignoreFlip: true });
    let sliceUpLeftAnim = new Animation(parent, Images.getImage("sliceVFXUpLeft"), sliceVFXData, { ignoreFlip: true });
    let sliceDownLeftAnim = new Animation(parent, Images.getImage("sliceVFXDownLeft"), sliceVFXData, { ignoreFlip: true });
    let sliceUpRightAnim = new Animation(parent, Images.getImage("sliceVFXUpRight"), sliceVFXData, { ignoreFlip: true });
    let sliceDownRightAnim = new Animation(parent, Images.getImage("sliceVFXDownRight"), sliceVFXData, { ignoreFlip: true });

    this.animation = dashAnim;

    this.lockOn = function (char) {
        this.generateRandomSliceDirection();
        this.lockedOn = true;
        this.animation = lockAnim;
        timer = gravityDelay;
        target = char;
        if (target.slicesNeeded) { remainingSlices = target.slicesNeeded; }
        else { remainingSlices = 7; }

        parent.x = target.x;
        parent.y = target.y;

        //this.slice();
    }
    this.unlock = function () {
        this.animation = dashAnim;
        this.lockedOn = false;
        this.slicing = false;
        target.lockedOnto = false;
        //console.log("unlock");
        sliceEncoding = [0, 0];
        parent.velocity.y += -parent.jumpVelocity;
    }

    this.update = function () {

        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits
        if (this.lockedOn && remainingSlices === 0) return states.jumpState; //if we didn't catch it because an enemy needed only a single slice
        if (this.slicing && this.animation.isActive === false) {
            nextState = this.finishSlice();
            if (nextState) {
                return nextState;
            }
        }
        if (parent.y > 105) {
            parent.y = GROUNDED_Y;
            return states.crouchState;
        }

        if (!dashDone && !this.lockedOn && !this.slicing) {
            if (parent.x === 0 || parent.x === ORIG_WORLD_W) {
                this.finishDash();
            }
            parent.x += dx;
            parent.y += dy;
            if ((dx >= 0 && parent.x > destination.x) || (dx < 0 && parent.x < destination.x) || (dy >= 0 && parent.y > destination.y) || (dy < 0 && parent.y < destination.y)) {
                this.finishDash();
            }
        } else {
            timer -= dt;
            if (timer <= 0) {
                parent.canDash = false;
                resetCombo();
                return states.jumpState;
                //parent.applyBasicPhysics();
            }

        }

        if (parent.grounded) {
            return states.idleState;
        } else if (dashDone) {
            parent.canDash = false;
            return states.jumpState;
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

            if (this.lockedOn && !this.slicing) {
                this.slice();
            }
            else {
                this.reset();
            }
        }
    }
    this.reset = function () {

        timer = gravityDelay;
        sliceEncoding = [0, 0];
        this.changeDirection();
    }
    this.generateRandomSliceDirection = function () {

        let rand = Math.random();
        if (rand < 0.125) {
            sliceEncoding = [-1, 0]; //up
        }
        else if (rand < 0.250) {
            sliceEncoding = [1, 0]; //down
        }
        else if (rand < 0.375) {
            sliceEncoding = [0, -1]; //left
        }
        else if (rand < 0.500) {
            sliceEncoding = [0, 1]; //right
        }
        else if (rand < 0.625) {
            sliceEncoding = [-1, -1]; //up-left
        }
        else if (rand < 0.750) {
            sliceEncoding = [1, -1]; //down-left
        }
        else if (rand < 0.875) {
            sliceEncoding = [-1, 1]; //up-right
        }
        else {
            sliceEncoding = [1, 1]; //down-right
        }
    }

    //only changes the animation, finishSlice deals the damage
    this.slice = function () {


        let sliceVert = 0;
        let sliceHoriz = 0;

        if (Input.getKey("up")) {
            sliceVert = -1;
        }
        else if (Input.getKey("down")) {
            sliceVert = 1;
        }

        if (Input.getKey("left")) {
            sliceHoriz = -1;
        }
        else if (Input.getKey("right")) {
            sliceHoriz = 1;
        }

        //check if we pressed the correct thing
        if (sliceVert === sliceEncoding[0] && sliceHoriz === sliceEncoding[1]) {
            if (sliceVert === -1) {
                if (sliceHoriz === -1) {
                    this.animation = sliceUpLeftAnim;
                } else if (sliceHoriz === 1) {
                    this.animation = sliceUpRightAnim;
                } else {
                    this.animation = sliceUpAnim;
                }
            }
            else if (sliceVert === 1) {
                if (sliceHoriz === -1) {
                    this.animation = sliceDownLeftAnim;
                } else if (sliceHoriz === 1) {
                    this.animation = sliceDownRightAnim;
                } else {
                    this.animation = sliceDownAnim;
                }
            }
            else if (sliceHoriz === -1) {
                this.animation = sliceLeftAnim;
            } else if (sliceHoriz === 1) {
                this.animation = sliceRightAnim;
            }

            this.slicing = true;
            sliceSfx.play();
            this.animation.loop();
            if (remainingSlices != 1) this.generateRandomSliceDirection();


            registerHitForCombo();
            //player.stats.addArcanePoints(POINTS_PER_SLICE*comboCurrent);
            player.stats.addArcanePoints(POINTS_PER_SLICE);
        }
    }


    this.finishSlice = function () {

        remainingSlices--;
        timer = gravityDelay;
        this.slicing = false;
        this.animation = lockAnim;

        if (target.enemySpawnAnim) {
            createParticleEmitter(target.x,target.y, frogbotExplosion);
            explosionSFX.play();
        }

        if (remainingSlices <= 0) {
            target.die();
            if (target.enemySpawnAnim) {
                GameStateMachine.handleReceivedState(GameStates.endGameState);
            }
            this.unlock();
            player.stats.addArcanePoints(POINTS_PER_KILL);
            parent.velocity.y = -parent.jumpVelocity;
            parent.y -= 10; //lifts the player so he doesn't get insta-grounded ;)
            return states.jumpState;
        }
    }


    this.changeDirection = function () {

        dashDone = false;
        parent.boundsCheck();
        airDashSfx.play();

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

        if (xMult != 0 && yMult != 0) {
            xMult *= 1 / Math.sqrt(2);
            yMult *= 1 / Math.sqrt(2);
        }

        if (xMult === 0 && yMult === 0) {

            dashDone = true;
            timer = 0;
            return;
        }

        destination.x = parent.x + dashDistance * xMult;
        destination.y = parent.y + dashDistance * yMult;
        //console.log(parent.x, parent.y);
        //console.log(destination.x, destination.y);


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
        if (this.lockedOn) { this.unlock(); }
        sliceEncoding = [0, 0];
    }
};
SliceState.prototype = baseState;

///////////////////////////////                 Player stunned state                      ///////////////////////////////////////

function StunnedState(parent, relatedStates) {

    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("playerStunned"), playerStunnedData, { holdLastFrame: true });

    let duration = PLAYER_STUNNED_STATE_LENGTH; //seconds
    let timer = duration;

    this.update = function () {

        parent.applyBasicPhysics();

        timer -= dt;
        if (timer <= 0) {

            timer = duration;
            return "previous";
        }
    }

    this.handleInput = function () {

    }

    this.enter = function () {


    }

    this.exit = function () {
    }

};
StunnedState.prototype = baseState;

////////////////////////            Level clear animation             ///////////////////////////////////

function LevelClearAnimState(parent) {

    var parent = parent;

    let leaping = false;

    this.animation = new Animation(parent, Images.getImage("playerCrouch"), playerCrouchData, { holdLastFrame: true });

    let crouchDuration = 1; //seconds
    let timer = crouchDuration;

    this.update = function () {

        if (parent.y === 0) {
            this.animation = null; // LOL kill the anim so it looks like AND flew above the screen! 
        }
        parent.applyBasicPhysics();
        if (!leaping) {

            timer -= dt;
            if (timer <= 0) {
                leaping = true;
                this.animation = new Animation(parent, Images.getImage("playerJump"), playerJumpData, { loop: true });
                parent.velocity.y = -parent.jumpVelocity;
            }
        } else {
            parent.velocity.y = -parent.jumpVelocity;
        }


    }

    this.handleInput = function () {

        if (this.animation === null) {
            GameStateMachine.handleReceivedState(GameStates.mainMenuState);
        }
    }

    this.enter = function () {

        leaping = false;
        timer = crouchDuration;
        this.animation = new Animation(parent, Images.getImage("playerCrouch"), playerCrouchData, { holdLastFrame: true });
    }

    this.exit = function () {

    }

};
StunnedState.prototype = baseState;

function EndGameIdleState(parent) {
    
    var parent = parent;

    this.animation = new Animation(parent, Images.getImage("playerIdle2"), playerIdleData, { loop: true });

    this.update = function () {}
    this.handleInput = function () {}
    this.enter = function () {}
    this.exit = function () {}
}

// parent must be a Character
function PlayerStates(parent) {

    // Might refactor?
    this.idleState = new IdleAndroidState(parent, this);
    this.walkState = new WalkingAndroidState(parent, this);
    this.crouchState = new CrouchState(parent, this);
    this.uppercutState = new UppercutState(parent, this);
    this.punchingState = new PunchState(parent, this);
    this.jumpState = new JumpState(parent, this);
    this.sliceState = new SliceState(parent, this);
    this.stunnedState = new StunnedState(parent, this);

    this.initial = this.jumpState;
}