characters = [];

// Base Character class, from which both player and enemy "inherit" from. 
// Characters currently musn't be created directly; instead, use another constructor on top (see Player.js)
function Character(x, y) {
    characters.push(this);

    this.x = x;
    this.y = y;
    this.velocity = { x: 0, y: 0 };

    this.walkSpeed = 1.75;
    this.jumpVelocity = 8; //initial y velocity when jumping
    this.slicesNeeded = 2;

    this.feetCollider = new RectCollider(this, 20, 0.2, { offsetY: 12 });

    this.grounded = false;
    this.movable = true; //can be affected (pushed) by collisions
    this.flipped = false; //non-flipped is facing right

    let xpModule = new XPclass();
    this.stats = new StatsClass(xpModule.getCurrentLVL(), 1.0, 1.0, 1.0);
    this.stats.setStats();

    this.hitThisFrame = false;
    this.knockupThisFrame = false;
    this.lockedOnto = false;
    this.canBeKnockedUp = false; //changes to true when passing a certain health threshold

    this.alive = true;
    this.explosionSequence = [robotExplosionParticlesConfig1, robotExplosionParticlesConfig2, robotExplosionParticlesConfig3];

    this.draw = function () {
        if (this.trail) { this.trail.draw(this.x, this.y); }
        this.getAnimation().draw();
        //this.feetCollider.draw();
        if (debug) { this.getAnimation().drawColliders(); }
    }

    //Draws the good ol' red health bar
    this.drawUI = function () {
        let hpRatio = this.stats.getNewHP() / this.stats.getModifiedHP();
        colorRect(this.x - 8, this.y - 16 - 5, 16 * (hpRatio), 2, "red"); //change for values to dynamically adapt to sprite?
    }

    this.groundCheck = function () {

        for (var i = 0, l = terrain.length; i < l; i++) {
            if (this.feetCollider.intersects(terrain[i].collider)) {
                this.grounded = true;
                this.feetCollider.pushOutBothParents(terrain[i].collider); //keep character above ground
                return;
            }
        }
        this.grounded = false;
    };

    this.boundsCheck = function () {
        if (this.x > ORIG_WORLD_W) {
            this.x = ORIG_WORLD_W;
        } else if (this.x < 0) {
            this.x = 0;
        }
        if (this.y > ORIG_WORLD_H) {
            this.y = ORIG_WORLD_H;
        } else if (this.y < 0) {
            this.y = 0;
        }
    };

    this.applyBasicPhysics = function (useGravity = true) {

        if (useGravity) { this.velocity.y += 0.45; }

        this.x = Math.round(this.x + this.velocity.x);
        this.y = Math.round(this.y + this.velocity.y);

        this.velocity.x *= 0.85;
        this.velocity.y *= 0.85;


        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;
    }

    this.applyKnockupPhysics = function () {

        this.velocity.y += 0.45;

        this.x = Math.round(this.x + this.velocity.x);
        this.y = Math.round(this.y + this.velocity.y);

        this.velocity.x *= 0.55;
        this.velocity.y *= 0.55;

        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;
    }

    this.checkForHits = function (otherChar) {

        if (this.hitThisFrame) { return; } //avoid multi-hits (or maybe we don't want to?)
        hit = otherChar.getHitboxes();
        hurt = this.getHurtboxes();

        // This double loop is not as costly as it may seem, as there is no way we'll have more than 3 hitboxes/hurtboxes on a given character
        for (var i = 0, l = hurt.length; i < l; i++) {
            for (var j = 0, k = hit.length; j < k; j++) {
                if (hurt[i].intersects(hit[j])) {
                    this.gotHit(otherChar); //this method will go get the information and handle the hit
                    break; //break...the game?
                }
            }
        }
    };

    this.gotHit = function (otherChar) {

        //console.log("hit");

        // a special effect where we pause the game for a very short amount of time when we get hit
        //impactPauseFramesRemaining = IMPACT_PAUSE_FRAMES;
        pauseNextFrame = true;

        let myState = this.actionMachine.getCurrentState();
        let attackerState = otherChar.actionMachine.getCurrentState();

        if (attackerState.attackDamage) {
            this.stats.characterHasBeenHitSoCalculateNewHP(0, attackerState.attackDamage);
            this.hitThisFrame = true;
            if (myState.onHit) { myState.onHit(); }

            //handle death
            if (this.stats.getNewHP() <= 0) {
                this.die();
            }
        }
        if (attackerState.knockup && this.canBeKnockedUp) {
            this.knockupThisFrame = true;
        }
        if (attackerState.sliceProperty) {
            if (this.grounded) { return; }
            if (attackerState.lockedOn === false && this.lockedOnto === false) {
                attackerState.lockOn(this);
                this.lockedOnto = true;
            }
        }

    }

    this.die = function () {
        this.alive = false;
        if (Array.isArray(this.explosionSequence)) {
            for (var i = 0, l = this.explosionSequence.length; i < l; i++) {
                new ParticleEmitter(this.x, this.y, this.explosionSequence[i]);
            }
        } else {
            new ParticleEmitter(this.x, this.y, this.explosionSequence);
        }
    }

    this.getHurtboxes = function () {
        return this.getAnimation().getHurtboxes();
    }

    this.getHitboxes = function () {
        return this.getAnimation().getHitboxes();
    }

    this.getAnimation = function () {
        return this.actionMachine.getAnimation();
    }

    this.getCurrentHP = function () {
        return this.stats.getNewHP();
    }

    this.getMaxHP = function () {
        return this.stats.getModifiedHP();
    }

    this.initMachine = function (allStates) {

        this.actionMachine = new StateMachine(allStates.initial); // state machine of the current move being used
    }

    this.initAI = function (allStates) {
        this.AIModule = new AIModule (this, allStates);
    }
}




