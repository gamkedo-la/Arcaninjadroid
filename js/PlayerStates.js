
////    All states (ie slick moves and abilities) of the player will be created here. Depending on size, might be split into separate files (for Arcane, Ninja and Android perhaps)

/////    Good format:
// function MyState (parent, relatedStates) {...}
// MyState.prototype = baseState;
// CRUCIAL Add to PlayerStates at the end of the file, just like shown
// Give it to the player and try it out! :D

var baseState = new State(); //give a reference to this state when declaring your custom state's prototype (see above, or below...)


////       Basic, idle Android state        ////

function IdleAndroidState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    this.animation = new Animation(parent, Images.getImage("arcaninjadroid"), playerIdleData, { loop: true });

    this.update = function () {

        parent.x += parent.velocity.x;
        parent.y += parent.velocity.y;

        //apply some gravity. Fun fact: often times our super awesome main character will flat out ignore gravity,
        //so I feel it's ok to add it (perhaps multiple times) in the update functions of different states
        parent.velocity.y += 0.75;

        parent.velocity.x *= 0.85;
        parent.velocity.y *= 0.85;
        if (Math.abs(parent.velocity.x) < 0.1) parent.velocity.x = 0;
        if (Math.abs(parent.velocity.y) < 0.1) parent.velocity.y = 0;

    }

    this.handleInput = function () {

        if (Input.getLeftClick() || Input.getKey("space")) {
            if (Input.getMouseY() / 4 < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                return states.punchingState;
            }
        }

        // Basic movement
        if (Input.getKey("w")) {
            return states.jumpState;
        } else if (Input.getKey("s")) {
            return states.crouchState;
        }

        if (Input.getKey("a")) {
            parent.flipped = true;
            parent.velocity.x = -parent.walkSpeed;
        }
        else if (Input.getKey("d")) {
            parent.flipped = false;
            parent.velocity.x = parent.walkSpeed;
        } else { parent.velocity.x = 0; }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
IdleAndroidState.prototype = baseState;



///////////////////       Android crouch state       ////////////////////////

function CrouchState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    //this.animation = new Animation(crouchSheet);
    this.animation = new Animation(parent, Images.getImage("PH_Android_Crouch"), androidCrouchData);

    this.update = function () {
    }

    this.handleInput = function () {

        if (Input.getKey("s") === false) {
            return "previous";
        }

        if (Input.getLeftClick()) {
            if (Input.getMouseY() / 4 < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                return states.uppercutState;
            }
        }
    }

    this.enter = function () {
    }
    this.exit = function () {
    }
}
CrouchState.prototype = baseState;




///////////////////       Android jump state      ////////////////////////

function JumpState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    //this.animation = new Animation(jumpSheet,{loop:true});
    this.animation = new Animation(parent, Images.getImage("arcaninjadroid"), playerIdleData); //placeholder
    this.fastfall = false;

    this.update = function () {
        if (this.fastfall === false) {
            parent.velocity.y += 0.45;
        } else {
            parent.velocity.y += 2;
        }
        parent.x += parent.velocity.x;
        parent.y += parent.velocity.y;

        parent.velocity.x *= 0.85;
        parent.velocity.y *= 0.85;


        if (Math.abs(parent.velocity.x) < 0.1) parent.velocity.x = 0;
        if (Math.abs(parent.velocity.y) < 0.1) parent.velocity.y = 0;


        if (parent.grounded) {
            //console.log("touch ground");
            return states.idleState;
        }
    }

    this.handleInput = function () {

        // Dampen the apex of the jump (thanks Matt Thorson!)
        if (Input.getKey("w")) {
            if (Math.abs(parent.velocity.y) <= 1.6) {
                //console.log("damp");
                parent.velocity.y -= 0.2;
            }
        }

        if (Input.getKeyDown("s")) {
            this.fastfall = true;
            new ParticleEmitter(parent.x - 10, parent.y - 15, fastFallParticlesConfig); //spawn fast fall blinking particles (visual only)
        }

        if (Input.getKey("a")) {
            parent.velocity.x = -parent.walkSpeed;
        } else if (Input.getKey("d")) {
            parent.velocity.x = parent.walkSpeed;
        }

        if (Input.getLeftClick()) {
            if (Input.getMouseY() / 4 < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                // do something cool here :) a dive kick maybe? 
            }
        }


    }

    this.enter = function () {
        //console.log("enter");
        this.fastfall = false;
        parent.velocity.y = -parent.jumpVelocity;
        parent.grounded = false;
        parent.y -= 10;
    }
    this.exit = function () {
    }
}
JumpState.prototype = baseState;



