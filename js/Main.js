
const ALLOW_FULLSCREEN = true; // go fullscreen if the user allows it

var animationRequestID; //replaces the usual setInterval technique, which caused issues when window lost focus. Thanks Nick P. for the fix! :)

var gameRunning = true;

var impactPauseFramesRemaining = 0; // how many frames should the game be in "hitpause" impact effect mode
var pauseNextFrame = false;
const IMPACT_PAUSE_FRAMES = 0; // delay the game if we get hit

var debug = false; // global toggle for debug mode. Most notably, draws colliders on the screen

//Used to generate delta time
var lastTime;
var currentTime;
var dt;

const ORIG_WORLD_W = 240;
const ORIG_WORLD_H = 135;
const GROUNDED_Y = 121; //(for 32x32 characters!)

var sliceEncoding = [0,0];
window.onload = function () {

    window.focus();
    //Prepping the game canvas. Strategy "borrowed" from the Roman's Adventure source code (ty Oasis Rim and co.)
    canvas = document.createElement("canvas");
    canvasContext = canvas.getContext("2d");
    scaledCanvas = document.getElementById("canvas");
    scaledContext = scaledCanvas.getContext("2d");
    tintCanvas = document.createElement("canvas"); //used in conjuction with the ParticleRenderer
    tintContext = tintCanvas.getContext("2d");

    canvas.width = ORIG_WORLD_W;
    canvas.height = ORIG_WORLD_H;

    // true liquid layout fullscreen:
    windowOnResize(); // use all available pixels and turn off smoothing

    window.addEventListener("focus", windowOnFocus);
    window.addEventListener("blur", windowOnBlur);
    window.addEventListener("resize", windowOnResize);

    if (ALLOW_FULLSCREEN) {
        window.addEventListener("fullscreenchange", onFullscreenChange); // it worked!
        window.addEventListener("fullscreenerror", onFullscreenError); // permission denied
        window.addEventListener("mozfullscreenerror ", onFullscreenError); // permission denied
        window.addEventListener("webkitfullscreenerror ", onFullscreenError); // permission denied
        /* window.addEventListener("click", firstClick); // run only once */
        // optionally could add this to a button: Document.exitFullscreen()
    }

    colorRect(0, 0, canvas.width, canvas.height, 'purple');
    colorText('LOADING', canvas.width / 2, canvas.height / 2, 'orange');

    Input(); // initialize inputs

    Images.loadImages(); // if we called this in Images.js, the game might start before the canvas is created


};

function windowOnResize() {
    scaledCanvas.width = window.innerWidth;
    scaledCanvas.height = window.innerHeight;
    //Prevents blur related to the canvas resize strategy
    canvasContext.mozImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    canvasContext.msImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    scaledContext.mozImageSmoothingEnabled = false;
    scaledContext.imageSmoothingEnabled = false;
    scaledContext.msImageSmoothingEnabled = false;
    scaledContext.imageSmoothingEnabled = false;
    // NOTE: the reason we do this at every time is that
    // these settings get reset if we resize the canvas
}

/* a hack
function firstClick() {
    console.log("First click!");
    tryGoingFullscreen();
    window.removeEventListener("click", firstClick);
}
*/

function onFullscreenChange() {
    console.log("Fullscreen mode just changed! =)");
}

function onFullscreenError() {
    console.log("Fullscreen request was denied.");
}

function toggleFullScreen() {
    console.log("Toggling FULLSCREEN mode...");
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}

// These functions (by Nick P.) allow the toggling of the window focus so that the game truly stops when out of focus
function windowOnFocus() {
    if (!gameRunning) {
        gameRunning = true;
        lastTime = (new Date()).getTime();
        animationRequestID = requestAnimationFrame(updateAll);
        resumeAudio();
        Input.allKeysUp();
    }
}
function windowOnBlur() {
    gameRunning = false;
    cancelAnimationFrame(animationRequestID);
    pauseAudio();
}


function imageLoadingDoneSoStartGame() {

    console.log("");
    console.log("Image loading done, game started!");
    console.log("");

    animationRequestID = requestAnimationFrame(updateAll); //updateAll will then start calling itself depending on anim frames

    lastTime = (new Date()).getTime();

}


function updateAll() {


    //Below is the standard stuff that needs to happen at the beginning of every frame, regardless of game state, player state etc.

    //Update the time variation
    now = (new Date()).getTime();
    dt = now - lastTime; //note: dt is a GLOBAL variable accessed freely in many update functions
    lastTime = now;
    dt = dt / 1000; //convert to seconds

    Input.update(dt*1000);

    if (pauseNextFrame) {
        impactPauseFramesRemaining = IMPACT_PAUSE_FRAMES;
        pauseNextFrame = false;
    }
    else if (impactPauseFramesRemaining > 0) { // when the player gets hit, the game pauses for a brief moment
        //console.log("HITPAUSE:" + impactPauseFramesRemaining);
        impactPauseFramesRemaining--;
        animationRequestID = requestAnimationFrame(updateAll);
        return;
    }

    //clearScreen(canvas);

    //////////////////////////////////////////////////
    // Now, we update the state machines. This takes care of things like handle inputs for state transitions
    // It also draws directly, though there may be an eventual addition of a Graphics module that draws after all updates are done

    GameStateMachine.update(); //updates game state depending on if we are ingame, paused, in menu etc.
    GameStateMachine.draw();

    drawOnScaledCanvas(); //once everything is done, we draw everything on our enlarged canvas, which is the one the player sees

    animationRequestID = requestAnimationFrame(updateAll); //once we're done, we ask for the next animation frame
    // when received, we'll update again!

    AudioEventManager.updateEvents();
}


var ninjaZoneBeginningY = 95; // at what height is the invisible ninja zone starting? (for all y values above it in game view, but under it in numerical value)

// Draws over everything and resets the canvas. This is the first draw function that must be called
function clearScreen(canvas) {

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.drawImage(background, 0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "red";
    colorRect(0, ninjaZoneBeginningY, canvas.width, 1); //draws the line separating the ninja zone (the sky) from the android zone

}

function drawOnScaledCanvas() {

    scaledContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, scaledCanvas.width, scaledCanvas.height);
}


// Resets everything from character stats, states, anims, current level progress, essentially what happens when you press Start Game
function resetGame () {

    characters = [];
    arcaneShots = [];
    player = new Player ();
    GameStates.inGameState.currentLevel._reset();
    //ParticleEmitterManager.killAllEmittersHard();
    console.log("Reset game state");
} 

