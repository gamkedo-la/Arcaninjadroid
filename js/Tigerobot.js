
// Tigerobot definition
function Tigerobot(x, y) {

    var char = new Character(x, y);

    char.idleAnim = new Animation(char, Images.getImage("tigerobotIdle"), tigerobotIdleData, { loop: true });
    char.jumpAnim = new Animation(char, Images.getImage("tigerobotJump"), tigerobotJumpData, { loop: true });
    char.walkAnim = new Animation(char, Images.getImage("tigerobotWalk"), tigerobotWalkData, { loop: true });
    char.punchAnim = new Animation(char, Images.getImage("tigerobotAttack"), tigerobotAttackData);
    char.crouchAnim = new Animation(char, Images.getImage("tigerobotCrouch"), tigerobotCrouchData, { loop: true });
    char.stunnedAnim = new Animation(char, Images.getImage("tigerobotStunned"), tigerobotStunnedData, { loop: true });
    char.knockedUpAnim = new Animation(char, Images.getImage("tigerobotStunned"), tigerobotKnockedUpData, { loop: true });

    char.walkSpeed = 1;
    char.slicesNeeded = 5;

    var states = new EnemyStates(char);

    char.initMachine(states);
    char.initAI(states);
    char.jumpAttack = true;
    //char.trail = new WooshTrail("wooshTrailKangarobot");

    char.hitSfx = kangarobotHitSfx;

    var enemyXP = new XPclass();
    var enemyStats = new StatsClass(enemyXP.getCurrentLVL(), 1.0, 1.0, 1.0);
    enemyStats.setStats();

    return char;
}

// Demo until we have a level format with spawn points etc.
//var tigerobot = new Kangarobot(200, 60);
//var kangarobot2 = new Kangarobot(50, 60);
//var kangarobot3 = new Kangarobot(150, 60);
//var kangarobot4 = new Kangarobot(100, 60);
//kangarobot.flipped = true;