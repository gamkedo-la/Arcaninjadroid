
//groundSheet = new SpriteSheet(Images.getImage("ground1"), 1,1);

terrain = [];
function Terrain (x,y, width,height, movable = false) {

    terrain.push(this);
    
    this.x = x;
    this.y = y;
    var width = width;
    var height = height;

    var sheet = sheet;
    var animation = new Animation (Images.getImage("ground1"));

    this.movable = movable;

    this.collider = new RectCollider(this,width,height);

    this.draw = function () {
        animation.draw(this.x, this.y); // standardise?
        this.collider.draw();
    }

}

var protoGround = new Terrain(85,151, 250,35);
//var protoGround2 = new Obstacle(45,132,35,35,groundSheet);
//var protoGround3 = new Obstacle(65,133,35,35,groundSheet);

function drawAllTerrain () {
    for (var i = 0, l = terrain.length; i<l; i++){
        terrain[i].draw();
    }
}