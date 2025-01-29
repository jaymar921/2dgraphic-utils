import { SpriteType } from "./SpriteType";

/**
 * Graphic Object (Sprite) -
 * will be used by the canvas screen as an object to render in animation
 */
export class Sprite{
    /**
     * 
     * @param {Object} param0 Sprite Properties
     * @param {string} param0.objID Unique Identifier of the Sprite Object
     * @param {string} param0.name Name for the Sprite Object
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
    constructor({objID, name, posX, posY, width, height, imageSource, animations, frames = 1, frameBuffer = 3, loop = true, autoPlay = true, scale=1, imageSmoothingEnabled = false, type = SpriteType.OBJECT}){
        this.objID = objID;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.type = type;
        this.name = name;

        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
            this.width = this.image.width / this.frames;
            this.height = this.image.height;
        }

        this.animations = animations;

        this.image.src = imageSource;
        this.loaded = false;
        this.frames = frames;
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        this.frameBuffer = frameBuffer;
        this.loop = loop;
        this.autoPlay = autoPlay;
        this.currentAnimation;
        this.scale = scale;
        this.imageSmoothingEnabled = imageSmoothingEnabled;

        this.currentAnimation;

        if(this.animations){
            for(let key in this.animations){
                const image = new Image();
                image.src = this.animations[key].imageSource;
                this.animations[key].image = image;
            }
        }
    }

    switchAnimation(name){
        if(!this.animations[name]){
            console.error(`There's no animation with key '${name}'`)
            return;
        }
        if(this.image === this.animations[name].image)
            return;
        this.currentFrame = 0;
        this.image = this.animations[name].image;
        this.frames = this.animations[name]?.frames ?? this.frames;
        this.frameBuffer = this.animations[name]?.frameBuffer ?? this.frameBuffer;
        this.loop = this.animations[name]?.loop ?? this.loop;
        this.currentAnimation = this.animations[name]
    }

    pause(){
        this.autoPlay = false;
    }

    draw(context, offset = { x : 0, y : 0}){
        if(!this.loaded) return;
        context.imageSmoothingEnabled = this.imageSmoothingEnabled;
        context.drawImage(
            this.image, 
            this.width * this.currentFrame,
            0,
            this.width,
            this.height,
            this.posX - offset.x,
            this.posY - offset.y,
            this.width*this.scale,
            this.height*this.scale
        );
        
        this.updateFrames();
    }

    update(context, offset){
        this.draw(context, offset);
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

        if(this.currentAnimation?.onComplete){
            if(this.currentFrame === this.frames - 1 && !this.currentAnimation.isActive){
                this.currentAnimation.onComplete();
                this.currentAnimation.isActive = true;
            }  
        }
    }
}