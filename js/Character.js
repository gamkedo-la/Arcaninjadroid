
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

    this.feetCollider = new RectCollider(this, 20, 0.2, { offsetY: 12 });

    this.grounded = false;
    this.movable = true; //can be affected (pushed) by collisions
    this.flipped = false; //default direction is right

    let xpModule = new XPclass();
    let stats = new StatsClass(xpModule.getCurrentLVL(), 1.0, 1.0, 1.0);
    stats.setStats();

    this.hitThisFrame = false;
    this.knockupThisFrame = false;

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
        let hpRatio = stats.getNewHP() / stats.getModifiedHP();
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
    };

    this.applyBasicPhysics = function () {

        this.velocity.y += 0.45;

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

        let attackerState = otherChar.actionMachine.getCurrentState();

        if (attackerState.attackDamage) {
            stats.characterHasBeenHitSoCalculateNewHP(0, attackerState.attackDamage);
            this.hitThisFrame = true;

            //handle death
            if (stats.getNewHP() <= 0) {
                this.alive = false;
                //characters.splice(1,characters.indexOf(this));
                for (var i = 0, l = this.explosionSequence.length; i < l; i++) {
                    new ParticleEmitter(this.x, this.y, this.explosionSequence[i]);
                }
            }
        }
        if (attackerState.knockup) {
            this.knockupThisFrame = true;
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

    this.initMachine = function (allStates) {

        var states = allStates;
        this.actionMachine = new StateMachine(states.initial); // state machine of the current move being used
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
    for (var i = characters.length-1, l = 0; i >= l; i--) {
        if (characters[i].alive === false) {
            characters.splice(1,i); //linear array for removal is O(N), might change if we have many enemies
        }
    }

}