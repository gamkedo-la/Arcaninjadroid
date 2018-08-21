// simple heads-up-display
const HP_HUD_W = 50;
const HP_HUD_H = 9;
const ARCANE_HUD_W = 70;
const ARCANE_HUD_H = 9;

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

    drawHPBar();
    drawArcaneBar();

    drawPixelfont("KITTENS: " + hud_score_displayed, 2, 2);

    //console.log("hp:" + player.stats.getModifiedHP());
    drawPixelfontCentered("HP: " + player.stats.getNewHP(), middle, 2);
    drawPixelfontCentered("Arcane: " + player.stats.arcaneMeter, middle, 12);

    var lvlstr = "LVL: " + levelProgression;
    var lenPx = measurePixelfont(lvlstr);
    drawPixelfont(lvlstr, canvas.width - 2 - lenPx, 2);

}

function drawHPBar() {
    var percHealthLeft = player.stats.getNewHP() / player.stats.getMaxHP();
    var hpBarX = Math.round(canvas.width / 2) - 28;
    /* // Commenting this out, I think it looks better without the black background
    colorRect(  hpBarX,
                1,
                HP_HUD_W,
                HP_HUD_H,
                'black');
    */
    colorRect(  hpBarX,
                1,
                percHealthLeft * HP_HUD_W,
                HP_HUD_H,
                'red');
}

function drawArcaneBar() {
    var arcaneBarX = Math.round(canvas.width / 2) - 40;
    var amountOfArcane = player.stats.arcaneMeter;

    if (amountOfArcane >= player.stats.maxArcane) {
        amountOfArcane = player.stats.maxArcane;
    }

    var percOfArcane = amountOfArcane / player.stats.maxArcane;

    /* // Commenting this out, I think it looks better without the black background
    colorRect(  arcaneBarX,
                HP_HUD_H + 3,
                ARCANE_HUD_W,
                ARCANE_HUD_H,
                'black');
    */
    colorRect(  arcaneBarX,
                ARCANE_HUD_H + 2,
                percOfArcane * ARCANE_HUD_W,
                ARCANE_HUD_H,
                'blue');
}
