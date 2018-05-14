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
            //Weakly typed languages ftw
            if (nextState === "previous") {
                this.changeToPrevious();
                return;
            }
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
            return;
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
// In other words, we're saying: if you make a State, define these functions, because we need them!
// Normally, the compiler in other languages would FORCE YOU to implement these methods. Here, we at least give
// a console log if the method is undefined

function State () {

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

var parent1 = {
    x:100,
    y:100
}
var parent2 = {
    x:150,
    y:100
}

var parent3 = {
    x:250,
    y:100
}

var rect1 = new RectCollider(parent1, 45, 45);
var rect2 = new RectCollider(parent2, 45, 45);
var circ1 = new CircleCollider(parent3, 25);
var circ2 = new CircleCollider(parent1, 50);

function ExampleState () {

    this.update = function () {

        canvasContext.drawImage(Images.getImage("viewtiful"), 0, 0,600,600);
        rect1.draw();
        rect2.draw();
        circ1.draw();
        circ2.draw();
        //console.log(circ1.intersects(circ2));
        //myAnim.update(dt);
        //if (myAnim.isActive === true) myAnim.draw(400,300);

    }

    this.handleInput = function () {
        
        if (Input.getKeyDown("mouseleft")){

            var x = Input.getMouseX();
            var y = Input.getMouseY();

            new ParticleEmitter(x,y,emitterConfig);

        }

        parent3.x = Input.getMouseX();
        parent3.y = Input.getMouseY();

        if (Input.getKeyDown("space")){

            return new DoNothingState();
        }

        if (Input.getKeyDown("up")) {
            parent1.y -= 10;
        }
        if (Input.getKeyDown("down")) {
            parent1.y += 10;
        }
        if (Input.getKeyDown("left")) {
            parent1.x -= 10;
        }
        if (Input.getKeyDown("right")) {
            parent1.x += 10;
        }


    }

    this.enter = function () {
        console.log("Entered the example state!");
    }

    this.exit = function () {
        console.log("Exit the example state. Now, inputs will not be detected!")
    }

}
ExampleState.prototype = new State(); //if forgotten, our pseudo-interface is broken, but there are no bugs


function DoNothingState () {
    
    this.update = function (){

    }

    this.handleInput = function () {

        if (Input.getKeyDown("backspace")) {
            return "previous";
        }
    }

    this.enter = function () {
        console.log ("Started doing nothing...");
    }

    this.exit = function () {

    }
}
DoNothingState.prototype = new State();

var exampleState = new ExampleState();
var doNothingState = new DoNothingState();

var myMachine = new StateMachine(exampleState);
myMachine.resetToDefault();