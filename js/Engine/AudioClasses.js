/*
AudioClasses.js and AudioManager,js are an attemp my Michael Fewkes to make more complex audio behaviors simpler to implement.

Functions that all sound objects share:
.play()    plays from the beggining of the audio file
.stop()	    stops playback and resets playback time
.resume()    plays file from last playback time
.pause()    stops playback without resetting playback time
.setVolume()/.getVolume()    reports and sets object volume
.setMixLevel()    sets a volume pre setVolume(), used for settimg a volume relative to the mix
.setTime()/.getTime()    controls the playback time
.getDuration()    reports the duration of the file
.getPaused()    reports true is the file is not currently playing

*/

//General
function setFormat() {
	var audio = new Audio();
	if (audio.canPlayType("audio/ogg")) {
		audioFormatType = ".ogg";
	} else {
		audioFormatType = ".mp3";
	}
}

function setAudioPath(path = "") {
	audioPath = path;
}

function audioFormat(alt = false) {
	var format = audioFormatType;
	if (alt != false) {
		format = ".mp3";
	}
	return format;
}

function toggleMute() {
	SFXVolumeManager.setMuted(!SFXVolumeManager.getMuted());
	MusicVolumeManager.setMuted(!MusicVolumeManager.getMuted());
}

function setMute(TorF) {
	SFXVolumeManager.setMuted(TorF);
	MusicVolumeManager.setMuted(TorF);
}

function getMute() {
	var isNotMuted = SFXVolumeManager.getMuted() * MusicVolumeManager.getMuted();
	return isNotMuted;
}


//Managers
const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade]
const TIMER = 2; // Arrayformat [TIMER, track, endTime, callSign]
const PLAY = 3; // Arrayformat [PLAY, track, endTime]
const STOP = 4; // Arrayformat [STOP, track, endTime]

var AudioEventManager = new audioEventManager();

