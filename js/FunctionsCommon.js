
function ArrayWithZeros(length) {
    array = [];
    for (i = 0; i < length; i++) {
        array.push(0);
    }
    return array;
}


function ArraySum(array) {
    var sum = 0;
    for (i = 0; i < array.length; i++) {
        toAdd = array[i];
        sum += toAdd;
    }
    return sum;
}

function ArraySmallest(array) {
    var smallestNum = array[0];
    if (array.length == 1) { return smallestNum; }
    for (i = 1; i < array.length; i++) {
        var num = array[i];
        if (num <= smallestNum) { smallestNum = num; }
    }
    return smallestNum; //the dumbest method lol
}

// Returns the distance between two position objects (that have x and y fields), rounded
function distanceBetween(obj1, obj2) {
    dist = Math.sqrt(Math.pow(obj2.x - obj1.x, 2) + Math.pow(obj2.y - obj1.y,2));
    return Math.round(dist);
}

// Returns a random number from -1 to 1 (inclusive -> exclusive)
function randomMin1To1() {
    return (Math.random()*2) - 1;
}

