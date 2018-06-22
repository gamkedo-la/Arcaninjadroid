
/// Enemies have general purpose states that will be shared, like walk, stunned etc. They will take the anims defined in the enemy constructor (see (EnemyName).js)

/// There might also be enemy-specific states created here; they will be clearly marked with their names

function IdleEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.idleAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();

    }

    this.handleInput = function () {
        if (debug === false) {return;}
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
    }

    this.enter = function () {
        parent.velocity.x = 0;
    }
    this.exit = function () {
    }
}
IdleEnemyState.prototype = baseState;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function WalkEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.walkAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();
        parent.velocity.x = parent.walkSpeed;

    }

    this.handleInput = function () {
        if (!debug) {return;}
        if (Input.getKey("up")){
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

    }

    this.enter = function () {

    }
    this.exit = function () {
    }
}
WalkEnemyState.prototype = baseState;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function JumpEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.jumpAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();

        if (parent.grounded) {
            return states.idleState;
        }

    }

    this.handleInput = function () {
        if (!debug) {return;}
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

function StunnedEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.stunnedAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();

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

function CrouchEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.crouchAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();

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

function UppercutEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.uppercutAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();

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

function PunchEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = parent.punchAnim;
    
    this.update = function () {

        parent.applyBasicPhysics();

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
    this.idleState = new IdleEnemyState(parent,this);
    this.walkState = new WalkEnemyState(parent,this);
    this.uppercutState = new UppercutEnemyState(parent,this); // this might become specific to kangarobot, therefore removed from here
    this.crouchState = new CrouchEnemyState(parent,this);
    this.stunnedState = new StunnedEnemyState(parent,this);
    this.punchState = new PunchEnemyState(parent,this);
    this.jumpState = new JumpEnemyState(parent,this);


    this.initial = this.jumpState;
}