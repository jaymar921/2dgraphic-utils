import { CanvasScreen } from "./CanvasScreen";
import { Sprite } from "./Sprite";
import { SpriteType } from "./SpriteType";

/**
 * This function only triggers when a mouse clicked on the screen hitting an object's hitbox. It will also return the position of the mouse within the CanvasScreen
 * @param {MouseEvent} event
 * @param {CanvasScreen} screen
 * @param {Function} callback
 */
export function HandleScreenClickedEvent(event, screen) {
  // check if callback function is not null
  if (!screen.onCanvasClickedEvent) return;
  if (screen.dragging) return;
  // grab the clicked position
  const mousePosition = {
    x: event.offsetX + CanvasScreen.cameraOffset.x * screen.globalScale,
    y: event.offsetY + CanvasScreen.cameraOffset.y * screen.globalScale,
  };

  const ObjectClicked = {
    objID: null,
    type: SpriteType.AIR,
    mousePosition,
    layers: [],
  };

  screen.canvasObjects.forEach((sprite) => {
    if (InHitbox(sprite, mousePosition, screen.globalScale)) {
      ObjectClicked.objID = sprite.objID;
      ObjectClicked.type = sprite.type;

      const { posX, posY, name, width, height } = sprite;

      const layer = {
        objID: sprite.objID,
        type: sprite.type,
        sprite: { posX, posY, name, width, height },
      };

      ObjectClicked.layers.push(layer);
    }
  });

  for (const func of screen.onCanvasClickedEvent) {
    func(ObjectClicked);
  }
}

/**
 *
 * @param {Sprite} sprite
 * @param {{x: Number, y: Number}} mousePosition
 */
function InHitbox(sprite, mousePosition, globalScale) {
  const minX = sprite.posX * globalScale;
  const maxX = minX + sprite.width * sprite.scale * globalScale;
  const minY = sprite.posY * globalScale;
  const maxY = minY + sprite.height * sprite.scale * globalScale;

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
export function HandleCameraMovement(canvasElement, screen) {
  let initialMousePos = { x: 0, y: 0 };
  let dragging = false;

  // Mouse events
  canvasElement.addEventListener("mousedown", (e) => {
    if (!screen.captureCameraMovement) return;

    dragging = true;
    initialMousePos = { x: e.offsetX, y: e.offsetY };
  });

  canvasElement.addEventListener("mousemove", (e) => {
    if (!screen.captureCameraMovement || !dragging) return;

    const deltaX = e.offsetX - initialMousePos.x;
    const deltaY = e.offsetY - initialMousePos.y;

    CanvasScreen.cameraOffset.x -= deltaX;
    CanvasScreen.cameraOffset.y -= deltaY;

    CanvasScreen.fixedCameraOffset.x -= deltaX;
    CanvasScreen.fixedCameraOffset.y -= deltaY;

    initialMousePos = { x: e.offsetX, y: e.offsetY };
  });

  canvasElement.addEventListener("mouseup", () => {
    dragging = false;
  });

  canvasElement.addEventListener("mouseleave", () => {
    dragging = false;
  });

  // Touch events
  canvasElement.addEventListener(
    "touchstart",
    (e) => {
      if (!screen.captureCameraMovement) return;

      const touch = e.touches[0];
      initialMousePos = { x: touch.clientX, y: touch.clientY };
      dragging = true;
    },
    { passive: true }
  );

  canvasElement.addEventListener(
    "touchmove",
    (e) => {
      if (!screen.captureCameraMovement || !dragging) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - initialMousePos.x;
      const deltaY = touch.clientY - initialMousePos.y;

      CanvasScreen.cameraOffset.x -= deltaX;
      CanvasScreen.cameraOffset.y -= deltaY;

      CanvasScreen.fixedCameraOffset.x -= deltaX;
      CanvasScreen.fixedCameraOffset.y -= deltaY;

      initialMousePos = { x: touch.clientX, y: touch.clientY };

      e.preventDefault();
    },
    { passive: false }
  );

  canvasElement.addEventListener(
    "touchend",
    () => {
      dragging = false;
    },
    { passive: true }
  );

  canvasElement.addEventListener(
    "touchcancel",
    () => {
      dragging = false;
    },
    { passive: true }
  );
}

/**
 * Handles camera zoom
 *
 * @param {WheelEvent} event
 * @param {CanvasScreen} screen
 */
export function HandleCameraZoom(event, screen) {
  if (!screen.screenZoom) return;

  const prevGlobalScale = screen.globalScale;

  if (event.deltaY > 0) {
    if (screen.globalScale > 0.2) screen.globalScale -= screen.zoomSpeed;
  } else screen.globalScale += screen.zoomSpeed;

  const { width, height } = screen.canvasElement;

  const zoomValue = parseFloat(screen.globalScale);
  const { x, y } = screen.getCameraOffset();

  const centerX =
    (CanvasScreen.fixedCameraOffset.x +
      (CanvasScreen.fixedCameraOffset.x + width)) /
    2;
  const centerY =
    (CanvasScreen.fixedCameraOffset.y +
      (CanvasScreen.fixedCameraOffset.y + height)) /
    2;

  const newX = centerX - (centerX - x) / (zoomValue / prevGlobalScale);
  const newY = centerY - (centerY - y) / (zoomValue / prevGlobalScale);
  screen.setCameraOffset(newX, newY);

  if (screen.onCanvasZoomEvent) {
    for (const func of screen.onCanvasZoomEvent)
      func({ globalScale: screen.globalScale, event });
  }

  event.preventDefault(); // Prevent default scroll behavior
}
