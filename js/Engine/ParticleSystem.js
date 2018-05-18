
// Particle system for club JS games. Made by the best Marth on For Glory, Remy, with original code from Christer
// and inspiration from this tutorial: http://buildnewgames.com/particle-systems/ .

// For pretty particles to spawn, we need two things: a ParticleEmitter and a ParticleRenderer.
// The emitter is the spawning point, the place where the particles are born. It also takes care of updating them properly and
// killing them when appropriate. Everything is defined in the "config" variable which is used to initialize particles. Note that configs are completely reusable for multiple emitters.

// The ParticleRenderer is already created as an object literal in this script. You can access it using ParticleRenderer.foo()

// The Particle object is a dummy. The class is empty, everything is initialized in the ParticleEmitter. These settings are all in the "config" object litteral that you must create and pass as an argument
// to the ParticleEmitter constructor.

// Fun implementation fact:
// There are often many particles in a typical game; depending on the genre, each frame may have 100+ particles going on at once
// As such, it becomes useful to implement what is known as object pooling. This reuses old particles (resuscitates them) so that instead
// of allocating new memory, we simply move a previously dead particle and start it all over again (which is fine because it is only a visual effect).

// As will all the modules in Arcaninjandroid, don't hesitate to contact me if you need help or want a walkthrough of the implementation! :)
 


