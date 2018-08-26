var arcaneShotCost = 50;

function ArcaneShot (x,y, config) {

    arcaneShots.push(this);

    if (!config) { config = {}; }

    this.flipped = player.flipped;
    this.animation = new Animation(this, Images.getImage("arcaneBig"), arcaneBigData, { holdLastFrame : true });
    
    this.attackDamage = 50;

    this.x = x;
    this.y = y;
    this.xParticleOffset1 = this.flipped? 10:-10;
    this.yParticleOffset1 = 0;
    this.xParticleOffset2 = this.flipped? -10:10;
    this.yParticleOffset2 = 0;

    this.velocity = { x: 0, y: 0 };
    this.velocity.x = this.flipped ? -2:2;
    this.velocity.y = 0;

    this.emitterTrail1 = new ParticleEmitter (this.x-10, this.y, arcaneTrailParticlesConfig1); //gets drawn with all other emitters
    this.emitterTrail1.angle = this.flipped ? 0:Math.PI;
    this.emitterTrail2 = new ParticleEmitter (this.x, this.y, arcaneTrailParticlesConfig2); //gets drawn with all other emitters

    this.draw = function () {
        this.animation.draw();
    }

    this.update = function () {

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.emitterTrail1.x = this.x+this.xParticleOffset1;
        this.emitterTrail1.y = this.y;
        this.emitterTrail2.x = this.x+this.xParticleOffset2;
        this.emitterTrail2.y = this.y;

        this.boundsCheck();
    }

    this.boundsCheck = function () {
        if (this.x > ORIG_WORLD_W || this.x < 0 ||
            this.y > ORIG_WORLD_H || this.y < 0) {
            this.removeShot();
        }
    };

    this.getAnimation = function () {
        return this.animation;
    }
    this.getHurtboxes = function () {
        return this.animation.getHurtboxes();
    }

    this.getHitboxes = function () {
        return this.animation.getHitboxes();
    }

    this.removeShot = function () {

        let index = arcaneShots.indexOf(this);
        arcaneShots.splice(index,1);

        this.emitterTrail1.timeLeft = 0;
        this.emitterTrail2.timeLeft = 0;
    }

    arcaneFireSFX.play();
}



arcaneShots = [];

drawAllArcane = function () {
    
    for (var i = arcaneShots.length - 1; i >= 0; i--) {
        arcaneShots[i].draw();
    }

}

updateAllArcane = function () {

    for (var i = arcaneShots.length - 1; i >= 0; i--) {
        arcaneShots[i].update();
    }
}