
characters = [];
function Player () {

    characters.push(this);

    this.x = 100;
    this.y = 75;
    this.velocity = {x:0, y:0};
    this.movespeed = 2;
    this.collider = new RectCollider(this,20,28);
    this.movable = true; //can be affected by collisions

    this.actionMachine = new StateMachine(new IdleAndroidState()); // state machine for the current fighting style

    this.draw = function () {
        this.actionMachine.drawCurrentState(this.x,this.y);
        //this.collider.draw();
    }

    this.onCollision = function () {
        console.log("I touched something");
    }
}








player = new Player ();



// Characters include both player and enemies. No inheritance between the two as of now
function drawAllCharacters() {
    for (var i = 0, l = characters.length; i<l;i++) {
        characters[i].draw();
    }
}





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