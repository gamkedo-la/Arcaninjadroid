
var animationFrameNumber; //replaces the usual setInterval technique, which caused issues when window lost focus. Thanks Nick P. for the fix! :)
var gameRunning = true;

var date;
var lastTime;
var currentTime;
var dt;

var emitters = [];
var emitterConfig;

const ORIG_WORLD_W = 800;
const ORIG_WORLD_H = 600;
const PIXEL_SCALE_UP = 4; // to replace with something better

window.onload = function () {

    // FIXME: it is impolite to trigger sound right away...
    // maybe we should wait until one user click, like start game button

    window.focus();
    //Prepping the game canvas. Strategy "borrowed" from the Roman's Adventure source code (ty Oasis Rim and co.)
    //Eventually, find a way to not scale the canvas at all
    canvas = document.getElementById("canvas");
    canvasContext = canvas.getContext("2d");
    tintCanvas = document.createElement("canvas"); //used in conjuction with the ParticleRenderer
    tintContext = tintCanvas.getContext("2d");
    //scaledCanvas = document.getElementById('gameCanvas');
    //scaledContext = scaledCanvas.getContext('2d');
    canvas.width = ORIG_WORLD_W;
    canvas.height = ORIG_WORLD_H;

    //scaledCanvas.width = PIXEL_SCALE_UP * canvas.width;
    //scaledCanvas.height = PIXEL_SCALE_UP * canvas.height;

    //Prevents blur related to the canvas resize strategy
    canvasContext.mozImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    canvasContext.msImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    //scaledContext.mozImageSmoothingEnabled = false;
    //scaledContext.imageSmoothingEnabled = false;
    //scaledContext.msImageSmoothingEnabled = false;
    //scaledContext.imageSmoothingEnabled = false;
    window.addEventListener("focus", windowOnFocus);
    window.addEventListener("blur", windowOnBlur);
    // See definition comment below
    //window.addEventListener("resize", windowOnResize);
    //windowOnResize();

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
// Commented for now because it would require to draw on different canvases, and the rendering technique has not been decided yet
/*
function windowOnResize() { // changing window dimensions
    if (!canvas) return;
    var gameRatio = canvas.height/canvas.width;
    var widthIfHeightScaled = window.innerHeight / gameRatio;
    if(widthIfHeightScaled <= window.innerWidth) {
        canvas.width = widthIfHeightScaled;
        canvas.height = window.innerHeight;
    } else {
        var heightIfWidthScaled = window.innerWidth * gameRatio;
        canvas.width = window.innerWidth;
        canvas.height = heightIfWidthScaled;
    }
}*/

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

    updateAllEmitters();
    ParticleRenderer.renderAll(canvasContext); //for now, we draw our particles on top. prob will be expanded later in the project

    animationFrameNumber = requestAnimationFrame(updateAll); //once we're done, we ask for the next animation frame
                                                            // when received, we'll update again!
}



function clearScreen(canvas) {

    
    canvasContext.clearRect(0,0,canvas.width,canvas.height);
    colorRect(0, 0, canvas.width, canvas.height, 'orange'); //Doesn't work with the whole scaled canvas shenanigans...


}



