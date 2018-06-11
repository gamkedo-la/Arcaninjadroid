
var baseState = new State();

//GameStates = {}; //hold all the states

function InGameState() {

    var justEntered; //hackity hack

    this.background = Images.getImage("moonlitForest");

    this.update = function () {

        updateAllCharacters();
        updateAllEmitters();

        resolveAllCollisions();
        justEntered = false;

    };

    this.handleInput = function () {
        if (Input.getKeyDown("q")) {
            debug = !debug;
        }
        if (Input.getKeyDown("p")) {
            return GameStates.pauseState;
        }
    };

    this.draw = function () {
        if (justEntered) { return; }
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        //canvasContext.fillStyle = "red";
        //colorRect(0, ninjaZoneBeginningY, canvas.width, 1); //draws the line separating the ninja zone (the sky) from the android zone
        drawAllCharacters();
        drawAllTerrain();
        ParticleRenderer.renderAll(canvasContext); //for now, we draw our particles on top. prob will be expanded later in the project
    }

    this.enter = function () {
        justEntered = true;
    };

    this.exit = function () {
    };

};
InGameState.prototype = baseState;

function PauseState() {
  this.background = Images.getImage("PH_menuScreen");// this is placeholder for now change.

  this.update = function () {
  };

  this.handleInput = function () {
      if (Input.getKeyDown("enter")) {
          return GameStates.inGameState;
      }
      if (Input.getKeyDown("escape")) {
          return GameStates.mainMenuState;
      }
  };

  this.draw = function () {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
  };

  this.enter = function () {
    console.log("entering pause menu");
  };

  this.exit = function () {
    console.log("exiting pause menu");
  };
}
PauseState.prototype = baseState;

function MainMenuState() {

    this.background = Images.getImage("PH_menuScreen");

    this.update = function () {

    };

    this.handleInput = function () {
        if (Input.getKeyDown("enter")) {
            return GameStates.inGameState;
        }
    };

    this.draw = function () {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
    };

    this.enter = function () {

    };

    this.exit = function () {

    };
}
MainMenuState.prototype = baseState;

//GameStates.inGameState = new InGameState();
var GameStates = {
    inGameState: new InGameState(),
    mainMenuState: new MainMenuState(),
    pauseState: new PauseState()
};

var GameStateMachine = new StateMachine(GameStates.mainMenuState);
