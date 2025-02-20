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
| `handleScreenClickedEvent(callbackFunc)`           | Registers a callback function to be triggered when the screen is clicked or touched.                                                                                           |
| `enableScreenDrag(bool)`                           | Enables or disables dragging (panning) of the canvas using mouse events.                                                                                                       |
| `getCameraOffset()`                                | Returns the `x` and `y` offset coordinates of the canvas camera. Gets modified on zoom.                                                                                        |
| `getFixedCameraOffset()` <a>v1.1.7</a>             | Returns the `x` and `y` offset coordinate of the canvas camera and does not change on zoom                                                                                     |
| `setCameraOffset(x, y)`                            | Update the camera position by the given `x` and `y` coordinates                                                                                                                |
| `setGlobalScale(value)` <a>v1.1.6</a>              | Scale all the sprites rendered insie the canvas                                                                                                                                |
| `enableScreenZoom(bool)` <a>v1.1.6</a>             | Enable canvas zoom                                                                                                                                                             |
| `handleScreenZoomEvent(callback)` <a>v1.1.6</a>    | Registers a callback function to be triggered when the screen is zoomed                                                                                                        |
| `setZoomSpeed(value)` <a>v1.1.6</a>                | Set the speed of zoom : default of `0.01` per scroll                                                                                                                           |
| `static animate()`                                 | Responsible for continuously updating the canvas by clearing the screen and redrawing all registered sprites. This function runs on each frame to animate objects.             |

## Sprite Class

| **Function**                                                                                                                                              | **Description**                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constructor({objID, name, posX, posY, width, height, imageSource, animations, frames, frameBuffer, loop, autoPlay, scale, imageSmoothingEnabled, type})` | Initializes a `Sprite` object with properties like position, size, image source, and animation settings. Important Note: The image source that was tested is of file type `png` and `jpeg`. Other file types might cause some rendering issue. |
| `draw(context)`                                                                                                                                           | Draws the sprite on the canvas at its current position, using the current frame if it's an animated sprite.                                                                                                                                    |
| `setGlobalScale(value)` <a>v1.1.6</a>                                                                                                                     | A utility function that will be called from `CanvasScreen` for scaling up the sprite globally.                                                                                                                                                 |
| `update(context)`                                                                                                                                         | Calls `draw()` to render the sprite.                                                                                                                                                                                                           |
| `play()`                                                                                                                                                  | Starts the animation of the sprite if it was paused.                                                                                                                                                                                           |
| `updateFrames()`                                                                                                                                          | Updates the current frame of the sprite based on the frame buffer. Handles looping and auto-playing logic.                                                                                                                                     |

### Important Note: Sprite Class

- You'll only need to create an instance of the class and register it in the `CanvasScreen` as it will do all the rendering function.

## SpriteType Enum

| **SpriteType** | **Description**                                                       |
| -------------- | --------------------------------------------------------------------- |
| `OBJECT`       | Represents a general object.                                          |
| `PLAYER`       | Represents a player character.                                        |
| `BACKGROUND`   | Represents background elements in the game/scene.                     |
| `FLUID`        | Represents fluid objects, such as water.                              |
| `PASSABLE`     | Represents objects that can be passed through.                        |
| `ITEM`         | Represents collectible items in a game.                               |
| `BLOCK`        | Represents solid, non-passable objects.                               |
| `AIR`          | Represents air or an empty space.                                     |
| `STATIC`       | Represents a static object, does not get affected by camera movement. |

## Short Examples of Usage

### Example 1: Basic Setup and Sprite Registration

```javascript
import { CanvasScreen } from "@jaymar921/2dgraphic-utils";
import { Sprite, SpriteType } from "@jaymar921/2dgraphic-utils";

const canvas = new CanvasScreen("myCanvas"); // Assuming there's a <canvas id="myCanvas"></canvas> in the HTML

canvas.setCameraOffset(5, 5); // Customize the camera position | default: x-0, y-0

