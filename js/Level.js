class Robot {

}

class Pirate {

}

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
    this.enemySet = [];
    this.title = title;
  }

  _setEnemies() {
    this.enemySet = [];
    for (let i = 0; i < this.enemyList.limit; i++) {
      let rand = Math.floor(Math.random() * this.enemyList.enemyTypes.length);
      this.enemySet.push(new this.enemyList.enemyTypes[rand]());
    }
  }

  _playMusic(){
    if(this.music){
      // Do something to start the audio
    }
  }

  _setBackground(){
    if(this.background){
      // Do something external to set the background
    }
  }

  _debug(){
    console.log('='.repeat(80))
    console.log('Debug Info for Level: ', this.title);
    console.log('Available Types: ', this.enemyList.enemyTypes);
    console.log('Current Set: ', this.enemySet);
    console.log('='.repeat(80))
  }
}

// For testing purposes:
// const level1 = new Level({enemyList: {enemyTypes: [Robot, Pirate], limit: 5}});
// level1._setEnemies();
// level1._debug();