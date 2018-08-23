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

var hpBarEmitter = new ParticleEmitter(200,6, hpMeterParticlesConfig);
function drawHPBar() {
    var percHealthLeft = player.stats.getNewHP() / player.stats.getMaxHP();
    var hpBarX = Math.round(canvas.width / 2) - 28;

    hpBarEmitter.x = hpBarX + Math.floor(percHealthLeft * HP_HUD_W);
    hpBarEmitter.timeLeft = 5; //just to keep it alive as long as it is drawn

    /* // Commenting this out, I think it looks better without the black background
    colorRect(  hpBarX,
                1,
                HP_HUD_W,
                HP_HUD_H,
                'black');
    */
    colorRect(  hpBarX,
                1,
                Math.floor(percHealthLeft * HP_HUD_W),
                HP_HUD_H,
                'red');
}

var arcaneBarEmitter = new ParticleEmitter(200,15, arcaneMeterParticlesConfig);
function drawArcaneBar() {
    var arcaneBarX = Math.round(canvas.width / 2) - 40;
    var amountOfArcane = player.stats.arcaneMeter;

    if (amountOfArcane >= player.stats.maxArcane) {
        amountOfArcane = player.stats.maxArcane;
    }

    var percOfArcane = amountOfArcane / player.stats.maxArcane;

    if (percOfArcane != 0) {
        arcaneBarEmitter.x = arcaneBarX + Math.floor(percOfArcane * ARCANE_HUD_W);
    } else { arcaneBarEmitter.x = -100; } //move it outside screen if inactive ;)
    arcaneBarEmitter.timeLeft = 5; //just to keep it alive as long as it is drawn
    /* // Commenting this out, I think it looks better without the black background
    colorRect(  arcaneBarX,
                HP_HUD_H + 3,
                ARCANE_HUD_W,
                ARCANE_HUD_H,
                'black');
    */
    colorRectAlpha(  arcaneBarX,
                ARCANE_HUD_H + 2,
                Math.floor(percOfArcane * ARCANE_HUD_W),
                ARCANE_HUD_H,
                [98, 171, 212, 1]);
}
