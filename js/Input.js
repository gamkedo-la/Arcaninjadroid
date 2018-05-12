
// Static Input module. No need to create an instance: simply call its methods using Input.method().
// Made by your Frenchie friend Remy with love <3 (with original script from the club of course)

// This might be slightly worse performance wise, as it uses string comparisons and creates large arrays for mapping inputs, but the key advantages are:
// no need to manually remap any new key desired
// keypresses not stored in global vars
// support for detecting inputs on only the first frame (analog to Unity's Input.GetKeyDown)

// Note: the "#" hack is a JS quickfix. Because JS is VERY weakly typed, inputting a string of a number ("4")
// treats it as an array index regardless. A non-numeral string is required for dict keys.


// IMPORTANT: The constructor, Input(), must be called in the Main.js file, after the game is started and canvas created
function Input() {

    console.log("Initializing Input module.");

    var mouseX = 0;
    var mouseY = 0;

    //Dict mapping keycodes with their "currently pressed" value
    var codeValuePairs = [];

    //Dict mapping keys with their keycodes (generated using the keycodes.js file)
    var nameCodePairs = keycodes;


    // Initialization of the value dict. Encoding for key states: [0,0] = no press, [0,1] = pressed this frame, [1,1] = holding
    // The state [1,0] is transitional, it tells the resetGetKeyDown method to wait 1 frame before clearing inputs so we have time to read first
    for (var name in nameCodePairs) {
        if (nameCodePairs.hasOwnProperty(name)){
            var code = nameCodePairs[name];
            codeValuePairs["#" + code] = [0,0];
        }
    }

    // Call this every frame (pls)
    Input.resetGetKeyDown = function () {

        for (var code in codeValuePairs) {
            if (codeValuePairs.hasOwnProperty(code)){
                var enc = codeValuePairs[code];
                
                if (enc[0] === 1 && enc[1] === 0){
                    codeValuePairs[code] = [0,1];
                } else if (enc[0] === 0 && enc[1] === 1) {
                    codeValuePairs[code] = [1,1];
                }
            }
        }

    }


    //Returns true if the key called "name" is currently pressed
    Input.getKey = function (name) {

        var toCheck = codeValuePairs["#" + nameCodePairs[name]];

        if (toCheck[1] === 1) {
            return true;
        } else {
            return false;
        }

    }

    // Returns true the frame on which the key called "name" is pressed
    Input.getKeyDown = function (name) {

        var toCheck = codeValuePairs["#" + nameCodePairs[name]];


        if (toCheck [0] === 0 && toCheck[1] === 1) {
            return true;
        } else {
            return false;
        }

    }

    Input.getMouseX = function () {
        return mouseX;
    }
    Input.getMouseY = function () {
        return mouseY;
    }

    //////     Event handlers for key and mouse events (mouse clicks treated as key down)  ////
    Input.keyDown = function (evt) {

        evt.preventDefault(); //prevents normal functionalities such as scrolling with arrows

        var toCheck = codeValuePairs["#" + evt.which];
        if (toCheck[0] == 0 && toCheck[1] == 0){
            codeValuePairs["#" + evt.which] = [1,0];
        } else {
            codeValuePairs["#" + evt.which] = [1,1];
        } // see encodings above

        
    };

    Input.keyUp = function (evt) {

        codeValuePairs["#" + evt.which] = [0,0];

    };

    
    //Requires "canvas" global var
    Input.setMousePos = function (evt) {

        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;

        mouseX = evt.clientX - rect.left - root.scrollLeft; //is there a problem with these lines? :/
        mouseY = evt.clientY - rect.top - root.scrollTop;   // clicking outside screen makes weird things happen

    };

    // Important that this is AFTER the function defs. 
    document.addEventListener("keydown", Input.keyDown);
    document.addEventListener("keyup", Input.keyUp);
    document.addEventListener("mousedown", Input.keyDown); //clicks handled with keydown
    document.addEventListener("mouseup", Input.keyUp);

    // Mouse movement requires an object named "canvas". Otherwise, only keyboard input works
    if (typeof canvas === "undefined"){
        console.log("Error: no canvas object. Mouse movement detection is not supported.");
        return;
    }

    canvas.addEventListener('mousemove', Input.setMousePos); 

};




// Keycodes for the entire keyboard (probably). You can look up / change which string needs to be
// passed to the Get methods here
var keycodes = {
    mouseleft:1,
    mouseright:2,
    backspace:8,
    tab:9,
    enter:13,
    shift:16,
    ctrl:17,
    alt:18,
    break:19,
    capslock:20,
    escape:27,
    space:32,
    pageup:33,
    pagedown:34,
    end:35,
    home:36,
    leftarrow:37,
    uparrow:38,
    rightarrow:39,
    downarrow:40,
    insert:45,
    delete:46,
    0:48,
    1:49,
    2:50,
    3:51,
    4:52,
    5:53,
    6:54,
    7:55,
    8:56,
    9:57,
    a:65,
    b:66,
    c:67,
    d:68,
    e:69,
    f:70,
    g:71,
    h:72,
    i:73,
    j:74,
    k:75,
    l:76,
    m:77,
    n:78,
    o:79,
    p:80,
    q:81,
    r:82,
    s:83,
    t:84,
    u:85,
    v:86,
    w:87,
    x:88,
    y:89,
    z:90,
    leftwindow:91,
    rightwindow:92,
    select:93,
    numpad0:96,
    numpad1:97,
    numpad2:98,
    numpad3:99,
    numpad4:100,
    numpad5:101,
    numpad6:102,
    numpad7:103,
    numpad8:104,
    numpad9:105,
    multiply:106,
    add:107,
    subtract:109,
    decimalpoint:110,
    divide:111,
    f1:112,
    f2:113,
    f3:114,
    f4:115,
    f5:116,
    f6:117,
    f7:118,
    f8:119,
    f9:120,
    f10:121,
    f11:122,
    f12	:123,
    numlock:144,
    scrolllock:145,
    semicolon:186,
    equalsign:187,
    comma:188,
    dash:189,
    period:190,
    forwardslash:191,
    graveaccent:192,
    openbracket:219,
    backslash:220,
    closebraket:221,
    singlequote:222 };