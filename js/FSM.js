// Finite state machine implementation in JS. Can be used for: character animations, game states, scenes, anything you can think of!
// Made by your Canuck/slash/Baguette BFF Remy :) with inspiration from Robert Nystrom's "Game Programming Patterns", free on the interwebs and a very good read!

// Unlike the Input and Images module, you need to create an instance of your machine and give it to your objects (notice the usage of this. and not StateMachine.)
// This is because each machine is unique, has different states, and objects could have multiple FSMs given to them.
// For example, the player to have a state machine for animations, while the inputs are being handled by another.

// Might eventually be extended to handle stack of states

function StateMachine (defaultState){

    var currentState;
    var previousState;
    var defaultState = defaultState; //could also be used as a "reset" state ?

    
     // our machine acts as the head, and delegates most of the handling to the current state
     // we return the next state directly from the state object logic itself and change if needed
    this.handleInput = function () {

        nextState = currentState.handleInput();

        if (typeof nextState !== "undefined"){
            console.log("Changing");
            currentState.exit();
            //make the switch and save previous
            previousState = currentState;
            currentState = nextState;
            currentState.enter();
        }
    }

    this.update = function () {
        if (typeof currentState === "undefined") {
            this.resetToDefault();
        }
        currentState.update();
    }

    // Use only for crude, exceptional cases (like resetting to default)
    // Otherwise, return a new state in the state.handleInput function!
    this.changeState = function (state){

        if (typeof state.enter === "undefined"){
            console.log ("Error: state provided is not valid. Could not change.");
            return;
        }

        if (typeof currentState !== "undefined"){
            currentState.exit();
        }

        previousState = currentState;
        currentState = state;

        state.enter(); //states handle their own initialization
    }

    this.changeToPrevious = function () {

        if (typeof previousState === "undefined") {
            console.log("Error: state machine has no previous state. Returning...");
        }

        currentState.exit();

        currentState = previousState;
        previousState = undefined; //might not work. Eventually, we could have a stack of states, which might be useful for complex animations

        currentState.enter();
    }

    this.resetToDefault = function () {
        console.log("Setting default state: " + defaultState);
        this.changeState(defaultState);
    }

}

// The following is what is known in programming as an "interface". It defines a set of methods (update, enter, exit etc.) that any State object
// must absolutely implement. Here, they are left blank, because we implement them in the actual state object definition.
//
// In other words, we're saying: if you make a State, define these functions, because we need them!

function State () {

    this.update = function () {

        console.log("Error: State does not implement 'update' method");

    }

    this.handleInput = function () {

    }

    this.enter = function () {

    }

    this.exit = function () {

    }
}

/////////     Example     //////////


function ExampleState () {

    this.prototype = new State();

    this.update = function () {

        //canvasContext.drawImage(Images.getImg("viewtiful"), 0, 0,600,600); 
        //console.log(this.prototype);

        for (var i = 0, l = emitters.length; i < l; i++) {
            emitters[i].update(dt);
        }

    }

    this.handleInput = function () {
        
        if (Input.getKey("mouseleft")){

            emitterConfig.x = Input.getMouseX();
            emitterConfig.y = Input.getMouseY();
            //console.log(Input.getMouseX());
            emitters.push(new ParticleEmitter(emitterConfig));
        }

        if (Input.getKey("space")){

            return new DoNothingState();
        }

    }

    this.enter = function () {
        console.log("Entered the example state!");
    }

    this.exit = function () {
        console.log("Exit the example state. Now, inputs will not be detected!")
    }

}

function DoNothingState () {
    
    this.update = function (){

    }

    this.handleInput = function () {

    }

    this.enter = function () {
        console.log ("Started doing nothing...");
    }

    this.exit = function () {

    }
}

var exampleState = new ExampleState();
var doNothingState = new DoNothingState();

var myMachine = new StateMachine(exampleState);
myMachine.resetToDefault();