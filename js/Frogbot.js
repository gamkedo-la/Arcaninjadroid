
// Frogbot definition
function Frogbot(x, y) {

    var char = new Character(x, y);

    char.idleAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });
    char.jumpAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });
    char.walkAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });
    char.punchAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });
    char.crouchAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });
    char.stunnedAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });
    char.knockedUpAnim = new Animation(char, Images.getImage("frogbot_v2_idle"), frogbotIdleData, { loop: true });

    char.walkSpeed = 1;
    char.slicesNeeded = 3;

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
