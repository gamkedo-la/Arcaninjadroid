

function PhysicalBody (config) {

    var mass = config.mass || 1;
    var applyGravity = config.applyGravity || true;
    var applyPhysics = config.applyPhysics || true; //is this body affected by physics or is it some immovable wall / moved by animation only?

    var velocity = {x:0, y:0, z:0};
    var acceleration = {x:0, y:0, z:0}; //not needed?

    PhysicalBody.prototype.applyPhysics = function () {

    }

    PhysicalBody.prototype.addForce = function () {
        
    }
}