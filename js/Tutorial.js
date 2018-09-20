// tutorial for arcaninjadroid by mcfunkypants

function TutorialClass() {

    const MESSAGE_TIMESPAN = 5000; // ms messages are displayed
    const MESSAGE_DELAY = 1000; // space between the messages
    
    const messages = [
        {txt:"Welcome to ArcaNinjaDroid!",x:100,y:200},
        {txt:"Use the arrow keys, WASD, or the gamepad to move.",x:100,y:200},
        {txt:"Press SPACE or gamepad A to jump.",x:100,y:200},
        {txt:"Press Z or gamepad B to punch.",x:100,y:200},
        {txt:"Press X or gamepad X to kick.",x:100,y:200},
        {txt:"Hold DOWN to crouch.",x:100,y:200},
        {txt:"While crouching, attacks are UPPERCUTS.",x:100,y:200},
        {txt:"When an enemy is stunned, UPPERCUT to launch them!",x:100,y:200},
        {txt:"When an enemy is in the air, jump and attack!",x:100,y:200},
        {txt:"Good luck! Save the kitties!",x:100,y:200}
    ];

    this.active = false; // can turn off
    this.stage = 0; // which message are we currently at
    this.nextTimestamp = 0; // when next msg should appear

    this.start = function() {
        console.log('Starting tutorial...');
        this.active = true;
        this.stage = -1;
        this.nextTimestamp = performance.now() + MESSAGE_TIMESPAN;
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
                console.log('Tutorial message '+this.stage+': ' + messages[this.stage].txt); 
                this.msgStart = now;
                this.msgEnd = now + MESSAGE_TIMESPAN;
            }
        }
    }

    this.draw = function() {
        if (!this.active) return;
        if (!messages[this.stage]) return;
        //console.log('Drawing tutorial...');
        //npcWordBubble(messages[this.stage].txt,messages[this.stage].x,messages[this.stage].y,this.msgStart,this.msgEnd);
    }
    
    this.end = function() {
        console.log('Ending tutorial...');
        this.stage = -1;
        this.nextTimestamp = 0;
        this.active = false;
    }

};