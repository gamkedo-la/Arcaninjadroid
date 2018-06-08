
// Similar to the Input module, this static Images module keeps loaded images in a dictionary, with the keys being what was entered in "fileNames" without the directory names and file extensions.
// Essentially, edit the fileNames array with all your image paths, then access them with Images.getImg(nameOnly)
//
// Example: viewtiful.jpg in filenames ---> var joeTheHero = Images.getImage("viewtiful");
//
// ---> This implies string comparisons, ie don't pull and draw directly from the dict each frame.
// Instead, give the reference to an object, for example player.sprite = Images.getImg("player"), then draw player.sprite
// If there is no object oriented design in the game, you could discard this module and use the standard club Imageloading.js method, or you could pull directly from the dict anyway (should be fine really)

// If there are issues with how the OS handles file directories (for example if the "/" does not work for whatever reason) please tell me! :O

// Made by your friend Remy :) (based on the usual script from Chris)

function Images() {

    var imageDict = [];
    console.log("Initializing Images module.");

    for (var i = 0, len = fileNames.length; i < len; i++) {

        // Cuts up the path to extract the image name, and adds it in the dict
        var splitArray = fileNames[i].split("/");
        var imgName = splitArray[splitArray.length - 1].split(".")[0];

        var img = document.createElement("img");
        imageDict[imgName] = img; //the spot is being kept by a dummy image; we will load it later
    }

    Images.loadImages = function () {
        console.log("");
        for (var i = 0, len = fileNames.length; i < len; i++) {

            // We did this already above, but this time we are loading the images
            // (ie giving all placeholder images their .src)
            var splitArray = fileNames[i].split("/");
            var imgName = splitArray[splitArray.length - 1].split(".")[0];

            imageDict[imgName].src = fileNames[i];

            console.log("Added '" + imgName + "' with path: " + fileNames[i]); // feel free to comment if this annoys you

            // The ordering of these lines might cause problems(?)
            img.onload = countLoadedImagesAndLaunchIfReady();

        }
    }

    Images.getImage = function (name) {

        try {
            var image = imageDict[name];
            if (typeof image === "undefined") {
                throw "Error: Did not find image with name '" + name + "'. Check Images module fileNames";
            }
        }
        catch (err) {
            console.log(err);
        }
        return imageDict[name];
    }

}

//////////////    Your file names go here    ////////////////
var fileNames = [

    // VFX
    "images/VFX/testTexture.png",
    "images/VFX/wooshTrail.png",

    //Backgrounds
    "images/Backgrounds/moonlitForest.png",

    //UI and menu art
    "images/UI/PH_menuScreen.png",

    //Player anims
    "images/Characters/Player/PH_Android_Punch.png",
    "images/Characters/Player/playerUppercut.png",
    "images/Characters/Player/playerIdle.png",
    "images/Characters/Player/playerCrouch.png",



];

var picsToLoad = fileNames.length;

function countLoadedImagesAndLaunchIfReady() {
    picsToLoad--;
    if (picsToLoad == 0) {
        imageLoadingDoneSoStartGame();
    }
}

//Load images must be called in window.onload (Main.js)
Images();