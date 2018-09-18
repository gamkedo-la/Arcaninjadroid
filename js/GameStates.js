
var baseState = new State();

function InGameState() {

    var justEntered; //hackity hack


    //this.background = Images.getImage("moonlitForest");


    this.currentLevel;

    this.update = function () {

        this.currentLevel._tickAndSpawnIfNeeded();
        updateAllCharacters();
        updateAllArcane();
        ParticleEmitterManager.updateAllEmitters(dt);

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

        // W stands for "win"
        if (Input.getKeyDown("w")) {
            return GameStates.levelClearedState;
        }

        // D stands for "die" :P
        if (Input.getKeyDown("d")) {
            return GameStates.gameOverState;
        }

        if (Input.getKeyDown("e")) {
            createParticleEmitter(100,100, frogbotExplosion);
        }
    };

    this.draw = function () {

        if (justEntered) { return; }

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.currentLevel.background, 0, 0, canvas.width, canvas.height);

        drawAllCharacters();
        drawAllTerrain();
        drawAllArcane();
        ParticleRenderer.renderAll(canvasContext); 


        // draw the camera view on the big TV screen in the final level
        if (levelProgression >= 7) {

            //canvasContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 77, 7, 96, 54); //somehow 55 is the correct height...
            tintCanvasAndDraw(73,7, canvas, 96,54, "rgba(198,217,235,0.4)", canvasContext);
            drawAllCharacters(); //lulululul draw twice cross ur fingers
            ParticleRenderer.renderAll(canvasContext); 
        }

        drawHUD(); // on screen heads-up-display (score etc)
        drawComboGUI(); // 2x 3x 4x

    }

    this.enter = function () {
        justEntered = true;

        //currentMusic.removeTrack(0);
        currentMusic.loadTrack(this.currentLevel.music, 0);
        currentMusic.play();

        hpBarEmitter = createParticleEmitter(200,6, hpMeterParticlesConfig);
        arcaneBarEmitter = createParticleEmitter(200,15, arcaneMeterParticlesConfig);
        /*
        if (currentMusic.getPaused() === true) {
            startAudio();
        }*/
    };

    this.exit = function () {
        //currentMusic.stop();
    };


};
InGameState.prototype = baseState;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        colorRectAlpha(0, 0, canvas.width, canvas.height, [0, 0, 0, 0.65]);
        canvasContext.drawImage(gamePausedText, 0, 35);
    };

    this.enter = function () {
        punch_Light02.play();
        pauseAudio();
        this.background = GameStates.inGameState.currentLevel.background;

    };

    this.exit = function () {
        punch_Light02.play();
        resumeAudio();
    };
}
PauseState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function MainMenuState() {

    this.background = Images.getImage("mainMenu_ver2");

    this.uiElements = [
        new Button(180, 30, Images.getImage("startGame"), function () {
            resetGame();
            punch_Uppercut01.play();
            return GameStates.inGameState;
        }),
        new Button(180, 50, Images.getImage("loadGame"), function () { console.log("load game") }, { unavailable: true }),
        new Button(180, 70, Images.getImage("options"), function () { return GameStates.optionsState; }),
        new Button(180, 90, Images.getImage("credits"), function () { return GameStates.creditsState; }),
        new UITextImage(-200, -200, Images.getImage("arca")),
        new UITextImage(-200, -160, Images.getImage("ninja")),
        new UITextImage(-200, -110, Images.getImage("droid")),
        new UITextImage(-200, -80, Images.getImage("kitty"))
    ];

    let currentFocus = 0;
    this.uiElements[currentFocus].hasFocus = true;

    this.update = function () {
        for (var i = 4, l = this.uiElements.length; i < l; i++) {
            if (this.uiElements[i].updateTween) {
                this.uiElements[i].updateTween();
            }
        }
    };

    this.handleInput = function () {

        if (Input.getKeyDown("enter") ||
            Input.getKeyDown("space") ||    // allow an alternate input
            Input.getKeyDown("z")) {        // allow gamepads to use attack button

            if (this.uiElements[currentFocus].callback) {
                state = this.uiElements[currentFocus].callback();
                if (state) {

                    punch_Light02.play();
                    return state;
                }
            }
        }
        if (Input.getKeyDown("up")) {

            this.changeFocus("up");
        }
        else if (Input.getKeyDown("down")) {

            this.changeFocus("down");
        }

        if (Input.getKeyDown("1")) {
            levelProgression = 1;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("2")) {
            levelProgression = 2;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("3")) {
            levelProgression = 3;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("4")) {
            levelProgression = 4;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("5")) {
            levelProgression = 5;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("6")) {
            levelProgression = 6;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("7")) {
            levelProgression = 7;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("8")) {
            levelProgression = 8;
            this.updateCurrentLevel();
        } else if (Input.getKeyDown("9")) {
            levelProgression = 9;
            this.updateCurrentLevel();
        }
    };
    //for demo only
    this.updateCurrentLevel = function () {
        GameStates.inGameState.currentLevel = allLevels[levelProgression];
    }
    this.changeFocus = function (direction) {

        this.uiElements[currentFocus].hasFocus = false; //remove focus from current
        if (direction === "up") {
            currentFocus--;
            if (currentFocus < 0) {
                currentFocus = this.uiElements.length - 1;
            }
        } else if (direction === "down") {
            currentFocus++;
            if (currentFocus >= this.uiElements.length) {
                currentFocus = 0;
            }
        }
        if (this.uiElements[currentFocus].unavailable === true || this.uiElements[currentFocus].canHaveFocus === false) {
            this.changeFocus(direction); //endless loop if nothing is selectable, but won't happen...
        }
        else {
            this.uiElements[currentFocus].hasFocus = true; //give focus to new
        }
        whiff_Light01.play();
    }

    this.draw = function () {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        for (var i = 0, l = this.uiElements.length; i < l; i++) {
            this.uiElements[i].draw();
        }
        ParticleRenderer.renderAll(canvasContext);
    };

    this.enter = function () {

        this.uiElements[currentFocus].hasFocus = true;
        this.background = GameStates.inGameState.currentLevel.background;

    };

    this.exit = function () {

    };
}
MainMenuState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function CreditsState() {

    this.background = Images.getImage("creditsScreen");


    let lockonX = 2;
    let lockonY = 35;
    let nextDistance = ORIG_WORLD_W;
    let scrollX = nextDistance;

    let scrollSpeed = 1;
    let timer = 0;
    let scrollWait = 2;
    let waiting = true;

    let nameCounter = 0;

    this.uiElements = [];
    let names = ["remy", "christer", "jaime", "stebs", "misha", "baris", "ashleeTrenton", "gamkedo"];
    for (var i = 0, l = names.length; i < l; i++) {
        this.uiElements[i] = new UITextImage(lockonX + nextDistance * i, lockonY, Images.getImage(names[i]));
    }

    this.update = function () {

        if (!waiting) {
            let currentX;
            scrollX -= scrollSpeed;
            for (var i = 0, l = this.uiElements.length; i < l; i++) {
                currentX = this.uiElements[i].getX();
                this.uiElements[i].setX(currentX - scrollSpeed);
            }
        }

        timer += dt;

        if (waiting) {

            if (timer >= scrollWait) {
                timer = 0;
                waiting = false;
            }
        } else {

            if (scrollX < lockonX) {
                scrollX = nextDistance;

                timer = 0;
                waiting = true;
                nameCounter++;
            }
        }
        if (nameCounter === this.uiElements.length - 1) {
            waiting = true; //permalock in wait when we're done scrolling
        }

    };

    this.handleInput = function () {

        if (Input.getKeyDown("enter") || Input.getKeyDown("escape")) {
            return GameStates.mainMenuState;
        }

        if (Input.getKey("right")) {
            scrollSpeed = 2;
        } else {
            scrollSpeed = 1;
        }

    };

    this.draw = function () {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        for (var i = 0, l = this.uiElements.length; i < l; i++) {
            this.uiElements[i].draw();
        }
        //ParticleRenderer.renderAll(canvasContext);
    };

    this.resetText = function () {
        for (var i = 0, l = this.uiElements.length; i < l; i++) {
            this.uiElements[i].setX(lockonX + nextDistance * i);
            this.uiElements[i].setY(lockonY);
        }
    }

    this.enter = function () {
        timer = 0;
        nameCounter = 0;
        waiting = true;
        this.background = GameStates.inGameState.currentLevel.background;

    };

    this.exit = function () {
        this.resetText();


    };
}
CreditsState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function GameOverState() {

    this.background = Images.getImage("moonlitForest");

    let gameOverText = new UITextImage(20, 10, Images.getImage("gameOverText"));
    let pressEscapeText = new UITextImage(50, 90, Images.getImage("pressEscape"));

    let _mainAlpha = 0; //darkness fades in until fully opaque
    let _secondAlpha = 0; //Game Over image becomes visible after screen is black

    let alphaIncreaseRate = 0.005; //per frame

    this.update = function () {

        if (_mainAlpha < 1) { _mainAlpha += alphaIncreaseRate; }

        else if (_mainAlpha >= 1 && _secondAlpha <= 1) { _secondAlpha += alphaIncreaseRate; }

        ParticleEmitterManager.updateAllEmitters(dt);
    };

    this.handleInput = function () {

        if (Input.getKeyDown("escape")) {
            return GameStates.mainMenuState;
        }

    };

    this.draw = function () {

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        if (_mainAlpha <= 1) {

            canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
            drawAllCharacters();
            drawAllTerrain();
            ParticleRenderer.renderAll(canvasContext);

        }

        colorRectAlpha(0, 0, canvas.width, canvas.height, [0, 0, 0, _mainAlpha]);
        gameOverText.draw(_mainAlpha);
        pressEscapeText.draw(_secondAlpha);

    };

    this.enter = function () {
        pauseAudio();
        gameOver.play();
        this.background = GameStates.inGameState.currentLevel.background;
    };

    this.exit = function () {
        currentMusic.stop();
        //resumeAudio();
    };
}
GameOverState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function LevelClearedState() {

    let levelClearedText = new UITextImage(20, 10, Images.getImage("levelCleared"));

    let interacted = false;

    this.update = function () {

        updateAllArcane();
        ParticleEmitterManager.updateAllEmitters(dt);
    };

    this.handleInput = function () {

        if ((Input.getKeyDown("enter") || Input.getKeyDown("escape") || Input.getKeyDown("space")) && !interacted) {

            interacted = true;
            player.actionMachine.handleReceivedState(new LevelClearAnimState(player));

        }

    };

    this.draw = function () {

        updateAllCharacters(); //don't move this in update, breaks the transition to main menu! ;D
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);


        drawAllCharacters();
        drawAllTerrain();
        drawAllArcane();
        ParticleRenderer.renderAll(canvasContext);

        levelClearedText.draw();

    };


    this.enter = function () {

        //pauseAudio();
        currentMusic.stop();
        ParticleEmitterManager.killAllEmittersSoft();
        createParticleEmitter(120,35, victoryParticle);

        this.background = GameStates.inGameState.currentLevel.background;
        levelProgression++;
        GameStates.inGameState.currentLevel = allLevels[levelProgression];

        interacted = false;
    };

    this.exit = function () {
        resumeAudio();
    };
}
LevelClearedState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function OptionsState() {
    
    // TODO store and read from localstorage
    this.sfx_vol = Math.round(SFXVolumeManager.getVolume() * 100);
    this.mus_vol = Math.round(MusicVolumeManager.getVolume() * 100);
    
    //this.background = GameStates.inGameState.currentLevel.background;

    this.update = function () {
        //timer += dt;
        //console.log("OptionsState.update");
    };
    this.handleInput = function () {
        if (Input.getKeyDown("enter") || Input.getKeyDown("escape")) {
            return GameStates.mainMenuState;
        }

        if (Input.getKeyDown("z")) {
            this.sfx_vol -= 10;
            if (this.sfx_vol < 0) this.sfx_vol = 0;
            punch_Light02.play(); // to preview the new volume
        }

        if (Input.getKeyDown("x")) {
            this.sfx_vol += 10;
            if (this.sfx_vol>100) this.sfx_vol = 100;
            punch_Light02.play(); // to preview the new volume
        }

        if (Input.getKeyDown("c")) {
            this.mus_vol -= 10;
            if (this.mus_vol < 0) this.mus_vol = 0;
        }

        if (Input.getKeyDown("v")) {
            this.mus_vol += 10;
            if (this.mus_vol>100) this.mus_vol = 100;
        }

        SFXVolumeManager.setVolume(this.sfx_vol/100);
        MusicVolumeManager.setVolume(this.mus_vol/100);


    };
    this.draw = function () {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        if (this.background) canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        //console.log("OptionsState.draw");
        
        drawPixelfont("OPTIONS", 48, 16);

        var barstr = "[";
        var loop = 0;

        drawPixelfont("[z,x] Sound FX Volume: ", 48, 48);
        for (loop=0; loop<Math.round(this.sfx_vol/5); loop++) { barstr += "=" }
        for (loop=Math.round(this.sfx_vol/5); loop<20; loop++) { barstr += "-" }
        barstr += "] " + this.sfx_vol;
        drawPixelfont(barstr, 48, 56);

        drawPixelfont("[c,v] Music Volume: ", 48, 64);
        barstr = "[";
        for (loop=0; loop<Math.round(this.mus_vol/5); loop++) { barstr += "=" }
        for (loop=Math.round(this.mus_vol/5); loop<20; loop++) { barstr += "-" }
        barstr += "] " + this.mus_vol;
        drawPixelfont(barstr, 48, 72);

        
        drawPixelfont("[ESC] to return", 48, 96);
        drawPixelfont("to the main menu.", 48, 104);

    };
    this.enter = function () {
        console.log("entering options menu");
        this.background = GameStates.inGameState.currentLevel.background;
    };
    this.exit = function () {
        console.log("exiting options menu");
    };
}
OptionsState.prototype = baseState;



var GameStates = {
    inGameState: new InGameState(),
    mainMenuState: new MainMenuState(),
    creditsState: new CreditsState(),
    pauseState: new PauseState(),
    gameOverState: new GameOverState(),
    levelClearedState: new LevelClearedState(),
    optionsState: new OptionsState(),
};

var GameStateMachine = new StateMachine(GameStates.mainMenuState);
