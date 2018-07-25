class Level {
  /**
   * 
   * @param {string} music - Path to file to be played
   * @param {string} background - Path to background image
   * @param {object} enemyList - What and how many enemies
   * @param {array} enemyList.enemyTypes - Array of existing enemy classes
   * @param {number} enemyList.limit - Total number of enemies allowed on the level
   */

  constructor({music, background, enemyList, title}){
    this.music = music;
    this.background = background;
    this.enemyList = enemyList;
    //this.enemySet = [];
    this.title = title;
    
    this.startWait = 1 * 60; //time before the first enemy is spawned
    this.enemiesCurrentlyOnscreen = 0;
    this.enemiesLeftToSpawn = enemyList.total;
    this.spawnInterval = 5 * 60;
    this.spawnTimer = this.startWait;
  }


  _setEnemies() {
    //this.enemySet = [];
    for (let i = 0; i < this.enemyList.limit; i++) {
      this._spawnRandomEnemy ();
    }
    this.enemiesCurrentlyOnscreen = this.enemyList.limit;
  }

  _removeOneEnemy() {

    this.enemiesCurrentlyOnscreen--;
    console.log(this.enemiesLeftToSpawn, this.enemiesCurrentlyOnscreen);

    if (this.enemiesCurrentlyOnscreen === 0 && this.enemiesLeftToSpawn === 0) {
      GameStateMachine.handleReceivedState(GameStates.levelClearedState);
    }
    
  }

  _playMusic(){
    if(this.music){
      this.music.pause();
    }
  }

  _setBackground(newBg){
    
    this.background = newBg;

  }

  _spawnRandomEnemy () {

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
    
    if (this.enemiesLeftToSpawn > 0 && this.spawnTimer<=0 && this.enemiesCurrentlyOnscreen < this.enemyList.limit){
      this._spawnRandomEnemy();
      this.spawnTimer = this.spawnInterval;
    }

  }


}

// For testing purposes:
// class Robot {};
// class Pirate {};
// const level1 = new Level({enemyList: {enemyTypes: [Robot, Pirate], limit: 5}});
// level1._setEnemies();
// level1._debug();

var level1Data = {
  music: musicFight,
  background: Images.getImage("moonlitForest"),
  enemyList: {
      enemyTypes: [Kangarobot],
      limit: 5,
      total: 10,
  }
}
var level2Data = Object.create(level1Data);
level2Data.background = Images.getImage("enemyBase");

var level1 = new Level(level1Data);
var level2 = new Level(level2Data);

GameStates.inGameState.currentLevel = level2;
