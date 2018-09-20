// tutorial for arcaninjadroid by mcfunkypants

var tutorial = {

    const MESSAGE_TIMESPAN = 5.0; // seconds messages are displayed
    
    const messages = [
        "Welcome to ArcaNinjaDroid!",
        "Use the arrow keys, WASD, or the gamepad to move.",
        "Press SPACE or gamepad A to jump.",
        "Press Z or gamepad B to punch.",
        "Press X or gamepad X to kick.",
        "Hold DOWN to crouch.",
        "While crouching, attacks are UPPERCUTS.",
        "When an enemy is stunned, UPPERCUT to launch them!",
        "When an enemy is in the air, jump and attack!",
        "Good luck! Save the kitties!"
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
        console.log('Updating tutorial...');
        var now = performance.now();
        if (now >= this.nextTimestamp) {
            console.log('Time for the next message...');
            this.stage++;
            this.nextTimestamp = now + MESSAGE_TIMESPAN;
            if (this.stage >= messages.length) {
                console.log('Reached the end of the tutorial!');
                this.end();
            }
            else {
                console.log('Tutorial message '+this.stage+': ' + messages[this.stage]); 
            }
        }
    }

    this.draw = function() {
        if (!this.active) return;
        console.log('Drawing tutorial...');
    }
    
    this.end = function() {
        console.log('Ending tutorial...');
        this.stage = 999;
        this.nextTimestamp = 999999999999999;
        this.active = false;
    }

};