
// Simple implementation of a RectCollider. Note the necessity for it to have a parent object.
// The main method of interest here is the "intersects" method. This takes another Collider (Rect or Circle) and returns true if they are overlapping.
// There is also a draw method which can be used for debugging.

// Made by the biggest tryhard in Gamkedo, Remy! If you enjoyed this script, check out its sibling(s)! (namely, the CircleCollider!)

var colliders = [];
function RectCollider (parent, width, height) {
    colliders.push(this);

    this.parent = parent; 
    var width = width; 
    var height = height;

    var isTrigger = false; // if two non-triggers collide, their parents will be pushed out and have their velocities nullified

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

            //console.log(this.getX() + width / 2 < other.getX() - other.getWidth() / 2, other.getX() + other.getWidth() / 2 < this.getX() - width / 2,
            //this.getY() + height / 2 < other.getY() - other.getHeight() / 2, other.getY() + other.getHeight() / 2 < this.getY() - height / 2);

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
        canvasContext.strokeStyle = "green";
        canvasContext.rect(this.getX() - width/2, this.getY() - height/2, width, height);
        canvasContext.stroke();
        canvasContext.closePath();

    }

    //currently only works with rect colliders
    this.pushOutBothParents = function (other) {

        var dx = Math.abs(other.getX() - this.getX());
        var dy = Math.abs(other.getY() - this.getY());

        overlapX = this.getWidth()/2 + other.getWidth()/2 - dx;
        overlapY = this.getHeight()/2 + other.getHeight()/2 - dy;

        console.log(overlapX, overlapY);

        if (overlapX < overlapY) {
            this.parent.x += overlapX/2;
            other.parent.x -= overlapX/2;
        } else {
            this.parent.y += overlapY/2;
            other.parent.y -= overlapY/2;
        }
    }

    this.getX = function () {
        return parent.x;
    }

    this.getY = function () {
        return parent.y;
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



            if (collider1.intersects(collider2)){
                if (!collider1.isTrigger && !collider2.isTrigger){
                    collider1.pushOutBothParents(collider2);
                }
                
            }
        }
    }
}