// tutorial for arcaninjadroid by mcfunkypants

// if this is true, nothing will take real HP damage while tutorial.active
const NO_DAMAGE_DURING_TUTORIAL = true; // see Character.js near line 235

function TutorialClass() {

    const MESSAGE_TIMESPAN = 1500; // ms messages are displayed
    const MESSAGE_DELAY = 3000; // space between the messages
    const TUTORIAL_START_DELAY = 1000; // time from game begin
    
    const messages = [
        {txt:"Welcome to ArcaNinjaDroid!",y:40},
        {txt:"Arrows, WASD, or gamepad to move.",y:120},
        {txt:"Press SPACE or gamepad A to jump.",y:40},
        {txt:"Press Z or gamepad B to attack.",y:56},
        {txt:"Hold DOWN to crouch.",y:120},
        {txt:"While crouching, attacks are UPPERCUTS.",y:120},
        {txt:"When an enemy is stunned,\nUPPERCUT to launch them!",y:40},
        {txt:"When an enemy is in the air,\njump and attack!",y:40},
        {txt:"Good luck! Save the kitties!",y:120}
    ];

    this.active = false; // can turn off
    this.stage = 0; // which message are we currently at
    this.nextTimestamp = 0; // when next msg should appear

    this.start = function() {
        console.log('Starting tutorial...');
        this.active = true;
        this.stage = -1;
        this.nextTimestamp = performance.now() + TUTORIAL_START_DELAY;
    }

    this.update = function() {
        if (!this.active) return;

        var now = performance.now();
        if (now >= this.nextTimestamp) {
            console.log('Time for the next message! now:'+now.toFixed(2));
            this.stage++;
            this.nextTimestamp = now + MESSAGE_TIMESPAN + MESSAGE_DELAY;
            if (this.stage >= messages.length) {
                console.log('Reached the end of the tutorial!');
                this.end();
            }
            else {
                console.log('Tutorial message '+this.stage+' at '+messages[this.stage].x+','+messages[this.stage].y+': ' + messages[this.stage].txt); 
                this.msgStart = now;
                this.msgEnd = now + MESSAGE_TIMESPAN;
                // if x not specified, center on screen
                if (messages[this.stage].x == undefined) {
                    messages[this.stage].x = Math.round(canvas.width/2);
                }
            }
        }
    }

    this.draw = function() {
        if (!this.active) return;
        if (!messages[this.stage]) return;
        //console.log('Drawing tutorial...');
        npcWordBubble(messages[this.stage].txt,messages[this.stage].x,messages[this.stage].y,this.msgStart,this.msgEnd);
    }
    
    this.end = function() {
        console.log('Ending tutorial...');
        this.stage = -1;
        this.nextTimestamp = 0;
        this.active = false;
    }


};

// referred to in GameState.js and Character.js
var tutorial = new TutorialClass();
