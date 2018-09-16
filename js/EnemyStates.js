
/// Enemies have general purpose states that will be shared, like walk, stunned etc. 
/// They will take the anims defined in the enemy constructor (see (EnemyName).js)
/// There might also be enemy-specific states created here; they will be clearly marked with their names

const DIZZY_FX_WHEN_STUNNED_IN_AIR = true; // particles when stunned and immobile in the air

function IdleEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    var thinkDelayRemaining = 0;
    var thinkDelayRangeMin = 10;
    var thinkDelayRangeMax = 30;

    this.canThinkDuring = true;

    this.animation = parent.idleAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

    }

    this.handleInput = function () {


        var distanceToPlayer = parent.x - player.x;
        /*if (TOOCLOSE < Math.abs(distanceToPlayer) && Math.abs(distanceToPlayer) < attackRange) {
            
            if (Math.random() < 0.5) {
                return states.punchState;
            } else {
                return states.crouchState;
            }
            return states.punchState;
        }*/
        // simplistic weighted random
        var idleStateWeightedChoices = [
            states.jumpState,
            states.crouchState,
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

        //return idleStateWeightedChoices[Math.floor(Math.random() * idleStateWeightedChoices.length)];

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

    this.AIWalkDirection = 1; // default value

    this.canThinkDuring = true;

    this.animation = parent.walkAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        // apply our walking velocity
        parent.velocity.x = parent.walkSpeed * this.AIWalkDirection; // left or right


    }

    this.handleInput = function () {




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


        if (parent.knockupThisFrame) {
        
            parent.velocity.y = -30 * randomRange(0.8, 1); //this value is strangely affected by other things... suspicious
            return states.knockupState;
        }
        else {
            parent.applyBasicPhysics();
        }

        timer -= dt;
        if (timer <= 0) {
            if (parent.canBeKnockedUp) {
                this.animation = parent.knockedUpAnim;
            } else {
                timer = duration;
                return states.idleState;
            }
        }
    }

    this.handleInput = function () {

    }

    this.enter = function () {

        if (parent.stats.getNewHP() <= parent.stats.getModifiedHP() / 4) {

            parent.canBeKnockedUp = true;

        }
        
        parent.velocity.x = parent.x < player.x ? -5:5; //Bump the character so we can't stand still and punch

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

        if (DIZZY_FX_WHEN_STUNNED_IN_AIR) {
            // dizzy stars
            var starz = createParticleEmitter(parent.x, parent.y - 10, stunnedParticlesConfig);
        }
        
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
        createParticleEmitter(parent.x + 10, parent.y - 25, robotExplosionParticlesConfig1);

    }
    this.exit = function () {
    }
}
KnockupEnemyState.prototype = baseState;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CrouchEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.canThinkDuring = true;

    this.animation = parent.crouchAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

    }

    this.handleInput = function () {

        if (debug){
            if (!Input.getKey("down")) {
                return states.idleState;
            }
            if (Input.getKeyDown("z")) {
                return states.uppercutState;
            }
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
    this.attackDamage = 20;

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
UppercutEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PunchEnemyState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    this.attackDamage = 50;

    let jumped = false;

    this.animation = parent.punchAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        if (parent.SDAttack && this.animation.isActive === false) {

            parent.die();
            createParticleEmitter(parent.x, parent.y, frogbotExplosion);
            player.stats.characterHasBeenHitSoCalculateNewHP(0, 100);
            player.hitThisFrame = true;
        }
        if (this.animation.isActive === false) {
            return states.idleState;
        } else if (jumped && parent.grounded) {
            return states.idleState;
        }

        if (parent.jumpAttack && !jumped && this.animation.getCurrentFrameNumber()===1) {
            parent.velocity.x = 10*parent.flipped ? -10:10;
            parent.velocity.y = -8;
            jumped = true;
            //parent.grounded = false;
            tigerobotRoarSfx.play();
        }

    }

    this.handleInput = function () {

    }

    this.enter = function () {
        jumped = false;
        if (parent.attackSfx) {
            parent.attackSfx.play();
        }
    }
    this.exit = function () {
        if (parent.attackSfx) {
            parent.attackSfx.stop();
        }
    }
}
PunchEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// parent must be a Character
function EnemyStates(parent) {

    // Might refactor?
    this.idleState = new IdleEnemyState(parent, this);
    this.walkState = new WalkEnemyState(parent, this);
    this.crouchState = new CrouchEnemyState(parent, this);
    this.stunnedState = new StunnedEnemyState(parent, this);
    this.punchState = new PunchEnemyState(parent, this);
    this.jumpState = new JumpEnemyState(parent, this);
    this.knockupState = new KnockupEnemyState(parent, this);

    if (parent.uppercutAnim) {
        this.uppercutState = new UppercutEnemyState(parent, this); // this might become specific to kangarobot, therefore removed from here
    }

    this.initial = this.jumpState;
}