import { SpriteType } from "./SpriteType";

/**
 * Graphic Object (Sprite) -
 * will be used by the canvas screen as an object to render in animation
 */
export class Sprite{
    constructor({objID, posX, posY, width, height, imageSource, animations, frames = 1, frameBuffer = 3, loop = true, autoPlay = true, scale=1, imageSmoothingEnabled = false, type = SpriteType.OBJECT}){
        this.objID = objID;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.type = type;

        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
            this.width = this.image.width / this.frames;
            this.height = this.image.height;
        }

        this.image.src = imageSource;
        this.loaded = false;
        this.frames = frames;
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        this.frameBuffer = frameBuffer;
        this.animations = animations;
        this.loop = loop;
        this.autoPlay = autoPlay;
        this.currentAnimation;
        this.scale = scale;
        this.imageSmoothingEnabled = false;

        if(this.animations){
            for(let key in this.animations){
                const image = new Image();
                image.src = this.animations[key].imageSrc;
                this.animations[key].image = image;
            }
        }
    }

    draw(context){
        if(!this.loaded) return;
        const cropBox = {
            x: this.width * this.currentFrame,
            y: 0,
            witdh: this.width
        }

        context.imageSmoothingEnabled = this.imageSmoothingEnabled;
        context.drawImage(
            this.image, 
            this.width * this.currentFrame,
            0,
            this.width,
            this.height,
            this.posX,
            this.posY,
            this.width*this.scale,
            this.height*this.scale
        );

        this.updateFrames();
    }

    update(context){
        this.draw(context);
    }

    play(){
        this.autoPlay = true;
    }

    updateFrames(){
        if(!this.autoPlay) return;
        this.elapsedFrames++;
        if(this.elapsedFrames % this.frameBuffer === 0){
            if(this.currentFrame < this.frames - 1) this.currentFrame++;
            else if(this.loop) this.currentFrame = 0;
        }
    }
}