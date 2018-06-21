
function IdleEnemyState(parent,relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("kangarobotIdle"), kangarobotIdleData, {loop : true});
    
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
IdleEnemyState.prototype = baseState;

// parent must be a Character
function EnemyStates(parent) {

    // Might refactor?
    this.idleState = new IdleEnemyState(parent,this);


    this.initial = this.idleState;
}