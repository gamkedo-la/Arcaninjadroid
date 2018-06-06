// Woosh trail / speed lines effect by McFunkypants
// not a particle system; just one sprite that never dies
// and gets stretched around a path based on player movement

function WooshTrail() {

    // private vars
    let trailImage = null;
    let trailSize = 0;

    // TODO: chop image into segments for curvy trails w > 2 points
    const trailSizeMax = 2;

    let trailXY = []; // list of previous positions

    // public funcs
    this.draw = function (newX, newY) {

        //console.log("Wooshtrail draw at " + newX + "," + newY);

        // TODO: move this to this.update() and add more lines to Character.js?
        trailSize++;
        // add current position to the list
        trailXY[trailSize] = { x: newX, y: newY };
        // remove the oldest entry
        if (trailSize >= trailSizeMax) {
            trailXY.shift();
        }

        // render it

    }

}