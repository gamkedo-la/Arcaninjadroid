
// Similar to the Input module, this static Images module keeps loaded images in a dictionary, with the keys being what was entered in "fileNames" without the directory names and file extensions.
// Essentially, edit the fileNames array with all your image paths, then access them with Images.getImg(nameOnly)
// viewtiful.jpg ---> var joeTheHero = Images.getImg("viewtiful")
//
// ---> This implies string comparisons, ie don't pull and draw directly from the dict each frame.
// Instead, give the reference to an object, for example player.sprite = Images.getImg("player"), then draw player.sprite
// If there is no object oriented design in the game, you could discard this module and use the standard club Imageloading.js method, or you could pull directly from the dict anyway and hope all works out! (should be fine really)

// If there are issues with how the OS handles file directories (for example if the "/" does not work for whatever reason) please tell me! :O

// Made by your friend Remy :) (with original script from the club of course)

function Images () {

    var imageDict = [];
    console.log("Initializing Images module.");

    Images.loadImages = function(){

        for (var i = 0, len = fileNames.length; i < len; i++) {

            var img = document.createElement("img");

            // Cuts up the path to extract the image name, and adds it in the dict
            var splitArray = fileNames[i].split("/");
            var imgName = splitArray[splitArray.length - 1].split(".")[0];
            imageDict[imgName] = img;

            console.log("Added " + imgName + " with path: " + fileNames[i]);
            
            // The ordering of these lines might cause problems(?)
            img.onload = countLoadedImagesAndLaunchIfReady();
            img.src = fileNames[i];
            
        }
    }

    Images.getImage = function (name) {

        try {
            var image = imageDict[name];
            if (typeof image === "undefined") {
                throw "Error: image with name '" + name + "' not found. Check Images module fileNames";
            }
        }
        catch (err){
            console.log(err);
        }

        return imageDict[name];
    }

}
// IMPORTANT: The constructor, Images(), as well as Images.loadImages(), must be called in the Main.js file, after the game is started and canvas created

// Your file names go here
var fileNames = [

    "images/viewtiful.jpg",
    "images/testTexture.png",
    "images/bayo.jpg"

];

var picsToLoad = fileNames.length;

function countLoadedImagesAndLaunchIfReady(){
    picsToLoad--;
    if (picsToLoad == 0){
        imageLoadingDoneSoStartGame();
    }
}
