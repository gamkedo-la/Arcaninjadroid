// Woosh trail / speed lines effect by McFunkypants
// not a particle system; just one sprite that never dies
// and gets stretched around a path based on player movement

function WooshTrail(imageName) {

    // private vars
    let trailImage = null;
    let trailXY = []; // list of previous positions
    if (!imageName) imageName = "wooshTrail";
    let wooshImage = Images.getImage(imageName);
    let trailMaxLength = 12;

    const CURVY_MODE = false; // chop into many small lines? if false, just one long smooth line

    // public funcs
    this.draw = function (newX, newY) {

        //console.log(newX,newY);
        //prevents draw if we stand still for too long
        if (trailXY.length != 0 && newX == trailXY[0].x && newY == trailXY[0].y) {
            trailXY = [{ x: newX, y: newY }]; //saves the current pos here until we trigger a change
            //console.log("Here")
            return;
        }
        // add current position to the list
        trailXY.push({ x: newX, y: newY }); // not super happy about new objects being created here
        //console.log("push")

        // remove the oldest entry if the array is full
        // TODO: allow for > 2 coordinates for curvy chopped up lines
        if (trailXY.length > trailMaxLength) {
            trailXY.shift(); // low performance - optimize out?
        }

        //console.log("Wooshtrail trailXY.length=" + trailXY.length + " draw at " + newX + "," + newY);

        if (CURVY_MODE) {

            // draws many small lines
            // not stretched and "chopped" as intended
            // but this supports "curves"
            for (let segment = 0, count = trailXY.length - 1; segment < count; segment++) {

                drawBitmapLine(wooshImage,
                    trailXY[segment].x - 1, trailXY[segment].y,
                    trailXY[segment + 1].x + 1, trailXY[segment + 1].y);

            }
        }
        else {// draw one solid line
            // draws a line from oldest to newest with no regard to curvature
            drawBitmapLine(wooshImage,
                trailXY[0].x, trailXY[0].y,
                trailXY[trailXY.length - 1].x, trailXY[trailXY.length - 1].y);

        } // curvy
    } // draw 
} // class