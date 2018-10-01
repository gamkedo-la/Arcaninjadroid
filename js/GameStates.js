
var baseState = new State();

function InGameState() {

    var justEntered; //hackity hack


    this.currentLevel;

    this.update = function () {

        this.currentLevel._tickAndSpawnIfNeeded();
        updateAllCharacters();
        updateAllArcane();
        ParticleEmitterManager.updateAllEmitters(dt);

        //resolveAllCollisions();
        justEntered = false;

        tutorial.update();

    };

    this.handleInput = function () {
        
        if (tutorial.active && Input.getKeyDown("escape")) { 
            console.log('Esc pressed during tutorial: skipping.');
            tutorial.end();
            this.currentLevel._removeAllOnscreenEnemies();
            killAllEnemies();

        }
        
        if (tutorial.active && Input.getKeyDown("space")) {
            console.log('Space pressed during tutorial: skipping to end of current line.');
            tutorial.hurryUp(); // skip to next line
        }
        
        if (Input.getKeyDown("enter")) {
            return GameStates.pauseState;
        }

        /*
        if (Input.getKeyDown("q")) {
            debug = !debug;
            //return GameStates.endGameState;
        }

        // W stands for "win"
        if (Input.getKeyDown("w")) {
            console.log("CHEAT KEY [W]: winning current level");
            return GameStates.levelClearedState;
        }

        // E stands for endgame
        if (Input.getKeyDown("e")) {
            console.log("CHEAT KEY [E]: triggering endgame");
            //GameStateMachine.handleReceivedState(GameStates.endGameState);
            return GameStates.endGameState; // hmm fades to white but never ends or inits
        }


        // D stands for "die" :P
        if (Input.getKeyDown("d")) {
            return GameStates.gameOverState;
        }

        if (Input.getKeyDown("e")) {
            createParticleEmitter(100,100, frogbotExplosion);
        }*/
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

        tutorial.draw();

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

        if (levelProgression === 0) tutorial.start();

    };

    this.exit = function () {
        //currentMusic.stop();

        if (tutorial.active) tutorial.end(); // perhaps this is not needed

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
        if (Input.getKeyDown("escape")) {
            return GameStates.mainMenuState;
        }
        else if (Input.getKeyDown("enter")) {
            return GameStates.inGameState;
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

            levelProgression = 0;
            GameStates.inGameState.currentLevel = allLevels[levelProgression];
            //no saving until the player completes the level!
            
            return GameStates.storySequenceState;
        }),
        new Button(180, 50, Images.getImage("loadGame"), function () { 
            resetGame();
            punch_Uppercut01.play();
            if (levelProgression === 0 || levelProgression === 1 || levelProgression === 4 || levelProgression === 7 || levelProgression === 9) {
                return GameStates.storySequenceState;
            }
            return GameStates.inGameState;
        }),

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
/*
        if (Input.getKeyDown("0")) {
            levelProgression = 0;
            this.updateCurrentLevel();
        }
        else if (Input.getKeyDown("1")) {
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
        }*/

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
        //ParticleRenderer.renderAll(canvasContext);
    };

    this.enter = function () {

        //console.log(localStorage.getItem("currentLevel"))
        if (localStorage.getItem("currentLevel") < allLevels.length) {
            levelProgression = localStorage.getItem("currentLevel")*1;
            GameStates.inGameState.currentLevel = allLevels[levelProgression];
            
            this.uiElements[currentFocus].hasFocus = false;
            if (levelProgression != 0) {
                currentFocus = 1;
            } else {
                currentFocus = 0;
            }
            this.uiElements[currentFocus].hasFocus = true;
        }
        this.uiElements[currentFocus].hasFocus = true;
        if (GameStates && GameStates.inGameState && GameStates.inGameState.currentLevel) {
            // this can be undefined after the boss battle
            this.background = GameStates.inGameState.currentLevel.background;
        } else {
            console.log("ERROR: GameStates.inGameState.currentLevel is undefined. Ignoring!");
        }

        if (currentMusic.getPaused()) {
            //currentMusic.loadTrack(musicFight, 0);
            currentMusic.play();
        }

    };

    this.exit = function () {

    };
}
MainMenuState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function CreditsState() {

    this.background;

    let lockonX = 2;
    let startY = 145;

    let totalYDisplacement = 0;
    let yPadBetween = 25;

    let baseScrollSpeed = 0.5;
    let scrollSpeedMult = 4;
    let _currentScrollSpeed = 0.2;

    let finished = false;


    this.uiElements = [];

    let imgNames = ["remy", "christer", "jaime", "chrisMarkle", "misha", "stebs", "marcSilva", "brandon", "T", "baris", "sam", "kyle", "ashleeTrenton", "gamkedo"];

    this.update = function () {

        if (finished) { return; }

        let currentY;

        for (var i = 0, l = this.uiElements.length; i < l; i++) {
            currentY = this.uiElements[i].getY();
            this.uiElements[i].setY(currentY - _currentScrollSpeed);
        }

        //permalock when we're done scrolling
        if (currentY <= yPadBetween) {
            finished = true;
        }

    };

    this.handleInput = function () {

        if (Input.getKeyDown("escape")) {
            return GameStates.mainMenuState;
        }

        if (Input.getKey("down") || Input.getKey("right")) {
            _currentScrollSpeed = baseScrollSpeed * scrollSpeedMult;
        } else if (Input.getKey("up") || Input.getKey("left")) {
            _currentScrollSpeed = -baseScrollSpeed * scrollSpeedMult;
        }
        else {
            _currentScrollSpeed = baseScrollSpeed;
        }

    };

    this.draw = function () {

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        
        for (var i = 0, l = this.uiElements.length; i < l; i++) {
            this.uiElements[i].draw();
        }
    };

    this.resetText = function () {

        this.uiElements = [];    

        totalYDisplacement = 0;
        for (var i = 0, l = imgNames.length; i < l; i++) {
            this.uiElements[i] = new UITextImage(lockonX, startY + totalYDisplacement, Images.getImage(imgNames[i]));
            totalYDisplacement += Images.getImage(imgNames[i]).height;
            totalYDisplacement += yPadBetween;
        }
    }

    this.enter = function () {

        finished = false;
        this.background = GameStates.inGameState.currentLevel.background;
        this.resetText();

        console.log(currentMusic.getPaused())
        if (currentMusic.getPaused()) {
            currentMusic.loadTrack(musicFight, 0);
            currentMusic.play();
        }

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
        _mainAlpha = 0;
        _secondAlpha = 0;
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

            if (levelProgression === 9) {
                resetGame();
                return GameStates.storySequenceState; //we're almost done
            }

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
        victoryFanfare.play();
        ParticleEmitterManager.killAllEmittersSoft();
        createParticleEmitter(120,35, victoryParticle);

        this.background = GameStates.inGameState.currentLevel.background;

        levelProgression++;
        localStorage.setItem("currentLevel",levelProgression);
        GameStates.inGameState.currentLevel = allLevels[levelProgression];

        interacted = false;
        killAllEnemies();
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
        if (Input.getKeyDown("escape")) {
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

        if (Input.getKeyDown("left")) {
            this.mus_vol -= 10;
            if (this.mus_vol < 0) this.mus_vol = 0;
        }

        if (Input.getKeyDown("right")) {
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

        drawPixelfont("[Left,Right] Music Volume: ", 48, 64);
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

/////////////////////////////////////////////////////////////////////////////////////////////////

function EndGameState() {

    let _mainAlpha = 0;

    let timer = 0;
    let whiteScreenDuration = 1;

    let alphaIncreaseRate = 0.005; //per frame
    let reversingFade = false;

    let kittiesplosion = new KittieSplosionClass();

    this.update = function () {

        if (!reversingFade) {
            _mainAlpha += alphaIncreaseRate;
        }

        //We're back to game screen
        else {
            _mainAlpha -= alphaIncreaseRate;
            if (_mainAlpha < 0) { _mainAlpha = 0; }
            kittiesplosion.update();
            endGameSequence.update();
            updateAllCharacters();
        }

        if (_mainAlpha >= 1 && !reversingFade) {

            timer += dt;
            if (timer >= whiteScreenDuration) {
                
                reversingFade = true;

                timer = 0;
                endGameSequence.start();
                
                player.actionMachine.handleReceivedState(new EndGameIdleState(player));
                player.x = ORIG_WORLD_W/2;
                player.y = GROUNDED_Y;

                killAllEnemies();
                //GameStates.inGameState.currentLevel._removeAllOnscreenEnemies();
            }
        }

        ParticleEmitterManager.updateAllEmitters(dt/6);
    };

    this.handleInput = function () {

        // cut to credits for now
        if (Input.getKeyDown("enter") || Input.getKeyDown("space") || Input.getKeyDown("escape")) {
            if (!endGameSequence.active) {
                return GameStates.creditsState;
            }
        }
        
    };

    this.draw = function () {

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        if (_mainAlpha <= 1) {

            canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);
            drawAllCharacters();
            drawAllTerrain();

        }

        ParticleRenderer.renderAll(canvasContext); // over top of white, due to kittiesplosion
        colorRectAlpha(0, 0, canvas.width, canvas.height, [255, 255, 255, _mainAlpha]);
        endGameSequence.draw();


    };

    this.enter = function () {
        reversingFade = false;
        pauseAudio();
        //gameOver.play();
        this.background = GameStates.inGameState.currentLevel.background;
    };

    this.exit = function () {
        currentMusic.stop();
        //resumeAudio();
    };
}
EndGameState.prototype = baseState;

/////////////////////////////////////////////////////////////////////////////////////////////////

function StorySequenceState() {

    let activeSequence;

    this.background;

    this.update = function () {

        activeSequence.update();

        if (levelProgression === 7 && activeSequence.stage === 3) {
            setPixelFont(Images.getImage("bitmapFontEvil"));
        }

        if (!activeSequence.active) {
            return GameStates.inGameState;
        }
    };

    this.handleInput = function () {

        
        if (Input.getKeyDown("escape")) {
            activeSequence.end();
            return GameStates.inGameState;
        }

        if (Input.getKeyDown("z")) {
            console.log('Z pressed during StorySequence: skipping to end of current line.');
            activeSequence.hurryUp(); // skip to next line
        }


    };

    this.draw = function () {

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        canvasContext.drawImage(this.background, 0, 0, canvas.width, canvas.height);

        activeSequence.draw();


    };

    this.enter = function () {

        pauseAudio();
        this.background = GameStates.inGameState.currentLevel.background;

        if (levelProgression === 0) {
            activeSequence = introSequence;
        } else if (levelProgression === 1) {
            activeSequence = area1Sequence;
        } else if (levelProgression === 4) {
            activeSequence = area2Sequence;
        } else if (levelProgression === 7) {
            activeSequence = area3Sequence;
        } else if (levelProgression === 9) {
            activeSequence = finalLevelSequence;
            setPixelFont(Images.getImage("bitmapFontEvil"));
        }
        activeSequence.start();
    };

    this.exit = function () {
        currentMusic.stop();
        setPixelFont(Images.getImage("bitmapFont"));
    };
}
StorySequenceState.prototype = baseState;

var GameStates = {
    inGameState: new InGameState(),
    mainMenuState: new MainMenuState(),
    creditsState: new CreditsState(),
    pauseState: new PauseState(),
    gameOverState: new GameOverState(),
    levelClearedState: new LevelClearedState(),
    optionsState: new OptionsState(),
    endGameState: new EndGameState(),
    storySequenceState: new StorySequenceState(),
};

var GameStateMachine = new StateMachine(GameStates.mainMenuState);
