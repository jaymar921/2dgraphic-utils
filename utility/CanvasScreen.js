import { HandleCameraMovement, HandleScreenClickedEvent } from "./EventHandler";
import { sleep } from "./HandlerUtils";
import { Sprite } from "./Sprite";

export class CanvasScreen{
    static context;
    static screen;
    static animationId = 0;
    static screenMoving;
    /**
     * 
     * @param {string} canvasId ID of the canvas element
     * @param {Number} width Custom width of the canvas screen | default: 640px
     * @param {Number} height Custom height of the canvas screen | default: 360px
     * @param {string} background Set the background style of the canvas element | default: 'black'
     */
    constructor(canvasId, width = 640, height = 360, background = "black"){
        const canvEl = document.getElementById(canvasId);

        // throw error if the canvas element requirement was not met
        if(!canvEl) throw new Error(`Couldn't find an element with an ID '${canvasId}'...`);
        if(!canvEl.tagName.toLocaleLowerCase().includes("canvas")) throw new Error(`Element with ID '${canvasId}' should be a canvas element...`);

        canvEl.style.background = background;
        this.width = width;
        this.height = height;

        if(width && height){
            canvEl.width = width;
            canvEl.height = height;
        }

        CanvasScreen.context = canvEl.getContext('2d');
        CanvasScreen.screen = this;
        this.canvasObjects = [];

        // Event Handler
        canvEl.addEventListener('click', (e)=>HandleScreenClickedEvent(e, this));
        HandleCameraMovement(canvEl, this);

        CanvasScreen.animate(this);
    }

    /**
     * 
     * @param {Sprite} obj A sprite object to render on screen
     */
    registerObject(obj){
        this.canvasObjects.push(obj);
    }

    /**
     * 
     * @param {string} objectId Remove a sprite object that is rendered on screen
     */
    unregisterObject(objectId){
        const newArr = this.canvasObjects.filter(o => o.objID !== objectId);
        this.canvasObjects = newArr;
    }

    /**
     * 
     * @param {string} objectId Get a sprite object that is rendered on screen
     * @returns {Sprite | null}
     */
    getRegisteredObject(objectId){
        const newArr = this.canvasObjects.filter(o => o.objID === objectId);
        if(newArr.length > 0) return newArr[0];
        return null;
    }

    /**
     * Returns a list of registered sprite objects that was rendered on screen
     * @returns {Array<Sprite>}
     */
    getAllRegisteredObjects(){
        return this.canvasObjects;
    }

    /**
     * This triggers a callback function that can be used when a mouse cursor clicked on an object's hitbox inside the CanvasScreen (Basically an interaction). It will also return the position of the mouse in the CanvasScreen.
     * @param {Function} callback 
     */
    handleScreenClickedEvent(callback){
        this.onCanvasClickedEvent = callback;
    }

    /**
     * Enable Camera Movement using mouse drag
     * @param {boolean} arg 
     */
    enableScreenDrag(arg){
        this.captureCameraMovement = arg;
    }

    static animate(){
        CanvasScreen.animationId = requestAnimationFrame(CanvasScreen.animate);
        
        if(!CanvasScreen.context) return;
        if(!CanvasScreen.screen) return;

        const screen = CanvasScreen.screen;
        const context = CanvasScreen.context;

        // clear the whole screen
        context.clearRect(0, 0, screen.width, screen.height);

        //render the sprites
        const canvasObjects = screen.canvasObjects;
        for(const obj of canvasObjects){
            obj.draw(context);
        }
    }
}