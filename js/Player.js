
characters = [];

function Player () {
    characters.push(this);

    this.x = 100;
    this.y = 75;
    this.velocity = {x:0, y:0};

    this.walkSpeed = 2;
    this.jumpVelocity = 8; //initial y velocity when jumping

    this.groundCollider = new RectCollider(this,20,0.2, {offsetY:12});
    this.grounded = false;
    this.movable = true; //can be affected by collisions


    this.ninjaSpeed = 1;

    this.actionMachine = new StateMachine(PlayerStates.idleAndroidState); // state machine of the current move being used

    this.draw = function () {
        this.actionMachine.drawCurrentState(this.x,this.y);
        this.groundCollider.draw();
    }
}
player = new Player ();


// Characters include both player and enemies. No inheritance between the two as of now
function drawAllCharacters() {
    for (var i = 0, l = characters.length; i<l;i++) {
        characters[i].draw();
    }
}

function updateAllCharacters() {

    for (var i = 0, l = characters.length; i<l; i++) {

        characters[i].actionMachine.updateAnimation(); //state changes are handled based on animation durations, so we update anims first
    }

    for (var i = 0, l = characters.length; i<l; i++) {

        characters[i].actionMachine.update();
    }
}