var emitters = [];
function ParticleEmitter (x,y,config) {

    // Adds to the array of emitters that get updated + rendered each frame
    emitters.push(this);

    this.pool = [];
    this.poolPointer = 0; //moves around in the pool, pointing to the last dead particle
    this.toSwap = []; //stores which particles died this frame and need to be swapped

    this.isActive = true;

    //Avoids error and lets us set to default configs 
    if (typeof config === "undefined") {
        config = {};
    }

    ////////       Initialize the emitter with configurations, if undefined set to (arbitrary/logical) default          //////////

    this.emissionRate = config.emissionRate || 1;
    if (this.emissionRate != 0) {
        this.emitCounter = 1/this.emissionRate; //init at this value so we spawn on the first frame! (ie not wait the first spawn interval)
    } else {
        this.emitCounter = 0;
    }
    //stores delta times and tells us if we must create a new particle

    this.x = x || 0;
    this.y = y || 0;
    this.duration = config.duration || 2; //note: when emitter dead, alive particles still finish their life
    this.timeLeft = this.duration;

    this.pLife = config.particleLife || 2;
    this.size = config.size || 10;
    this.speed = config.speed || 25;
    this.angle = config.angle*(Math.PI/180) || 0; //converts to rads for the calculations

    this.startColor = config.startColor || [247,46,0, 1]; //default is rgb for a nice orange (with alpha = 1)
    this.endColor = config.endColor || [247,46,0, 1];
    this.useTexture = config.useTexture || false; //this can be turned off to improve performance
    this.texture = config.texture; // add a default texture?
    this.textureAdditive = config.textureAdditive || false; //turn off to improve performance
    this.tint = config.tint || false;

    this.fadeAlpha = config.fadeAlpha || false; //fades the alpha over the particle's lifetime
    this.fadeSize = config.fadeSize || false;

    this.gravity = config.gravity || 0;



    // Var is the degree at which the value varies randomly. The formula: value = base + var * (random (-1 to 1))
    this.xVar = config.xVar || 0;
    this.yVar = config.yVar || 0;
    this.angleVar = config.angleVar*(Math.PI/180) || 0;
    this.pLifeVar = config.particleLifeVar || 0;
    this.sizeVar = config.sizeVar || 0;
    this.speedVar = config.speedVar || 0;

    this.startColorVar = config.startColorVar || [0,0,0,0];
    this.endColorVar = config.endColorVar || [0,0,0,0];


    ParticleEmitter.prototype.update = function (dt) {

        this.toSwap = [];

        //Update emitter time left
        if (this.isActive){
            this.timeLeft -= dt; //in seconds
            if (this.timeLeft < 0) {
                this.isActive = false;
            }
        }

        //Emit new particles if needed           
        if (this.emissionRate != 0 && this.isActive){

            var rate = 1 / this.emissionRate;

            // Here, we check how many particles we have to spawn. It's possible that for a given dt, we have to spawn
            // more than 1 if emissionRate is high enough, hence the while loop and the emitCounter
            this.emitCounter += dt;
            while (this.emitCounter > rate){
                this.addParticle();
                this.emitCounter -= rate;
            }
        }

        //Update all alive particles (moves, applies forces, but no rendering)
        for (var i = 0, l = this.poolPointer; i < l; i++) {

            var particle = this.pool[i];
            this.updateParticle(dt, particle, i);

        }
        
        // Return all that died to pool
        for (var i = 0, l = this.toSwap.length; i < l; i++){           
            this.returnToPool(this.toSwap[i]);
        }

    }

    ParticleEmitter.prototype.updateParticle = function (dt, particle, particleIndex) {

        particle.lifeLeft -= dt; // again, times are in seconds!

        // if alive, do EVERYTHING!
        if (particle.lifeLeft > 0){
               		
    		particle.x += particle.velocity.x * dt;
            particle.y += particle.velocity.y * dt;
            
          
            particle.color[0] += particle.deltaColor[0] * dt;
            particle.color[1] += particle.deltaColor[1] * dt;
            particle.color[2] += particle.deltaColor[2] * dt;
            particle.color[3] += particle.deltaColor[3] * dt;
            //Update the fading over lifetime properties
            var ageRatio = particle.lifeLeft / particle.lifetime;
            if (particle.fadeAlpha) {
                particle.color[3] = ageRatio; //index 3 is alpha in rgba
            }
            if (particle.fadeSize) {
                particle.size = particle.originalSize * ageRatio;
            }



        } else {

            this.toSwap.push(particleIndex); //particle died this frame, we'll need to swap this one once we're done updating everyone else

        }


    }

    ParticleEmitter.prototype.addParticle = function () {

        var particle = this.getParticleFromPool(); //grab a dead one if available, or extend the pool if it's full
        
        this.initParticle(particle); //applies the emitter configuration to our newborn particle
    
    }

    ParticleEmitter.prototype.initParticle = function (p) {
               
        p.x = this.x + this.xVar*randomMin1To1();
        p.y = this.y + this.yVar*randomMin1To1();

        p.lifetime = this.pLife + this.pLifeVar*randomMin1To1(); //camelCase confusing?
        p.lifeLeft = p.lifetime; //life left starts at max
        p.originalSize = this.size + this.sizeVar*randomMin1To1();
        if (p.originalSize < 0 ){ p.originalSize = 0;}
        p.size = p.originalSize;
        p.angle = this.angle + this.angleVar*randomMin1To1();

        p.velocity = {
            x: (this.speed + this.speedVar*randomMin1To1()) * Math.cos(p.angle),
            y: -(this.speed+ this.speedVar*randomMin1To1()) * Math.sin(p.angle), //minus because y axis points down
        };


        var startColor = [
            this.startColor[0] + this.startColorVar[0] * randomMin1To1(), 
    	    this.startColor[1] + this.startColorVar[1] * randomMin1To1(), 
    	    this.startColor[2] + this.startColorVar[2] * randomMin1To1(), 
    	    this.startColor[3] + this.startColorVar[3] * randomMin1To1()
        ];

        var endColor = [
            this.endColor[0] + this.endColorVar[0] * randomMin1To1(),
            this.endColor[1] + this.endColorVar[1] * randomMin1To1(),
            this.endColor[2] + this.endColorVar[2] * randomMin1To1(),
            this.endColor[3] + this.endColorVar[3] * randomMin1To1()
        ];
        p.color = startColor;

        //The variation between colors.This is applied each frame over lifetime
        p.deltaColor = [
    	(endColor[0] - startColor[0]) / p.lifeLeft,
    	(endColor[1] - startColor[1]) / p.lifeLeft,
    	(endColor[2] - startColor[2]) / p.lifeLeft,
    	(endColor[3] - startColor[3]) / p.lifeLeft
        ];



        p.useTexture = this.useTexture;
        p.textureAdditive = this.textureAdditive;
        p.texture = this.texture;
        p.tint = this.tint;

        p.fadeAlpha = this.fadeAlpha;
        p.fadeSize = this.fadeSize;

        p.gravity = this.gravity;

    }

    ParticleEmitter.prototype.getParticleFromPool = function () {

        // If the pointer overshoots the array, we have no dead particles available. Create a new one.
        if (this.poolPointer === this.pool.length) {
            this.pool.push(new Particle()); //note: creating a new particle intuitively implies that it is alive, but it is really dead because it's not actually in the game yet!
        }

        var particle = this.pool[this.poolPointer]; //get the dead particle that is at the "barrier" between the alive and dead

        this.poolPointer++; //the barrier separating life and death is pushed forward, because we revived a particle

        return particle;

    }

    ParticleEmitter.prototype.returnToPool = function (particleIndex) {

        this.poolPointer--; //one more dead -> move back by one, point to the current last alive

        var aliveParticle = this.pool[this.poolPointer]; //gets the last alive particle at the barrier

        this.pool[this.poolPointer] = this.pool[particleIndex]; //our dead particle takes its place...
        this.pool[particleIndex] = aliveParticle; //swap complete!

        //now our pool is still organised and separates the alive and dead, but we have one more dead

    }

};

