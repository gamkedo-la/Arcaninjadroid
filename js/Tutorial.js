// tutorial for arcaninjadroid by mcfunkypants

// if this is true, nothing will take real HP damage while tutorial.active
const NO_DAMAGE_DURING_TUTORIAL = true; // see Character.js near line 235

function MessageSequence(messages) {

    this.messageTimespan = 1500; // ms messages are displayed
    this.messageDelay = 1750; // space between the messages
    this.startDelay = 500; // time from game begin


    this.active = false; // can turn off
    this.stage = 0; // which message are we currently at
    this.nextTimestamp = 0; // when next msg should appear

    this.start = function() {
        console.log('Starting message sequence...');
        this.active = true;
        this.stage = -1;
        //this.stage = 8;
        this.nextTimestamp = performance.now() + this.startDelay;
    }

    this.update = function() {
        if (!this.active) return;

        var now = performance.now();
        if (now >= this.nextTimestamp) {
            console.log('Time for the next message! now:'+now.toFixed(2));
            this.stage++;
            this.nextTimestamp = now + this.messageTimespan + this.messageDelay;
            if (this.stage >= messages.length) {
                console.log('Reached the end of the sequence!');
                this.end();
            }
            else {
                console.log('Sequence message '+this.stage+' at '+messages[this.stage].x+','+messages[this.stage].y+': ' + messages[this.stage].txt); 
                this.msgStart = now;
                this.msgEnd = now + this.messageTimespan;
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
    
    this.hurryUp = function() {
        if (!this.active) return;
        if (!messages[this.stage]) return;
        console.log('Hurrying up sequence...');
        this.msgEnd = performance.now(); // skips to end of the line
        this.nextTimestamp = performance.now(); // and past the pause between lines
    }

    this.end = function() {
        console.log('Ending message sequence...');
        this.stage = -1;
        this.nextTimestamp = 0;
        this.active = false;
    }


};

// referred to in GameState.js and Character.js

    
const tutorialMessages = [
    {txt:"Welcome to Arcaninjadroid!",y:40},
    {txt:"Arrows, WASD, or gamepad to move.",y:120},
    {txt:"Press UP or gamepad A to jump.",y:40},
    {txt:"Press Z or gamepad B to attack.",y:56},
    {txt:"Hold DOWN to crouch.",y:120},
    {txt:"While crouching, attacks are UPPERCUTS.",x:130,y:120},
    {txt:"When an enemy is stunned,\nUPPERCUT to launch them!",y:40},
    {txt:"When an enemy is in the air,\njump and attack!",y:40},
    {txt:"Then, press Z + Arrows to slice!",y:40},
    {txt:"Press X for the Arcane spell (costs 50)",x:130,y:40},
    {txt:"Good luck! Save our kitties!",y:120}
];

const area1Messages = [
    {txt:"You've just arrived on the alien planet.",x:130,y:40},
    {txt:"Using your ninja stealth...",y:40},
    {txt:"...you silently roam the forest.",y:50},
    {txt:"Your goal : reach the enemy base.",y:40},
    {txt:"...................",y:50},
    {txt:"But, the enemies knew you were coming!",x:130,y:40},
    {txt:"And they have evil animal robots!!! ",y:40},
    {txt:"Good luck! Save our kitties!",y:70}
];

const area2Messages = [
    {txt:"You've infiltrated the enemy base.",x:130,y:40},
    {txt:"Now, to find where the kitties are held...",x:130,y:50},
    {txt:"While running through the corridors...",y:40},
    {txt:"you hear a croaking sound.",x:130,y:40},
    {txt:"More robots!!!",y:40},
    {txt:"Watch out! They're explosive!",x:130,y:50},
    {txt:"Good luck! Save our kitties!",y:70}
];

const area3Messages = [
    {txt:"Wait... something's not right...",y:40},
    {txt:"The doors are locked; \n you're trapped!!!",y:40},
    {txt:"You hear a voice coming \n through a speaker",x:130,y:40},
    {txt:"Haha! You thought we'd let you grab \n our precious kitties?!?",y:40},
    {txt:"We've been watching \n you this whole time!",x:130,y:50},
    {txt:"Don't worry, your kittens \n are in good hands now.",x:130,y:60},
    {txt:"Though, I couldn't say \n the same for YOU!!!!!!!!",x:135,y:60}
];

const finalLevelMessages = [
    {txt:"Tsss... you're a tough one huh?!",x:130,y:40},
    {txt:"But, sadly, this is the end for you.",x:130,y:40},
    {txt:"Behold! \n Our most powerful invention yet :",x:130,y:40},
    {txt:"MEGABOT",x:125,y:40},
    {txt:"Well, you had a good run.",x:125,y:40},
    {txt:"See you never, \n Arcaninjadroid!",y:30},
];

const endGameMessages = [
    {txt:"And so, Megabot was no more.",x:130,y:40},
    {txt:"All the kitties in this area \n are now free...",x:130,y:40},
    {txt:"...but there are still \n many more to rescue!",x:130,y:40},
    {txt:"Who knows what evil machinations \n you'll encounter next?",x:125,y:40},
    {txt:"The world needs you, Arcaninjadroid!",x:130,y:40},
    {txt:"You must save all our kitties! \n Go, prepare for your next adventure!",x:125,y:40},
];

var tutorial = new MessageSequence(tutorialMessages);
tutorial.messageTimespan = 1500; // ms messages are displayed
tutorial.messageDelay = 3000; // space between the messages
tutorial.startDelay = 1000; // time from game begin

var area1Sequence = new MessageSequence(area1Messages);
var area2Sequence = new MessageSequence(area2Messages);
var area3Sequence = new MessageSequence(area3Messages);
var finalLevelSequence = new MessageSequence(finalLevelMessages);
var endGameSequence = new MessageSequence(endGameMessages);
endGameSequence.messageTimespan = 1500;
endGameSequence.messageDelay = 3000; // space between the messages


