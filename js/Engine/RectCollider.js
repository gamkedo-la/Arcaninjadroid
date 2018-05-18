
// Simple implementation of a RectCollider. Note the necessity for it to have a parent object.
// The main method of interest here is the "intersects" method. This takes another Collider (Rect or Circle) and returns true if they are overlapping.
// There is also a draw method which can be used for debugging.

// Made by the biggest tryhard in Gamkedo, Remy! If you enjoyed this script, check out its sibling(s)! (namely, the CircleCollider!)

function RectCollider (parent, width, height) {

    var parent = parent; 
    var width = width; 
    var height = height;

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