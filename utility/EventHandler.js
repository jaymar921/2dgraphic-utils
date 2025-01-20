import { CanvasScreen } from "./CanvasScreen"
import { sleep } from "./HandlerUtils";
import { Sprite } from "./Sprite"
import { SpriteType } from "./SpriteType"

/**
 * This function only triggers when a mouse clicked on the screen hitting an object's hitbox. It will also return the position of the mouse within the CanvasScreen
 * @param {MouseEvent} event 
 * @param {CanvasScreen} screen
 * @param {Function} callback
 */
export function HandleScreenClickedEvent(event, screen){
    // check if callback function is not null
    if(!screen.onCanvasClickedEvent) return;
    if(screen.dragging) return;
    console.log("clicked")
    // grab the clicked position
    const mousePosition = {
        x: event.offsetX,
        y: event.offsetY
    }
    //alert(`position { x: ${mousePosition.x}, y: ${mousePosition.y} }`)
    screen.canvasObjects.forEach(sprite => {
        const ObjectClicked = {
            objID: null,
            type: SpriteType.AIR,
            mousePosition
        }
        if(InHitbox(sprite, mousePosition)){
            ObjectClicked.objID = sprite.objID;
            ObjectClicked.type = sprite.type
        }
        
        screen.onCanvasClickedEvent(ObjectClicked);
    })
}

/**
 * 
 * @param {Sprite} sprite 
 * @param {{x: Number, y: Number}} mousePosition 
 */
function InHitbox(sprite, mousePosition){
    const minX = sprite.posX;
    const maxX = minX + sprite.width * sprite.scale;
    const minY = sprite.posY;
    const maxY = minY + sprite.height * sprite.scale;

    const x = mousePosition.x;
    const y = mousePosition.y;

    // check if mousePosition is inside the hitbox
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 * 
 * @param {HTMLElement} canvasElement 
 * @param {CanvasScreen} screen
 */
export function HandleCameraMovement(canvasElement, screen){
    let mousePos = { x: 0, y: 0 };
    let initialMousePos = { x: 0, y: 0 };
    let initialObjectPositions = [];

    // For touch events, we will use the first touch point (index 0).
    const getTouchPosition = (e) => {
        const touch = e.touches[0];
        return { x: touch.clientX, y: touch.clientY };
    };

    // Handle mouse events
    canvasElement.addEventListener('mousedown', async (e) => {
        if (!screen.captureCameraMovement) return;
        await sleep(100);

        screen.dragging = true;
        mousePos.x = e.offsetX;
        mousePos.y = e.offsetY;

        initialMousePos.x = mousePos.x;
        initialMousePos.y = mousePos.y;
        
        // store the objects position
        initialObjectPositions = screen.canvasObjects.map(obj => ({
            objID: obj.objID,
            x: obj.posX,
            y: obj.posY
        }));
    });

    canvasElement.addEventListener('mouseup', async (e) => {
        if (!screen.captureCameraMovement) return;
        await sleep(100);

        CanvasScreen.screenMoving = false;
        screen.dragging = false;
        initialObjectPositions = [];
    });

    canvasElement.addEventListener('mousemove', async e => {
        if (!screen.captureCameraMovement || !screen.dragging) return;
        CanvasScreen.screenMoving = true;

        const { offsetX, offsetY } = e;

        const deltaX = offsetX - initialMousePos.x;
        const deltaY = offsetY - initialMousePos.y;

        // Update object positions based on the delta
        for (let i = 0; i < screen.canvasObjects.length; i++) {
            const obj = screen.canvasObjects[i];
            const initialPos = initialObjectPositions.find(o => o.objID === obj.objID);
            
            if (initialPos) {
                // Move the object by the calculated delta
                obj.posX = initialPos.x + deltaX;
                obj.posY = initialPos.y + deltaY;
            }
        }
    });

    // Handle touch events for mobile support
    canvasElement.addEventListener('touchstart', async (e) => {
        if (!screen.captureCameraMovement) return;
        await sleep(100);

        screen.dragging = true;
        const touchPos = getTouchPosition(e);
        mousePos.x = touchPos.x;
        mousePos.y = touchPos.y;

        initialMousePos.x = mousePos.x;
        initialMousePos.y = mousePos.y;

        // store the objects position
        initialObjectPositions = screen.canvasObjects.map(obj => ({
            objID: obj.objID,
            x: obj.posX,
            y: obj.posY
        }));
        
        // Prevent default touch behavior (e.g., scrolling)
        e.preventDefault();
    });

    canvasElement.addEventListener('touchend', async (e) => {
        if (!screen.captureCameraMovement) return;
        await sleep(100);

        CanvasScreen.screenMoving = false;
        screen.dragging = false;
        initialObjectPositions = [];

        // Prevent default touch behavior (e.g., scrolling)
        e.preventDefault();
    });

    canvasElement.addEventListener('touchmove', async e => {
        if (!screen.captureCameraMovement || !screen.dragging) return;
        CanvasScreen.screenMoving = true;

        const touchPos = getTouchPosition(e);

        const deltaX = touchPos.x - initialMousePos.x;
        const deltaY = touchPos.y - initialMousePos.y;

        // Update object positions based on the delta
        for (let i = 0; i < screen.canvasObjects.length; i++) {
            const obj = screen.canvasObjects[i];
            const initialPos = initialObjectPositions.find(o => o.objID === obj.objID);
            
            if (initialPos) {
                // Move the object by the calculated delta
                obj.posX = initialPos.x + deltaX;
                obj.posY = initialPos.y + deltaY;
            }
        }

        // Prevent default touch behavior (e.g., scrolling)
        e.preventDefault();
    });
}