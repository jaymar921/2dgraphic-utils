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
    this.dragging = false; // FIX: expose dragging on the screen instance so click handler can read it

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

    // Draw world-space (non-static) objects — only those inside the viewport
    for (const obj of screen.canvasObjects) {
      if (screen.isInViewport(obj, offset)) {
        // FIX: viewport culling, skip off-screen sprites
        obj.draw(context, offset);
      }
    }

    // Draw static/HUD objects — always drawn, no offset or culling needed
    for (const obj of screen.staticCanvasObjects) {
      obj.draw(context);
    }

    // FIX: removed orphaned context.restore() that had no matching context.save(),
    // which would cause a canvas state stack underflow over time
  }
}