////////////////////       Android regular punch state      /////////////////////////

function PunchingState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    //this.animation = new Animation(punchingSheet, { fps: 16 });
    this.animation = new Animation(parent, Images.getImage("PH_Android_Punch"), androidPunchData);

    this.update = function () {
        // not applying gravity here is a feature, not an error
    }

    this.handleInput = function () {

        if (this.animation.isActive === false) {
            return "previous";
        }
        if (Input.getLeftClick()) {
            if (Input.getMouseY() / 4 < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                // do something cool here? :) 
            }
        }
    }

    this.enter = function () {
    }

    this.exit = function () {
    }
};
PunchingState.prototype = baseState;


///////////////     Android uppercut (colloquially known as the "Sho-ryu-ken")      ///////////////

function UppercutState(parent, relatedStates) {

    var parent = parent;
    var states = relatedStates;

    //this.animation = new Animation(uppercutSheet);
    this.animation = new Animation(parent, Images.getImage("PH_Android_Uppercut"), androidUppercutData, { loop: false, holdLastFrame: true });


    this.update = function () {

        if (parent.grounded) {
            return states.idleState;
        }

        parent.velocity.y += 0.45;

        parent.x += parent.velocity.x;
        parent.y += parent.velocity.y;

        parent.velocity.x *= 0.85;
        parent.velocity.y *= 0.85;
        if (Math.abs(parent.velocity.x) < 0.1) parent.velocity.x = 0;
        if (Math.abs(parent.velocity.y) < 0.1) parent.velocity.y = 0;
    }

    this.handleInput = function () {
        if (Input.getLeftClick()) {
            if (Input.getMouseY() / 4 < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                // do something cool here :) ?
            }
        }
    }

    this.enter = function () {

        parent.velocity.y = -parent.jumpVelocity;
        parent.grounded = false;
        parent.y -= 10;

        new ParticleEmitter(parent.x + 10, parent.y - 25, fastFallParticlesConfig);
    }

    this.exit = function () {
    }

};
UppercutState.prototype = baseState;


/////////////////      Ninja slice state (for demo)      ///////////////////
function SliceState(parent, relatedStates) {
    var parent = parent;
    var states = relatedStates;

    var destination = { x: 0, y: 0 };
    var theta = 0;
    var speed = 25;
    var dx = 0;
    var dy = 0;

    //this.animation = new Animation(punchingSheet, { fps: 16 });
    this.animation = new Animation(parent, Images.getImage("PH_Android_Uppercut"), androidUppercutData, { loop: false, holdLastFrame: true });

    this.update = function () {

        parent.x += dx;
        parent.y += dy;

        if ((dx >= 0 && parent.x > destination.x) || (dx < 0 && parent.x < destination.x)) {
            dx = 0;
            parent.x = destination.x;
        }
        if ((dy >= 0 && parent.y > destination.y) || (dy < 0 && parent.y < destination.y)) {
            dy = 0;
            parent.y = destination.y;
        }
    }

    this.handleInput = function () {

        if (parent.grounded) {
            //return states.idleState;
        }
        if (Input.getLeftClick()) {
            if (Input.getMouseY() / 4 < ninjaZoneBeginningY) {
                return states.sliceState;
            } else {
                return states.jumpState;
            }
        }
    }

    this.changeDirection = function () {
        destination = {
            x: Input.getMouseX() / 4,
            y: Input.getMouseY() / 4
        };

        var xDiff = destination.x - parent.x;
        var yDiff = destination.y - parent.y;
        if (xDiff === 0) {
            theta = Math.PI / 2;
        } else {
            theta = Math.atan(yDiff / xDiff);
        }
        if (xDiff < 0) {
            if (yDiff < 0) {
                theta = Math.PI + theta;
            } else {
                theta = theta - Math.PI;
            }

        }
        dx = speed * Math.cos(theta);
        dy = speed * Math.sin(theta);
    }

    this.enter = function () {
        this.changeDirection();
    }

    this.exit = function () {
    }
};
SliceState.prototype = baseState;

// parent must be a Character
function PlayerStates(parent) {

    // Might refactor?
    this.idleState = new IdleAndroidState(parent, this);
    this.crouchState = new CrouchState(parent, this);
    this.uppercutState = new UppercutState(parent, this);
    this.punchingState = new PunchingState(parent, this);
    this.jumpState = new JumpState(parent, this);
    this.sliceState = new SliceState(parent, this);

    this.initial = this.idleState;
}

function DummyStates() {

}