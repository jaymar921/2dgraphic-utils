import {
  HandleCameraMovement,
  HandleCameraZoom,
  HandleScreenClickedEvent,
} from "./EventHandler";
import { Sprite } from "./Sprite";
import { SpriteType } from "./SpriteType";

export class CanvasScreen {
  static context;
  static screen;
  static animationId = 0;
  static lastFrameTime = 0; // FIX: initialize so first frame comparison doesn't yield NaN
  static cameraOffset = { x: 0, y: 0 }; // Camera offset for screen movement, affected on zoom
  static fixedCameraOffset = { x: 0, y: 0 }; // does not get affected on zoom, always relative to the screen movement and x,y position in canvas

  /**
   *
   * @param {string} canvasId ID of the canvas element
   * @param {Number} width Custom width of the canvas screen | default: 640px
   * @param {Number} height Custom height of the canvas screen | default: 360px
   * @param {string} background Set the background style of the canvas element | default: 'black'
   */
  constructor(canvasId, width = 640, height = 360, background = "black") {
    const canvEl = document.getElementById(canvasId);

    // throw error if the canvas element requirement was not met
    if (!canvEl)
      throw new Error(`Couldn't find an element with an ID '${canvasId}'...`);
    if (!canvEl.tagName.toLocaleLowerCase().includes("canvas"))
      throw new Error(
        `Element with ID '${canvasId}' should be a canvas element...`,
      );

    canvEl.style.background = background;
    this.width = width;
    this.height = height;

    if (width && height) {
      canvEl.width = width;
      canvEl.height = height;
    }

    CanvasScreen.context = canvEl.getContext("2d");
    CanvasScreen.screen = this;
    this.canvasObjects = [];
    this.staticCanvasObjects = [];
    this.globalScale = 1;
    this.zoomSpeed = 0.01;
    this.canvasElement = canvEl;
    this.dragging = false;
    this._backgrounds = []; // pre-allocated reusable arrays for Y-sort — cleared each frame, never GC'd
    this._sortables = [];
    this.behindOpacity = 0.5; // opacity applied to the object when it overlaps the player (Y-sort only)
    this.behindOpacityThreshold = 0.1; // minimum overlap percentage (0.0–1.0) before opacity is applied

    // Event Handler
    canvEl.addEventListener("click", (e) => HandleScreenClickedEvent(e, this));
    HandleCameraMovement(canvEl, this);

    canvEl.addEventListener("wheel", (e) => HandleCameraZoom(e, this), {
      passive: false,
    });

    CanvasScreen.animate();
  }

  /**
   * Returns the camera offset relative of the canvas screen.
   *
   * Does not get affected on zoom effect
   * @returns {{x: Number, y: Number}}
   */
  getFixedCameraOffset() {
    return CanvasScreen.fixedCameraOffset;
  }

  /**
   * Returns the camera offset of the canvas screen
   * @returns {{x: Number, y: Number}}
   */
  getCameraOffset() {
    return CanvasScreen.cameraOffset;
  }

  /**
   * Set the x and y offset of the canvas screen camera
   * @param {Number} x
   * @param {Number} y
   */
  setCameraOffset(x = 0, y = 0) {
    CanvasScreen.cameraOffset = { x, y };
  }

  /**
   *
   * @param {Sprite} obj A sprite object to render on screen
   */
  registerObject(obj) {
    if (obj.type === SpriteType.STATIC) {
      this.staticCanvasObjects.push(obj);
      return;
    }
    this.canvasObjects.push(obj);
  }

  /**
   *
   * @param {string} objectId Remove a sprite object that is rendered on screen
   */
  unregisterObject(objectId) {
    this.canvasObjects = this.canvasObjects.filter((o) => o.objID !== objectId);
    this.staticCanvasObjects = this.staticCanvasObjects.filter(
      (o) => o.objID !== objectId,
    );
  }

  /**
   *
   * @param {string} objectId Get a sprite object that is rendered on screen
   * @returns {Sprite | null}
   */
  getRegisteredObject(objectId) {
    const found = this.getAllRegisteredObjects().find(
      (o) => o.objID === objectId,
    );
    return found ?? null; // FIX: use .find() instead of .filter()[0] to avoid creating a new array
  }

