
characters = [];

function Player () {
    characters.push(this);

    this.x = 100;
    this.y = 75;
    this.velocity = {x:0, y:0};

    this.walkSpeed = 2;
    this.jumpVelocity = 8; //initial y velocity when jumping

    this.feetCollider = new RectCollider(this,20,0.2, {offsetY:12});
    this.hitbox = new RectCollider(this,10,10, {offsetX:12, offsetY:-9, isTrigger:true});
    this.hurtbox = new RectCollider(this,20,30, {isTrigger:true});

    this.grounded = false;
    this.movable = true; //can be affected by collisions


    this.actionMachine = new StateMachine(PlayerStates.idleAndroidState); // state machine of the current move being used

    this.draw = function () {
        this.actionMachine.drawCurrentState(this.x,this.y);
        this.feetCollider.draw();
        this.hitbox.draw();
        this.hurtbox.draw();
    }

    this.groundCheck = function () {

        // this will be a method of Character
        for (var i = 0, l = terrain.length; i < l ; i++) {
            if (this.feetCollider.intersects(terrain[i].collider)) {
                this.grounded = true;
                this.feetCollider.pushOutBothParents(terrain[i].collider); //keep character above ground
                return;
            }
        }
        this.grounded = false;
    }

    this.checkForHits = function (otherChar) {

        hit = otherChar.getHitboxes();
        hurt = this.getHurtboxes();
        // This double loop is not as costly as it may seem, as there is no way we'll have more than 3 hitboxes/hurtboxes on a given character
        for (var i = 0, l = hurt.length; i < l; i++) {
            for (var j = 0, k = hit.length; j<k; j++) {
                if (hurt[i].intersects(hit[j])) {
                    this.gotHit(otherChar); //this method will go get the information and handle the hit
                }
            }
        }
    }

    this.gotHit = function (otherChar) {
        console.log("Got hit!");
    }

    this.getHurtboxes = function () {
        return [this.hurtbox];
        //this.animation.getHurtboxes();
    }

    this.getHitboxes = function () {
        return [this.hitbox];
        //this.animation.getHitboxes();
    }
}
var player = new Player ();

var otherCharacter = new Player ();

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

    for (var i = 0, l = characters.length; i<l; i++) {

        characters[i].groundCheck();
    }

    for (var i = 0, l = characters.length; i<l; i++) {

        //this loop implies we can get hit by multiple attacks on a single frame
        for (var j = 0, l; j<l; j++) {
            if (i == j){ continue; } // to avoid hitting oneself
            characters[i].checkForHits(characters[j]);
        }
    }

}