const playerSprite = new Sprite({
  objID: "player1",
  name: "Player 1",
  posX: 50,
  posY: 50,
  width: 32,
  height: 32,
  imageSource: "player-sprite.png", // Path to your image
  type: SpriteType.PLAYER, // Classify this Sprite object to a type "Player" | default: "Object"
  scale: 1,
});

canvas.registerObject(playerSprite); // It will automatically render the playerSprite

const objs = canvas.getRegisteredObjects(); // Returns an array of rendered sprites
```

### Example 2: Handling Mouse Click Events

```javascript
canvas.handleScreenClickedEvent((e) => {
  const objID = e.objID; // objID of the top-most sprite that was clicked or touched
  const spriteType = e.type; // The SpriteType of the clicked top-most sprite | default: SpriteType.AIR
  const mouseX = e.mousePosition.x; // The offsetX of the mouse cursor
  const mouseY = e.mousePosition.y; // The offsetY of the mouse cursor
  const layers = e.layers; // Array of sprites within the clicked position

  console.log(`Mouse clicked at position: (${mouseX}, ${mouseY})`);

  // Custom logic such as moving the playerSprite by altering the posX and posY
});
```

### Example 3: Enabling Camera Movement via Dragging

```javascript
canvas.enableScreenDrag(true); // Allow camera movement by dragging the canvas
```

### Example 4: Canvas Rendered Objects

```javascript
// To keep track of all registered objects inside the canvas, you can call the getAllRegisteredObjects() function

const registeredObjects = canvas.getAllRegisteredObjects(); // Array of Sprites

// registeredObjects is passed by reference, you can alter the object's property and it will show the effect on screen. Example is by changing the sprite's posX and posY.

// To remove a sprite from being rendered inside the canvas, you can unregister the object by given objID
canvas.unregisterObject("player-1"); // Instant effect

// Get a single registered object by objID given.
const registeredObject = canvas.getRegisteredObject("sprite-id");
```

### Example 5: React Implementation with custom hook

If you are working with ReactJS, there's a sample code below with an updated implementation of custom hook

<details>
<summary>useCanvas.js</summary>

Copy the code below if you're trying to implement this code in reactJS

```javascript
// useCanvas.js
import { CanvasScreen, Sprite } from "@jaymar921/2dgraphic-utils";
import { useEffect, useState } from "react";

/**
 *
 * @param {string} canvasId
 * @param {Number} width
 * @param {Number} height
 * @param {string} background
 */
