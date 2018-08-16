// combos.js - made by mcfunkypants with love for gamkedo 
// a system to handle 2x 3x 4x etc hits/timers for action games

var comboCurrent = 0; // 1x 2x 3x 4x
var comboMaxTimespan = 3000; // ms until reset
var comboLastHitTimestamp = 0;
var comboStartedTimestamp = 0;
const debug_combos = true;

function registerHitForCombo() {

    var resetCombo = true;
    var now = performance.now();

    if (debug_combos) console.log('registerHitForCombo at ' + now.toFixed(2));

    if (comboCurrent > 0) { // ongoing?

        var timeSince = now - comboLastHitTimestamp;
        var timeSinceStart = now - comboStartedTimestamp;

        if (debug_combos) console.log('ongoing combo time ' + timeSinceStart.toFixed(2));
        if (timeSince <= comboMaxTimespan) { // soon enough?
            if (debug_combos) console.log(timeSince.toFixed(2) + ' was soon enough! in-combo time: ' + timeSinceStart.toFixed(2));
            comboCurrent++;
            resetCombo = false;
        } else { // too long
            if (debug_combos) console.log(timeSince.toFixed(2) + ' was too slow: combo reset.');
        }
    }

    if (resetCombo) {
        comboCurrent = 1;
        comboStartedTimestamp = now;
    }

    comboLastHitTimestamp = now;
    if (debug_combos) console.log(comboCurrent + 'x combo');
}


function drawComboGUI() { // 2x 3x 4x etc

    var now = performance.now();
    var timeSince = now - comboLastHitTimestamp;
    if ((comboCurrent > 0) && (timeSince > comboMaxTimespan)) {
        console.log(comboCurrent + 'x combo timed out after ' + timeSince);
        comboCurrent = 0;
    }

    var percent = 1 - (timeSince / comboMaxTimespan);
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    if (comboCurrent > 1 && comboCurrent > 1) {
        canvasContext.globalAlpha = percent;
        drawPixelfont(comboCurrent + 'x combo', 2, 16);
        canvasContext.globalAlpha = 1;
    }
}