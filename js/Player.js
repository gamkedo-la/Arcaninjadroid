
// Don't ask why, it just has to be done in this order
function Player () {
    
    var char = new Character();
    var states = new PlayerStates(char);
    char.initMachine(states);
    return char;
}


var player = new Player ();
var otherCharacter = new Player ();

otherCharacter.x = 0;

