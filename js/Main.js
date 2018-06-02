
var animationFrameNumber; //replaces the usual setInterval technique, which caused issues when window lost focus. Thanks Nick P. for the fix! :)

var gameRunning = true;

//Used to generate delta time
var lastTime;
var currentTime;
var dt;

// World dimensions
const ORIG_WORLD_W = 200;
const ORIG_WORLD_H = 150;
const PIXEL_SCALE_UP = 4; // to replace with something better

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

    scaledCanvas.width = PIXEL_SCALE_UP * canvas.width;
    scaledCanvas.height = PIXEL_SCALE_UP * canvas.height;

    //Prevents blur related to the canvas resize strategy
    canvasContext.mozImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    canvasContext.msImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    scaledContext.mozImageSmoothingEnabled = false;
    scaledContext.imageSmoothingEnabled = false;
    scaledContext.msImageSmoothingEnabled = false;
    scaledContext.imageSmoothingEnabled = false;
    window.addEventListener("focus", windowOnFocus);
    window.addEventListener("blur", windowOnBlur);

    colorRect(0, 0, canvas.width, canvas.height, 'purple'); 
    colorText('LOADING', canvas.width / 2, canvas.height / 2, 'orange'); 

    Input(); // initialize inputs

    Images.loadImages(); // if we called this in Images.js, the game might start before the canvas is created

};

// These functions (by Nick P.) allow the toggling of the window focus so that the game truly stops when out of focus
function windowOnFocus() {
	if(!gameRunning){
		gameRunning = true;
		animationFrameNumber = requestAnimationFrame(updateAll);
	}
}
function windowOnBlur() {
	gameRunning = false;
	cancelAnimationFrame(animationFrameNumber);
}


function imageLoadingDoneSoStartGame() {

    console.log("");
    console.log("Image loading done, game started!");
    console.log("");

    animationFrameNumber = requestAnimationFrame(updateAll); //updateAll will then start calling itself depending on anim frames

    lastTime = (new Date()).getTime();

}


function updateAll() {

    //Below is the standard stuff that needs to happen at the beginning of every frame, regardless of game state, player state etc.

    //Update the time variation
    now = (new Date()).getTime();
    dt = now - lastTime; //note: dt is a GLOBAL variable accessed freely in many update functions
    lastTime = now;
  
    dt = dt/1000; //convert to seconds

    if (typeof Input.resetGetKeyDown != "undefined"){ Input.resetGetKeyDown();}
    //updates the states of all keys for checking the single frame, Input.getKeyDown function


    clearScreen(canvas);

    //////////////////////////////////////////////////
    // Now, we update the state machines. This takes care of things like handle inputs for state transitions
    // It also draws directly, though there may be an eventual addition of a Graphics module that draws after all updates are done

    GameStateMachine.update(); //updates game state depending on if we are ingame, paused, in menu etc.


    drawAllCharacters();
    drawAllTerrain();
    ParticleRenderer.renderAll(canvasContext); //for now, we draw our particles on top. prob will be expanded later in the project

    drawOnScaledCanvas(); //once everything is done, we draw everything on our enlarged canvas, which is the one the player sees

    animationFrameNumber = requestAnimationFrame(updateAll); //once we're done, we ask for the next animation frame
                                                            // when received, we'll update again!
}


var ninjaZoneBeginningY = 95; // at what height is the invisible ninja zone starting? (for all y values above it in game view, but under it in numerical value)
var background = Images.getImage("regularSky"); // will be in game state FSM eventually

// Draws over everything and resets the canvas. This is the first draw function that must be called
function clearScreen(canvas) {
   
    canvasContext.clearRect(0,0,canvas.width,canvas.height);
    canvasContext.drawImage(background, 0,0, canvas.width,canvas.height);
    canvasContext.fillStyle = "red";
    colorRect(0,ninjaZoneBeginningY, canvas.width,1); //draws the line separating the ninja zone (the sky) from the android zone

}

function drawOnScaledCanvas() {

    scaledContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, scaledCanvas.width, scaledCanvas.height);
}


