/**
 * D-pad Controller 🎮 - A class for on-screen button
 *
 * D-pad is a ui element for a on-screen directional pad that returns a directional value when pressed.
 */

// Paths for D-Pad
const pathData = {
  up: "M264,30.79a19.8,19.8,0,0,0-28,0L172.64,94.17A173.44,173.44,0,0,1,232,76.58L236.58,72a19.8,19.8,0,0,1,28,0L269,76.46A173,173,0,0,1,325.21,92Z",
  right:
    "M469.21,236l-60.09-60.09a172.59,172.59,0,0,1,15.55,56.17l3.36,3.35a19.8,19.8,0,0,1,0,28l-3.23,3.23a173.18,173.18,0,0,1-15.68,57.43L469.21,264A19.8,19.8,0,0,0,469.21,236Z",
  down: "M267.79,423.67,263.42,428a19.8,19.8,0,0,1-28,0l-4.75-4.76a172.91,172.91,0,0,1-58.05-17.44L236,469.21a19.8,19.8,0,0,0,28,0L325.21,408A173.43,173.43,0,0,1,267.79,423.67Z",
  left: "M72,264.56a19.8,19.8,0,0,1,0-28l5.75-5.75A173.15,173.15,0,0,1,95.3,171.51L30.79,236a19.8,19.8,0,0,0,0,28l64.51,64.5a173.08,173.08,0,0,1-17.44-58Z",
};

// Direction type
type direction =
  | "center"
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-right"
  | "down-right"
  | "up-left"
  | "down-left";

// Options for the D-pad Controller
interface DpadOptions {
  uid?: string;
  // container for the D-pad controller (Optional, default: document.body)
  container: HTMLElement;
  // top position of the D-pad controller (Optional, default: "50%")
  top?: string;
  // left position of the D-pad controller (Optional, default: "50%")
  left?: string;
  // radius of the D-pad controller (Optional, default: 2rem)
  radius?: number;
  // handle colors (Optional, default: "#262626")
  colorBase?: string;
  // pressed handle colors (Optional, default: "#060606")
  colorsPressed?: string;
  // center radius threshold (Optional, default: 0.25)
  centerRadiusThreshold?: number;
  // callbacks for the D-pad controller
  // directions can be "center", "up", "right", "down", "left", "up-right", "down-right", "down-left", "up-left"
  onPressCallback?: (direction: direction) => void;
  onReleaseCallback?: (direction: direction) => void;
  // verbose logging (Optional, default: false)
  verboseLogging?: boolean;
  // key repeat (repeat key press) (Optional, default: false)
  keyRepeat?: boolean;
  // rotation degree (for rotated D-pad on landscape mode) (Optional, default: 0)
  rotate?: number;
}

/**
 * D-pad Controller
 */
export class DpadController {
  // Unique id for the D-pad controller
  uid: string;
  // D-pad controller container
  container: HTMLElement;
  // top position of the D-pad controller
  top: string;
  // left position of the D-pad controller
  left: string;
  // width of the D-pad controller
  radius: number;
  // handle colors
  colorBase: string;
  // pressed handle colors
  colorPressed: string;
  // center radius threshold out of this bound it counts as input
  centerThreshold?: number;
  // callbacks
  onPressCallback: (direction: direction) => void;
  onReleaseCallback: (direction: direction) => void;
  // verbose
  verboseLogging: boolean;
  // variables
  base: SVGElement;
  currentDirection: direction = "center";
  basePaths: { [key: string]: SVGPathElement };
  pointerId: number = -1;
  baseRect: DOMRect | undefined;
  inputRegisterDistance: number = 0;
  isPressed: boolean;
  keyRepeat?: boolean;
  // rotation degree
  rotate: number;

  // init the d-pad
  constructor(options: DpadOptions) {
    this.uid = options.uid || Math.random().toString(36).substring(7);
    this.container = options.container || document.body;
    this.top = options.top || "50%";
    this.left = options.left || "50%";
    this.radius = options.radius || 5;
    this.colorBase = options.colorBase || "gray";
    this.colorPressed = options.colorsPressed || "rgb(69 69 69)";
    this.centerThreshold =
      options.centerRadiusThreshold == undefined
        ? 0.25
        : options.centerRadiusThreshold;
    // verbose logging
    this.verboseLogging = options.verboseLogging || false;
    // callbacks
    this.onPressCallback =
      options.onPressCallback ||
      ((direction: direction) => {
        if (this.verboseLogging)
          console.log(
            `[DpadController:${this.uid}] pressed direction ${direction}!`
          );
      });
    this.onReleaseCallback = (direction: direction) => {
      if (this.verboseLogging)
        console.log(
          `[DpadController:${this.uid}] released direction ${direction}!`
        );
    };
    this.isPressed = false;
    this.keyRepeat = options.keyRepeat || false;

    // create a base
    this.base = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.base.id = `ts-dpad-${this.uid}`;
    this.basePaths = {};
    // rotation
    this.rotate = options.rotate || 0;

    // init
    this.init();
  }

