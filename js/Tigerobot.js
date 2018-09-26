
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

    char.walkSpeed = 2;
    char.slicesNeeded = 4;

    var states = new EnemyStates(char);

    char.initMachine(states);
    char.initAI(states);
    char.jumpAttack = true;
    //char.trail = new WooshTrail("wooshTrailKangarobot");

    char.hitSfx = tigerobotRoarSfx;

    var enemyXP = new XPclass();
    var enemyStats = new StatsClass(enemyXP.getCurrentLVL(), 1.0, 1.0, 1.0);
    enemyStats.setStats();

    return char;
}
