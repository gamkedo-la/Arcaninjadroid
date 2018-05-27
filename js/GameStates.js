
var baseState = new State();
GameStates = {};

function InGameState () {

    this.update = function () {

        clearScreen(canvas); //eventually, will be something like "get the current level's bg and draw it"
        updateAllCharacters();
        updateAllEmitters();
    
        resolveAllCollisions();

    };

    this.handleInput = function () {

        if (Input.getKeyDown("p")){
            console.log("pause");
            return new AnimationEditorState();
        }
        
    };

    this.enter = function () {

    };

    this.exit = function () {

    };

};
InGameState.prototype = baseState;

GameStates.inGameState = new InGameState();
//GameStates.inGameState = new AnimationEditorState();

var GameStateMachine = new StateMachine(GameStates.inGameState);

function PauseState () {
    //TODO    
}
