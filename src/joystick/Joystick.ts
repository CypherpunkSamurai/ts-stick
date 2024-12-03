/**
 * Joystick Controller 🎮 - A class for on-screen Joystick Controller
 *
 * Joysick Controller
 */

// Joystick Controller Options
interface JoysickControllerOptions {
  // uid - unique id to uniquely identify the joystick controller (default: random string)
  uid?: string;
  // conatiner - the container where to store the joystick (default: body)
  container?: HTMLElement;
  // top - top position of the joystick (default: 50%)
  top?: string;
  // left - left position of the joystick (default: 50%)
  left?: string;
  // rotate - the degree of rotation of the joystick (default: 0deg)
  rotate?: number;
  // radius - the radius of the joystick in rem (default: 3)
  radius?: number;
  // color - the color of the joystick (default: #CCC)
  color?: string;
  // thumbColor - the color of the joystick thumb (default: #333)
  thumbColor?: string;
  // onInputCallback - callback triggered when the joystick is moved
  onInputCallback?: (x: number, y: number) => void;
  // verbose logging (default: false)
  verboseLogging?: boolean;
}

/**
 * The Joysick Controller
 */
export class JoysickController {
  uid: string;
  top: string;
  left: string;
  rotate: number;
  radius: number;
  color: string;
  thumbColor: string;
  // callbacks
  onInputCallback: (x: number, y: number) => void;
  // variables
  isPressed: boolean;
  container: HTMLElement;
  verboseLogging: boolean;
  base: HTMLDivElement;
  baseThumb: HTMLDivElement;
  baseRect: DOMRect | undefined;
  thumbMaxDistance: number;

  /**
   * Create a New JoysickController
   */
  constructor(options: JoysickControllerOptions) {
    // unique id
    this.uid = options.uid || Math.random().toString(36).substring(7);
    // container
    this.container = options.container || document.body;
    // top
    this.top = options.top || "50%";
    this.left = options.left || "50%";
    // radius of the controller
    this.radius = options.radius || 5;
    // rotate
    this.rotate = options.rotate || 0;
    // color of the controller
    this.color = options.color || "#CCC";
    // color of the thumb
    this.thumbColor = options.thumbColor || "#333";

    // callbacks
    this.onInputCallback =
      options.onInputCallback ||
      ((x: number, y: number) => {
        console.log(`[JoysickController:${this.uid}] input: x: ${x}, y: ${y}`);
      });
    // verbose logging
    this.verboseLogging = options.verboseLogging || false;
    this.thumbMaxDistance = 0;
    this.isPressed = false;

    // create the controller base
    this.base = document.createElement("div");
    this.base.id = `ts-dpad-${this.uid}`;
    this.baseThumb = document.createElement("div");
    this.baseThumb.id = `ts-dpad-${this.uid}-thumb`;
    this.base.appendChild(this.baseThumb);

    // init
    this.init();
  }

  /**
   * Log
   */
  log(message: string) {
    if (this.verboseLogging)
      console.log(`[JoysickController:${this.uid}] ${message}`);
  }

  /**
   * Init
   */
  init() {
    // log
    this.log("init");

    // checks
    // Check Container Exists
    if (!this.container) {
      throw new Error("Button Container not found!");
    }

    // render
    this.render();

    // add event handlers
    this.base.addEventListener("pointerup", (e) => this.onJoysickUp(e));
    this.base.addEventListener("pointercancel", (e) => this.onJoysickUp(e));
    this.base.addEventListener("pointerdown", (e) => this.onJoysickDown(e));
    this.base.addEventListener("pointermove", (e) => this.onJoysickMove(e));

    // resize
    window.addEventListener("resize", this.updateContainerRectangle.bind(this));
    this.updateContainerRectangle();
  }

