/**
 * RetrackableSlider Controller 🎮 - A class for on-screen retractable slider.
 *
 * A slider is a slider that retracts back to 0 when released.
 */

type direction = "vertical" | "horizontal";

// Options for RetractableSlider
export interface RetrackableSliderOptions {
  // unique id for the slider
  uid?: string;
  // container element of the slider (default: body)
  container: HTMLElement;
  // top position of the slider (default: 50%)
  top?: string;
  // left position of the slider (default: 50%)
  left?: string;
  // width: width of the slider (default: 100px)
  width?: string;
  // height: height of the slider (default: 500px)
  height?: string;
  // color of the slider
  color?: string;
  // border color of the slider (default: gray)
  borderColor?: string;
  // border width of the slider (default: 2px)
  borderWidth?: string;
  // border radius (default: 2px)
  borderRadius?: string;
  // direction of the slider to rotate (default: vertical)
  // can be either vertical or horizontal
  direction?: direction;
  // callbacks
  onSlideCallback?: (value: number) => void;
  onReleaseCallback?: () => void;
  // verbose logging (default: false)
  verboseLogging?: boolean;
}

/**
 * RetractableSlider Controller 🎮 - A class for on-screen retractable slider.
 */
export class RetrackableSlider {
  // uid - unique id of the slider
  uid: string;
  // container - container element for the slider
  container: HTMLElement;
  // top - top position of the slider
  top: string;
  // left - left position of the slider
  left: string;
  // width - width of the slider
  width: string;
  // height - height of the slider
  height: string;
  // color - color of the slider
  color: string;
  // border color - border color of the slider
  borderColor: string;
  // border width - border width of the slider
  borderWidth: string;
  // border radius - border radius of the slider
  borderRadius: string;
  // direction of the slider
  direction: string;
  // callbacks
  // onSlide - callback when the slider is sliding
  onSlideCallback?: (value: number) => void;
  // onRelease - callback when the slider is released
  onReleaseCallback?: () => void;

  // verbose logging
  verboseLogging: boolean;

  // variables
  base: HTMLDivElement;
  baseSlider: HTMLDivElement;
  baseRect: DOMRect | undefined;
  // isPressed - flag to check if the slider is pressed
  isPressed: boolean;
  // slider value
  valuePercent: number;

  // constructor
  constructor(options: RetrackableSliderOptions) {
    // set uid or generate a new one
    this.uid = options.uid || Math.random().toString(36).substring(7);
    // container
    this.container = options.container || document.body;
    // top
    this.top = options.top || "50%";
    // left
    this.left = options.left || "50%";
    // width
    this.width = options.width || "1rem";
    // height
    this.height = options.height || "5rem";
    // color
    this.color = options.color || "gray";
    // border color
    this.borderColor = options.borderColor || "gray";
    // border width
    this.borderWidth = options.borderWidth || "2px";
    // border radius
    this.borderRadius = options.borderRadius || "2px";
    // direction
    this.direction = options.direction || "vertical";
    // assert that diretion is either vertical or horizontal

    // callbacks
    this.onSlideCallback =
      options.onSlideCallback ||
      ((value: number) => {
        console.log(`[RetrackableSlider:${this.uid}] Sliding: ${value}`);
      });
    this.onReleaseCallback =
      options.onReleaseCallback ||
      (() => {
        console.log(`[RetrackableSlider:${this.uid}] Released`);
      });

    // verbose logging
    this.verboseLogging = options.verboseLogging || false;
    // is pressed
    this.isPressed = false;
    // value
    this.valuePercent = 0;

    // create a base
    this.base = document.createElement("div");
    this.base.id = `ts-retrackable-slider-${this.uid}`;
    this.baseSlider = document.createElement("div");
    this.baseSlider.id = `ts-retrackable-slider-${this.uid}-cursor`;

    // call init
    this.init();
  }

  /**
   * Logging Function
   */
  log(message: string) {
    if (this.verboseLogging) {
      console.log(`[RetrackableSlider:${this.uid}] ${message}`);
    }
  }

