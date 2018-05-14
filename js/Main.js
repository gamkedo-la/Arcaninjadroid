
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

    colorRect(0, 0, canvas.width, canvas.height, 'purple'); //Doesn't work with the whole scaled canvas shenanigans...
    colorText('LOADING', canvas.width / 2, canvas.height / 2, 'orange'); //Also looks weird now :P

    Input();

    Images.loadImages(); // if we called this in Images.js, the game could start before the canvas is created

};



function imageLoadingDoneSoStartGame() {

    console.log("Image loading done, game started!");

    var framesPerSecond = 60; //ask if it really matters?
    setInterval(updateAll, 1000 / framesPerSecond);

    lastTime = (new Date()).getTime();

    emitterConfig = {

        speed:300,
        size:55,
        angle : 0,
        emissionRate: 100,
        pLife : 2,
        duration : 0.1,

        xVar:10,
        yVar:10,
        angleVar: 360,
        speedVar: 15,
        sizeVar : 20,

        texture : Images.getImage("testTexture"),
        useTexture : true,
        textureAdditive : true,
        tint : true,

        fadeAlpha : true,
        fadeSize : true,

        endColor : [8, 22, 175, 1]

    }
}


function updateAll() {

    
    //Below is the standard stuff that needs to happen at the beginning of every frame, regardless of game state, player state etc.

    //Update the time variation
    now = (new Date()).getTime();
    dt = now - lastTime;
    lastTime = now;
  
    dt = dt/1000; //convert to seconds

    if (typeof Input.resetGetKeyDown != "undefined"){ Input.resetGetKeyDown();}
    //updates the states of all keys for checking the single frame, Intpu.getKeyDown function


    clearScreen(canvas);


    //////////////////////////////////////////////////
    // Now, we update the state machines. This takes care of things like handle inputs for state transitions
    // It also draws directly, though there may be an eventual addition of a Graphics module that draws after all updates are done
    myMachine.update();
    myMachine.handleInput();

    updateAllEmitters();
    ParticleRenderer.renderAll(canvasContext); //for now, we draw our particles on top. prob will be expanded later in the project

}

function clearScreen(canvas) {

    //colorRect(0, 0, canvas.width, canvas.height, 'black'); //Doesn't work with the whole scaled canvas shenanigans...
    canvasContext.clearRect(0,0,canvas.width,canvas.height);
    canvasContext.drawImage(Images.getImage("bayo"), 0, 0,canvas.width,canvas.height); 


}