  /**
   * Log
   */
  log(message: string) {
    if (this.verboseLogging)
      console.log(`[DpadController:${this.uid}] ${message}`);
  }

  /**
   * Init the D-pad
   */
  init() {
    // init
    this.log("Init");

    // pre init checks
    if (!this.container) {
      throw new Error("Button Container not found!");
    }
    // check base
    if (!this.base) {
      throw new Error(
        "D-pad elements could not be created. Please check your container element."
      );
    }

    // render
    this.render();

    // add event handlers
    this.base.addEventListener("pointerdown", this.onDpadDown.bind(this));
    this.base.addEventListener("pointermove", this.onDpadMove.bind(this));
    this.base.addEventListener("pointerup", this.onDpadUp.bind(this));
    this.base.addEventListener("touchstart", (e: TouchEvent) => {
      e.preventDefault();
      this.onDpadDown(e);
    });
    this.base.addEventListener("touchend", (e: TouchEvent) => {
      e.preventDefault();
      this.onDpadUp(e);
    });
  }

  /**
   * Render UI
   */
  render() {
    // Check if base already exist
    if (!this.base) {
      throw new Error(
        "D-pad elements could not be created. Please check your container element."
      );
    }
    // controller base
    this.base.setAttribute("viewBox", "0 0 450 450");
    this.base.style.cssText = `
          position: absolute;
          width: ${this.radius}px;
          height: ${this.radius}px;
          top: ${this.top};
          left: ${this.left};
          transform: translate(-50%, -50%);
          z-index: 1000;
          opacity: 0.5;
          transition: opacity 0.3s ease-out;
          transform: rotate(${this.rotate}deg);
      `;
    // Draw D-pad Paths
    for (const [direction, d] of Object.entries(pathData)) {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.id = "dpad-path-" + direction;
      path.setAttribute("d", d);
      path.setAttribute("transform", "translate(-25, -25)");
      path.style.fill = this.colorBase;
      path.style.transition = "fill 0.2s ease";
      path.style.backdropFilter = "blur(5px)";
      this.base.appendChild(path);
      this.basePaths[direction] = path;
    }

    // add to container
    this.container.appendChild(this.base);
  }

  /**
   * Update Contaier Rect
   *
   * This method is called ot recalculate the container element size
   * it updates the containerRect property which is used to determine the manimum
   * distance the d-pad handle can move from the center of the d-pad
   */
  updateContainerRectangle() {
    this.baseRect = this.base.getBoundingClientRect();
    // Calculate the radius of the d-pad
    // Half of the minimum dimension (width or height) of the container
    this.inputRegisterDistance =
      (Math.min(this.baseRect.width, this.baseRect.height) / 2) *
      this.centerThreshold!;
  }

  // ***<< EVENT HANDLERS >>***

  /**
   * Update D-Pad UI After Pointer Events
   *
   * Change the pointer colors according to the direction
   */
  updateDpadUI() {
    console.log(this.currentDirection);
    // for each base path
    Object.entries(this.basePaths).forEach(([direction, path]) => {
      if (this.currentDirection.includes(direction)) {
        path.style.fill = this.colorPressed;
      } else {
        path.style.fill = this.colorBase;
      }
    });
  }

  /**
   * Reset D-Pad After Pointer Events
   *
   * Resets the D-pad colors
   */
  resetDpad() {
    this.log("D-pad reset...");
    // reset the colors
    Object.values(this.basePaths).forEach((path) => {
      path.style.fill = this.colorBase;
    });
    this.base.style.opacity = "0.5";
  }

