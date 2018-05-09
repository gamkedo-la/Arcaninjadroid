
// Animation module

this.fps = config.fps ? config.fps : 1;
this.frameDurationMs = 1000 / this.fps;
this.frameCount = config.frameCount ? config.frameCount : 1;
this.duration = config.duration ? config.duration : this.frameCount * this.frameDurationMs;



this.spriteSheet = config.spriteSheet; //Image file
this.numRows = config.numRows ? config.numRows : 1;
this.numCols = config.numCols ? config.numCols : 1;
this.spriteWidth = this.spriteSheet.width / this.numCols;
this.spriteHeight = this.spriteSheet.height / this.numRows;