export function useCanvas(
  canvasId = "my-canvas",
  width,
  height,
  background = "black"
) {
  const [canvas, setCanvas] = useState();

  useEffect(() => {
    const canvas = new CanvasScreen(canvasId, width, height, background);
    setCanvas(canvas);
  }, [canvasId, background]);

  /**
   * Returns the camera offset relative of the canvas screen.
   *
   * Does not get affected on zoom effect
   * @returns {{x: Number, y: Number}}
   */
  function getFixedCameraOffset() {
    return CanvasScreen.fixedCameraOffset;
  }

  /**
   * Returns the camera offset of the canvas screen
   * @returns {{x: Number, y: Number}}
   */
  function getCameraOffset() {
    return CanvasScreen.cameraOffset;
  }

  /**
   * Set the x and y offset of the canvas screen camera
   * @param {Number} x
   * @param {Number} y
   */
  function setCameraOffset(x = 0, y = 0) {
    CanvasScreen.cameraOffset = {
      x,
      y,
    };
  }

  /**
   * Enable Camera Movement using mouse drag
   * @param {boolean} arg
   */
  function enableScreenDrag(bool) {
    if (!canvas) return;
    canvas.enableScreenDrag(bool);
  }

  /**
   * This triggers a callback function that can be used when a mouse cursor clicked on an object's hitbox inside the CanvasScreen (Basically an interaction). It will also return the position of the mouse in the CanvasScreen.
   * @param {Function} callback
   */
  function handleScreenClickedEvent(callbackFunc) {
    if (!canvas) return;
    canvas.handleScreenClickedEvent(callbackFunc);
  }

  /**
   *
   * @param {Sprite} obj A sprite object to render on screen
   */
  function registerObject(sprite) {
    if (!canvas) return;
    canvas.registerObject(sprite);
  }

  /**
   *
   * @param {string} objectId Remove a sprite object that is rendered on screen
   */
  function unregisterObject(objectId) {
    if (!canvas) return;
    canvas.unregisterObject(objectId);
  }

  /**
   *
   * @param {string} objectId Get a sprite object that is rendered on screen
   * @returns {Sprite | null}
   */
  function getRegisteredObject(objectId) {
    if (!canvas) return;
    canvas.getRegisteredObject(objectId);
  }

  /**
   * Returns a list of registered sprite objects that was rendered on screen
   * @returns {Array<Sprite>}
   */
  function getAllRegisteredObjects() {
    if (!canvas) return;
    canvas.getAllRegisteredObjects();
  }

  /**
   * Scale up images rendered inside the canvas [1.1.6]
   * @param {Number} value
   */
  function setGlobalScale(value) {
    if (!canvas) return;
    canvas.setGlobalScale(value);
  }

  /**
   * Enable canvas zoom
   * @param {boolean} bool
   */
  function enableScreenZoom(bool) {
    if (!canvas) return;
    canvas.enableScreenZoom(bool);
  }

  /**
   * Triggers a callback function that can be used when a screen zoom is triggered [1.1.6]
   * @param {Function} callback
   */
  function handleScreenZoomEvent(callback) {
    if (!canvas) return;
    canvas.handleScreenZoomEvent(callback);
  }

  /**
   * Set the value of zoom speed, default of 0.01 [1.1.6]
   * @param {Number} value
   */
  function setZoomSpeed(value = 0.01) {
    if (!canvas) return;
    canvas.setZoomSpeed(value);
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
  // initialize the useCanvas hook
  const canvasScreen = useCanvas("canvas-screen", 300, 300, "blue");

  // do something when user clicks anywhere inside the canvas
  function handleClick(clickEvent) {
    console.log(clickEvent);
  }

  useEffect(() => {
    // enable screen drag
    canvasScreen.enableScreenDrag(true);
    // invoke the handleClick
    canvasScreen.handleScreenClickedEvent(handleClick);

    // create a Sprite Object
    const spr1 = new Sprite({
      objID: "spr1",
      name: "sprite 1",
      posX: 150,
      posY: 150,
      imageSource: "path-to-sprite-img",
      scale: 3,
    });

    // render 'spr1' on the CanvasScreen
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

### Example 6: Custom Sprite Animation [v1.1.5 up]

Keeping things simple, you can create a custom Player class that extends from Sprite class

```javascript
// Creating player sprite with animation
const player = new Sprite({
  objID: "player",
  name: "player 1",
  posX: 150,
  posY: 150,
  imageSource: "path-to-idle-player-img",
  scale: 3,

  // Add animations
  animations: {
    // walk left animation
    walkLeft: {
      frames: 6,
      imageSource: "path-to-walk-left-img",
    },
    // walk right animation
    walkRight: {
      frames: 6,
      imageSource: "path-to-walk-right-img",
    },
    // idle left animation
    IdleLeft: {
      frames: 12,
      imageSource: "path-to-idle-left-img",
    },
    // idle right animation
    IdleRight: {
      frames: 12,
      imageSource: "path-to-idle-right-img",
    },
  },
});

// Custom logic here, lets say player is moving at a direction
if (playerIsMovingLeft) {
  // load the animation
  player.switchAnimation("walkLeft");
}

if (playerIsMovingRight) {
  // load the animation
  player.switchAnimation("walkRight");
}

if (playerIsIdleLeft) {
  // load the animation
  player.switchAnimation("IdleLeft");
}

if (playerIsIdleRight) {
  // load the animation
  player.switchAnimation("IdleRight");
}
```

<br />
-- End of documentation --

---

<p align="center">
  <h3 align="center">Would you like to show support?</h3>
</p>
<p align="center">
  <a href="https://www.buymeacoffee.com/jaymar921"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="150"/></a>
</p>