// There is no pooling here, only removal using array.splice. If we have performance issues, this would be a good place to look
function updateAllEmitters() {

    var toRemove = []; //remove these indexes after we're done updating

    for (var i = 0, l = emitters.length; i < l; i++) {

        // check if the emitter is inactive and all partys are dead
        if (emitters[i].isActive === false && emitters[i].poolPointer === 0) {
            toRemove.push(i);
            continue;
        }
        
        emitters[i].update(dt);
    }
    for (var i = toRemove.length-1, j = 0; i >= j; i--) {
        index = toRemove[i];
        emitters.splice(index,1); //remove the dead emitter. Not optimal, but gets job done
    }

}

//Note: tint, additive rendering, and to a degree, using textures, consumes resources! I will try to optimize the code, but still, the operations are costly. Use with care!
ParticleRenderer = {


    renderAll : function (context){

        // Iterate over every alive particle of every active emitter, and draw
        for (var i = 0, l = emitters.length; i < l; i++) {
            for (var j = 0, k = emitters[i].poolPointer; j < k; j++) {
                
                particle = emitters[i].pool[j];
                this.renderParticle(particle, context); //I'm not putting huge code in a double loop haha
            }
        }

    },

    renderParticle : function (particle, context) {

        if (particle.useTexture){

            context.globalAlpha = particle.color[3];

            if (particle.textureAdditive){
                context.globalCompositeOperation = "lighter";
            }
            if (particle.tint) {

                this.tintAndDraw(particle,context);

            } else {
                context.drawImage(particle.texture, particle.x-particle.size/2, particle.y-particle.size/2, particle.size, particle.size);               
            }
            
            context.globalAlpha = 1;
            context.globalCompositeOperation = "source-over";
            
            
        }
        //default to drawing a circle
        else {
            colorCircleAlpha(particle.x, particle.y, particle.size, particle.color);
        }
    },

    tintAndDraw : function (particle,context) {

        // A canvas must have integer width that is more than zero
        if (particle.size < 1) {
            return;
        }

        tintCanvas.width = particle.size;
        tintCanvas.height = particle.size;
        tintContext.fillStyle = context.fillStyle = "rgba(" + particle.color[0] + ","+ particle.color[1] + "," + particle.color[2] + "," + particle.color[3] + ")";

        tintContext.drawImage(particle.texture, 0, 0, tintCanvas.width, tintCanvas.height);
        tintContext.globalCompositeOperation = "source-atop";
        tintContext.fillRect(0,0, tintCanvas.width,tintCanvas.height);
        tintContext.globalCompositeOperation = "source-over";
        
        //canvasContext.drawImage(tintCanvas, particle.x, particle.x, tintCanvas.width, tintCanvas.height);
        context.drawImage(tintCanvas, particle.x-tintCanvas.width/2, particle.y-tintCanvas.height/2, tintCanvas.width, tintCanvas.height);
    }
};

function Particle() {


};

