
// Don't ask why, it just has to be done in this order


function Player() {

    var char = new Character(100, 75);

    var states = new PlayerStates(char); 
    char.initMachine(states);

    char.trail = new WooshTrail();

    var playerXP = new XPclass();
    var playerStats = new StatsClass(playerXP.getCurrentLVL(), 1.0,1.0,1.0);
    playerStats.setStats();

    return char;
}

// Kangarobot definition
function Kangarobot (x,y) {

    var char = new Character(x,y);

    char.idleAnim = new Animation(char,Images.getImage("kangarobotIdle"),kangarobotIdleData, {loop : true});
    char.jumpAnim = new Animation(char,Images.getImage("kangarobotJump"),kangarobotJumpData, {loop : true});
    char.walkAnim = new Animation(char,Images.getImage("kangarobotWalk"),kangarobotWalkData, {loop : true});
    char.punchAnim = new Animation(char,Images.getImage("kangarobotPunch"),kangarobotPunchData);
    char.uppercutAnim = new Animation(char,Images.getImage("kangarobotUppercut"),kangarobotUppercutData);
    char.crouchAnim = new Animation(char,Images.getImage("kangarobotCrouch"),kangarobotCrouchData, {loop : true});
    char.stunnedAnim = new Animation(char,Images.getImage("kangarobotStunned"),kangarobotStunnedData, {loop : true});

    char.walkSpeed = 0.75;

    var states = new EnemyStates(char);
    
    char.initMachine(states);

    var enemyXP = new XPclass();
    var enemyStats = new StatsClass(enemyXP.getCurrentLVL(), 1.0,1.0,1.0);
    enemyStats.setStats();

    return char;
}

var player = new Player();
var kangarobot = new Kangarobot(150,60);
var kangarobot2 = new Kangarobot(50,60);
kangarobot.flipped = true;


