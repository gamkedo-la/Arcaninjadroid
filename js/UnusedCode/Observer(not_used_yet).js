// Adaptation of Robert Nystrom's "Game Programming Patterns"
// This script covers the Observer pattern
// Made by Remy Lapointe for Gamkedo projects

//////////////////////////          Templates             /////////////////////////

function Observer() {
    //Parameters can be anything needed. To override when making observers
    this.onNotify = function (entity, event) {
    }
}

function Subject() {
    
    var observers = [];

    this.addObserver = function (observer) {
        observers.push(observer);
    }

    this.removeObserver = function (observer) {
        var index = observers.indexOf(observer);
        observers.splice(index, 1); //Remove 1 element at "index"
    }

    this.notify = function(entity, event){
        for (i = 0; i < observers.length; i++) {
            observers[i].onNotify(entity, event); //again, params are to be made by the user
        }
    }
}

///////////////////                  Example                    /////////////////////////

function Person(name) {
    this.name = name;
    this.observer = new Observer();
    this.observer.onNotify = function (entity, event) {
        console.log("Notified!");
        if (entity.name && event === "speak") {
            console.log(entity.name + " spoke to me!");
        }
    }

    this.subject = new Subject();
        
    this.speakUp = function () {
         this.subject.notify(this, "speak"); //notify observers that the entity that spoke is "this", and that the event was talking
    }
}
/*
ray = new Person("Ray");
beam = new Person("Beam");

ray.subject.addObserver(beam.observer); //now person 2 is listening to person 1
ray.speakUp();
beam.speakUp();//doesn't do anything because no one listens!
console.log("Adding observer to Beam");
beam.subject.addObserver(ray.observer);
beam.speakUp();
console.log("No one is listening to Ray anymore.");
ray.subject.removeObserver(beam.observer);
ray.speakUp(); //does nothing
beam.speakUp();
*/