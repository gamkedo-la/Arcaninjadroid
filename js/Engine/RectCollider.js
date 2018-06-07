
// Simple implementation of a RectCollider. Note the necessity for it to have a parent object.
// The main method of interest here is the "intersects" method. This takes another Collider (Rect or Circle) and returns true if they are overlapping.
// There is also a draw method which can be used for debugging.

// Made by the biggest tryhard in Gamkedo, Remy! If you enjoyed this script, check out its sibling(s)! (namely, the CircleCollider!)

var colliders = [];
function RectCollider (parent, width, height, config) {

    colliders.push(this);

    if (!config) {config = {};} // avoids errors related to undefined config

    this.parent = parent;
    var width = width;
    var height = height;
    var offsetX = config.offsetX || 0;
    var offsetY = config.offsetY || 0;

    var color = config.color || "green";

    var isTrigger = config.isTrigger || false; // if two non-triggers collide, their parents will be pushed out and have their velocities nullified

    this.intersects = function (other) {

        // If the other collider is a circle collider (rect cannot be rotated)
        // See this wonderful link for explanation of the check: https://yal.cc/rectangle-circle-intersection-test/
        if (other.getRadius) {
            
            dx = other.getX() - Math.max(this.getX() - width / 2,
                                        Math.min(other.getX(), this.getX() + width/2));
            dy = other.getY() - Math.max(this.getY() - height / 2,
                                        Math.min(other.getY(), this.getY() + height/2));

            return dx * dx + dy * dy < (other.getRadius()*other.getRadius());
        }
        
        // we can assume that we have a Rect since the physics engine is very basic
        else {

            return !(
                // if a rect is on the left of the other
                this.getX() + width / 2 < other.getX() - other.getWidth() / 2
                || other.getX() + other.getWidth() / 2 < this.getX() - width / 2
                // if a rect is above the other
                || this.getY() + height / 2 < other.getY() - other.getHeight() / 2
                || other.getY() + other.getHeight() / 2 < this.getY() - height / 2
            );

        }
    }

    // give the option to be drawn for debugging
    this.draw = function () {

        canvasContext.beginPath();
        canvasContext.strokeStyle = color;
        canvasContext.rect(this.getX() - width/2, this.getY() - height/2, width, height);
        canvasContext.stroke();
        canvasContext.closePath();

    }

    //DISCLAIMER: This method is extremely rudimentary!!! The full game is intended to contain little to no
    // actual physics collisions/movements, only hitbox/hurtbox triggers. This is only intended for use with basic terrain
    // as the player will be able to walk freely "through" enemies. Use sparingly!
    // Also, it's ugly, so don't bother reading through this unless you wanna laugh at how a "physicist" can't code decent physics
    this.pushOutBothParents = function (other) {

        if (this.isTrigger || other.isTrigger) {return;} //for safety

        var dx = other.getX() - this.getX();
        var dy = other.getY() - this.getY();

        if (dx < 0) {
            var directionX = -1;
        } else {
            var directionX = 1;
        }
        if (dy < 0) {
            var directionY = -1;
        } else {
            var directionY = 1;
        }
        var overlapX = this.getWidth()/2 + other.getWidth()/2 - Math.abs(dx) + 1; //+1 so we push outside by 1px and not simply at the frontier
        var overlapY = this.getHeight()/2 + other.getHeight()/2 - Math.abs(dy) + 1;

        var fullMoveX = directionX*overlapX;
        var fullMoveY = directionY*overlapY;


        if (overlapX < overlapY) {
            if (this.parent.movable && other.parent.movable === false){
                this.parent.x -= fullMoveX;
            } else if (this.parent.movable === false && other.parent.movable) {
                other.parent.x += fullMoveX;
            } else {
                this.parent.x -= fullMoveX/2;
                other.parent.x += fullMoveX/2;
            }

        } else {
            //The pushout rounds the y value, but that might be a bad idea (?)
            if (this.parent.movable && other.parent.movable === false){
                this.parent.y -= fullMoveY;
                this.parent.y = Math.round(this.parent.y);
            } else if (this.parent.movable === false && other.parent.movable) {
                other.parent.y += fullMoveY;
                other.parent.y = Math.round(other.parent.y);
            } else {
                this.parent.y -= fullMoveY/2;
                other.parent.y += fullMoveY/2;
            }
        }
    }

    this.getX = function () {
        return parent.x + offsetX;
    }

    this.getY = function () {
        return parent.y + offsetY;
    }

    this.getWidth = function () {
        return width;
    }
    this.getHeight = function () {
        return height;
    }

};

//only usage of this function so far: push out stuff if there are two non-trigger colliders intersecting
function resolveAllCollisions() {

    var collider1;
    var collider2;
    for (var i = 0, l = colliders.length; i<l; i++){

        for (var j = i+1, l; j<l; j++) {

            collider1 = colliders[i];
            collider2 = colliders[j];

            if (collider1.parent === collider2.parent) continue;

            if (collider1.intersects(collider2)){
                if (!collider1.isTrigger && !collider2.isTrigger){
                    //collider1.pushOutBothParents(collider2);
                }
            }
        }
    }
}

function resolveFeetToGround() {

}