  /**
   * Returns a list of registered sprite objects that was rendered on screen
   * @returns {Array<Sprite>}
   */
  getAllRegisteredObjects() {
    return [...this.canvasObjects, ...this.staticCanvasObjects];
  }

  /**
   * This triggers a callback function that can be used when a mouse cursor clicked on an object's hitbox inside the CanvasScreen (Basically an interaction). It will also return the position of the mouse in the CanvasScreen.
   * @param {Function} callback
   */
  handleScreenClickedEvent(callback) {
    if (!this.onCanvasClickedEvent) {
      this.onCanvasClickedEvent = [];
    }
    this.onCanvasClickedEvent.push(callback);
  }

  /**
   * Enable Camera Movement using mouse drag
   * @param {boolean} bool
   */
  enableScreenDrag(bool) {
    this.captureCameraMovement = bool;
  }

  /**
   * Scale up images rendered inside the canvas
   * @param {Number} value
   */
  setGlobalScale(value) {
    this.globalScale = value;
    // FIX: propagate the new scale to all non-static objects immediately
    // instead of doing it inside the render loop every frame
    for (const obj of this.canvasObjects) {
      obj.setGlobalScale(value);
    }
  }

  /**
   * Enable canvas zoom
   * @param {boolean} bool
   */
  enableScreenZoom(bool) {
    this.screenZoom = bool;
  }

  /**
   * Triggers a callback function that can be used when a screen zoom is triggered
   * @param {Function} callback
   */
  handleScreenZoomEvent(callback) {
    if (!this.onCanvasZoomEvent) this.onCanvasZoomEvent = [];
    this.onCanvasZoomEvent.push(callback);
  }

  /**
   * Set the value of zoom speed, default of 0.01
   * @param {Number} value
   */
  setZoomSpeed(value = 0.01) {
    this.zoomSpeed = value;
  }

  /**
   * Enable or disable Y-sorting for world-space sprites.
   *
   * When enabled, sprites are rendered in the following order each frame:
   *   1. BACKGROUND — always behind everything
   *   2. All other non-background types (OBJECT, BLOCK, ITEM, PLAYER, etc.)
   *      sorted by their bottom edge (posY + scaled height).
   *      A sprite higher on screen (lower posY) is drawn first, so the player
   *      appears behind objects it stands above and in front of objects below it.
   *   3. STATIC / HUD — always on top, unaffected by Y-sort.
   *
   * When disabled (default), sprites are drawn in registration order.
   * @param {boolean} bool
   */
  setYsort(bool) {
    this.ysort = bool;
  }

  /**
   * Set the opacity of the PLAYER sprite when it is rendered behind an object (Y-sort only).
   * Has no effect when Y-sort is disabled.
   * @param {Number} value  A number between 0 (fully transparent) and 1 (fully opaque). Default: 0.5
   */
  setBehindOpacity(value = 0.5) {
    this.behindOpacity = Math.min(1, Math.max(0, value));
  }

  /**
   * Set the minimum overlap percentage between the player and an object before
   * the object's opacity is reduced. Based on the overlapping area relative to
   * the smaller of the two bounding boxes.
   * Has no effect when Y-sort is disabled.
   * @param {Number} value  A number between 0.0 and 1.0. Default: 0.1 (10%)
   */
  setOverlapThreshold(value = 0.1) {
    this.behindOpacityThreshold = Math.min(1, Math.max(0, value));
  }

  /**
   * Returns true if a sprite is within the visible viewport (used for culling)
   * @param {Sprite} obj
   * @param {{x: Number, y: Number}} offset
   * @returns {boolean}
   */
  isInViewport(obj, offset) {
    const screenX = (obj.posX - offset.x) * this.globalScale;
    const screenY = (obj.posY - offset.y) * this.globalScale;
    const scaledW = obj.width * obj.scale * this.globalScale;
    const scaledH = obj.height * obj.scale * this.globalScale;
    return (
      screenX + scaledW > 0 &&
      screenX < this.width &&
      screenY + scaledH > 0 &&
      screenY < this.height
    );
  }

