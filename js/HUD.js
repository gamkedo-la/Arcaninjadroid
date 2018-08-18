// simple heads-up-display

var hud_score_displayed = 0;

function drawHUD() {

    //console.log("drawHUD");

    var middle = Math.round(canvas.width / 2);

    // animate the score
    if (player.stats.score > hud_score_displayed) {
        if (player.stats.score - hud_score_displayed > 10) {
            hud_score_displayed += 10; // count fast
        } else {
            hud_score_displayed += 1; // count slowly
        }
    }

    drawPixelfont("KITTENS: " + hud_score_displayed, 2, 2);

    //console.log("hp:" + player.stats.getModifiedHP());
    drawPixelfontCentered("HP: " + player.stats.getNewHP(), middle, 2);
    drawPixelfontCentered("Arcane: " + player.stats.arcaneMeter, middle, 10);

    var lvlstr = "LVL: " + levelProgression;
    var lenPx = measurePixelfont(lvlstr);
    drawPixelfont(lvlstr, canvas.width - 2 - lenPx, 2);

}