// Characters include both player and enemies. No inheritance between the two as of now
function drawAllCharacters() {
    //loop from the end to draw player on top
    for (var i = characters.length - 1; i >= 0; i--) {
        characters[i].draw();
    }
    for (var i = characters.length - 1; i >= 0; i--) {
        characters[i].drawUI();
    }
}

function updateAllCharacters() {


    // Update all anims. Remember that anims are not just visuals, they influence colliders and behaviours, hence why they are updated first
    for (var i = 0, l = characters.length; i < l; i++) {
        characters[i].actionMachine.updateAnimation(); //state changes are handled based on animation durations, so we update anims first
    }

    
    // Update all AI. We can receive new states that we will give directly to the action machine
    for (var i = 0, l = characters.length; i < l; i++) {

        if (characters[i].AIModule && characters[i].actionMachine.getCurrentState().canThinkDuring){

            let newState = characters[i].AIModule.update();
            if (newState) {
                characters[i].actionMachine.handleReceivedState(newState);
            }
        }
    }


    // Update all state machines
    for (var i = 0, l = characters.length; i < l; i++) {
        characters[i].actionMachine.update();
    }


    // Ground checks
    for (var i = 0, l = characters.length; i < l; i++) {
        characters[i].groundCheck();
    }

    // Bounds checks
    for (var i = 0, l = characters.length; i < l; i++) {
        characters[i].boundsCheck();
    }

    // Check for hits on hitbox-hurtbox
    for (var i = 0, l = characters.length; i < l; i++) {
        characters[i].hitThisFrame = false;
        characters[i].knockupThisFrame = false;
        //this loop implies we can get hit by multiple attacks on a single frame
        for (var j = 0, l; j < l; j++) {
            if (i == j) { continue; } // to avoid hitting oneself
            characters[i].checkForHits(characters[j]);
        }
    }

    // Remove dead characters
    for (var i = characters.length - 1, l = 0; i >= l; i--) {
        if (characters[i].alive === false) {
            characters.splice(i, 1); //linear array for removal is O(N), might change if we have many enemies
        }
    }

}