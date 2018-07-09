
/// Enemies have general purpose states that will be shared, like walk, stunned etc. 
/// They will take the anims defined in the enemy constructor (see (EnemyName).js)
/// There might also be enemy-specific states created here; they will be clearly marked with their names

function IdleEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    var thinkDelayRemaining = 0;
    var thinkDelayRangeMin = 10;
    var thinkDelayRangeMax = 30;

    this.animation = parent.idleAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

    }

    this.handleInput = function () {
        //if (debug === false) { return; }

        thinkDelayRemaining--;
        if (thinkDelayRemaining > 0) {
            return; // no state change this frame - keep going
        }

        // simplistic weighted random
        var idleStateWeightedChoices = [
            states.jumpState,
            states.crouchState,
            states.punchState,
            states.punchState,
            states.punchState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.idleState // stay idle?
        ];

        // don't think again for a while
        thinkDelayRemaining = thinkDelayRangeMin + (Math.round(Math.random() * (thinkDelayRangeMax - thinkDelayRangeMin)));

        return idleStateWeightedChoices[Math.floor(Math.random() * idleStateWeightedChoices.length)];

        // PLAYER example input detection for reference:
        /*
        if (Input.getKey("up")){
            return states.jumpState;
        }
        else if (Input.getKey("down")) {
            return states.crouchState;
        }
        else if (Input.getKeyDown("z")) {
            return states.punchState;
        }

        else if (Input.getKey("left") || Input.getKey("right")) {
            return states.walkState;
        }
        else if (Input.getKey("down")) {
            return states.crouchState;
        }
        */
    }

    this.onHit = function () {

    }
    this.enter = function () {
        parent.velocity.x = 0;
    }
    this.exit = function () {
    }
}
IdleEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function WalkEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    var thinkDelayRemaining = 0; // so we don't change our minds every frame
    var thinkDelayRangeMin = 10;
    var thinkDelayRangeMax = 30;
    parent.aiWalkDirection = 1; // default values

    this.animation = parent.walkAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        // apply our walking velocity
        parent.velocity.x = parent.walkSpeed * parent.aiWalkDirection; // left or right

    }

    this.handleInput = function () {
        //if (!debug) { return; }

        const debugAI = false; // console spam

        // go towards the player unless too close (FIXME: not centered? offset to the left corner?)
        const TOOCLOSE = 32; // FIXME: need to be close enough to hit 

        var distanceToPlayer = parent.x - player.x;

        if (distanceToPlayer > 0) { // is the player to the right of me?

            if (debugAI) console.log("ai dist: " + distanceToPlayer + " - player is to the RIGHT of me!");
            if (distanceToPlayer < TOOCLOSE) { // back off
                console.log("backing off to the right");
                parent.aiWalkDirection = 1;
            }
            else { // close in
                if (debugAI) console.log("closing in to the left");
                parent.aiWalkDirection = -1;
            }

        }
        else // is the player to the right of me?
        {

            if (debugAI) console.log("ai dist: " + distanceToPlayer + " - player is to the LEFT of me!");
            if (distanceToPlayer > -TOOCLOSE) { // back off
                if (debugAI) console.log("backing off to the left");
                parent.aiWalkDirection = -1;
            }
            else { // close in
                if (debugAI) console.log("closing in to the right");
                parent.aiWalkDirection = 1;
            }

        }

        // randomly choose a walk direction instead:
        // parent.aiWalkDirection = (Math.random() < 0.5 ? 1 : -1); // 1 or -1 means right or left

        // make the sprite face the right way
        parent.flipped = (parent.aiWalkDirection == -1); // true/false

        thinkDelayRemaining--;
        if (thinkDelayRemaining > 0) {
            return; // no state change this frame - keep going
        }

        // simplistic weighted random
        var walkStateWeightedChoices = [
            states.jumpState,
            states.crouchState,
            states.punchState,
            states.walkState, // continue to walk in the same direction
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.walkState,
            states.idleState // stop walking
        ];

        // don't think again for a while
        thinkDelayRemaining = thinkDelayRangeMin + (Math.round(Math.random() * (thinkDelayRangeMax - thinkDelayRangeMin)));

        return walkStateWeightedChoices[Math.floor(Math.random() * walkStateWeightedChoices.length)];

        // PLAYER version that uses inputs for reference:
        /*
        if (Input.getKey("up")) {
            return states.jumpState;
        }
        else if (Input.getKey("down")) {
            return states.crouchState;
        }
        else if (Input.getKeyDown("z")) {
            return states.punchState;
        }

        if (Input.getKey("left")) {
            parent.velocity.x = -parent.walkSpeed;
        }
        else if (Input.getKey("right")) {
            parent.velocity.x = parent.walkSpeed;
        }
        else {
            return states.idleState;
        }
        */

    }

    this.onHit = function () {

    }
    this.enter = function () {

    }
    this.exit = function () {
    }
}
WalkEnemyState.prototype = baseState;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function JumpEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.jumpAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        if (parent.grounded) {
            return states.idleState;
        }

    }

    this.handleInput = function () {
        if (!debug) { return; }
        if (Input.getKey("left")) {
            parent.velocity.x = -parent.walkSpeed;
        }
        else if (Input.getKey("right")) {
            parent.velocity.x = parent.walkSpeed;
        }
    }

    this.enter = function () {
        parent.velocity.y = -10;
        parent.grounded = false;
        parent.y -= 10; //avoid being insta-grounded
    }
    this.exit = function () {
    }
}
JumpEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function StunnedEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    let duration = 0.5; //seconds
    let timer = duration;

    this.animation = parent.stunnedAnim;

    this.update = function () {
        //parent.applyBasicPhysics();

        if (parent.knockupThisFrame) {
            parent.velocity.y = -30 * randomRange(0.8, 1); //this value is strangely affected by other things... suspicious
            return states.knockupState;
        }

        timer -= dt;
        if (timer <= 0) {
            if (parent.canBeKnockedUp) {
                this.animation = parent.knockedUpAnim;
            } else {
                timer = duration;
                return "previous";
            }
        }
    }

    this.handleInput = function () {

    }

    this.enter = function () {
        if (parent.stats.getNewHP() <= parent.stats.getModifiedHP() / 3) {

            parent.canBeKnockedUp = true;

        }
    }
    this.exit = function () {
    }
}
StunnedEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function KnockupEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    let duration = 2.5; //seconds
    let timer = duration;


    this.animation = parent.knockedUpAnim;

    this.update = function () {

        if (parent.lockedOnto) { return; }

        if (parent.hitThisFrame) { return states.stunnedState; }
        if (parent.grounded) {
            timer = duration;
            return states.idleState;
        }

        if (parent.velocity.y < 0) {
            parent.applyKnockupPhysics();
        }
        else if (parent.velocity.y >= 0) {
            timer -= dt;
        }

        if (timer <= 0) {
            parent.applyKnockupPhysics();
        }
    }

    this.handleInput = function () {

    }

    this.enter = function () {
        //parent.velocity.x = 15 * randomMin1To1();

    }
    this.exit = function () {
    }
}
KnockupEnemyState.prototype = baseState;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CrouchEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.crouchAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

    }

    this.handleInput = function () {
        if (!Input.getKey("down")) {
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
CrouchEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UppercutEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.uppercutAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        if (this.animation.isActive === false) {
            return states.idleState;
        }

    }

    this.handleInput = function () {

    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
StunnedEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PunchEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    this.attackDamage = 50;

    this.animation = parent.punchAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        if (this.animation.isActive === false) {
            return states.idleState;
        }
    }

    this.handleInput = function () {

    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
PunchEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// parent must be a Character
function EnemyStates(parent) {

    // Might refactor?
    this.idleState = new IdleEnemyState(parent, this);
    this.walkState = new WalkEnemyState(parent, this);
    this.uppercutState = new UppercutEnemyState(parent, this); // this might become specific to kangarobot, therefore removed from here
    this.crouchState = new CrouchEnemyState(parent, this);
    this.stunnedState = new StunnedEnemyState(parent, this);
    this.punchState = new PunchEnemyState(parent, this);
    this.jumpState = new JumpEnemyState(parent, this);
    this.knockupState = new KnockupEnemyState(parent, this);


    this.initial = this.jumpState;
}