function audioEventManager() {
	var eventList = [];
	var now = Date.now();

	this.returnEventList = function() {
		return eventList;
	}

	this.updateEvents = function() {
		now = Date.now();
		cleanupList();
		runList();
	}

	this.addFadeEvent = function(track, duration, endVol) {
		// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade = false]
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol, false]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol, false];
		}
	}

	this.addCrossfadeEvent = function(track, duration, endVol) {
		// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade = true]
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol, true]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol, true];
		}
	}

	this.addTimerEvent = function(track, duration, callSign = "none") {
		// Arrayformat [TIMER, track, endTime, callSign]
		var thisTrack = track;
		var check = checkListFor(TIMER, thisTrack, callSign);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Timer Event for " + track.getTrackName() + ". CallSign: " + callSign);
			eventList.push([TIMER, track, endTime, callSign]);
		} else {
			//console.log("Replacing Timer Event for " + track.getTrackName() + ". CallSign: " + callSign);
			eventList[check] = [TIMER, track, endTime, callSign];
		}
	}

	this.addPlayEvent = function(track, duration) {
		// Arrayformat [PLAY, track, endTime]
		var thisTrack = track;
		var check = checkListFor(PLAY, thisTrack);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Play Event for " + track.getTrackName());
			eventList.push([PLAY, track, endTime]);
		} else {
			eventList[check] = [PLAY, track, endTime];
		}
	}

	this.addStopEvent = function(track, duration) {
		// Arrayformat [STOP, track, endTime]
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Stop Event for " + track.getTrackName());
			eventList.push([STOP, track, endTime]);
		} else {
			eventList[check] = [STOP, track, endTime];
		}
	}

	this.removeTimerEvent = function(track, callSign = "") {
		var thisTrack = track;
		if(callSign != " ") {
			var check = checkListFor(TIMER, thisTrack, callSign);
			if (check == "none") {
				return;
			} else {
				//console.log("Removing Timer Event for " + track.getTrackName() + ". CallSign: " + callSign);
				eventList[check] = [REMOVE];
			}
		} else {
			var check = checkListFor(TIMER, thisTrack, "");
			while(check != "none") {
			//console.log("Removing Timer Event for " + track.getTrackName());
				eventList[check] = [REMOVE];
				check = checkListFor(TIMER, thisTrack, "");
			}
		}
	}

	this.removePlayEvent = function(track) {
		var thisTrack = track;
		var check = checkListFor(PLAY, thisTrack);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Stop Event for " + track.getTrackName());
			eventList[check] = [REMOVE];
		}
	}

	this.removeStopEvent = function(track) {
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Stop Event for " + track.getTrackName());
			eventList[check] = [REMOVE];
		}
	}

	this.getEventSecondsRemaining = function(track, eventType, callSign = "") {
		now = Date.now();
		var thisTrack = track;
		var check = checkListFor(eventType, thisTrack, callSign);

		if (check == "none") {
			return "none";
		} else {
			return (eventList[check][2] - now)/1000;
		}
	}

	function runList(){
		for (var i = 0; i < eventList.length; i++) {
			var thisTrack = eventList[i][1];
			if (eventList[i][0] == FADE) {
			// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade]
					if(eventList[i][6]) {
						if(eventList[i][4] < eventList[i][5]){
							thisTrack.setVolume(scaleRange(0, 1, eventList[i][4], eventList[i][5], 
								Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 0, 1, now), 0.5)));
						} else {
							thisTrack.setVolume(scaleRange(1, 0, eventList[i][4], eventList[i][5], 
								Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 1, 0, now), 0.5)));
						}
					} else {
						thisTrack.setVolume(interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now));
					}
				if (now > eventList[i][3]) {
					//console.log("Ending Fade Event for " + thisTrack.getTrackName());
					thisTrack.setVolume(eventList[i][5]);
					eventList[i] = [REMOVE];
				}
			}
			if (eventList[i][0] == TIMER) {
			// Arrayformat [TIMER, track, endTime, callSign]
				if (now >= eventList[i][2]) {
					var callSign = eventList[i][3];
					//console.log("Triggering Timer Event. CallSign is: " + eventList[i][3]);
					eventList[i] = [REMOVE];
					thisTrack.trigger(callSign);
				}
			}
			if (eventList[i][0] == PLAY) {
			//Arrayformat [PLAY, track, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Play Event for " + thisTrack.getTrackName());
					thisTrack.play();
					eventList[i] = [REMOVE];
				}
			}
			if (eventList[i][0] == STOP) {
			//Arrayformat [STOP, track, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Stop Event for " + thisTrack.getTrackName());
					thisTrack.stop();
					eventList[i] = [REMOVE];
				}
			}
		}
	}

	function cleanupList() {
		//console.log("Cleaning up");
		eventList.sort(function(a, b){return b[0]-a[0]});
		while (eventList[eventList.length - 1] == REMOVE) {
			//console.log("Removing Event");
			eventList.pop();
		}
	}

	function checkListFor(eventType, track, callSign = "none"){
		var foundItem = false;
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					if(eventType == TIMER && callSign != "" && eventList[i][3] == callSign) {
						foundItem = true;
						return i;
					} else if (eventType == TIMER && callSign == "") {
						foundItem = true;
						return i;
					} else if (eventType != TIMER) {
						foundItem = true;
						return i;
					}
				}
			}
		}
		if (!foundItem) {
			return "none";
		}
	}

	function interpolateFade(startTime, endTime, startVolume, endVolume, currentTime) {
		/*
		x1 = startTime
		y1 = startVolume		
	
		x2 = endTime
		y2 = endVolume		

		x = currentTime
		y = y1 + (x - x1)((y2 - y1)/(x2 - x1))
   	 currentVolume = startVolume + (now - startTime) * ((endVolume - startVolume) / (endTime - startTime))
		*/
		if (currentTime > endTime) {currentTime = endTime;}
		var currentVolume = startVolume + (currentTime - startTime) * ((endVolume - startVolume) / (endTime - startTime));

		return currentVolume;
	}

	function scaleRange(inputStart, inputEnd, outputStart, outputEnd, value) {
		var scale = (outputEnd - outputStart) / (inputEnd - inputStart);
		return outputStart + ((value - inputStart) * scale);
	}
}


function volumeManager() {
	var list = [];
	var volume = 1;
	var muted = false;

	this.setVolume = function(amount) {
		if (amount > 1) {volume = 1;}
		else if (amount < 0) {volume = 0;}
		else {volume = amount;}
		for (var i in list) {
			list[i].updateVolume();
		}
	}

	this.getVolume = function() {
		return volume;
	}

	this.setMuted = function(ToF) {
		muted = ToF;
		this.updateVolume();
	}

	this.getMuted = function() {
		return muted;
	}

	this.updateVolume = function() {
		for(var i in list) {
			list[i].updateVolume();
		}
	}

	this.addToList = function(item) {
		list.push(item);
	}
}

