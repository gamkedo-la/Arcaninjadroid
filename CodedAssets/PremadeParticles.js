// Particles emitters use config data when initialized. These define almost the entirety of the particle system. You can hard code some of these reusable config objects here.

gotHitParticlesConfig = {
    emissionRate: 150,
    size: 1.0,
    color: [255, 255, 100, 1.0],
    endColor: [255, 255, 100, 0.0],
    duration: 0.05,
    speed: 120,
    particleLife: 0.25,
    angle: 90,
    angleVar: 360,
    fadeSpeed: true
}

jumpDustParticlesConfig = {
    emissionRate: 200,
    size: 0.75,
    color: [170, 190, 210, 1.0],
    endColor: [150, 170, 180, 0.0],
    duration: 0.05,
    speed: 55,
    particleLife: 0.2,
    angle: 90,
    angleVar: 90,
    gravity: 2
}

landingDustParticlesConfig = {
    emissionRate: 250,
    size: 1.0,
    color: [32, 66, 88, 1.0],
    endColor: [12, 46, 68, 0.0],
    duration: 0.05,
    speed: 50,
    particleLife: 0.2,
    angle: -90,
    angleVar: 90,
    gravity: 2
}

fastFallParticlesConfig = {
    emissionRate: 200,
    size: 0.75,
    color: [255, 255, 179, 1],
    duration: 0.05,
    speed: 120,
    particleLife: 0.1
}

robotExplosionParticlesConfig1 = {
    emissionRate: 200,
    size: 2.5,
    sizeVar: 1,
    color: [252, 244, 194, 1],
    endColor: [237, 70, 4, 1],
    duration: 0.1,
    speed: 175,
    speedVar: 125,
    fadeSpeed: true,
    particleLife: 0.4
}

robotExplosionParticlesConfig2 = {
    emissionRate: 50,
    texture: Images.getImage("screwParticle"),
    useTexture: true,
    duration: 0.1,
    speed: 150,
    speedVar: 75,
    fadeSpeed: true,
    particleLife: 0.4
}

robotExplosionParticlesConfig3 = {
    emissionRate: 200,
    size: 3,
    sizeVar: 0.5,
    color: [252, 244, 194, 1],
    endColor: [224, 68, 6, 0.75],
    duration: 0.35,
    speed: 55,
    speedVar: 25,
    fadeSpeed: true,
    particleLife: 0.4
}