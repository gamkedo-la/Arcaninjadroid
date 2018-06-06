
function drawBitmapWithRotation(useBitmap, atX, atY, withAng) {

    canvasContext.save();
    canvasContext.translate(atX, atY);
    canvasContext.rotate(withAng);
    canvasContext.drawImage(useBitmap, -useBitmap.width / 2, -useBitmap.height / 2);
    canvasContext.restore();

}

// rotates and stretches a bitmap to go from point A to point B, used by Woosh Lines FX
function drawBitmapLine(useBitmap, startX, startY, endX, endY) {
    canvasContext.save();
    canvasContext.translate(startX, startY);
    canvasContext.rotate(Math.atan2(startY - endY, startX, endX));
    var lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    canvasContext.drawImage(useBitmap, 0, 0, useBitmap.width, useBitmap.height, startX, startY, lineLength, useBitmap.height);
    canvasContext.restore();
}

// 10/10 for descriptive function naming :D
function drawBitmapClippedWithRotationAndFlip(useBitmap, x, y, clipStartX, clipStartY, clipWidth, clipHeight, withAng, flipX) {

    canvasContext.save();
    canvasContext.translate(x, y);
    if (flipX) {
        canvasContext.scale(-1, 1);
    }
    canvasContext.rotate(withAng);
    canvasContext.drawImage(useBitmap,
        clipStartX, clipStartY, clipWidth, clipHeight,
        -clipWidth / 2, -clipHeight / 2, clipWidth, clipHeight);
    canvasContext.restore();

}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {

    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorRectScaled(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {

    scaledContext.fillStyle = fillColor;
    scaledContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true); //Début, fin, horaire ou anti horaire
    canvasContext.fill();
}

// Accepted formats for fillColorAlpha: standard named color string (alpha = 1) or [r,g,b,a] 
//Used in conjunction with the ParticleRenderer
function colorCircleAlpha(centerX, centerY, radius, fillColorAlpha) {

    // Support for the default named colors like "purple"
    if (Array.isArray(fillColorAlpha) === false) {
        canvasContext.fillStyle = fillColorAlpha;
    } else {
        canvasContext.fillStyle = "rgba(" + fillColorAlpha[0] + "," + fillColorAlpha[1] + "," + fillColorAlpha[2] + "," + fillColorAlpha[3] + ")";
    } //generate the color from the rgba array

    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true); //Début, fin, horaire ou anti horaire
    canvasContext.fill();

}

function colorText(showWords, textX, textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}

function colorText2(showWords, textX, textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}
