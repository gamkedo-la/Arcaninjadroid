setFormat();
setAudioPath("./audio/");
//music
var musicFight = new musicTrackOverlapLoop("arcaninjadroidfightV2", 114.5);  //By Stebs. Note: duration is set for self looping and wouldn't work for transitions
//musicFight.setMixVolume(0.3);
var musicFight3 = new musicTrackOverlapLoop("arcaninjadroidLevel2or3(2)", 114.5);  //By Stebs. Note: duration is set for self looping and wouldn't work for transitions

var currentMusic = new musicContainer([musicFight]);
//var currentMusic = new musicContainer([]);
currentMusic.setVolume(0.3);

//SFX
var sfxTemp = new sfxClip("temp_placeholder");

var hit_Kangaroo01 = new sfxClip("Hit_Kangaroo01");
var hit_Kangaroo02 = new sfxClip("Hit_Kangaroo02");
var hit_Kangaroo03 = new sfxClip("Hit_Kangaroo03");
var kangarobotHitSfx = new sfxContainerRandom([hit_Kangaroo01, hit_Kangaroo02, hit_Kangaroo03]);
kangarobotHitSfx.setVolume(0.4);

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

var tigerobotRoar01 = new sfxClip("TigerobotRoar01");
var tigerobotRoar02 = new sfxClip("TigerobotRoar02");
var tigerobotRoar03 = new sfxClip("TigerobotRoar03");
var tigerobotRoarSfx = new sfxContainerRandom([tigerobotRoar01, tigerobotRoar02, tigerobotRoar03]);
tigerobotRoarSfx.setVolume(0.55);

var whiff_Hard01 = new sfxClip("Whiff_Hard01");
var whiff_Hard02 = new sfxClip("Whiff_Hard02");
var whiff_HardSfx = new sfxContainerRandom([whiff_Hard01, whiff_Hard02]);

var whiff_Med01 = new sfxClip("Whiff_Medium01");
var whiff_Med02 = new sfxClip("Whiff_Medium02");
var whiff_MedSfx = new sfxContainerRandom([whiff_Med01, whiff_Med02]);

var whiff_Light01 = new sfxClip("Whiff_Light01");
var whiff_Light02 = new sfxClip("Whiff_Light02");
var whiff_Light03 = new sfxClip("Whiff_Light03");
var whiff_LightSfx = new sfxContainerRandom([whiff_Light01, whiff_Light02, whiff_Light03]);
whiff_LightSfx.setVolume(0.4);

var explosion01 = new sfxClip("Explosion01");
var explosion02 = new sfxClip("Explosion02");
var explosionSFX = new sfxContainerRandom([explosion01, explosion02]);

var gameOver = new sfxClip("gameOver");

var arcaneFireSFX = new sfxClip("ArcaneFire");
whiff_LightSfx.setVolume(1);

var airDashSfx = new sfxClip("AirDash");
airDashSfx.setVolume(0.5);
var playerJumpSfx = new sfxClip("DroidJump");
playerJumpSfx.setVolume(0.6);

var frogbotCountdownSfx = new sfxClip("FrogbotCountdown");
frogbotCountdownSfx.setVolume(0.5);
var frogbotCroak1 = new sfxClip("FrogbotCroak01");
var frogbotCroak2 = new sfxClip("FrogbotCroak02");
var frogbotCroak3 = new sfxClip("FrogbotCroak03");
var frogbotCroakSfx = new sfxContainerRandom([frogbotCroak1, frogbotCroak2, frogbotCroak3]);
//frogbotCroakSfx.setVolume();

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