// Finite state machine implementation in JS. Can be used for: character animations, game states, scenes, anything you can think of!
// Made by your Canuck/Baguette BFF Remy :) with inspiration from Robert Nystrom's "Game Programming Patterns", free on the interwebs and a very good read!

// Unlike the Input and Images module, you need to create an instance of your machine and give it to your objects (notice the usage of this.foo and not StateMachine.foo)
// This is because each machine is unique, has different states, and objects could have multiple FSMs given to them.

function StateMachine(defaultState) {

    var currentState;
    var previousState;
    var defaultState = defaultState; //can also be used as a "reset" state


    // our machine acts as the head, and delegates most of the handling to the current state
    // we return the next state directly from the state object logic itself and change if needed
    this.update = function () {
        if (!currentState) {
            this.resetToDefault(); // if for some reason there is no state, just reset (on the first frame of every State Machine created)
        }
        var nextState = currentState.update(); //get next state from update
        if (nextState) {
            this.handleReceivedState(nextState);
            return; // no need to handle inputs, as we've changed states anyway
        }

        this.handleInput(); //once we're done updating, we take the input. We might need to switch this order at some point(?)
    }

    this.updateAnimation = function () {
        if (!currentState) {
            this.resetToDefault();
        }
        if (currentState.animation) { currentState.animation.update(); }
    }

    // Input detection is defined in the actual state object
    this.handleInput = function () {

        var nextState = currentState.handleInput();
        if (nextState) {
            this.handleReceivedState(nextState);
            return;
        }
    }

    this.draw = function () {
        if (currentState.draw) {
            currentState.draw();
        } else {
            console.log("Tried to call inexistent draw function on state machine:", this);
        }
    }

    // Left commented to reuse after the game releases
    // Use only for crude, exceptional cases
    // If you can, return a new state in the state update functions instead!
    /*
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
    }*/

    this.changeToPrevious = function () {

        if (typeof previousState === "undefined") {
            console.log("Error: state machine has no previous state. Returning...");
            return;
        }

        currentState.exit();

        currentState = previousState;
        previousState = undefined; //might not work. Eventually, we could have a stack of states, which might be useful for complex animations (?)

        currentState.enter();
    }

    //Changes to the next state that was received through one of the update functions of the current state
    this.handleReceivedState = function (nextState) {

        //Weakly typed languages ftw
        if (nextState === "previous") {
            nextState = previousState;
            if (typeof previousState === "undefined") {
                console.log("Error: state machine has no previous state. Returning...");
                return;
            }
        }

        if (currentState){
            currentState.exit(); //could have been undefined if received from another source than updates (like at init)
        }
        if (nextState.animation && nextState!=currentState) {
            nextState.animation.loop();
        }
        //make the switch and save previous
        previousState = currentState;
        currentState = nextState;
        currentState.enter();

    }

    this.resetToDefault = function () {
        this.handleReceivedState(defaultState); //handleReceivedState is used as a crude way to change states here; only when necessary! Instead, return states in update and/or handleInputs! :)
    }

    this.getAnimation = function () {
        if (currentState && currentState.animation) {
            return currentState.animation;
        } else {
            //console.log("No animation to access for state machine:", this);
        }
    }

    this.getCurrentState = function () {
        return currentState;
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

/*
////////     Example     //////////
//(uncommenting does nothing unless you add myMachine.update() somewhere that updates game state)

function ExampleState () {

    // IMPORTANT: you can return a State object here if you wanna change depending on update
    this.update = function () {

        // do stuff

    }

    // IMPORTANT: you can return a State object here if you wanna change depending on inputs
    this.handleInput = function () {
        
        if (Input.getLeftClick()){

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