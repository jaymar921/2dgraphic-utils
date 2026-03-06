# 2D Graphics Util

> Created by: [Jaymar921](https://github.com/jaymar921)

A lightweight 2-Dimensional graphic utility that can be used for website or game development. Wraps all renderable images inside a `CanvasScreen` object.

### Live Demo: Basic Implementation of the CanvasScreen

[2D-Graphics Implementation](https://jaymar921-2dgraphic-demo.vercel.app/)

## Installation

```bash
npm install @jaymar921/2dgraphic-utils
```

## Classes and Their Descriptions

| **Class**        | **Description**                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CanvasScreen** | A wrapper class around the `<canvas>` element that manages sprites and their rendering. It handles screen updates, sprite registrations, and interactions like mouse clicks and drags. |
| **Sprite**       | Represents an image (or animation) that can be drawn onto the canvas. It has properties for position, size, animation frames, and more.                                                |
| **SpriteType**   | A predefined enum that categorizes different types of sprites, such as `OBJECT`, `PLAYER`, `BLOCK`, etc.                                                                               |

## CanvasScreen Class

| **Function**                                       | **Description**                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `constructor(canvasId, width, height, background)` | Initializes a `CanvasScreen` object, binding it to an existing canvas element in the DOM by its ID. Optional parameters allow for setting width, height, and background color. |
| `registerObject(spriteObj)`                        | Registers a `Sprite` object for rendering on the canvas. Order of registration matters, as later objects will overlap earlier ones.                                            |
| `unregisterObject(objID)`                          | Removes a `Sprite` object from the screen by its `objID`.                                                                                                                      |
| `getRegisteredObject(objID)`                       | Retrieves a `Sprite` object by its `objID`. Returns `null` if not found.                                                                                                       |
| `getAllRegisteredObjects()`                        | Returns a list of all registered `Sprite` objects currently rendered on screen.                                                                                                |
| `handleScreenClickedEvent(callbackFunc)`           | Registers a callback function to be triggered when the screen is clicked or touched.                                                                                           |
| `enableScreenDrag(bool)`                           | Enables or disables dragging (panning) of the canvas using mouse or touch events.                                                                                              |
| `getCameraOffset()`                                | Returns the `x` and `y` offset coordinates of the canvas camera. Gets modified on zoom.                                                                                        |
| `getFixedCameraOffset()`                           | Returns the `x` and `y` offset of the canvas camera. Does **not** change on zoom.                                                                                              |
| `setCameraOffset(x, y)`                            | Update the camera position by the given `x` and `y` coordinates.                                                                                                               |
| `setGlobalScale(value)`                            | Scale all sprites rendered inside the canvas. Also propagates the new scale to all sprite objects immediately.                                                                 |
| `enableScreenZoom(bool)`                           | Enable or disable canvas zoom via mouse wheel.                                                                                                                                 |
| `handleScreenZoomEvent(callback)`                  | Registers a callback function to be triggered when the screen is zoomed.                                                                                                       |
| `setZoomSpeed(value)`                              | Set the speed of zoom. Default: `0.01` per scroll.                                                                                                                             |
| `setYsort(bool)` <a>v1.3.0</a>                     | Enable or disable Y-sorting for world-space sprites. When enabled, sprites are depth-sorted by their bottom edge each frame for correct top-down rendering order.              |
| `setBehindOpacity(value)` <a>v1.3.0</a>            | Set the opacity of an object when it renders on top of the player. Default: `0.5`. Has no effect when Y-sort is disabled.                                                      |
| `setOverlapThreshold(value)` <a>v1.3.0</a>         | Set the minimum overlap percentage (0.0–1.0) before opacity is applied. Based on the intersecting area relative to the smaller bounding box. Default: `0.1` (10%).             |
| `isInViewport(obj, offset)`                        | Returns `true` if the given sprite is within the visible viewport. Used internally for render culling.                                                                         |
| `static animate()`                                 | Continuously updates the canvas by clearing the screen and redrawing all registered sprites. Runs at a capped 60 FPS. Off-screen sprites are automatically culled.             |

### Important Notes: CanvasScreen

- **Coordinate space**: Sprite positions (`posX`, `posY`) are always in **world space**. The camera offset and global scale are applied during rendering — you never need to manually adjust sprite positions for zoom or pan.
- **Drag suppression**: Click events are automatically suppressed after a drag so that releasing a pan does not accidentally trigger a click interaction.
- **Viewport culling**: Only world-space sprites that are within the visible viewport are drawn each frame. Static sprites (HUD elements) are always drawn.

## Sprite Class

| **Function**                                                                                                                                              | **Description**                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constructor({objID, name, posX, posY, width, height, imageSource, animations, frames, frameBuffer, loop, autoPlay, scale, imageSmoothingEnabled, type})` | Initializes a `Sprite` object with properties like position, size, image source, and animation settings. **Note:** Tested image formats are `png` and `jpeg`. Other formats may cause rendering issues. |
| `draw(context, offset)`                                                                                                                                   | Draws the sprite on the canvas. Pass the camera `offset` for world-space sprites; omit it for static sprites.                                                                                           |
| `setGlobalScale(value)`                                                                                                                                   | Called by `CanvasScreen` when the global scale changes. You do not need to call this manually.                                                                                                          |
| `update(context)`                                                                                                                                         | Calls `draw()` to render the sprite.                                                                                                                                                                    |
| `play()`                                                                                                                                                  | Starts the animation of the sprite if it was paused.                                                                                                                                                    |
| `switchAnimation(name)`                                                                                                                                   | Switches the active animation by name (must match a key in the `animations` object passed to the constructor).                                                                                          |
| `updateFrames()`                                                                                                                                          | Updates the current frame of the sprite based on the frame buffer. Handles looping and auto-playing logic.                                                                                              |

### Important Note: Sprite Class

- You only need to create an instance of `Sprite` and register it with `CanvasScreen`. The screen handles all rendering automatically.
- Sprite positions are **world-space coordinates**. The camera offset is applied by the renderer — do not offset `posX`/`posY` manually to compensate for panning or zoom.

## SpriteType Enum

| **SpriteType** | **Description**                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `OBJECT`       | Represents a general object.                                                                             |
| `PLAYER`       | Represents a player character.                                                                           |
| `BACKGROUND`   | Represents background elements in the game/scene.                                                        |
| `FLUID`        | Represents fluid objects, such as water.                                                                 |
| `PASSABLE`     | Represents objects that can be passed through.                                                           |
| `ITEM`         | Represents collectible items in a game.                                                                  |
| `BLOCK`        | Represents solid, non-passable objects.                                                                  |
| `AIR`          | Represents air or an empty space.                                                                        |
| `STATIC`       | Represents a static object that is **not** affected by camera movement or zoom. Useful for HUD elements. |

## Short Examples of Usage

### Example 1: Basic Setup and Sprite Registration

```javascript
import { CanvasScreen } from "@jaymar921/2dgraphic-utils";
import { Sprite, SpriteType } from "@jaymar921/2dgraphic-utils";

const canvas = new CanvasScreen("myCanvas"); // Assumes <canvas id="myCanvas"></canvas> exists in the HTML

canvas.setCameraOffset(5, 5); // Customize the camera position | default: x=0, y=0

const playerSprite = new Sprite({
  objID: "player1",
  name: "Player 1",
  posX: 50, // World-space X position
  posY: 50, // World-space Y position
  width: 32,
  height: 32,
  imageSource: "player-sprite.png",
  type: SpriteType.PLAYER,
  scale: 1,
});

canvas.registerObject(playerSprite); // Sprite is now rendered automatically

const objs = canvas.getAllRegisteredObjects(); // Returns all currently rendered sprites
```

### Example 2: Handling Mouse Click Events

```javascript
canvas.handleScreenClickedEvent((e) => {
  const objID = e.objID; // objID of the top-most sprite that was clicked
  const spriteType = e.type; // SpriteType of the top-most clicked sprite | default: SpriteType.AIR
  const mouseX = e.mousePosition.x; // World-space X of the mouse cursor
  const mouseY = e.mousePosition.y; // World-space Y of the mouse cursor
  const layers = e.layers; // Array of all sprites at the clicked position

  console.log(`Mouse clicked at world position: (${mouseX}, ${mouseY})`);

  // Custom logic such as moving the player by altering posX and posY
});
```

> **Note:** `mousePosition` is returned in **world space**. You can compare it directly against `sprite.posX` / `sprite.posY` without any manual offset or scale correction.

### Example 3: Enabling Camera Movement via Dragging

```javascript
canvas.enableScreenDrag(true); // Allow panning by dragging the canvas

// Pan speed is automatically adjusted for the current zoom level,
// so dragging always feels consistent regardless of how far in or out you've zoomed.
```

### Example 4: Canvas Rendered Objects

```javascript
// Get all sprites currently registered on the canvas
const registeredObjects = canvas.getAllRegisteredObjects(); // Array<Sprite>

// registeredObjects is passed by reference — mutating properties like posX/posY
// will be reflected on screen immediately on the next frame.

// Remove a sprite from the canvas by its objID
canvas.unregisterObject("player-1");

// Get a single registered sprite by objID
const registeredObject = canvas.getRegisteredObject("sprite-id"); // Sprite | null
```

### Example 5: React Implementation with Custom Hook

If you are working with ReactJS, here's a sample implementation using a custom hook:

<details>
<summary>useCanvas.js</summary>

```javascript
// useCanvas.js
import { CanvasScreen, Sprite } from "@jaymar921/2dgraphic-utils";
import { useEffect, useState } from "react";

/**
 * @param {string} canvasId
 * @param {Number} width
 * @param {Number} height
 * @param {string} background
 */
export function useCanvas(
  canvasId = "my-canvas",
  width,
  height,
  background = "black",
) {
  const [canvas, setCanvas] = useState();

  useEffect(() => {
    const canvas = new CanvasScreen(canvasId, width, height, background);
    setCanvas(canvas);
  }, [canvasId, background]);

  function getFixedCameraOffset() {
    return CanvasScreen.fixedCameraOffset;
  }

  function getCameraOffset() {
    return CanvasScreen.cameraOffset;
  }

  function setCameraOffset(x = 0, y = 0) {
    CanvasScreen.cameraOffset = { x, y };
  }

  function enableScreenDrag(bool) {
    if (!canvas) return;
    canvas.enableScreenDrag(bool);
  }

  function handleScreenClickedEvent(callbackFunc) {
    if (!canvas) return;
    canvas.handleScreenClickedEvent(callbackFunc);
  }

  function registerObject(sprite) {
    if (!canvas) return;
    canvas.registerObject(sprite);
  }

  function unregisterObject(objectId) {
    if (!canvas) return;
    canvas.unregisterObject(objectId);
  }

  function getRegisteredObject(objectId) {
    if (!canvas) return null;
    return canvas.getRegisteredObject(objectId);
  }

  function getAllRegisteredObjects() {
    if (!canvas) return [];
    return canvas.getAllRegisteredObjects();
  }

  function setGlobalScale(value) {
    if (!canvas) return;
    canvas.setGlobalScale(value);
  }

  function enableScreenZoom(bool) {
    if (!canvas) return;
    canvas.enableScreenZoom(bool);
  }

  function handleScreenZoomEvent(callback) {
    if (!canvas) return;
    canvas.handleScreenZoomEvent(callback);
  }

  function setZoomSpeed(value = 0.01) {
    if (!canvas) return;
    canvas.setZoomSpeed(value);
  }

  function setYsort(bool) {
    if (!canvas) return;
    canvas.setYsort(bool);
  }

  function setBehindOpacity(value) {
    if (!canvas) return;
    canvas.setBehindOpacity(value);
  }

  function setOverlapThreshold(value) {
    if (!canvas) return;
    canvas.setOverlapThreshold(value);
  }

  return {
    registerObject,
    unregisterObject,
    handleScreenClickedEvent,
    enableScreenDrag,
    getRegisteredObject,
    getAllRegisteredObjects,
    getCameraOffset,
    setCameraOffset,
    setGlobalScale,
    enableScreenZoom,
    handleScreenZoomEvent,
    setZoomSpeed,
    getFixedCameraOffset,
    setYsort,
    setBehindOpacity,
    setOverlapThreshold,
  };
}
```

</details>

<details>
<summary>App.jsx</summary>

```javascript
import { useEffect } from "react";
import "./App.css";
import { useCanvas } from "./hooks/useCanvas";
import { Sprite } from "@jaymar921/2dgraphic-utils";

function App() {
  const canvasScreen = useCanvas("canvas-screen", 300, 300, "blue");

  function handleClick(clickEvent) {
    console.log(clickEvent);
  }

  useEffect(() => {
    canvasScreen.enableScreenDrag(true);
    canvasScreen.handleScreenClickedEvent(handleClick);

    const spr1 = new Sprite({
      objID: "spr1",
      name: "sprite 1",
      posX: 150,
      posY: 150,
      imageSource: "path-to-sprite-img",
      scale: 3,
    });

    canvasScreen.registerObject(spr1);
  }, [canvasScreen]);

  return (
    <>
      <div className="content-center h-screen">
        <canvas className="m-auto" id="canvas-screen"></canvas>
      </div>
    </>
  );
}
```

</details>

<details>
<summary>main.jsx</summary>

```javascript
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
```

</details>

### Example 6: Custom Sprite Animation

```javascript
const player = new Sprite({
  objID: "player",
  name: "player 1",
  posX: 150,
  posY: 150,
  imageSource: "path-to-idle-player-img",
  scale: 3,

  animations: {
    walkLeft: { frames: 6, imageSource: "path-to-walk-left-img" },
    walkRight: { frames: 6, imageSource: "path-to-walk-right-img" },
    IdleLeft: { frames: 12, imageSource: "path-to-idle-left-img" },
    IdleRight: { frames: 12, imageSource: "path-to-idle-right-img" },
  },
});

// Switch animation based on game logic
if (playerIsMovingLeft) player.switchAnimation("walkLeft");
if (playerIsMovingRight) player.switchAnimation("walkRight");
if (playerIsIdleLeft) player.switchAnimation("IdleLeft");
if (playerIsIdleRight) player.switchAnimation("IdleRight");
```

### Example 7: Zoom

```javascript
canvas.enableScreenZoom(true);
canvas.setZoomSpeed(0.05); // Faster zoom | default: 0.01

// React to zoom events
canvas.handleScreenZoomEvent(({ globalScale, event }) => {
  console.log("Current zoom level:", globalScale);
});
```

> **Note:** Zoom is centered on the visible viewport. Panning speed and click detection are automatically corrected for the current zoom level — no manual adjustment needed.

### Example 8: Y-Sort for Top-Down Games [v1.3.0]

Y-sorting gives correct depth ordering for top-down style games. Sprites are sorted by their bottom edge each frame so the player naturally appears behind objects it stands above and in front of objects it stands below.

```javascript
canvas.setYsort(true);

// When the player walks behind an object, the object becomes semi-transparent
// so the player is still visible underneath it.
canvas.setBehindOpacity(0.5); // default: 0.5

// Only apply transparency once the player and object overlap by at least 10%
// of the smaller bounding box. Prevents the effect from triggering on nearby
// objects that aren't genuinely overlapping the player.
canvas.setOverlapThreshold(0.1); // default: 0.1 (10%)
```

**Y-sort render order:**

1. `BACKGROUND` — always drawn first, always behind everything
2. All other world-space types (`OBJECT`, `BLOCK`, `ITEM`, `PLAYER`, etc.) — sorted by bottom edge (`posY + height * scale`)
3. `STATIC` — always drawn last, on top of everything (HUD layer)

## Changelog

### v1.3.0

- **Added** `setYsort(bool)` — enables Y-sorting for correct top-down depth ordering. Sprites are sorted by bottom edge each frame. `BACKGROUND` sprites always render first; `STATIC` sprites always render last.
- **Added** `setBehindOpacity(value)` — sets the opacity applied to an object when it renders on top of the player. Default: `0.5`.
- **Added** `setOverlapThreshold(value)` — sets the minimum overlap percentage (0.0–1.0) between the player and an object before the opacity effect triggers. Overlap is measured as the intersecting area relative to the smaller of the two bounding boxes. Default: `0.1` (10%).
- **Improved** Y-sort render loop uses pre-allocated, reusable arrays (`_backgrounds`, `_sortables`) cleared with `.length = 0` each frame to avoid GC pressure from per-frame allocations.
- **Fixed** drag-suppression now uses a movement threshold (`4px`) instead of `setTimeout`. A tap/click never triggers the dragging state unless the pointer actually moves, so click events are never incorrectly suppressed.

### v1.2.0

- **Fixed** mouse click world-space conversion: click coordinates are now correctly transformed to world space (`offsetX / globalScale + cameraOffset.x`) so hitbox detection is accurate at any zoom level.
- **Fixed** `InHitbox` to use pure world-space comparison. Previously applied `globalScale` again inside the hitbox check, causing misses at zoom levels other than 1.
- **Fixed** `lastFrameTime` initialization to `0` so the first frame's FPS comparison does not produce `NaN`.
- **Fixed** orphaned `context.restore()` in `animate()` that had no matching `context.save()`, which would eventually cause a canvas state stack underflow.
- **Fixed** pan delta now divided by `globalScale` so panning speed stays consistent at any zoom level.
- **Fixed** touch coordinates now use `getBoundingClientRect()` for accurate offset calculation.
- **Improved** `setGlobalScale()` now propagates the new scale to all sprite objects immediately rather than doing so inside the render loop on every frame.
- **Improved** `animate()` now iterates `canvasObjects` and `staticCanvasObjects` separately, avoiding a new array allocation via spread on every frame.
- **Improved** Viewport culling: world-space sprites that are entirely outside the visible viewport are skipped during rendering.
- **Improved** `getRegisteredObject()` now uses `.find()` instead of `.filter()[0]` to avoid creating a temporary array.
- **Improved** Zoom `globalScale` is clamped with `.toFixed(4)` to prevent floating-point drift at extreme zoom levels.

---

<p align="center">
  <h3 align="center">Would you like to show support?</h3>
</p>
<p align="center">
  <a href="https://www.buymeacoffee.com/jaymar921"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="150"/></a>
</p>
