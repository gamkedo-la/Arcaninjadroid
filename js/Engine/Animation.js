
// Animation module with a SpriteSheet object. Simply create a SpriteSheet object, then give it as an argument to your Animation, along with the config. As per usual, undefined configs result in default configuration.
// Made by your project lead, yours truly, Remy L.

// Do note that:
// 1. Animation goes hand in hand with the State Machine pattern. Characters (esp. the player) will have animation state machines that will decide what animation is active at any given time, and drawing it.
// 2. Animation configurations, just like any config object litteral, can be reused across many Animation instances. Create a config you like, and pass it to every anim that could use it.

// As will all the modules in Arcaninjandroid, don't hesitate to contact me if you need help or want a walkthrough of the implementation! :)

animations = [];
function Animation (sheet, config) {
    
    animations.push(this);

    var sheet = sheet; //SpriteSheet object

    //Avoids error and lets us set to default configs 
    if (typeof config === "undefined") {
        config = {};
    }

    var fps = config.fps || 1;
    var frameDurationSec = 1 / fps;
    var frameCount = sheet.getNumCols()*sheet.getNumRows(); // => we cannot have empty spaces in the sheet

    var duration = config.duration || frameCount * frameDurationSec; //if we didnt give a duration, do one cycle only
    var timeLeft = duration; // decrements with time

    var loop = config.loop || false;
    if (frameCount == 1) loop = true;

    this.isActive = true; //left public for simplicity of get/set

    var currentFrameNum = 0; // index of the frame to be drawn

    var timeCounter = 0; //keeps track of time passage and updates current frame


    // Call this every frame, updates the current frame of animation
    this.update = function () {

        if (this.isActive === false) {
            return;
        }

        timeCounter += dt; //in seconds just like everything else that includes dt

        // Check if our anim is over, and either reset it or terminate it if needed
        if (timeCounter > timeLeft) {
            if (loop){
                this.reset();
            } else {
                this.isActive = false;
            }
        }

        currentFrameNum = Math.floor(timeCounter / frameDurationSec) % frameCount; //calc current frame
 
    }

    this.draw = function (x,y) {

        if (this.isActive === false) {
            console.log("Tried to draw inactive animation.");
            return;
        }
        var clipStartX = (currentFrameNum % sheet.getNumCols()) * sheet.getSpriteWidth();
        var clipStartY = Math.floor(currentFrameNum / sheet.getNumCols()) * sheet.getSpriteHeight();

        canvasContext.drawImage(sheet.getImage(),
                                clipStartX,clipStartY, sheet.getSpriteWidth(), sheet.getSpriteHeight(), 
                                x-sheet.getSpriteWidth()/2,y-sheet.getSpriteHeight()/2, sheet.getSpriteWidth(), sheet.getSpriteHeight());
    }

    this.reset = function () {

        timeCounter = 0;
        this.isActive = true;
    }

    this.getcurrentFrameNumNumber = function () {
        return currentFrameNum;
    }

    this.getDuration = function () {
        return duration;
    }
/*
    this.getSheet = function () {
        return sheet; //doesn't respect encapsulation, for testing only
    }*/

    this.getFrameWidth = function () {
        return sheet.getSpriteWidth();
    }

    this.getFrameHeight = function () {
        return sheet.getSpriteHeight();
    }

}


//IMPORTANT: sprite sheets cannot have incomplete rows, but they can have "full" sheets of any size
function SpriteSheet (image, numRows, numCols) {

    var image = image; //the image variable, NOT the path string!
    
    var numRows = numRows ? numRows : 1;
    var numCols = numCols ? numCols : 1;

    if (numRows == 0) { numRow = 1;} //safety checks to avoid divide by 0
    if (numCols == 0) { numCols = 1;}


    this.getImage = function () {
        return image;
    }

    this.getNumRows = function () {
        return numRows;
    }
    this.getNumCols = function () {
        return numCols;
    }

    //Note: having an "Images" module means that (as of now) images have 0 width, 0 height on program startup, because they are not loaded yet
    // As such, we cannot save the width and heigths in fields on startup... and we need getters
    this.getSpriteWidth = function () {
        return image.width / numCols;
    }

    this.getSpriteHeight = function () {
        return image.height / numRows;
    }
}

function updateAllAnimations() {
    for (var i = 0, l = animations.length; i < l; i++) {
        animations[i].update();
    }
}
/////////////////      Example      ///////////////////////
/*
var mySheet = new SpriteSheet (Images.getImage("myImage3rows2cols"), 3,2);

var myAnimConfig = {
    fps : 15,
    loop: true
}
var myAnim = new Animation (mySheet, myAnimConfig);
*/