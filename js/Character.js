characters = [];

// Base Character class, from which both player and enemy "inherit" from. 
// Characters currently musn't be created directly; instead, use another constructor on top (see Player.js)
function Character(x, y) {
    characters.push(this);

    const JIGGLE_WHEN_HIT = true; // visual effect only, does not touch simulation position
    const GOTHIT_JIGGLE_FRAMECOUNT = 16; // how many frames to jiggle for when we get hit

    this.x = x;
    this.y = y;
    this.velocity = { x: 0, y: 0 };

    this.walkSpeed = 1.75;
    this.jumpVelocity = 10; //initial y velocity when jumping
    this.slicesNeeded = 2;

    this.feetCollider = new RectCollider(this, 20, 0.2, { offsetY: 12 });

    this.grounded = false;
    this.canDash = true; //can the player do an air dash? (resets when touching ground)
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

    this.hitSfx = punch_HardSfx; //assigned at character creation

    const HP_FLASH_PERCENT = 0.3; // when below this ratio, the health bar flashes
    const HP_FRAMES_PER_FLASH = 10;
    var hpFlashFrameCounter = 0;

    this.draw = function () {

        if (!this.getAnimation()) {
            return;
        }

        if (this.trail) { this.trail.draw(this.x, this.y); }

        if (JIGGLE_WHEN_HIT) {
            canvasContext.save();
            // makes the character sprite shake after getting hit
            // without affecting the x,y position for gameplay simulation
            this.jiggle();
        }

        // "dizzy stars" above their head when vulnerable to knockup
        if (this.canBeKnockedUp) {
            //console.log('spawning dizzy stars: canBeKnockedUp!');
            var starz = createParticleEmitter(this.x, this.y - 10, dizzyParticlesConfig);
        }

        this.getAnimation().draw();

        if (JIGGLE_WHEN_HIT) {
            canvasContext.restore();
        }

        //this.feetCollider.draw();
        if (debug) { this.getAnimation().drawColliders(); }
    }

    //Draws the good ol' red health bar
    this.drawUI = function () {
        let hpRatio = this.stats.getNewHP() / this.stats.getModifiedHP();
        colorRect(this.x - 8, this.y - 16 - 5, 16, 2, "rgba(100,0,0,1)"); //background dark red full size bar
        colorRect(this.x - 8, this.y - 16 - 5, Math.round(16 * (hpRatio)), 2, "red"); //change for values to dynamically adapt to sprite?
        if (hpRatio < HP_FLASH_PERCENT) {
            hpFlashFrameCounter++;
            if ((hpFlashFrameCounter % HP_FRAMES_PER_FLASH) > (HP_FRAMES_PER_FLASH / 2)) {
                colorRect(this.x - 8, this.y - 16 - 5, 16, 2, "rgba(255,255,255,0.15)"); // lighten the healthbar
            }
        }
    }

    this.groundCheck = function () {

        for (var i = 0, l = terrain.length; i < l; i++) {
            if (this.feetCollider.intersects(terrain[i].collider)) {
                this.grounded = true;
                this.canDash = true;
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

        if (!this.getAnimation() || !otherChar.getAnimation()) { return; }
        if (this.hitThisFrame) { return; } //avoid hits from different opponents
        hit = otherChar.getHitboxes();
        hurt = this.getHurtboxes();

        // This double loop is not as costly as it may seem, as there is no way we'll have more than 3 hitboxes/hurtboxes on a given character
        for (var i = 0, l = hurt.length; i < l; i++) {
            for (var j = 0, k = hit.length; j < k; j++) {
                if (hurt[i].intersects(hit[j])) {
                    if (otherChar.actionMachine) {
                        this.gotHit(otherChar);
                    } else {
                        this.gotHitArcane(otherChar);
                        
                    } //this method will go get the information and handle the hit
                    break; //break...the game?
                }
            }
            if (this.hitThisFrame) {
                break; //avoid multi-hits from the same opponent
            }
        }
    };

    // a visual effect that temporarily shakes something in reaction to an impact
    // NOTE: this function needs a canvasContext.save() and canvasContext.restore() around it
    var jigglesPending = 0;

    this.jiggle = function () { // an update function

        var jiggleSpeedX = 3; // larger values make the wobble slower
        var jiggleSpeedY = 1;

        var jiggleSizeX = 6; // wobble range in pixels
        var jiggleSizeY = 6;

        var jiggleX = 0;
        var jiggleY = 0;

        if (jigglesPending > 0) {
            jiggleX = Math.sin(jigglesPending / jiggleSpeedX) / Math.PI * jiggleSizeX;
            jiggleY = -1 * Math.abs(Math.sin(jigglesPending / jiggleSpeedY) / Math.PI * jiggleSizeY);
            //console.log(jigglesPending + ' jiggles ' + jiggleX.toFixed(1) + ',' + jiggleY.toFixed(1));
            jigglesPending--;
        } else {
            jiggleX = 0;
            jiggleY = 0;
        }

        canvasContext.translate(jiggleX, jiggleY); // draw the next sprite offset from true world position
    }

    this.gotHit = function (otherChar) {

        let myState = this.actionMachine.getCurrentState();
        let attackerState = otherChar.actionMachine.getCurrentState();

        if (attackerState.knockup && this.canBeKnockedUp) {
            this.knockupThisFrame = true;
            if (attackerState.onHit) { attackerState.onHit(); }
        }

        if (attackerState.sliceProperty) {
            if (this.grounded) { return; }
            if (attackerState.lockedOn === false && this.lockedOnto === false) {
                attackerState.lockOn(this);
                this.lockedOnto = true;
            }
        }
        
        if (this.enemySpawnAnim && this.canBeKnockedUp) {return;}

        if (attackerState.attackDamage) {

            //ignore any "hit" that deals no damage
            if (attackerState.attackDamage === 0) {
                return;
            }
            createParticleEmitter(this.x, this.y - 10, gotHitParticlesConfig);
            this.hitSfx.play();

            // a special effect added at draw time only - fake "bounce" jiggle state when hit
            if (JIGGLE_WHEN_HIT) jigglesPending = GOTHIT_JIGGLE_FRAMECOUNT;

            // a special effect where we pause the game for a very short amount of time when we get hit
            //impactPauseFramesRemaining = IMPACT_PAUSE_FRAMES;
            pauseNextFrame = true;

            if (this != player) { // an enemy got hit
                player.stats.addArcanePoints(POINTS_PER_HIT);
                //registerHitForCombo(); // 2x 3x 4x etc
            }

            if (!(tutorial.active && NO_DAMAGE_DURING_TUTORIAL)) { // nothing takes damage during the tutorial
                this.stats.characterHasBeenHitSoCalculateNewHP(0, attackerState.attackDamage);
            } else {
                console.log("Tutorial is active: no damage taken.");
            }

            this.hitThisFrame = true;
            if (myState.onHit) { myState.onHit(); }
            if (attackerState.onHit) { attackerState.onHit(); }

            //handle death
            if (this.stats.getNewHP() <= 0) {
                this.die();
            }
        }
    }

    this.gotHitArcane = function (arcaneShot) {

        if (this.enemySpawnAnim && this.canBeKnockedUp) {return;}

        let myState = this.actionMachine.getCurrentState();

        createParticleEmitter (this.x, this.y, robotExplosionParticlesConfig1);
        // a special effect added at draw time only - fake "bounce" jiggle state when hit
        if (JIGGLE_WHEN_HIT) jigglesPending = GOTHIT_JIGGLE_FRAMECOUNT;

        this.stats.characterHasBeenHitSoCalculateNewHP(0, arcaneShot.attackDamage);
        this.hitThisFrame = true;

        if (myState.onHit) { myState.onHit(); }
        //remove shot here?

        //handle death
        if (this.stats.getNewHP() <= 0) {
            this.die();
        }
    }

    this.die = function () {

        explosionSFX.play();

        if (this != player) { // an enemy was defeated
            //player.stats.arcaneMeter += POINTS_PER_KILL;
            player.stats.score += 1;
        }

        this.alive = false;
        if (this != player) GameStates.inGameState.currentLevel._removeOneEnemy(); //hard references FTW (use Unity if you don't like it ;) 

        if (Array.isArray(this.explosionSequence)) {
            for (var i = 0, l = this.explosionSequence.length; i < l; i++) {
                createParticleEmitter(this.x, this.y, this.explosionSequence[i]);
            }
        } else {
            createParticleEmitter(this.x, this.y, this.explosionSequence);
        }

        // Game over!!! :O
        if (this === player) {
            GameStateMachine.handleReceivedState(GameStates.gameOverState);
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
        this.AIModule = new AIModule(this, allStates);
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

        if (characters[i].AIModule && characters[i].actionMachine.getCurrentState().canThinkDuring) {

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

        for (var j = arcaneShots.length - 1; j >= 0; j--) {
            characters[i].checkForHits(arcaneShots[j]);
        }
        if (characters[i] === player) { continue; }
        //only check for player/enemy contact, no longer enemy/enemy
        characters[i].checkForHits(player);
        player.checkForHits(characters[i]);


        /*
        for (var j = 0, l; j < l; j++) {
            if (i == j) { continue; } // to avoid hitting oneself
            characters[i].checkForHits(characters[j]);
        }*/
    }

    // Remove dead characters
    for (var i = characters.length - 1, l = 0; i >= l; i--) {
        if (characters[i].alive === false) {
            characters.splice(i, 1); //linear array for removal is O(N), might change if we have many enemies
        }
    }

}

function killAllEnemies() {

    for (var i = 0, l = characters.length; i < l; i++) {
        if (characters[i] != player) {
            characters[i].die();
        }
    }

}