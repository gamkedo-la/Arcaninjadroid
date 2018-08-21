
function ArcaneShot (x,y, config) {

    arcaneShots.push(this);

    if (!config) { config = {}; }

    this.animation = new Animation(this, Images.getImage("arcaneBig"), arcaneBigData, { holdLastFrame : true });
    this.x = x;
    this.y = y;

    this.emitterTrail1 = new ParticleEmitter (this.x-10, this.y, arcaneTrailParticlesConfig1); //gets drawn with all other emitters

    this.draw = function () {
        this.animation.draw();
    }

    this.update = function () {

    }
}

arcaneShots = [];

drawAllArcane = function () {
    
    for (var i = arcaneShots.length - 1; i >= 0; i--) {
        arcaneShots[i].draw();
    }

}