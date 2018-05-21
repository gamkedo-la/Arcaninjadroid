
characters = [];

function Player () {
    characters.push(this);

    this.x = 100;
    this.y = 75;
    this.velocity = {x:0, y:0};

    this.walkSpeed = 2;
    this.jumpVelocity = 12; //initial y velocity when jumping

    this.collider = new RectCollider(this,20,28);
    this.movable = true; //can be affected by collisions

    this.ninjaSpeed = 1;

    this.actionMachine = new StateMachine(new IdleAndroidState()); // state machine of the current move being used

    this.draw = function () {
        this.actionMachine.drawCurrentState(this.x,this.y);
        this.collider.draw();
    }
}
player = new Player ();


// Characters include both player and enemies. No inheritance between the two as of now
function drawAllCharacters() {
    for (var i = 0, l = characters.length; i<l;i++) {
        characters[i].draw();
    }
}