  /**
   * Pointer Up Event Handler
   *
   * Triggers when pointer is Up
   */
  onDpadUp(e: PointerEvent | TouchEvent) {
    this.log("Pointer Up!");
    // reset for pointer event
    if ("pointerId" in e && e.pointerId === this.pointerId) {
      e.preventDefault();
      this.isPressed = false;
      this.pointerId = -1;
      this.resetDpad();
      // reset for touch event
    } else if (e instanceof TouchEvent && e.changedTouches.length > 0) {
      e.preventDefault();
      this.pointerId = -1;
      this.resetDpad();
    }

    // reset direction and trigger callback
    if (this.currentDirection !== "center") {
      this.currentDirection = "center";
      if (this.onReleaseCallback) {
        this.onReleaseCallback.call(this, "center");
      }
    }
  }

  /**
   * Handle Pointer Down
   *
   * Triggers when pointer is down
   */
  onDpadDown(e: PointerEvent | TouchEvent) {
    this.log("D-pad pointer down...");
    // Handle Pointer Events
    if (e instanceof PointerEvent) {
      this.base.setPointerCapture(e.pointerId);
      this.isPressed = true;
      this.pointerId = e.pointerId;
      // update container rect for accurate calculation
      this.updateContainerRectangle();
      // change opacity of whole base when touched
      // this.base.style.opacity = "1";
      // handle pointer move
      this.onDpadMove(e);
    } else if (e instanceof TouchEvent && e.touches.length > 0) {
      // monkey patch for touch events (mobile devices)
      // Handle Touch Events
      this.isPressed = true;
      this.pointerId = e.touches[0].identifier;
      // update container rect for accurate calculation
      this.updateContainerRectangle();
      // forward to pointer move
      this.onDpadMove(e.touches[0] as unknown as PointerEvent);
    }
  }

  /**
   * Handle Pointer Move
   *
   * Triggers when the touch / pointer moves
   */
  onDpadMove(e: PointerEvent) {
    if (!this.isPressed) return;

    // * Joystick Logic Here

    // calculate the base Rect Center
    const baseCenterX = this.baseRect!.left + this.baseRect!.width / 2;
    const baseCenterY = this.baseRect!.top + this.baseRect!.height / 2;

    // calculate pointer pos
    let x = e.clientX - baseCenterX;
    let y = e.clientY - baseCenterY;

    // ! USE EITHER OF THE ROTATION LOGIC
    // *<< ROTATION LOGIC USING X,Y (WORKS INDEPENDENT TO ANGLE) >>*
    if (this.rotate !== 0) {
      // rotate "x" and "y" by "-rotation" degrees (reverse rotation)
      const angle = (-this.rotate * Math.PI) / 180;
      const x1 = x * Math.cos(angle) - y * Math.sin(angle);
      const y1 = x * Math.sin(angle) + y * Math.cos(angle);
      x = x1;
      y = y1;
    }

    // * calculate angle for checking direction
    // Calculates the angle in degrees using the inverse tangent (arctan) of the given y and x coordinates.
    let angle = (Math.atan2(-y, x) * 180) / Math.PI;

    // ! USE EITHER OF THE ROTATION LOGIC
    // *<< ROTATION LOGIC USING DEGREES (EASY, WONT WORK FOR CO-ORDINATE SYSTEMS) >>*
    // if (this.rotation !== 0) {
    //   // rotate "angle" by "rotation" degrees
    //   angle += this.rotation;
    // }

    // * calculate distance from the center
    // just distance formula from geometry class :P
    const centerDistance = Math.sqrt(x * x + y * y);

    // find directions
    let direction: direction = "center";
    // check if the distance from the center exceeds the input register threshold
    if (centerDistance > this.inputRegisterDistance) {
      if (angle > -22.5 && angle <= 22.5) direction = "right";
      else if (angle > 22.5 && angle <= 67.5) direction = "up-right";
      else if (angle > 67.5 && angle <= 112.5) direction = "up";
      else if (angle > 112.5 && angle <= 157.5) direction = "up-left";
      else if (angle > 157.5 || angle <= -157.5) direction = "left";
      else if (angle > -157.5 && angle <= -112.5) direction = "down-left";
      else if (angle > -112.5 && angle <= -67.5) direction = "down";
      else if (angle > -67.5 && angle <= -22.5) direction = "down-right";
    }

    // state change
    if (this.currentDirection !== direction) {
      this.currentDirection = direction;
      // update ui
      this.updateDpadUI();
      // trigger callbacks
      this.log(`direction update: direction: ${direction} - angle: ${x},${y}`);
      if (this.onPressCallback) {
        this.onPressCallback.call(this, direction);
      }
    }
  }
}
