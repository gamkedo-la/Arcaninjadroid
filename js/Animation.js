
// Animation module with a SpriteSheet object.



function Animation (config) {

    this.fps = config.fps ? config.fps : 1;
    this.frameDurationSec = 1 / this.fps;
    this.frameCount = config.frameCount ? config.frameCount : 1;
    this.duration = config.duration ? config.duration : this.frameCount * this.frameDurationSec;
    
    var sheet = config.spriteSheet; //SpriteSheet object

    //this.currentFrame; //the image that will be drawn

    this.frames = [];
    for (var i = 0, l = sheet.imageCount; i < l; i++) {
        //frames[i] = this.spriteSheet
    }

    var timeCounter = 0;
    this.update = function (dt) {

        timeCounter += dt; //in seconds just like everything else that includes dt

        //frame numbering starts at 1 for reasons
        var frameNum = Math.floor(this.timeCounter % this.frameDurationSec) + 1;
 

    }

    this.draw = function (x,y) {

        //var clipStartX = 
        //canvasContext.drawImage(sheet.getImage(), sheet.get   x,y, );
    }
}

function SpriteSheet (image, numRows, numCols) {

    var image = image; //the image variable, NOT the path string!
    var frames = []; //array of all the frames, created at init
    
    var numRows = numRows ? numRows : 1;
    var numCols = numCols ? numCols : 1;
    if (numRows == 0) { numRow = 1;} //safety check
    if (numCols == 0) { numCols = 1;}

    var imageCount = numRows * numCols;

    var spriteWidth = image.width / numCols;
    var spriteHeight = image.height / numRows;

    /*for (var i = 0, l = this.numRows; i < l; i++){
        for (var j = 0, m = this.numCols; i < l; i++){
            this.frames.push();
        } 
    }*/

    this.getImage = function () {
        return image;
    }

    this.getNumRows = function () {
        return numRows;
    }
    this.getNumCols = function () {
        return numCols;
    }

}