//SFX Classes
SFXVolumeManager = new volumeManager();

function getRandomVolume(){
	var min = 0.85;
	var max = 1;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function sfxClip(filename) {//A simple, single buffer sound clip
	var soundFile = new Audio(audioPath+filename+audioFormat());
	soundFile.onerror = function(){soundFile = new Audio(audioPath+filename+audioFormat(true))};
	var clipVolume = 1;
	var randVolume = true;
	this.name = filename;
	var duration = soundFile.duration;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;

	soundFile.pause();
	var man = SFXVolumeManager;
	man.addToList(this);


	this.play = function() {
		soundFile.currentTime = 0;
		this.updateVolume();
		soundFile.play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		soundFile.pause();
		AudioEventManager.removeTimerEvent(this);
		soundFile.currentTime = 0;
		playing = false;
	}

	this.resume = function() {
		soundFile.play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		soundFile.pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		if (randVolume) {
			soundFile.volume = Math.pow(newVolume * man.getVolume() * getRandomVolume() * !man.getMuted(), 2);
		} else {
			soundFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && musicFile.paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			soundFile.play();
		}
		if(clipVolume < 0.1) {soundFile.pause();}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		soundFile.currentTime = time;
		if (playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile.currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipOverlap(filename, voices = 2) {//A sound clip with as many buffers as specified
	var soundFile = new array(voices);
	var maxVoices = soundfile.length;
	for (var i in soundFile) {
		soundFile[i] = new Audio(audioPath+filename+audioFormat());
		soundFile[i].onerror = function(){soundFile[i] = new Audio(audioPath+filename+audioFormat(true))};
		soundFile[i].pause();
	}
	var currentClip = 0;
	var clipVolume = 1;
	var randVolume = true;
	this.name = filename;
	var duration = soundFile[0].duration;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;


	var man = SFXVolumeManager;
	man.addToList(this);

	this.play = function() {
		currentClip++;
		if (currentClip >= maxVoices) {currentClip = 0;}

		soundFile[currentClip].currentTime = 0;
		this.updateVolume();
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
			soundFile[i].currentTime = 0;
		}
		playing = false;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		playing = false;
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		if (randVolume) {
			for (var i in soundFile) {
				soundFile[i].volume = Math.pow(newVolume * man.getVolume() * getRandomVolume() * !man.getMuted(), 2);
			}
		} else {
			for (var i in soundFile) {
				soundFile[i].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
			}
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		for (var i in soundFile) {
			soundFile[i].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
		if(playing && soundFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			soundFile[currentClip].play();
		}
		if(clipVolume < 0.1) {
			soundFile[0].pause();
			soundFile[1].pause();
		}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		soundFile.currentTime[currentClip] = time;
		if(playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipOverlapLoop(filename, playLength) {//Double buffer sound file that loops
	var musicFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	soundFile[0].onerror = function(){soundFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	soundFile[1].onerror = function(){soundFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentClip = 0;
	var duration = playLength;
	this.name = filename;
	var clipVolume = 1;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;

	soundFile[0].pause();
	soundFile[1].pause();
	var man = SFXVolumeManager;
	man.addToList(this);

	this.play = function() {
		soundFile[currentClip].currentTime = 0;
		this.updateVolume();
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		soundFile[0].pause();
		soundFile[0].currentTime = 0;
		soundFile[1].pause();
		soundFile[1].currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		soundFile[0].pause();
		soundFile[1].pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip > 1) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile[0].volume = Math.pow(newVolume  * man.getVolume() * !man.getMuted(), 2);
		soundFile[1].volume = Math.pow(newVolume  * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		soundFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && soundFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			soundFile[currentClip].play();
		}
		if(clipVolume < 0.1) {
			soundFile[0].pause();
			soundFile[1].pause();
		}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		soundFile[currentClip].currentTime = newTime;
		if (playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipSpriteSheet(filename, listOfTimePairs) {//A single file holding several sound clips
	var soundFile = new Audio(audioPath+filename+audioFormat());
	soundFile.onerror = function(){soundFile = new Audio(audioPath+filename+audioFormat(true))};
	var times = listOfTimePairs;
	var clipVolume = 1;
	var randVolume = true;
	this.name = filename;
	var duration = soundFile.duration;
	var currentClip = 0;
	var totalClips = times.length;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;

	soundFile.pause();
	var man = SFXVolumeManager;
	man.addToList(this);


	this.play = function() {
		var startAt = times[currentClip][0];
		soundFile.currentTime = startAt;
		this.updateVolume();
		soundFile.play();
		AudioEventManager.addStopEvent(this, this.getClipDuration(currentClip));
		AudioEventManager.addTimerEvent(this, this.getClipDuration(currentClip), "cue");
		playing = true;
	}

	this.stop = function() {
		soundFile.pause();
		soundFile.currentTime = 0;
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		this.play();
		AudioEventManager.addStopEvent(this, (this.getClipDuration(currentClip) - (times[currentClip][1] - this.getTime())));
		AudioEventManager.addTimerEvent(this, (this.getClipDuration(currentClip) - (times[currentClip][1] - this.getTime())), "cue");
		playing = true;
	}

	this.pause = function() {
		soundFile.pause();
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		if (randVolume) {
			soundFile.volume = Math.pow(newVolume * man.getVolume() * getRandomVolume() * !man.getMuted(), 2);
		} else {
			soundFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && musicFile.paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			soundFile.play();
		}
		if(clipVolume < 0.1) {soundFile.pause();}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		this.stop();
		if (clipNumber >= totalClips) {currentClip = 0;}
		else {currentClip = clipNumber;}
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getClipDuration = function(clipNumber) {
		return (times[clipNumber][1] - times[clipNumber][0])
	}

	this.getTimePair = function(clipNumber) {
		return times[clipNumber];
	}

	this.setTime = function(time) {
		soundFile.currentTime = time;
		if (playing) {
			AudioEventManager.addTimerEvent(this, this.getClipDuration(currentClip), "cue");
		}
	}

	this.getTime = function() {
		return soundFile.currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipSprite(spriteSheet, clipNumber) {//A referance to the clips in sfxClipSpriteSheet
	var spriteFile = spriteSheet;
	var clip = clipNumber;
	this.name = "sfxClipSprite " + spriteFile.name;
	var duration = spriteFile.getClipDuration(clip);
	var tick = 0;

	this.play = function() {
		spriteFile.setCurrentClip(clip);
		spriteFile.play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.updateVolume = function() {
		spriteFile.updateVolume();		
	}

	this.setVolume = function(newVolume) {
		spriteFile.setVolume(newVolume);
	}

	this.getVolume = function() {
		return spriteFile.getVolume();
	}

	this.getSourceClip = function() {
		return soundFile.getSourceClip();
	}

	this.getChildClip = function() {
		return [soundFile];
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		spriteFile.setTime(time + spriteFile.getTimePair(clip)[0]);
		if (!spriteFile.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return spriteFile.getTime() - spriteFile.getTimePair(clip)[0];
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return spriteFile.getPaused();
	}

	return this;
}

function sfxContainer(clipList) {//Basic Container
	var soundFile = [];
	var currentClip = 0;
	this.name = "sfxContainer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
	}

	this.play = function() {
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		soundFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in soundFile) {
			soundFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return soundFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return soundFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		soundFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLoop(clipList) {//Basic Container
	var soundFile = [];
	var currentClip = 0;
	this.name = "sfxContainer";
	var schedualedClip = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
	}

	this.play = function() {
		currentTrack = schedualedClip;
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		soundFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in soundFile) {
			soundFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return soundFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return soundFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		soundFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerRandom(clipList) {//Plays a random list-item on playback
	var soundFile = [];
	var currentClip = 0;
	this.name = "sfxContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * soundFile.length);
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		soundFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in soundFile) {
			soundFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return soundFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return soundFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		soundFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLoopRandom(clipList) {//Plays a random list-item on playback
	var soundFile = [];
	var currentClip = 0;
	this.name = "sfxContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * soundFile.length);
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		soundFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in soundFile) {
			soundFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return soundFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return soundFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		soundFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLayer(clipList) {//Plays all list-items together
	var soundFile = [];
	var currentClip = 0;
	this.name = "sfxContainerLayer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
	}

	this.play = function() {
		for (var i in soundFile) {
			soundFile[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in soundFile) {
			soundFile[i].resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.setLayerLevel = function(slot, level) {
		soundFile[slot].setVolume(level);
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in soundFile) {
			soundFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return soundFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return soundFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		for (var i in soundFile) {
			soundFile[currentClip].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerBlend(clipList, startingLevel = 0) {//Container which blends between the volumes of list-items
	var soundFile = [];
	var currentClip = 0;
	this.name = "sfxContainerBlend";
	var currentLevel = startingLevel;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
	}

	var overlap = 1/soundFile.length - 1;
	function defineVolumes() {
		for (var i = 0; soundFile.length; i++) {
			var relativeLevel = Math.abs(currentLevel - i*overlap);
			if (relativeLevel > overlap) {
				soundFile[i].setVolume(0);
			}
			if (relativeLevel <= overlap) {
				soundFile[i].setVolume(Math.abs(1 - relativeLevel / overlap) * clipVolume);
			}
		}
	}

	this.play = function() {
		defineVolumes();
		for (var i in soundFile) {
			soundFile[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		defineVolumes();
		for (var i in soundFile) {
			soundFile[i].resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.setLevel = function(newLevel) {
		currentLevel = newLevel;
		defineVolumes();		
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		defineVolumes();
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return soundFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return soundFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		for (var i in soundFile) {
			soundFile[currentClip].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

//Music Classes
MusicVolumeManager = new volumeManager();

function musicTrack(filename, playLength) {//Single buffer music file
	var musicFile = new Audio(audioPath+filename+audioFormat());
	musicFile.onerror = function(){musicFile = new Audio(audioPath+filename+audioFormat(true))};
	var duration = musicFile.duration;
	this.name = filename;
	var duration = playLength;
	var trackVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;

	musicFile.pause();
	musicFile.loop = false;
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		musicFile.currentTime = 0;
		this.updateVolume();
		musicFile.play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		musicFile.pause();
		musicFile.currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		musicFile.play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		musicFile.pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		musicFile.play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = trackVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		trackVolume = newVolume;
		newVolume = trackVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && musicFile[currentTrack].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				musicFile.play();
			}
		}
		if(trackVolume < 0.1) {musicFile.pause();}
	}

	this.getVolume = function() {
		return trackVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.getChildTracks = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while(newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		musicFile.currentTime = newTime;
		if(this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicFile.currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function musicTrackOverlap(filename, playLength) {//Double buffer music file
	var musicFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	musicFile[0].onerror = function(){musicFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	musicFile[1].onerror = function(){musicFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentTrack = 0;
	var duration = playLength;
	this.name = filename;
	var trackVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;

	musicFile[0].pause();
	musicFile[1].pause();
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		currentTrack++;
		if (currentTrack > 1) {currentTrack = 0;}
		musicFile[currentTrack].currentTime = 0;
		this.updateVolume();
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		musicFile[0].pause();
		musicFile[0].currentTime = 0;
		musicFile[1].pause();
		musicFile[1].currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		musicFile[0].pause();
		musicFile[1].pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = trackVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		musicFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		trackVolume = newVolume;
		newVolume = trackVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		musicFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && musicFile[currentTrack].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				musicFile[currentTrack].play();
			}
		}
		if(trackVolume < 0.1) {
			musicFile[0].pause();
			musicFile[1].pause();
		}
	}

	this.getVolume = function() {
		return trackVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.getChildTracks = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		musicFile[currentTrack].currentTime = newTime;
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicFile[currentTrack].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function musicTrackOverlapLoop(filename, playLength) {//Double buffer music file that loops
	var musicFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	musicFile[0].onerror = function(){musicFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	musicFile[1].onerror = function(){musicFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentTrack = 0;
	var duration = playLength;
	this.name = filename;
	var trackVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;

	musicFile[0].pause();
	musicFile[1].pause();
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		musicFile[currentTrack].currentTime = 0;
		this.updateVolume();
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		musicFile[0].pause();
		musicFile[0].currentTime = 0;
		musicFile[1].pause();
		musicFile[1].currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		musicFile[0].pause();
		musicFile[1].pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack++;
			if (currentTrack > 1) {currentTrack = 0;}
			this.play();
			tick++;
		}
	}

	this.updateVolume = function() {
		newVolume = trackVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		musicFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		trackVolume = newVolume;
		newVolume = trackVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		musicFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && musicFile[currentTrack].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				musicFile[currentTrack].play();
			}
		}
		if(trackVolume < 0.1) {
			musicFile[0].pause();
			musicFile[1].pause();
		}
	}

	this.getVolume = function() {
		return trackVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.getChildTracks = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		musicFile[currentTrack].currentTime = newTime;
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicFile[currentTrack].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function musicContainer(trackList) {//Basic containers
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainer";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		AudioEventManager.removeTimerEvent(this);
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		AudioEventManager.removeTimerEvent(this);
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.setCurrentTrack = function(trackNumber) {
		currentTrack = trackNumber;
	}

	this.loadTrack = function(newTrack, slot) {

		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerRandom(trackList) {//Picks random list-item to play on play
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerRandom";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		currentTrack = Math.floor(Math.random() * musicTrack.length);
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentTrack = Math.floor(Math.random() * musicTrack.length);
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoop(trackList) {//Loops current list-item
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerLoop";
	var schedualedTrack = 0;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		currentTrack = schedualedTrack;
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.setCurrentTrack = function(trackNumber) {
		schedualedTrack = trackNumber;
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoopRandom(trackList) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerLoopRandom";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack = Math.floor(Math.random() * musicTrack.length);
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoopRandomRepetitionControl(trackList, maxRepetitions = 3, minRepetitions = 1) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerLoopRandomRepetitionControl";
	var lastTrack = 0;
	var playCountdown = 0;
	var playMax = maxRepetitions;
	var playMin = minRepetitions;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		lastTrack = currentTrack;
		playCountdown--;
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (playCountdown <= 0 && musicTrack.length > 1){
				while(currentTrack == lastTrack) {
					currentTrack = Math.floor(Math.random() * musicTrack.length);
				}
				playCountdown = Math.floor(Math.random() * (playMax - playMin + 1) + playMin);
			}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoopRandomDurationControl(trackList, maxDurationInSeconds = 180, minDurationInSeconds = 60) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerLoopRandomDurationControl";
	var lastTrack = 0;
	var playTime = 0;
	var playMax = maxDurationInSeconds;
	var playMin = minDurationInSeconds;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		lastTrack = currentTrack;
		playTime += musicTrack[currentTrack].getDuration();
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (playTime > playMin && musicTrack.length > 1){
				if(Math.random() <= (playTime - playMin)/(playMax - playMin)) {
					while(currentTrack == lastTrack) {
						currentTrack = Math.floor(Math.random() * musicTrack.length);
					}
					playTime = 0;
				}
			}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenated(trackList) {//Reports all list-items as one item and plays through them
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerConcatenated";
	var duration = 0;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentTrack].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentTrack = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime && notFound) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
				currentTrack = i;
				notFound = false;
			}
		}
		musicTrack[currentTrack].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack++;
			if (currentTrack < musicTrack.length) {
				this.play();
			} else {
				currentTrack = 0;
				tick++;
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime) {
				currentTrack = i;
				musicTrack[currentTrack].setTime(totalTime);
				return;
			}
		}
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in musicTrack) {
			if (i < currentTrack) {
				totalTime += musicTrack[i].getDuration();
			} else if (i == currentTrack) {
				totalTime += musicTrack[i].getTime();
			}
		}
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLatchLast(trackList) {//Reports all list-items as one item, but only repeats last one
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerConcatenatedLatchLast";
	var duration = 0;
	var atEnd = false;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentTrack].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		if (!atEnd) {
			currentTrack = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].playFrom(time);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime && notFound) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
					currentTrack = i;
					notFound = false;
				}
			}
			musicTrack[currentTrack].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (currentTrack < musicTrack.length - 1) {
				currentTrack++;
				this.play()
			} 
			if (currentTrack >= musicTrack.length - 1) {
				atEnd = true;
				tick++;
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
		atEnd = false;
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].setTime(time);
			if(!this.getPaused()) {
				AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
			}
		} else {
			var totalTime = time;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime) {
					currentTrack = i;
					musicTrack[currentTrack].setTime(totalTime);
					if(!this.getPaused()) {
						AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
					}
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = musicTrack[currentTrack].getTime();
		} else {
			for (var i in musicTrack) {
				if (i < currentTrack) {
					totalTime += musicTrack[i].getDuration();
				} else if (i == currentTrack) {
					totalTime += musicTrack[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return musicTrack[currentTrack].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoop(trackList) {//Loops list-items as if one item
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerConcatenatedLoop";
	var duration = 0;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentTrack].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentTrack = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime && notFound) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
				currentTrack = i;
				notFound = false;
			}
		}
		musicTrack[currentTrack].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack++;
			if (currentTrack < musicTrack.length) {
				this.play();
			} else {
				currentTrack = 0;
				this.play();
				tick++;
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime) {
				currentTrack = i;
				musicTrack[currentTrack].setTime(totalTime);
				if(!this.getPaused()) {
					AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
				}
				return;
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in musicTrack) {
			if (i < currentTrack) {
				totalTime += musicTrack[i].getDuration();
			} else if (i == currentTrack) {
				totalTime += musicTrack[i].getTime();
			}
		}
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoopLast(trackList) {//Loop all list-items as one item, but only repeats last one
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerConcatenatedLoopLast";
	var duration = 0;
	var atEnd = false;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentTrack].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		if (!atEnd) {
			currentTrack = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].playFrom(time);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime && notFound) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
					currentTrack = i;
					notFound = false;
				}
			}
			musicTrack[currentTrack].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "secret cue") {
			if (currentTrack < musicTrack.length - 1) {
				currentTrack++;
			} 
			if (currentTrack >= musicTrack.length - 1) {
				atEnd = true;
				tick++;
			}
			this.play();
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
		atEnd = false;
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].setTime(time);
		} else {
			var totalTime = time;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime) {
					currentTrack = i;
					musicTrack[currentTrack].setTime(totalTime);
					if(!this.getPaused()) {
						AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
					}
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = musicTrack[currentTrack].getTime();
		} else {
			for (var i in musicTrack) {
				if (i < currentTrack) {
					totalTime += musicTrack[i].getDuration();
				} else if (i == currentTrack) {
					totalTime += musicTrack[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return musicTrack[currentTrack].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerCrossfade(trackList) {//Can crossfade between list-items
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerCrossfade";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].setVolume(0)
	}
	musicTrack[0].setVolume(1);

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack != slot && !musicTrack[currentTrack].getPaused()) {
			musicTrack[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, trackVolume);
			currentTrack = slot;
		} else if (currentTrack != slot) {
			musicTrack[slot].setTime(timeNow);
			musicTrack[currentTrack].stop();
			currentTrack = slot;
			musicTrack[currentTrack].setVolume(trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerCrossfadeLoop(trackList) {//Can crossfade between list-items, loops current item
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerCrossfadeLoop";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].setVolume(0)
	}
	musicTrack[0].setVolume(1);

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack != slot && !musicTrack[currentTrack].getPaused()) {
			musicTrack[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, trackVolume);
			currentTrack = slot;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		} else if (currentTrack != slot) {
			musicTrack[slot].setTime(timeNow);
			musicTrack[currentTrack].stop();
			currentTrack = slot;
			musicTrack[currentTrack].setVolume(trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLayers(trackList) {//Plays all list-items together, controls volumes
	var musicTrack = [];
	var musicTrackVolume = [];
	var trackVolume = 1;
	var currentTrack = 0;
	this.name = "musicContainerLayers";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrackVolume[i] = 1;
		musicTrack[i].setVolume(1);
	}

	function evaluateCurrentTrack(){
		var trackNow = 0;
		for(var i = musicTrack.length-1; i >= 0; i--) {
			if (!musicTrack[i].getPaused()) {
				trackNow = i;
			}
		}
		currentTrack = trackNow;
	}

	this.play = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicTrackVolume[slot] = level;
		if (musicTrack[slot].getPaused()) {
			var timeNow = musicTrack[0].getTime();
			var tracksPlaying = 0;
			for(var i in musicTrack) {
				if (!musicTrack[i].getPaused()) {
					timeNow = musicTrack[i].getTime();
					tracksPlaying++;
				}
			}
			if (tracksPlaying > 0) {
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
				musicTrack[slot].playFrom(timeNow);
			} else {
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(musicTrack[slot], fadeTime, musicTrackVolume[slot] * trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack.getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) { //Needs a look
		evaluateCurrentTrack();
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, musicTrackVolume[slot] *  trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		musicTrackVolume.push(0);
		newTrack.setVolume(0);
	}

	this.removeTrack = function(slot) {
		evaluateCurrentTrack();
		musicTrack.splice(slot,1);
		musicTrackVolume.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (var i in musicTrack) {
			musicTrack[i].setVolume(musicTrackVolume[i] * trackVolume);
		}
	}

	this.getVolume = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		evaluateCurrentTrack();
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].setTime(time);
		}
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLayersLoop(trackList) {//Plays all list-items together, controls volumes, loops
	var musicTrack = [];
	var musicTrackVolume = [];
	var trackVolume = 1;
	var currentTrack = 0;
	this.name = "musicContainerLayersLoop";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrackVolume[i] = 1;
		musicTrack[i].setVolume(1);
	}

	function evaluateCurrentTrack(){
		var trackNow = 0;
		for(var i = musicTrack.length-1; i >= 0; i--) {
			if (!musicTrack[i].getPaused()) {
				trackNow = i;
			}
		}
		currentTrack = trackNow;
	}

	function tracksToPlay() {
		for(var i in musicTrackVolume) {
			if(musicTrackVolume[i] > 0) {
				return true;
			}
		}
		return false;
	}

	this.play = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			this.play();
		}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicTrackVolume[slot] = level;
		if (musicTrack[slot].getPaused()) {
			var timeNow = musicTrack[0].getTime();
			var tracksPlaying = 0;
			for(var i in musicTrack) {
				if (!musicTrack[i].getPaused()) {
					timeNow = musicTrack[i].getTime();
					tracksPlaying++;
				}
			}
			if (tracksPlaying > 0) {
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
				musicTrack[slot].playFrom(timeNow);
			} else {
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(musicTrack[slot], fadeTime, musicTrackVolume[slot] * trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack.getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) { //Needs a look
		evaluateCurrentTrack();
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, musicTrackVolume[slot] *  trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		musicTrackVolume.push(0);
		newTrack.setVolume(0);
	}

	this.removeTrack = function(slot) {
		evaluateCurrentTrack();
		musicTrack.splice(slot,1);
		musicTrackVolume.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (var i in musicTrack) {
			musicTrack[i].setVolume(musicTrackVolume[i] * trackVolume);
		}
	}

	this.getVolume = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		evaluateCurrentTrack();
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerSequence(trackList) {//Plays list-items in order
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerSequence";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack++;
			if (currentTrack >= musicTrack.length) {
				currentTrack = 0;
			}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerSequenceLatch(trackList) {//Plays list-items in order, but stays on current one until indicated
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerSequenceLatch";
	var latched = true;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (!latched) {
				currentTrack++;
				latched = true;
			}
			if (currentTrack >= musicTrack.length) {currentTrack = 0;}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerSequenceLatchLast(trackList) {//Plays list-items in order, stays on last item
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerSequenceLatchLast";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (currentTrack < musicTrack.length - 1) {
				currentTrack++;
			}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylist(trackList) {//Plays through list-items in order
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerPlaylist";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack++;
			if (currentTrack < musicTrack.length) {
				this.play();
			} else {
				currentTrack = 0;
			}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoop(trackList) {//Loops through list-items in order
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerPlaylistLoop";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentTrack++;
			if (currentTrack >= musicTrack.length) {currentTrack = 0;}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLatch(trackList) {//Plays through list-items in order, but loops current one until indicated
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerPlaylistLoopLatch";
	var latched = true;
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (!latched) {
				currentTrack++;
				latched = true;
			}
			if (currentTrack >= musicTrack.length) {currentTrack = 0;}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLast(trackList) {//Plays through list-items in order, loops last item
	var musicTrack = [];
	var currentTrack = 0;
	this.name = "musicContainerPlaylistLoopLast";
	var trackVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (currentTrack < musicTrack.length - 1) {
				currentTrack++;
			}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(trackVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}
