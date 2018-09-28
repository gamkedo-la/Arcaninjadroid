// kittiesplosion
// endgame cinematic

function KittieSplosionClass() {

    this.update = function() {
        //console.log("kittiesplosion update");
        if (Math.random()>0.9) {
            createParticleEmitter(Math.random()*canvas.width, -32, kittieParticles);
            createParticleEmitter(Math.random()*canvas.width, -32, loveParticles);
        }
    }

    console.log("kittiesplosion effect initialized...");

}