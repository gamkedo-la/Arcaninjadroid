setFormat();
setAudioPath("./audio/");
//music
var musicFight = new musicTrackOverlapLoop("arcaninjadroidfightV2", 106.8);  //By Stebs. Note: duration is set for self looping and wouldn't work for transitions
musicFight.setMixVolume(0.38);

var currentMusic = new musicContainer([musicFight]);

//SFX
var sfxTemp = new sfxClip("temp_placeholder");

//Functions
function startAudio() {
	currentMusic.play();
}

function resumeAudio() {
	currentMusic.resume();
}

function pauseAudio() {
	currentMusic.pause();
}