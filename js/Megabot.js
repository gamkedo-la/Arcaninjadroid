
// Frogbot definition
function Megabot(x, y) {

    var char = new Character(x, y);

    char.idleAnim = new Animation(char, Images.getImage("megabot"), megabotIdleData, { loop: true });
    char.jumpAnim = new Animation(char, Images.getImage("megabotJump"), megabotJumpData, { loop: true });
    char.walkAnim = new Animation(char, Images.getImage("megabot"), megabotIdleData, { loop: true });
    char.crouchAnim = new Animation(char, Images.getImage("megabot"), megabotIdleData, { loop: true });
    char.stunnedAnim = new Animation(char, Images.getImage("megabotStunned"), megabotStunnedData, { loop: true });
    char.knockedUpAnim = new Animation(char, Images.getImage("megabotStunned"), megabotIdleData, { loop: true });
    
    char.punchAnim = new Animation(char, Images.getImage("megabotPunch"), megabotPunchData, { });
    char.enemySpawnAnim = new Animation(char, Images.getImage("megabotSpawning"), megabotSpawningData, { loop:true });
    char.openMouthAnim = new Animation(char, Images.getImage("megabotOpenMouth"), megabotOpenMouthData, { });
    
    char.walkSpeed = 2;
    char.slicesNeeded = 10;
    char.jumpVelocity = 15;

    var states = new MegabotStates(char);
    states.walkState = null; //end of project hack omegalul

    char.initMachine(states);
    char.AIModule = new MegabotAI(char, states);
    //char.SDAttack = true; //self-destructs after attack end
    //char.trail = new WooshTrail("wooshTrailKangarobot");

    char.hitSfx = frogbotCroakSfx;
    char.attackSfx = megabotPunch;

    char.jumpVelocity = 15;
    //char.walkSpeed = 2;

    var enemyXP = new XPclass();
    char.stats = new StatsClass(enemyXP.getCurrentLVL(), 3, 1.0, 1.0);
    char.stats.setStats();

    //char.stats.characterHasBeenHitSoCalculateNewHP(0,5*char.stats.getMaxHP()/8)

    return char;
    
}

// hacky but has the best ROI
function MegabotStates(parent) {

    this.idleState = new IdleEnemyState(parent, this);
    this.walkState = new WalkEnemyState(parent, this);
    this.crouchState = new CrouchEnemyState(parent, this);
    this.stunnedState = new StunnedEnemyState(parent, this);
    this.jumpState = new JumpEnemyState(parent, this);
    this.knockupState = new KnockupEnemyState(parent, this);

    this.punchState = new PunchEnemyState(parent, this);
    this.fireBreathState = new FireBreathState(parent, this);
    this.enemySpawnState = new EnemySpawnState(parent, this);

    this.initial = this.jumpState;
}

//////////////////    Custom states for Megabot    //////////////////////////

function FireBreathState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    //this.attackDamage = 50;
    let fired = false;

    this.animation = parent.openMouthAnim;

    this.update = function () {

        parent.applyBasicPhysics();
        if (parent.hitThisFrame) { return states.stunnedState; } //hacky, but saves us a coding rabbit hole. Stick this everywhere that needs to be able to receive hits

        if (this.animation.isActive === false) {
            return states.idleState;
        } else if (!fired && this.animation.getCurrentFrameNumber() === 6) {
            let fireShot = new ArcaneShot (parent.x,parent.y, {flipped: parent.flipped, emitterTrail1:fireBreathTrailConfig1, emitterTrail2:fireBreathTrailConfig2, sfx:megabotFire});
            fireShot.animation = new Animation(fireShot, Images.getImage("fireBreath"), arcaneBigData, { holdLastFrame : true });

            fired = true;
        }
        
    }

    this.handleInput = function () {

    }

    this.enter = function () {

        fired = false;

        parent.flipped = (Math.sign(getXDistanceBetween(parent,player)) === 1);
        

        
    }
    this.exit = function () {
    }
}
FireBreathState.prototype = baseState;

/////////////////////////////////////////////////////////
function EnemySpawnState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;
    
    let duration = 4; //seconds
    let timer = 0;
    let numEnemies = 3;
    let step = duration/numEnemies;
    let remaining = numEnemies;

    this.badHit = false;
    this.hitArmor = true;

    this.animation = parent.enemySpawnAnim;

    this.update = function () {

        parent.applyBasicPhysics();

        if (parent.hitThisFrame) {
            if (parent.enemySpawnAnim) {
                if (!this.badHit) {
                    thudSFX.play();
                    console.log("play")
                    this.badHit = true;
                }
                //parent.stats.characterHasBeenHitSoCalculateNewHP(0,-50);
                return;
            }
            return states.stunnedState;
        }

        timer += dt;
        if (timer > step) {

            timer = 0;
            remaining--; 
            megabotSpawn(parent.x);          

            if (remaining <= 0) { return parent.AIModule.forceThink(); }
            
        }
        
    }

    this.handleInput = function () {

    }

    this.enter = function () {

        remaining = numEnemies;
        megabotLaugh.play();
        //parent.flipped = (Math.sign(getXDistanceBetween(parent,player)) === 1);
        this.badHit = false;
        
    }
    this.exit = function () {
        megabotLaugh.stop();
    }
}
EnemySpawnState.prototype = baseState;


function megabotSpawn(x) {

    GameStates.inGameState.currentLevel.enemiesCurrentlyOnscreen++;
    //this.enemiesLeftToSpawn--;

    let rand = Math.floor(Math.random() * allEnemies.length);

    new allEnemies[rand](x, 120);

}