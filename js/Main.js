
var animationFrameNumber; //replaces the usual setInterval technique, which caused issues when window lost focus. Thanks Nick P. for the fix! :)
var gameRunning = true;

var date;
var lastTime;
var currentTime;
var dt;

var emitters = [];
var emitterConfig;

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

    //scaledCanvas = document.getElementById('gameCanvas');
    //scaledContext = scaledCanvas.getContext('2d');
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

    colorRect(0, 0, canvas.width, canvas.height, 'purple'); //Doesn't work with the whole scaled canvas shenanigans...
    colorText('LOADING', canvas.width / 2, canvas.height / 2, 'orange'); //Also looks weird now :P

    Input();

    Images.loadImages(); // if we called this in Images.js, the game could start before the canvas is created

};

// These functions (by Nick P.) allow the toggling of the window focus and toggle updates accordingly
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
    dt = now - lastTime;
    lastTime = now;
  
    dt = dt/1000; //convert to seconds

    if (typeof Input.resetGetKeyDown != "undefined"){ Input.resetGetKeyDown();}
    //updates the states of all keys for checking the single frame, Input.getKeyDown function


    clearScreen(canvas);


    //////////////////////////////////////////////////
    // Now, we update the state machines. This takes care of things like handle inputs for state transitions
    // It also draws directly, though there may be an eventual addition of a Graphics module that draws after all updates are done
    updateAllAnimations();
    updateAllStateMachines(); //as of now FSMs depend on animations in their update, so update them after
    updateAllEmitters();

    resolveAllCollisions();

    player.draw();
    drawAllObstacles();
    ParticleRenderer.renderAll(canvasContext); //for now, we draw our particles on top. prob will be expanded later in the project

    drawOnScaledCanvas(); //once everything is done, we draw everything on an enlarged canvas

    animationFrameNumber = requestAnimationFrame(updateAll); //once we're done, we ask for the next animation frame
                                                            // when received, we'll update again!
}


var background = Images.getImage("regularSky");
function clearScreen(canvas) {

    
    canvasContext.clearRect(0,0,canvas.width,canvas.height);
    canvasContext.drawImage(background, 0,0, canvas.width,canvas.height);
    //colorRect(0, 0, canvas.width, canvas.height, 'orange'); //Doesn't work with the whole scaled canvas shenanigans...


}

function drawOnScaledCanvas() {

    scaledContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, scaledCanvas.width, scaledCanvas.height);
}


