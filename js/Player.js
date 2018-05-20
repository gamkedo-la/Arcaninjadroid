var dummyParent = {x:150, y:75, onCollision : function (){}};
var dummyCollider = new RectCollider(dummyParent, 50,50);
function Player () {

    this.x = 100;
    this.y = 75;
    this.velocity = {x:0, y:0};
    this.movespeed = 5;
    this.collider = new RectCollider(this,30,64);

    this.actionMachine = new StateMachine(new IdleAndroidState()); // state machine for the current fighting style

    this.draw = function () {
        this.actionMachine.drawCurrentState(this.x,this.y);
        this.collider.draw();
        dummyCollider.draw();
    }

    this.onCollision = function () {
        console.log("I touched something");
    }
}

punchingSheet = new SpriteSheet(Images.getImage("PH_Android_Punch"), 1,2);
idleSheet = new SpriteSheet(Images.getImage("PH_Android_Idle"), 1,2);

function PunchingState () {

    this.animation = new Animation (punchingSheet, {fps:16});

    this.update = function () {

    }

    this.handleInput = function () {


        if (this.animation.isActive === false) {
            return new IdleAndroidState();
        }
    }

    this.enter = function () {
        //console.log("Started punching");
    }

    this.exit = function () {
        
    }
}
PunchingState.prototype = new State ();


function IdleAndroidState () {

    this.animation = new Animation (idleSheet, {loop : true});

    this.update = function () {

        player.x += player.velocity.x;
        player.y += player.velocity.y;

        player.velocity.x *= 0.85;
        if (Math.abs(player.velocity.x) < 0.1) player.velocity.x = 0;
    }

    this.handleInput = function () {

        if (Input.getLeftClick()) {
            return new PunchingState();
        }

        else if (Input.getKey("d")) {
            player.velocity.x = player.movespeed;
        }
        
        else if (Input.getKey("a")) {
            player.velocity.x = -player.movespeed;
        }
    }

    this.enter = function () {
        //console.log("Started idling");
    }

    this.exit = function () {
        
    }
}
IdleAndroidState.prototype = new State ();

player = new Player ();










///////////////////////////      Not needed????     /////////////////////////////////

function AndroidState () {

    this.update = function () {
        
    }

    this.handleInput = function () {

        if (Input.getLeftClick()) {
            console.log("Clicked in Android");
        }

        if (Input.getKeyDown("space")) {
            return new NinjaState();
        }
    }

    this.enter = function () {
        console.log("Entered Android");
    }

    this.exit = function () {

    }
}
AndroidState.prototype = new State ();

function NinjaState () {

    this.update = function () {
        
    }

    this.handleInput = function () {

        if (Input.getLeftClick()) {
            console.log("Clicked in Ninja");
        }
    }

    this.enter = function () {
        console.log("Entered Ninja");
    }

    this.exit = function () {
        
    }
}
NinjaState.prototype = new State ();



function ArcaneState () {

    this.update = function () {
        
    }

    this.handleInput = function () {

        if (Input.getLeftClick()) {
            console.log("Clicked in Arcane");
        }
    }

    this.enter = function () {
        console.log("Entered Arcane");
    }

    this.exit = function () {
        
    }
}
ArcaneState.prototype = new State ();