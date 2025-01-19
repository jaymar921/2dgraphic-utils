import { CanvasScreen } from "./CanvasScreen"
import { Sprite } from "./Sprite"
import { SpriteType } from "./SpriteType"

/**
 * This function only triggers when a mouse clicked on the screen hitting an object's hitbox. Note that it will not trigger on sprite type of 'BACKGROUND', 'PASSABLE' and 'AIR'.
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
            if(sprite.type === SpriteType.AIR || sprite.type === SpriteType.BACKGROUND || sprite.type === SpriteType.PASSABLE) return;
            ObjectClicked.spriteId = sprite.objID;
            ObjectClicked.type = sprite.type
            screen.onCanvasClickedEvent(ObjectClicked);
        }
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