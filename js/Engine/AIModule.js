
// Disclaimer: I am not an AI coder and this is not meant to be used as reference for solid game AI code.
// My intention is simply to extract the AI code from the states in order to generate a simple "state generator"
// with multiple configurations available

// Update: turns out this has become the single worst piece of AI code I've ever made (also the first lol).
// Never ever use this as reference, inspiration, save it anywhere permanently, and don't read through it because I want to preserve my facade as a decent coder
// Thanks,
// Remy

/*
possibleStates should be an object litteral with the format 
{
    walk: myChar.walkState
}
etc. 
*/

// "State" refers to an in-game character action (walking, idling, jumping etc)
// "Decision" refers to the choices made by the AI. Am I passive, attacking, closing in, running away, etc.

function AIModule (parent, possibleStates, config) {

    let states = possibleStates; //shorter to write, but not as self-descriptive
    if (!config) {config = {}; } //trying to look at properties of "undefined" is not allowed
 
    let _attackDistance = 0; //changes depending on the attack we're currently trying to do

    let thinkDelayRangeMin = config.thinkDelayRangeMin || 10;
    let thinkDelayRangeMax = config.thinkDelayRangeMax || 30;
    let scaredTargetDistance = config.scaredTargetDistance || 120;

    let _timeUntilThink = 0; //resetThinkTimer is called at init

    //let decisionsAllowed = { passive:true, attack:true };

    //let decisionsAllowed = ["passive"];

    let decisionPassive = {
        walk:0.5,
        idle:0.5
    }


    let decisionScared = {
        walk: 1
    }

    let decisionAggro = {
        walk: 0.7,
        crouch: 0.1,
        jump: 0.2
    }
    
    //Frogbot can't walk
    if (!states.walkState) {
        decisionPassive = { jump: 1}; //this is the worst code I've ever written
        decisionScared = { jump: 1};
        decisionAggro = { jump: 0.6, crouch: 0.4 };
    }

    let _currentDecision = decisionAggro;

    // go towards the player unless too close
    //when standing between TOOCLOSE and attackRange, attacks will be triggered
    const TOOCLOSE = 5;
    let attackRange = config.attackRange || 20;
    
    //when an enemy is scared, they'll run away from the player until they are far away
    const FARENOUGH = 50;

    this.update = function () {

        _timeUntilThink--;

        if (_timeUntilThink <= 0) {

            resetThinkTimer();
            return think(); //think returns one of the states our character can use
        }
    }

    // just to make it clear that this is for extraordinary cases
    this.forceThink = function () {
        think();
    }

    let resetThinkTimer = function () {
        _timeUntilThink = thinkDelayRangeMin + (Math.round(Math.random() * (thinkDelayRangeMax - thinkDelayRangeMin)));
    }
    resetThinkTimer();


    let think = function() {

        let rand = Math.random();
        let _weightTally = 0;

        //Generates a DECISION based on current GAME VARIABLES (for example parent health)
        if (parent.getCurrentHP() < parent.getMaxHP()/2) {
            _currentDecision = decisionScared;   
        } else {
            _currentDecision = decisionAggro;
        }



        // Parent changes for "passive" decision
        if (_currentDecision === decisionPassive){

            let direction = Math.random() < 0.5 ? 1:-1;

            if (states.walkState) states.walkState.AIWalkDirection = direction;
            parent.flipped = (direction === -1);
        }
        // for "scared" decision
        else if (_currentDecision === decisionScared) {

            let direction = Math.sign(getXDistanceFrom(player));
            if (states.walkState) states.walkState.AIWalkDirection = direction;
            parent.flipped = (direction === -1);
            if (Math.abs(getXDistanceFrom(player)) >= FARENOUGH) {
                //return states["idleState"];
                if (states.walkState) states.walkState.AIWalkDirection = -direction;
                else {
                    parent.velocity.x += 5 * direction; 
                }
                parent.flipped = (direction === -1);
            }
        }

        // for "aggro" decision
        else if (_currentDecision === decisionAggro) {

            let direction = -Math.sign(getXDistanceFrom(player));

            if (states.walkState) states.walkState.AIWalkDirection = direction;
            else {
                parent.velocity.x += 5 * direction; 
            }
            parent.flipped = (direction === -1);
        }


        if (Math.abs(getXDistanceFrom(player)) > TOOCLOSE && Math.abs(getXDistanceFrom(player)) < attackRange) {
            
            if (states["uppercutState"] && rand <= 0.5){
                return states["uppercutState"];
            }
            else if (states["punchState"]){
                return states["punchState"];
            }
        }

        // Generates a STATE based on the current DECISION
        for (state in _currentDecision) {
            
            _weightTally += _currentDecision[state];
            if (rand <= _weightTally) {
                //console.log("Chose to: ", state);

                return states[state+"State"] //bit hacky, depends on the naming convention used
            
            }

        }

    }

    // Return positive if parent at the right, negative if at the left
    let getXDistanceFrom = function (other) {
        return parent.x - other.x;
    }

}