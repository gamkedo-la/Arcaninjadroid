
// Don't ask why, it just has to be done in this order


function Player() {

    var char = new Character(100, 75);

    var states = new PlayerStates(char);
    char.initMachine(states);

    char.trail = new WooshTrail();


    return char;
}


var player = new Player();



