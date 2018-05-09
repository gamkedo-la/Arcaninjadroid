
// Animation module with a SpriteSheet object.



function Animator (config) {

    this.fps = config.fps ? config.fps : 1;
    this.frameDurationSec = 1 / this.fps;
    this.frameCount = config.frameCount ? config.frameCount : 1;
    this.duration = config.duration ? config.duration : this.frameCount * this.frameDurationSec;
    
    this.spriteSheet = config.spriteSheet; //SpriteSheet object

    //this.currentFrame; //the image that will be drawn

    this.frames = [];
    for (var i = 0, l = this.spriteSheet.imageCount; i < l; i++) {
        frames[i] = this.spriteSheet
    }

    this.timeCounter = 0;
    this.update = function (dt) {

        this.timeCounter += dt; //in seconds just like everything that includes dt

        var frameNum = Math.floor(this.timeCounter / this.frameDurationSec);
 

    }

    this.draw = function (x,y) {

        
    }
}

function SpriteSheet (image, numRows, numCols) {

    this.image = image; //the image variable, not the path string!
    this.frames = []; //array of all the frames, created at init
    this.numRows = numRows ? numRows : 1;
    this.numCols = numCols ? numCols : 1;
    if (this.numRows == 0) { this.numRow = 1;} //safety check
    if (this.numCols == 0) { this.numCols = 1;}
    this.imageCount = this.numRows * this.numCols;

    this.spriteWidth = this.image.width / this.numCols;
    this.spriteHeight = this.image.height / this.numRows;

    for (var i = 0, l = this.numRows; i < l; i++){
        for (var j = 0, m = this.numCols; i < l; i++){
            this.frames.push();
        } 
    }

}