  static animate() {
    const fps = 60;
    const frameInterval = 1000 / fps;
    const now = performance.now();

    if (now - CanvasScreen.lastFrameTime < frameInterval) {
      requestAnimationFrame(CanvasScreen.animate);
      return;
    }

    CanvasScreen.lastFrameTime = now;
    CanvasScreen.animationId = requestAnimationFrame(CanvasScreen.animate);

    if (!CanvasScreen.context) return;
    if (!CanvasScreen.screen) return;

    const screen = CanvasScreen.screen;
    const context = CanvasScreen.context;
    const offset = CanvasScreen.cameraOffset;

    context.clearRect(0, 0, screen.width, screen.height);

    if (screen.ysort) {
      // --- Y-sort rendering ---
      // Reuse pre-allocated arrays (length = 0 clears in-place, no GC pressure)
      screen._backgrounds.length = 0;
      screen._sortables.length = 0;

      for (const obj of screen.canvasObjects) {
        if (!screen.isInViewport(obj, offset)) continue;
        if (obj.type === SpriteType.BACKGROUND) {
          screen._backgrounds.push(obj);
        } else {
          screen._sortables.push(obj);
        }
      }

      // 1. Backgrounds always first
      for (const obj of screen._backgrounds) {
        obj.draw(context, offset);
      }

      // 2. Sort by bottom edge (posY + scaled height).
      screen._sortables.sort((a, b) => {
        const aBottom = a.posY + a.height * a.scale;
        const bBottom = b.posY + b.height * b.scale;
        return aBottom - bBottom;
      });

      // 2. Sort by bottom edge (posY + scaled height).
      screen._sortables.sort((a, b) => {
        const aBottom = a.posY + a.height * a.scale;
        const bBottom = b.posY + b.height * b.scale;
        return aBottom - bBottom;
      });

      // Cache the player's AABB once for overlap checks below
      let player = null;
      for (const obj of screen._sortables) {
        if (obj.type === SpriteType.PLAYER) {
          player = obj;
          break;
        }
      }

      for (const obj of screen._sortables) {
        if (obj.type !== SpriteType.PLAYER && player !== null) {
          const objBottom = obj.posY + obj.height * obj.scale;
          const playerBottom = player.posY + player.height * player.scale;

          // Only fade the object if:
          //   1. It is sorted after the player (objBottom > playerBottom) — meaning it renders on top
          //   2. Its bounding box actually overlaps the player's bounding box in 2D (AABB test)
          const coversPlayer = objBottom > playerBottom;

          // Calculate the actual overlapping rectangle between player and object
          const overlapX = Math.max(
            0,
            Math.min(
              player.posX + player.width * player.scale,
              obj.posX + obj.width * obj.scale,
            ) - Math.max(player.posX, obj.posX),
          );
          const overlapY = Math.max(
            0,
            Math.min(playerBottom, objBottom) - Math.max(player.posY, obj.posY),
          );
          const overlapArea = overlapX * overlapY;

          // Compare overlap area against the smaller of the two bounding boxes
          // so that a tiny object overlapping a large one still triggers correctly
          const playerArea =
            player.width * player.scale * player.height * player.scale;
          const objArea = obj.width * obj.scale * obj.height * obj.scale;
          const smallerArea = Math.min(playerArea, objArea);
          const overlapRatio = smallerArea > 0 ? overlapArea / smallerArea : 0;

          if (coversPlayer && overlapRatio >= screen.behindOpacityThreshold) {
            context.globalAlpha = screen.behindOpacity;
            obj.draw(context, offset);
            context.globalAlpha = 1;
          } else {
            obj.draw(context, offset);
          }
        } else {
          // Always draw the player at full opacity
          obj.draw(context, offset);
        }
      }
    } else {
      // --- Default: draw in registration order ---
      for (const obj of screen.canvasObjects) {
        if (screen.isInViewport(obj, offset)) {
          obj.draw(context, offset);
        }
      }
    }

    // Static/HUD — always on top, no camera offset or culling
    for (const obj of screen.staticCanvasObjects) {
      obj.draw(context);
    }
  }
}
