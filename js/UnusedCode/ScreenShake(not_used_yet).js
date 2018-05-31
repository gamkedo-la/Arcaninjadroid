// SCREENSHAKE - a simple html element wiggler for "juice"
// made for gamkedo with love from mcfunkypants

var screen_shakes = 0; // frames of screenshake used as player feedback for when we take damage
var screen_shake_pivot_x = 0;
var screen_shake_pivot_y = 0;
var screen_shake_me = document.getElementById('gameCanvas');
var braceYourselves  = [];
var shook = false; //Is screen being shaken this frame (prevent delayed multi-shakes)

function screenshake(howMany, delayFrames)
{
    if (!delayFrames) delayFrames = 0; // deal with undefined

    var myShake = [howMany, delayFrames];
	// console.log('screenshake ' + howmany);
	if (!screen_shake_me)
	{
		console.log('ERROR: screenshake does not know which element to shake!')
		return;
	}
	screen_shake_pivot_x = 0;
	screen_shake_pivot_y = 0;

    //screen_shakes = howmany;
	braceYourselves.push(myShake);
}

function updateScreenshake()
{
	if (!screen_shake_me) return; // sanity check

	braceYourselves.forEach(function (myShake, index) {
	    
	    myShake[1] -= 1;
	    if (myShake[1] <= 0 && shook === false) {
	        {
	            var shakesize = myShake[1] / 2;
	            if (shakesize > 20) shakesize = 20;

	            // shake around a pivot point
	            screen_shake_me.style.margin = "" + (screen_shake_pivot_x + Math.round((Math.random() * shakesize) - shakesize / 2) * 2) +
                            "px " + (screen_shake_pivot_y + Math.round((Math.random() * shakesize) - shakesize / 2) * 2) + "px";

	            myShake[0]--;
	            //console.log('screen_shakes:'+screen_shakes);

	            // about to finish? return to where we were when we started
	            if (myShake[0] < 1) {
	                //console.log('screenshakes done. going back to original position.')
	                screen_shake_me.style.margin = "0";
	                braceYourselves.splice(index, 1); //pop from the stash
	            }
	        }
	        shook = true;
	    }
	})

	shook = false;

	/*if (screen_shakes>0)
	{
		var shakesize = screen_shakes / 2;
		if (shakesize > 20) shakesize = 20;

		// shake around a pivot point
		screen_shake_me.style.margin = "" + (screen_shake_pivot_x + Math.round((Math.random() * shakesize) - shakesize / 2) * 2) + 
					"px " + (screen_shake_pivot_y + Math.round((Math.random() * shakesize) - shakesize / 2) * 2) + "px";

		screen_shakes--;
		//console.log('screen_shakes:'+screen_shakes);

		// about to finish? return to where we were when we started
		if (screen_shakes<1)
		{
			//console.log('screenshakes done. going back to original position.')
			screen_shake_me.style.margin = "0";
		}
	}*/
}
