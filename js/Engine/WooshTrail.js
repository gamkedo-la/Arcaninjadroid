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
        if (trailXY.length > 10) {
            trailXY.shift();
        }

        //console.log("Wooshtrail trailXY.length=" + trailXY.length + " draw at " + newX + "," + newY);

        /*
        // draws many small lines - not stretched and "chopped" as intended
        for (let segment = 0, count = trailXY.length - 1; segment < count; segment++) {

            drawBitmapLine(wooshImage,
                trailXY[segment].x, trailXY[segment].y,
                trailXY[segment + 1].x, trailXY[segment + 1].y);

        }
        */

        // draws a line from oldest to newest with no regard to curvature
        drawBitmapLine(wooshImage,
            trailXY[0].x, trailXY[0].y,
            trailXY[trailXY.length - 1].x, trailXY[trailXY.length - 1].y);


    }

}