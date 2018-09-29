// kittiesplosion
// endgame cinematic

function KittieSplosionClass() {

    this.update = function() {
        //console.log("kittiesplosion update");
        if (Math.random()>0.9) {
            createParticleEmitter(Math.random()*canvas.width, -32, kittieParticles1);
            createParticleEmitter(Math.random()*canvas.width, -32, kittieParticles2);
            createParticleEmitter(Math.random()*canvas.width, -32, kittieParticles3);
            createParticleEmitter(Math.random()*canvas.width, -32, loveParticles);
        }
    }

    console.log("kittiesplosion effect initialized...");

}