  /**
   * Render
   */
  render() {
    // create styles
    // Render Styles for the Joystick
    this.base.style.cssText = `
        width: ${this.radius}px;
        height: ${this.radius}px;
        background-color: ${this.color};
        border-radius: 50%;
        position: absolute;
        top: ${this.top};
        left: ${this.left};
        transform: translate(-50%, -50%) rotate(${this.rotate}deg); // Apply rotation
        touch-action: none;
        z-index: 1000;
        opacity: 0.7;
        transition: opacity 0.3s linear;
        /* Glassmorphic effect */
        backdrop-filter: blur(6px);
        box-shadow: 0 8px 32px 0 ${this.color}60, inset 0 0 0 1px #FFFFFF2E;
        user-select: none;
    `;
    this.baseThumb.style.cssText = `
        width: ${this.radius / 2.5}px;
        height: ${this.radius / 2.5}px;
        background-color: ${this.thumbColor};
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 1000;
        transition: all 0.1s ease-out;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        user-select: none;
    `;
    this.container.appendChild(this.base);
  }

  /**
   * UpdateUI
   */
  updateUI() {}

  /**
   * Update Container Rectangle
   *
   * Update Container Rectangle for properly calculating the joystick position
   */
  updateContainerRectangle() {
    // check
    // this.baseRect = this.base.getBoundingClientRect();
    // Calculate the maximum distance the joystick handle can move from the center
    // (Joystick radius - Half of handle width) / 2
    // this.thumbMaxDistance = (this.radius - this.baseThumb.offsetWidth / 2) / 2;

    // OG Code
    this.baseRect = this.base.getBoundingClientRect();
    this.thumbMaxDistance = (this.radius - this.baseThumb.offsetWidth) / 1.5;
  }

  // ***<< EVENT HANDLERS >>***

  /**
   * Joysick Up
   *
   * This Event is Triggered when the joystick thumb is released
   */
  onJoysickUp(e: PointerEvent) {
    // log
    this.log("Joysick Released");

    // change is pressed
    e.preventDefault();
    this.isPressed = false;
    this.baseThumb.style.transform = `translate(-50%, -50%)`;
    this.base.style.opacity = "0.7";
  }

  /**
   * Pointer Down
   *
   * This event is triggered when the joystick is pressed
   */
  onJoysickDown(e: PointerEvent) {
    // log
    this.log("Joysick Pressed");

    // change is pressed
    e.preventDefault();
    this.isPressed = true;
    this.base.setPointerCapture(e.pointerId);
    this.base.style.opacity = "1";

    // update container rectangle
    this.updateContainerRectangle();

    // forward to pointer move
    this.onJoysickMove(e);
  }

  /**
   * Pointer Move
   *
   * This Event is triggered when the joystick thumb is moved
   */
  onJoysickMove(e: PointerEvent) {
    if (!this.isPressed) return;
    // log
    this.log("Joystick Moved");

    // center of the base
    const baseCenterX = this.baseRect!.left + this.baseRect!.width / 2;
    const baseCenterY = this.baseRect!.top + this.baseRect!.height / 2;

    // pointer position
    let x = e.clientX - baseCenterX;
    let y = e.clientY - baseCenterY;

    // calculate distance from center
    const distance = Math.hypot(x, y);

    // clamp x and y
    if (distance > this.thumbMaxDistance) {
      x *= this.thumbMaxDistance / distance;
      y *= this.thumbMaxDistance / distance;
    }

    // rotate x and y if rotate
    if (this.rotate) {
      const angle = (-this.rotate * Math.PI) / 180;
      const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
      const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
      x = rotatedX;
      y = rotatedY;
    }

    // update ui so that the thumb moves around the center radius of max distance (calc to subtract its own width and height)
    this.baseThumb.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

    // clamp values between -1 and 1
    x = Number(Math.max(-1, Math.min(1, x / this.thumbMaxDistance)).toFixed(2));
    y = Number(Math.max(-1, Math.min(1, y / this.thumbMaxDistance)).toFixed(2));

    // call the callback
    if (this.onInputCallback) {
      this.onInputCallback(x, y);
    }
  }
}
