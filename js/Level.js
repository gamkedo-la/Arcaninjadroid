class Level {
  /**
   * 
   * @param {string} music - Path to file to be played
   * @param {string} background - Path to background image
   * @param {object} enemyList - What and how many enemies
   * @param {array} enemyList.enemyTypes - Array of existing enemy classes
   * @param {number} enemyList.limit - Total number of enemies allowed on the level
   */

  constructor({ music, background, enemyList, title, spawnInterval }) {
    this.music = music;
    this.background = background;
    this.enemyList = enemyList;
    //this.enemySet = [];
    this.title = title;

    this.startWait = 1 * 60; //time before the first enemy is spawned
    this.enemiesCurrentlyOnscreen = 0;
    this.enemiesLeftToSpawn = enemyList.total;
    this.spawnInterval = 60*spawnInterval || 3 * 60;
    this.spawnTimer = this.startWait;
  }


  _setEnemies() {
    //this.enemySet = [];
    for (let i = 0; i < this.enemyList.limit; i++) {
      this._spawnRandomEnemy();
    }
    this.enemiesCurrentlyOnscreen = this.enemyList.limit;
  }

  _removeOneEnemy() {

    this.enemiesCurrentlyOnscreen--;
    console.log("Enemies left to spawn: " + this.enemiesLeftToSpawn, "Enemies Currently Onscreen: " + this.enemiesCurrentlyOnscreen);

    if (this.enemiesCurrentlyOnscreen === 0 && this.enemiesLeftToSpawn === 0) {
      GameStateMachine.handleReceivedState(GameStates.levelClearedState);
    }

  }

  _removeAllOnscreenEnemies() {

    this.enemiesLeftToSpawn = 0;
    while (this.enemiesCurrentlyOnscreen > 0) {
      this._removeOneEnemy();
    }
    
  }

  _playMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  _setBackground(newBg) {

    this.background = newBg;

  }

  _spawnRandomEnemy() {

    this.enemiesCurrentlyOnscreen++;
    this.enemiesLeftToSpawn--;

    let rand = Math.floor(Math.random() * this.enemyList.enemyTypes.length);
    let randX = Math.random() * 240;
    new this.enemyList.enemyTypes[rand](randX, 60);

  }

  _debug() {
    console.log('='.repeat(80))
    console.log('Debug Info for Level: ', this.title);
    console.log('Available Types: ', this.enemyList.enemyTypes);
    console.log('Current Set: ', this.enemySet);
    console.log('='.repeat(80));
  }

  _tickAndSpawnIfNeeded() {

    this.spawnTimer--;

    if (this.enemiesLeftToSpawn > 0 && this.spawnTimer <= 0 && this.enemiesCurrentlyOnscreen < this.enemyList.limit) {
      this._spawnRandomEnemy();
      this.spawnTimer = this.spawnInterval;
    }

  }

  // Returns to initial state, for example when retrying a level
  _reset() {

    this.enemiesCurrentlyOnscreen = 0;
    this.enemiesLeftToSpawn = this.enemyList.total;
    this.spawnTimer = this.startWait;

  }

}

// For testing purposes:
// class Robot {};
// class Pirate {};
// const level1 = new Level({enemyList: {enemyTypes: [Robot, Pirate], limit: 5}});
// level1._setEnemies();
// level1._debug();

// "Tutorial" with only one enemy at a time would be level 0 here

/////

var level0Data = {
  music: musicFight,
  background: Images.getImage("moonlitForest"),
  enemyList: {
      enemyTypes: [Kangarobot],
      limit: 1,
      total: 2,
  }
}
var level1Data = {
  music: musicFight,
  background: Images.getImage("moonlitForest"),
  enemyList: {
      enemyTypes: [Kangarobot],
      limit: 2,
      total: 3,
  },
  spawnInterval:1
}
var level2Data = {
  music: musicFight,
  background: Images.getImage("moonlitForest"),
  enemyList: {
      enemyTypes: [Kangarobot],
      limit: 2,
      total: 5,
  }
}
var level3Data = {
  music: musicFight,
  background: Images.getImage("moonlitForest"),
  enemyList: {
      enemyTypes: [Kangarobot],
      limit: 3,
      total: 8,
  }
}
var level4Data = {
  music: musicFight,
  background: Images.getImage("enemyBase"),
  enemyList: {
      enemyTypes: [Kangarobot,Frogbot],
      limit: 3,
      total: 10,
  }
}
var level5Data = {
  music: musicFight,
  background: Images.getImage("enemyBase"),
  enemyList: {
      enemyTypes: [Kangarobot,Frogbot],
      limit: 7,
      total: 7,
  },
  spawnInterval:0.5
}
var level6Data = {
  music: musicFight,
  background: Images.getImage("enemyBase"),
  enemyList: {
      enemyTypes: [Kangarobot,Frogbot],
      limit: 3,
      total: 10,
  }
}
var level7Data = {
  music: musicFight3,
  background: Images.getImage("controlRoom"),
  enemyList: {
      enemyTypes: [Kangarobot,Frogbot,Tigerobot],
      limit: 3,
      total: 8,
  }
}
var level8Data = {
  music: musicFight3,
  background: Images.getImage("controlRoom"),
  enemyList: {
      enemyTypes: [Kangarobot,Frogbot,Tigerobot],
      limit: 5,
      total: 10,
  }
}
var level9Data = {
  music: musicFight3,
  background: Images.getImage("controlRoom"),
  enemyList: {
      enemyTypes: [Kangarobot,Frogbot,Tigerobot],
      limit: 7,
      total: 15,
  },
  spawnInterval: 2
}

var level0 = new Level(level0Data);
var level1 = new Level(level1Data);
var level2 = new Level(level2Data);
var level3 = new Level(level3Data);
var level4 = new Level(level4Data);
var level5 = new Level(level5Data);
var level6 = new Level(level6Data);
var level7 = new Level(level7Data);
var level8 = new Level(level8Data);
var level9 = new Level(level9Data);

var levelProgression = 0;
var allLevels = [level0,level1,level2,level3,level4,level5,level6,level7,level8,level9];
GameStates.inGameState.currentLevel = allLevels[levelProgression];