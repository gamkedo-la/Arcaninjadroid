
groundSheet = new SpriteSheet(Images.getImage("ground1"), 1,1);

obstacles = [];
function Obstacle (x,y, width,height, sheet,animConfig, movable = false) {

    obstacles.push(this);
    this.x = x;
    this.y = y;
    var width = width;
    var height = height;

    var sheet = sheet;
    var animation = new Animation (sheet, animConfig);

    this.movable = movable;

    this.collider = new RectCollider(this,width,height);

    this.draw = function () {
        animation.draw(this.x, this.y); // standardise?
        this.collider.draw();
    }

}

var protoGround = new Obstacle(85,151, 250,35, groundSheet);
//var protoGround2 = new Obstacle(45,132,35,35,groundSheet);
//var protoGround3 = new Obstacle(65,133,35,35,groundSheet);

function drawAllObstacles () {
    for (var i = 0, l = obstacles.length; i<l; i++){
        obstacles[i].draw();
    }
}