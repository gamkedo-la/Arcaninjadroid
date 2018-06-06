// Woosh trail / speed lines effect by McFunkypants
// not a particle system; just one sprite that never dies
// and gets stretched around a path based on player movement

function WooshTrail() {

    // private vars
    let trailImage = null;
    let trailXY = []; // list of previous positions
    let wooshImage = Images.getImage("wooshTrail");

    // public funcs
    this.draw = function (newX, newY) {

        // add current position to the list
        trailXY.push({ x: newX, y: newY });

        // remove the oldest entry if the array is full
        // TODO: allow for > 2 coordinates for curvy chopped up lines
        if (trailXY.length > 2) {
            trailXY.shift();
        }

        //console.log("Wooshtrail trailXY.length=" + trailXY.length + " draw at " + newX + "," + newY);

        if (trailXY.length>1)
            drawBitmapLine(wooshImage,
                trailXY[0].x,trailXY[0].y,
                trailXY[1].x,trailXY[1].y);

    }

}