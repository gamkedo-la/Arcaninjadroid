
// Frogbot definition
function Megabot(x, y) {

    var char = new Character(x, y);

    char.idleAnim = new Animation(char, Images.getImage("megabot"), megabotIdleData, { loop: true });
    char.jumpAnim = new Animation(char, Images.getImage("megabotJump"), megabotJumpData, { loop: true });
    char.walkAnim = new Animation(char, Images.getImage("megabot"), megabotIdleData, { loop: true });
    char.punchAnim = new Animation(char, Images.getImage("megabotPunch"), megabotPunchData, { });
    char.crouchAnim = new Animation(char, Images.getImage("megabot"), megabotIdleData, { loop: true });
    char.stunnedAnim = new Animation(char, Images.getImage("megabotStunned"), megabotStunnedData, { loop: true });
    char.knockedUpAnim = new Animation(char, Images.getImage("megabotStunned"), megabotIdleData, { loop: true });

    char.walkSpeed = 2;
    char.slicesNeeded = 10;
    char.jumpVelocity = 15;

    var states = new EnemyStates(char);
    states.walkState = null; //end of project hack omegalul

    char.initMachine(states);
    char.initAI(states);
    //char.SDAttack = true; //self-destructs after attack end
    //char.trail = new WooshTrail("wooshTrailKangarobot");

    char.hitSfx = frogbotCroakSfx;
    char.attackSfx = punch_HardSfx;

    var enemyXP = new XPclass();
    var enemyStats = new StatsClass(enemyXP.getCurrentLVL(), 1.0, 1.0, 1.0);
    enemyStats.setStats();
    //enemyStats

    return char;
    
}


