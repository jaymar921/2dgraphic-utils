import { CanvasScreen } from "./CanvasScreen";
import { Sprite } from "./Sprite";
import { SpriteType } from "./SpriteType";

/**
 * This function only triggers when a mouse clicked on the screen hitting an object's hitbox. It will also return the position of the mouse within the CanvasScreen
 * @param {MouseEvent} event
 * @param {CanvasScreen} screen
 */
export function HandleScreenClickedEvent(event, screen) {
  if (!screen.onCanvasClickedEvent) return;
  if (screen.dragging) return; // FIX: now correctly reads screen.dragging (set by HandleCameraMovement)

  // FIX: correct world-space mouse position — divide screen coordinate by scale first, then add offset
  // Previously was: offsetX + cameraOffset.x * globalScale (wrong order of operations)
  const mousePosition = {
    x: event.offsetX / screen.globalScale + CanvasScreen.cameraOffset.x,
    y: event.offsetY / screen.globalScale + CanvasScreen.cameraOffset.y,
  };

  const ObjectClicked = {
    objID: null,
    type: SpriteType.AIR,
    mousePosition,
    layers: [],
  };

  screen.canvasObjects.forEach((sprite) => {
    if (InHitbox(sprite, mousePosition)) {
      // FIX: no longer passing globalScale, hitbox is now in world space
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
 * Check if a world-space mouse position is inside a sprite's hitbox.
 * Both the mouse position and sprite position are now in the same world space,
 * so no scale factor is needed here.
 * @param {Sprite} sprite
 * @param {{x: Number, y: Number}} mousePosition  — already converted to world space
 */
function InHitbox(sprite, mousePosition) {
  // FIX: removed globalScale multiplication — positions are now compared in world space,
  // so the check is consistent regardless of zoom level
  const minX = sprite.posX;
  const maxX = minX + sprite.width * sprite.scale;
  const minY = sprite.posY;
  const maxY = minY + sprite.height * sprite.scale;

  const { x, y } = mousePosition;

  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 *
 * @param {HTMLElement} canvasElement
 * @param {CanvasScreen} screen
 */
export function HandleCameraMovement(canvasElement, screen) {
  let initialMousePos = { x: 0, y: 0 };
  // Use a movement threshold instead of a timing hack.
  // screen.dragging is only set to true once the pointer has actually moved
  // at least DRAG_THRESHOLD pixels, so a clean tap/click never gets suppressed.
  const DRAG_THRESHOLD = 4;
  let mouseIsDown = false;

  // Mouse events
  canvasElement.addEventListener("mousedown", (e) => {
    if (!screen.captureCameraMovement) return;
    mouseIsDown = true;
    screen.dragging = false; // not a drag yet — only becomes one if the mouse moves enough
    initialMousePos = { x: e.offsetX, y: e.offsetY };
  });

  canvasElement.addEventListener("mousemove", (e) => {
    if (!screen.captureCameraMovement || !mouseIsDown) return;

    const deltaX = e.offsetX - initialMousePos.x;
    const deltaY = e.offsetY - initialMousePos.y;

    // Only start panning once the pointer has moved beyond the threshold
    if (!screen.dragging) {
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (dist < DRAG_THRESHOLD) return;
      screen.dragging = true;
    }

    CanvasScreen.cameraOffset.x -= deltaX / screen.globalScale;
    CanvasScreen.cameraOffset.y -= deltaY / screen.globalScale;

    CanvasScreen.fixedCameraOffset.x -= deltaX;
    CanvasScreen.fixedCameraOffset.y -= deltaY;

    initialMousePos = { x: e.offsetX, y: e.offsetY };
  });

  canvasElement.addEventListener("mouseup", () => {
    mouseIsDown = false;
    // Clear dragging synchronously — the click event fires right after mouseup
    // in the same task, so screen.dragging must already be false by then for
    // normal taps to reach HandleScreenClickedEvent.
    screen.dragging = false;
  });

  canvasElement.addEventListener("mouseleave", () => {
    mouseIsDown = false;
    screen.dragging = false;
  });

  // Touch events
  canvasElement.addEventListener(
    "touchstart",
    (e) => {
      if (!screen.captureCameraMovement) return;
      const touch = e.touches[0];
      const rect = canvasElement.getBoundingClientRect();
      initialMousePos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
      mouseIsDown = true;
      screen.dragging = false;
    },
    { passive: true },
  );

  canvasElement.addEventListener(
    "touchmove",
    (e) => {
      if (!screen.captureCameraMovement || !mouseIsDown) return;

      const touch = e.touches[0];
      const rect = canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const deltaX = touchX - initialMousePos.x;
      const deltaY = touchY - initialMousePos.y;

      if (!screen.dragging) {
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (dist < DRAG_THRESHOLD) return;
        screen.dragging = true;
      }

      CanvasScreen.cameraOffset.x -= deltaX / screen.globalScale;
      CanvasScreen.cameraOffset.y -= deltaY / screen.globalScale;

      CanvasScreen.fixedCameraOffset.x -= deltaX;
      CanvasScreen.fixedCameraOffset.y -= deltaY;

      initialMousePos = { x: touchX, y: touchY };

      e.preventDefault();
    },
    { passive: false },
  );

  canvasElement.addEventListener(
    "touchend",
    () => {
      mouseIsDown = false;
      screen.dragging = false;
    },
    { passive: true },
  );

  canvasElement.addEventListener(
    "touchcancel",
    () => {
      mouseIsDown = false;
      screen.dragging = false;
    },
    { passive: true },
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
  } else {
    screen.globalScale += screen.zoomSpeed;
  }

  // FIX: clamp to avoid floating point drift at extreme zoom levels
  screen.globalScale = parseFloat(screen.globalScale.toFixed(4));

  const { width, height } = screen.canvasElement;
  const zoomRatio = screen.globalScale / prevGlobalScale;
  const { x, y } = screen.getCameraOffset();

  const centerX =
    (CanvasScreen.fixedCameraOffset.x +
      (CanvasScreen.fixedCameraOffset.x + width)) /
    2;
  const centerY =
    (CanvasScreen.fixedCameraOffset.y +
      (CanvasScreen.fixedCameraOffset.y + height)) /
    2;

  const newX = centerX - (centerX - x) / zoomRatio;
  const newY = centerY - (centerY - y) / zoomRatio;
  screen.setCameraOffset(newX, newY);

  // FIX: propagate new scale to all sprites via the proper setter
  screen.setGlobalScale(screen.globalScale);

  if (screen.onCanvasZoomEvent) {
    for (const func of screen.onCanvasZoomEvent)
      func({ globalScale: screen.globalScale, event });
  }

  event.preventDefault();
}
