// Finite state machine implementation in JS. Can be used for: character animations, game states, scenes, anything you can think of!
// Made by your Canuck/slash/Baguette BFF Remy :) with inspiration from Robert Nystrom's "Game Programming Patterns", free on the interwebs and a very good read!

// Unlike the Input and Images module, you need to create an instance of your machine and give it to your objects (notice the usage of this. and not StateMachine.)
// This is because each machine is unique, has different states, and objects could have multiple FSMs given to them.
// For example, the player to have a state machine for animations, while the inputs are being handled by another.

// Might eventually be extended to handle stack of states

function StateMachine(defaultState) {

    var currentState;
    var previousState;
    var defaultState = defaultState; //could also be used as a "reset" state ?


    this.update = function () {
        if (!currentState) {
            this.resetToDefault();
        }
        var nextState = currentState.update();
        if (nextState) {
            this.handleReceivedState(nextState);
        }

        this.handleInput(); //once we're done updating, we take the input. We might need to switch this order at some point(?)
    }

    this.updateAnimation = function () {
        if (!currentState) {
            this.resetToDefault();
        }
        if (currentState.animation) { currentState.animation.update(); }
    }

    // our machine acts as the head, and delegates most of the handling to the current state
    // we return the next state directly from the state object logic itself and change if needed
    this.handleInput = function () {

        var nextState = currentState.handleInput();
        if (nextState) { this.handleReceivedState(nextState); }

    }


    // Use only for crude, exceptional cases
    // If you can, return a new state in the state update functions!
    this.changeState = function (state) {

        if (typeof state.enter === "undefined") {
            console.log("Error: state provided is not valid. Could not change.");
            return;
        }

        if (typeof currentState !== "undefined") {
            currentState.exit();
        }

        previousState = currentState;
        currentState = state;

        state.enter(); //states handle their own initialization
    }

    this.changeToPrevious = function () {

        if (typeof previousState === "undefined") {
            console.log("Error: state machine has no previous state. Returning...");
            return;
        }

        currentState.exit();

        currentState = previousState;
        previousState = undefined; //might not work. Eventually, we could have a stack of states, which might be useful for complex animations

        currentState.enter();
    }

    //Changes to the next state that was received through one of the update functions of the current state
    this.handleReceivedState = function (nextState) {

        //Weakly typed languages ftw
        if (nextState === "previous") {
            this.changeToPrevious();
            return;
        }
        currentState.exit();
        if (nextState.animation) {
            nextState.animation.loop();
        }
        //make the switch and save previous
        previousState = currentState;
        currentState = nextState;
        currentState.enter();

    }

    this.resetToDefault = function () {
        this.changeState(defaultState);
    }

    // Used to call draws from outside the FSM
    this.drawCurrentState = function (x, y) {
        if (currentState.animation) {
            currentState.animation.draw(x, y);
        }
        else {
            console.log("Current state no animation to draw.");
        }
        if (currentState.collider) {
            currentState.collider.draw();
        }
    }

    this.getAnimation = function () {
        return currentState.animation;
    }
}

// The following is what is known in programming as an "interface". It defines a set of methods (update, enter, exit etc.) that any State object
// must absolutely implement. Here, they are left blank, because we implement them in the actual state object definition.
// In other words, we're saying: if you make a State, define these functions, because we need them!
// Normally, the compiler in other languages would FORCE YOU to implement these methods. Here, we at least give
// a console log if the method is undefined

function State() {

    this.update = function () {
        console.log("Warning: Current state must implement 'update' method");
    }

    this.handleInput = function () {
        console.log("Warning: Current state must implement 'handleInput' method");
    }

    this.enter = function () {
        console.log("Warning: Current state must implement 'enter' method");
    }

    this.exit = function () {
        console.log("Warning: Current state must implement 'exit' method");
    }

}

/////////     Example     //////////
/*
function ExampleState () {

    this.update = function () {

        // do stuff

    }

    // IMPORTANT: you can return a State object here if you wanna change depending on inputs
    this.handleInput = function () {
        
        if (Input.getKeyDown("mouseleft")){

            // handle click
            console.log("click")

        }

        if (Input.getKey("right")) {

            // move right
            // also, change the animator to the "walkRight" anim, etc

        }


    }

    this.enter = function () {
        console.log("You've entered an example state!");
    }

    this.exit = function () {
        console.log("You've exited the example state!")
    }

}
ExampleState.prototype = new State();

var exampleState = new ExampleState();

var myMachine = new StateMachine(exampleState); //create and init at default state
*/
