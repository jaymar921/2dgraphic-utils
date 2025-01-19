import { CanvasScreen } from "./CanvasScreen"
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
    // grab the clicked position
    const mousePosition = {
        x: event.offsetX,
        y: event.offsetY
    }
    //alert(`position { x: ${mousePosition.x}, y: ${mousePosition.y} }`)
    screen.canvasObjects.forEach(sprite => {
        const ObjectClicked = {
            spriteId: null,
            type: SpriteType.AIR,
            mousePosition
        }
        if(InHitbox(sprite, mousePosition)){
            ObjectClicked.spriteId = sprite.objID;
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