  /**
   * Init
   */
  init() {
    // log
    this.log("Initializing RetrackableSlider...");

    // render UI
    // base
    this.base.style.cssText = `
        position: fixed;
        top: ${this.top};
        left: ${this.left};
        width: ${this.width};
        height: ${this.height};
        transform: translate(-50%, -50%);
        margin: 0;
        padding: 0;
        opacity: 0.4;
        border: ${this.borderWidth} solid ${this.borderColor};
        border-radius: ${this.borderRadius};
        /* Prevent ui glitches */
        z-index: 1000;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        /* Prevent any inherited styles */
        box-sizing: border-box;
        overflow: hidden;
        font-size: 16px;
        line-height: 1;
        text-align: center;`;
    // slider
    this.baseSlider.style.cssText = `
        position: absolute;
        transition: background-color 0.2s ease;
        /* opacity: 0.7%; */
        background: ${this.color};
        backdrop-filter: blur(10px);
        /* Prevent ui glitches */
        pointer-events: none;
        `;

    // set constants for the slider according to the direction
    if (this.direction === "vertical") {
      // fix base
      this.baseSlider.style.bottom = "0";
      // fix
      this.baseSlider.style.width = "100%";
      // variable
      this.baseSlider.style.height = "0%";
    } else {
      // fix base
      this.baseSlider.style.left = "0";
      // fix
      this.baseSlider.style.height = "100%";
      // variable
      this.baseSlider.style.width = "0%";
    }

    this.base.appendChild(this.baseSlider);
    this.container.appendChild(this.base);

    // add event listeners
    // Mouse and touch events
    this.base.addEventListener("pointerup", this.onSliderUp.bind(this));
    this.base.addEventListener("pointerdown", this.onSliderDown.bind(this));
    this.base.addEventListener("pointermove", this.onSliderMove.bind(this));
    // release if out of bounds
    this.base.addEventListener("pointercancel", this.onSliderUp.bind(this));

    // Window resize event
    window.addEventListener("resize", this.updateContainerRectangle.bind(this));

    // Prevent select context events
    this.base.addEventListener("selectstart", (e: Event) => e.preventDefault());
    this.base.addEventListener("contextmenu", (e: Event) => e.preventDefault());
    // monkey patch preventDefault for touch events (on mobile devies)
    this.base.addEventListener("touchstart", (e: TouchEvent) => {
      e.preventDefault();
    });
  }

  /**
   * Update UI
   */
  updateUI() {
    // log
    this.log("Updating UI...");

    // set opacity and position
    if (this.direction === "vertical") {
      // change height only
      this.baseSlider.style.height = `${this.valuePercent}%`;
    } else {
      // change width only
      this.baseSlider.style.width = `${this.valuePercent}%`;
    }
  }

  /**
   * Update Container Rectangle
   *
   * Updaate the base rectangle bounds for the slider to calculate the position of the cursor.
   */
  updateContainerRectangle() {
    this.baseRect = this.base.getBoundingClientRect();
  }

  // ***<< EVENT HANDLERS >>***

  /**
   * Handle Slider Down
   */
  onSliderUp(e: PointerEvent) {
    // log
    this.log("Slider Up");

    // prevent default
    e.preventDefault();

    // set isPressed to false
    this.isPressed = false;

    // reset value
    if (this.valuePercent !== 0) {
      this.valuePercent = 0;
      this.updateUI();
      // call callbacks
      if (this.onReleaseCallback) {
        this.onReleaseCallback.call(this);
      }
    }
  }

  /**
   * Handle Slider Down
   */
  onSliderDown(e: PointerEvent) {
    // log
    this.log("Slider Down");

    // prevent default
    e.preventDefault();

    // set isPressed to true
    this.isPressed = true;
    this.base.setPointerCapture(e.pointerId);

    // update container rectangle
    this.updateContainerRectangle();

    // call callbacks
    if (this.onSlideCallback) {
      this.onSlideCallback.call(this, this.valuePercent);
    }
  }

  /**
   * Handle Slider Move
   */
  onSliderMove(e: PointerEvent) {
    // prevent default
    e.preventDefault();

    // check if the slider is pressed
    if (!this.isPressed) return;

    // update container rectangle
    this.updateContainerRectangle();

    // calculate the value
    let value = 0;
    if (this.direction === "vertical") {
      value =
        100 - ((e.clientY - this.baseRect!.top) / this.baseRect!.height) * 100;
    } else {
      value = ((e.clientX - this.baseRect!.left) / this.baseRect!.width) * 100;
    }

    // clamp the value
    value = Math.round(Math.max(0, Math.min(100, value)));

    // set value if not changed
    if (this.valuePercent !== value) {
      this.valuePercent = value;
      this.updateUI();
      this.log(`Slider Value: ${this.valuePercent}`);
      // call callbacks
      if (this.onSlideCallback) {
        this.onSlideCallback.call(this, this.valuePercent);
      }
    }
  }
}
