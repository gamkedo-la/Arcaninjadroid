
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
    tintCanvas = document.createElement("canvas");
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

    colorRect(0, 0, canvas.width, canvas.height, 'purple'); //Doesn't work with the whole scaled canvas shenanigans...
    colorText('LOADING', canvas.width / 2, canvas.height / 2, 'orange'); //Also looks weird now :P

    Input();
    Images();
    Images.loadImages();

};



function imageLoadingDoneSoStartGame() {

    console.log("Image loading done, game started!");

    var framesPerSecond = 60; //ask if it really matters?
    setInterval(updateAll, 1000 / framesPerSecond);

    lastTime = (new Date()).getTime();

    emitterConfig = {

        speed:155,
        size:115,
        angle : 90,
        emissionRate: 2,
        pLife : 5,

        xVar:40,
        yVar:40,
        angleVar: 25,
        speedVar: 15,
        sizeVar : 40,

        texture : Images.getImg("testTexture"),
        useTexture : true,
        textureAdditive : true,
        tint : true,

        fadeAlpha : true,
        fadeSize : true,

        endColor : [8, 22, 175, 1]

    }
}


function updateAll() {

    //Update the time variation
    now = (new Date()).getTime();
    dt = now - lastTime;
    lastTime = now;
  
    dt = dt/1000; //convert to seconds

    Input.update();
    clearScreen();

    myMachine.update();
    myMachine.handleInput();

    ParticleRenderer.renderAll(canvasContext);

    //gameController.update(); Game state will have it's own state machine
    /*
    if (holdP) {
        pauseState = !pauseState;
        if (pauseState) {
            console.log(pauseState);
            scaledContext.textAlign = "center";
            colorText("P A U S E D", scaledCanvas.width / 2, 200, "blue");
            scaledContext.textAlign = "left";
        }
    }*/
}

function clearScreen() {

    colorRect(0, 0, canvas.width, canvas.height, 'black'); //Doesn't work with the whole scaled canvas shenanigans...

    //canvasContext.drawImage(Images.getImg("viewtiful"), 0, 0,canvas.width,canvas.height); 


}

/* Remember to do this in the anim module
function updateCycles() {
    if (player.cycleImage) {
        player.cycleTick();
    }
    if (player.opponent) {
        if (player.opponent.cycleImage) {
            player.opponent.cycleTick();
        }
    }
}*/
/*
function updateInteractionDelay() {
    interactDelay--;
    if (interactDelay <= 0) { okToInteract = true; }
    else okToInteract = false;
}*/

/* Leaving this for a ref.of using Date for time related events
function spellTimeLapse() {
    date = new Date();
    lastTime = currentTime;
    currentTime = date.getTime();
    deltaTime = currentTime - lastTime;
    player.currentSpell.timeElapsed += deltaTime;
}*/



