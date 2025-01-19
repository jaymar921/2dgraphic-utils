import { SpriteType } from "./SpriteType";

/**
 * Graphic Object (Sprite) -
 * will be used by the canvas screen as an object to render in animation
 */
export class Sprite{
    /**
     * 
     * @param {Object} param0 Sprite Properties
     * @param {string} param0.objID Name of the sprite object
     * @param {Number} param0.posX X position of Sprite in CanvasScreen
     * @param {Number} param0.posY Y position of Sprite in CanvasScreen
     * @param {Number} param0.width Width of the Sprite | will be used in hitbox
     * @param {Number} param0.height Height of the Sprite | will be used in hitbox
     * @param {string} param0.imageSource Image Source
     * @param {Number} param0.frames Total number of frames in the sprite image, default: 1
     * @param {Number} param0.frameBuffer Delay of current frame to next frame, default: 3
     * @param {Boolean} param0.loop Loop the sprite frames, default: true
     * @param {Boolean} param0.autoPlay Play the animation once the object is rendered, default: true
     * @param {Number} param0.scale Scale of image, default: 1
     * @param {Boolean} param0.imageSmoothingEnabled Render smooth image (not good on lower resolution images), default: false
     * @param {SpriteType} param0.type Type of object that classifies this sprite
     */
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
        this.imageSmoothingEnabled = imageSmoothingEnabled;

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