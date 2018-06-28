
function UIElement (initX,initY, image) {

    let x = initX;
    let y = initY;
    this.image = image;

    let width;
    let height;
    

    this.hasFocus = false;
    this.notSelectable = true;

    this.draw = function () {

        width = this.image.width;
        height = this.image.height;
        if ( width === 0 || height === 0) {return;} //something is horribly wrong here

        if (this.notSelectable) {
            tintCanvas.width = width;
            tintCanvas.height = height;

            
            tintContext.drawImage(this.image, 0,0, width,height);
            tintContext.globalCompositeOperation = "source-atop";
            tintContext.fillStyle = "rgba(0,0,0,0.65)";
            tintContext.fillRect(0,0, tintCanvas.width,tintCanvas.height);
            tintContext.globalCompositeOperation = "source-over";
            canvasContext.drawImage(tintCanvas, x-width/2, y-height/2, width, height);
        }

        else {

            if (this.hasFocus) {
                width *= 1.2;
                height *= 1.2;
            }
            canvasContext.drawImage(this.image, x-width/2,y-height/2, width,height);
        }
        

            
    }


    this.getX = function () {
        return x;
    }
    this.getY = function () {
        return y;
    }
    this.setX = function (newX) {
        x = newX;
    }
    this.setY = function (newY) {
        y = newY;
    }
};