
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

        if (currentMusic.getPaused() === true){
            startAudio();
        }


    };

    this.exit = function () {
    };

};
InGameState.prototype = baseState;

function PauseState() {
  this.background = Images.getImage("moonlitForest");
  var gamePausedText = Images.getImage("gamePaused");

  this.update = function () {
  };

  this.handleInput = function () {
    if (Input.getKeyDown("p")) {
        return GameStates.inGameState;
    }
    if (Input.getKeyDown("escape")) {
        return GameStates.mainMenuState;
    }
  };

  this.draw = function () {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        drawAllCharacters();
        drawAllTerrain();
        ParticleRenderer.renderAll(canvasContext);
        colorRectAlpha(0,0,canvas.width,canvas.height,[0,0,0,0.65]);
        canvasContext.drawImage(gamePausedText, 0, 35);
  };

  this.enter = function () {
    pauseAudio();
  };

  this.exit = function () {
    resumeAudio();
  };
}
PauseState.prototype = baseState;

function MainMenuState() {

    this.background = Images.getImage("mainMenu");

    this.buttons = [
        new UIElement(180,30,Images.getImage("startGame"), true),
        new UIElement(180,50,Images.getImage("loadGame"), false),
        new UIElement(180,70,Images.getImage("options"), true),
        new UIElement(180,90,Images.getImage("credits"), true)
    ];

    let currentFocus = 0;
    this.buttons[currentFocus].hasFocus = true;

    this.update = function () {

    };

    this.handleInput = function () {
        if (Input.getKeyDown("enter")) {
            return GameStates.inGameState;
        }
        if (Input.getKeyDown("up")) {
            
            this.changeFocus("up");
        }
        else if (Input.getKeyDown("down")) {
            
            this.changeFocus("down");
        }
        if (Input.getKeyDown("h")) {
            this.testButton.notSelectable = !this.testButton.notSelectable;
        }
    };

    this.changeFocus = function (direction) {

        this.buttons[currentFocus].hasFocus = false; //remove focus from current
        if (direction === "up") {
            currentFocus--;
            if (currentFocus < 0) {
                currentFocus = this.buttons.length-1;
            }
        } else if (direction === "down") {
            currentFocus++;
            if (currentFocus >= this.buttons.length) {
                currentFocus = 0;
            }
        }
        if (this.buttons[currentFocus].selectable === false) {
            this.changeFocus(direction); //endless loop if nothing is selectable, but won't happen...
        }
        else {
            this.buttons[currentFocus].hasFocus = true; //give focus to new
        }
    }

    this.draw = function () {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        for (var i = 0, l = this.buttons.length; i<l; i++) {
            this.buttons[i].draw();
        }
        ParticleRenderer.renderAll(canvasContext);
    };

    this.enter = function () {

    };

    this.exit = function () {

    };
}
MainMenuState.prototype = baseState;


var GameStates = {
    inGameState: new InGameState(),
    mainMenuState: new MainMenuState(),
    pauseState: new PauseState()
};

var GameStateMachine = new StateMachine(GameStates.mainMenuState);
