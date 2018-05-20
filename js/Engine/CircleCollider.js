
// Simple implementation of a CircleCollider. Note the necessity for it to have a parent object.
// The main method of interest here is the "intersects" method. This takes another Collider (Rect or Circle) and returns true if they are overlapping.
// There is also a draw method which can be used for debugging.

// Made by the biggest tryhard in Gamkedo, Remy! If you enjoyed this script, check out its sibling(s)! (namely, the RectCollider!)

//var "colliders" is created in RectCollider.js
function CircleCollider (parent, radius) {

    colliders.push(this);

    var parent = parent;
    var radius = radius;

    if (!radius) {
        console.log("Warning! Circle collider added with undefined radius.");
    }

    this.intersects  = function (other) {

        // If we have two circle colliders
        if (other.getRadius) {

            dx = this.getX() - other.getX();
            dy = this.getY() - other.getY();
            
            return Math.sqrt(dx*dx + dy*dy) < this.getRadius() + other.getRadius();
        }

        // else we assume it is a rectangle
        else {

            dx = this.getX() - Math.max(other.getX() - other.getWidth() / 2,
                                        Math.min(this.getX(), other.getX() + other.getWidth()/2));
            dy = this.getY() - Math.max(other.getY() - other.getHeight() / 2,
                                        Math.min(this.getY(), other.getY() + other.getHeight()/2));

            return (dx * dx + dy * dy) < (this.getRadius()*this.getRadius());
        }
    }

    this.draw = function () {

        canvasContext.beginPath();
        canvasContext.strokeStyle = "green";
        canvasContext.arc(this.getX(), this.getY(), radius, 0, Math.PI * 2, true); 
        canvasContext.stroke();
        canvasContext.closePath();
        
    }

    this.getRadius = function () {
        return radius;
    }

    this.getX = function () {
        return parent.x;
    }

    this.getY = function () {
        return parent.y;
    }
};