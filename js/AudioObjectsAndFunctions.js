setFormat();
setAudioPath("./audio/");
//music
var musicFight = new musicTrackOverlapLoop("arcaninjadroidfightV2", 114.5);  //By Stebs. Note: duration is set for self looping and wouldn't work for transitions
musicFight.setMixVolume(0.38);

var currentMusic = new musicContainer([musicFight]);

//SFX
var sfxTemp = new sfxClip("temp_placeholder");

var hit_Kangaroo01 = new sfxClip("Hit_Kangaroo01");
var hit_Kangaroo02 = new sfxClip("Hit_Kangaroo02");
var hit_Kangaroo03 = new sfxClip("Hit_Kangaroo03");
var kangarobotHitSfx = new sfxContainerRandom([hit_Kangaroo01, hit_Kangaroo02, hit_Kangaroo03]);

var sliceSfx = new sfxClip("SwordSlice");

var punch_Hard01 = new sfxClip("Punch_Hard01");
var punch_Hard02 = new sfxClip("Punch_Hard02");
var punch_HardSfx = new sfxContainerRandom([punch_Hard01, punch_Hard02]);

var punch_Med01 = new sfxClip("Punch_Med01");
var punch_Med02 = new sfxClip("Punch_Med02");
var punch_MedSfx = new sfxContainerRandom([punch_Med01, punch_Med02]);

var punch_Light01 = new sfxClip("Punch_Light01");
var punch_Light02 = new sfxClip("Punch_Light02");
var punch_LightSfx = new sfxContainerRandom([punch_Light01, punch_Light02]);

var punch_Uppercut01 = new sfxClip("Punch_Uppercut01");
var punch_Uppercut02 = new sfxClip("Punch_Uppercut02");
var punch_UppercutSfx = new sfxContainerRandom([punch_Uppercut01, punch_Uppercut02]);


//Functions
function startAudio() {
	MusicVolumeManager.updateVolume();
	SFXVolumeManager.updateVolume();
	currentMusic.play();
}

function resumeAudio() {
	MusicVolumeManager.updateVolume();
	SFXVolumeManager.updateVolume();
	currentMusic.resume();
}

function pauseAudio() {
	currentMusic.pause();
}