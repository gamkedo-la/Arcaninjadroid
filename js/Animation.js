
// Animation module with a SpriteSheet object.



function Animation (sheet, config) {
    
    var sheet = sheet; //SpriteSheet object

    //Avoids error and lets us set to default configs 
    if (typeof config === "undefined") {
        config = {};
    }

    var fps = config.fps ? config.fps : 1;
    var frameDurationSec = 1 / fps;
    var frameCount = sheet.getNumCols()*sheet.getNumRows();

    var duration = config.duration ? config.duration : frameCount * frameDurationSec;
    var timeLeft = duration; // decrements
    var loop = config.loop || false;

    this.isOver = false;

    var frameNum = 0;

    var timeCounter = 0;

    this.update = function (dt) {

        if (this.isOver) {
            return;
        }

        timeCounter += dt; //in seconds just like everything else that includes dt

        if (timeCounter > timeLeft) {
            if (loop){
                this.reset();
            } else {
                this.isOver = true;
            }
        }

        frameNum = Math.floor(timeCounter / frameDurationSec) % frameCount;
 
    }

    this.draw = function (x,y) {

        var clipStartX = (frameNum % sheet.getNumCols()) * sheet.getSpriteWidth();
        var clipStartY = Math.floor(frameNum / sheet.getNumCols()) * sheet.getSpriteHeight();

        canvasContext.drawImage(sheet.getImage(),
                                clipStartX,clipStartY, sheet.getSpriteWidth(), sheet.getSpriteHeight(), 
                                x,y, sheet.getSpriteWidth(), sheet.getSpriteHeight());
    }

    this.reset = function () {

        timeCounter = 0;
        this.isOver = false;
    }

    this.getCurrentFrame = function () {
        return frameNum;
    }

    this.getDuration = function () {
        return duration;
    }

}

var testSheet = new SpriteSheet (Images.getImage("robokedoSideRight"), 2,2);

var animConfig = {
    fps : 15,
    //loop: true,
    duration : 5
}
var testAnim = new Animation (testSheet);

//IMPORTANT: sprite sheets cannot have incomplete rows, but they can have "full" sheets of any size
function SpriteSheet (image, numRows, numCols) {

    var image = image; //the image variable, NOT the path string!
    var frames = []; //array of all the frames, created at init
    
    var numRows = numRows ? numRows : 1;
    var numCols = numCols ? numCols : 1;
    if (numRows == 0) { numRow = 1;} //safety check
    if (numCols == 0) { numCols = 1;}

    var imageCount = numRows * numCols;

    this.getImage = function () {
        return image;
    }

    this.getNumRows = function () {
        return numRows;
    }
    this.getNumCols = function () {
        return numCols;
    }

    //Note: having an image module means that (as of now) images have 0 w, 0 h when assigned
    // As such, we cannot save the width and heigths in fields... and we need getters
    this.getSpriteWidth = function () {
        return image.width / numCols;
    }

    this.getSpriteHeight = function () {
        return image.height / numRows;
    }
}