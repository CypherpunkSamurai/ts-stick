/**
 * RetrackableSlider Controller 🎮 - A class for on-screen retractable slider.
 *
 * A slider is a slider that retracts back to 0 when released.
 */

/**
 * Type alias representing the orientation of a slider.
 * Can be either "vertical" or "horizontal".
 * @typedef {("vertical"|"horizontal")} direction
 */
type direction = "vertical" | "horizontal";

// Options for RetractableSlider
/**
 * Interface representing options for configuring a retractable slider component.
 * @interface
 * @property {string} [uid] - Unique identifier for the slider
 * @property {HTMLElement} container - Container element where the slider will be mounted
 * @property {string} [top='50%'] - Top position of the slider relative to its container
 * @property {string} [left='50%'] - Left position of the slider relative to its container
 * @property {string} [width='100px'] - Width of the slider
 * @property {string} [height='500px'] - Height of the slider
 * @property {string} [color] - Color of the slider
 * @property {string} [borderColor='gray'] - Border color of the slider
 * @property {string} [borderWidth='2px'] - Border width of the slider
 * @property {string} [borderRadius='2px'] - Border radius of the slider
 * @property {('vertical'|'horizontal')} [direction='vertical'] - Direction of slider movement
 * @property {(value: number) => void} [onSlideCallback] - Callback function triggered during sliding, receives current value
 * @property {() => void} [onReleaseCallback] - Callback function triggered when slider is released
 * @property {boolean} [verboseLogging=false] - Enable detailed logging for debugging
 */
export interface RetrackableSliderOptions {
	/** unique id for the slider */
	uid?: string;
	/** container element of the slider (default: body) */
	container: HTMLElement;
	/** top position of the slider (default: 50%) */
	top?: string;
	/** left position of the slider (default: 50%) */
	left?: string;
	/** width: width of the slider (default: 100px) */
	width?: string;
	/** height: height of the slider (default: 500px) */
	height?: string;
	/** color of the slider */
	color?: string;
	/** border color of the slider (default: gray) */
	borderColor?: string;
	/** border width of the slider (default: 2px) */
	borderWidth?: string;
	/** border radius (default: 2px) */
	borderRadius?: string;
	/** direction of the slider to rotate (default: vertical)
  can be either vertical or horizontal  */
	direction?: direction;
	/** onSlide callback when the slider is sliding */
	onSlideCallback?: (value: number) => void;
	/** onRelease callback when the slider is released */
	onReleaseCallback?: () => void;
	/** verbose logging (default: false) */
	verboseLogging?: boolean;
}

/**
 * A class representing a retractable slider UI component that can be interacted with using mouse or touch input.
 * The slider can be oriented vertically or horizontally and automatically retracts when released.
 *
 * @example
 * const slider = new RetrackableSlider({
 *   container: document.getElementById('container'),
 *   direction: 'vertical',
 *   onSlideCallback: (value) => console.log(value)
 * });
 *
 * @public
 * @class RetrackableSlider
 * @property {string} uid - Unique identifier for the slider instance
 * @property {HTMLElement} container - The container element where the slider will be mounted
 * @property {string} top - CSS top position of the slider
 * @property {string} left - CSS left position of the slider
 * @property {string} width - Width of the slider
 * @property {string} height - Height of the slider
 * @property {string} color - Background color of the slider
 * @property {string} borderColor - Border color of the slider
 * @property {string} borderWidth - Border width of the slider
 * @property {string} borderRadius - Border radius of the slider
 * @property {string} direction - Direction of slider movement ('vertical' or 'horizontal')
 * @property {function} onSlideCallback - Callback function triggered while sliding, receives value as parameter
 * @property {function} onReleaseCallback - Callback function triggered when slider is released
 * @property {boolean} verboseLogging - Enable/disable detailed console logging
 * @property {HTMLDivElement} base - Main slider container element
 * @property {HTMLDivElement} baseSlider - Slider thumb element
 * @property {DOMRect} baseRect - Bounding rectangle of the slider
 * @property {boolean} isPressed - Current press state of the slider
 * @property {number} valuePercent - Current value of the slider (0-100)
 */
export class RetrackableSlider {
	/** uid - unique id of the slider */
	uid: string;
	/** container - container element for the slider */
	container: HTMLElement;
	/** top - top position of the slider */
	top: string;
	/** left - left position of the slider */
	left: string;
	/** width - width of the slider */
	width: string;
	/** height - height of the slider */
	height: string;
	/** color - color of the slider */
	color: string;
	/** border color - border color of the slider */
	borderColor: string;
	/** border width - border width of the slider */
	borderWidth: string;
	/** border radius - border radius of the slider */
	borderRadius: string;
	/** direction of the slider */
	direction: string;
	/** onSlide - callback when the slider is sliding */
	onSlideCallback?: (value: number) => void;
	/** onRelease - callback when the slider is released */
	onReleaseCallback?: () => void;

	/** verbose logging */
	verboseLogging: boolean;

	/** variables */
	base: HTMLDivElement;
	baseSlider: HTMLDivElement;
	baseRect: DOMRect | undefined;
	/** isPressed - flag to check if the slider is pressed */
	isPressed: boolean;
	/** slider value */
	valuePercent: number;

	/**
	 * Creates a new RetractableSlider instance.
	 * @param {RetrackableSliderOptions} options - The configuration options for the slider
	 * @param {string} [options.uid] - Unique identifier for the slider. If not provided, a random string will be generated
	 * @param {HTMLElement} [options.container=document.body] - Container element where the slider will be appended
	 * @param {string} [options.top="50%"] - Top position of the slider
	 * @param {string} [options.left="50%"] - Left position of the slider
	 * @param {string} [options.width="1rem"] - Width of the slider
	 * @param {string} [options.height="5rem"] - Height of the slider
	 * @param {string} [options.color="gray"] - Color of the slider
	 * @param {string} [options.borderColor="gray"] - Border color of the slider
	 * @param {string} [options.borderWidth="2px"] - Border width of the slider
	 * @param {string} [options.borderRadius="2px"] - Border radius of the slider
	 * @param {string} [options.direction="vertical"] - Direction of the slider movement ("vertical" | "horizontal")
	 * @param {Function} [options.onSlideCallback] - Callback function that fires when sliding, receives value parameter
	 * @param {Function} [options.onReleaseCallback] - Callback function that fires when slider is released
	 * @param {boolean} [options.verboseLogging=false] - Enable verbose logging for debugging
	 */
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
	 * Logs a message to the console if verbose logging is enabled
	 * @param message - The message to log
	 * @returns void
	 */
	log(message: string) {
		if (this.verboseLogging) {
			console.log(`[RetrackableSlider:${this.uid}] ${message}`);
		}
	}

	/**
	 * Initializes the RetractableSlider component by setting up the UI elements and event listeners.
	 *
	 * @example
	 * const slider = new RetractableSlider();
	 * slider.init();
	 *
	 * @remarks
	 * This method performs the following:
	 * - Sets up the base container styles with fixed positioning and visual properties
	 * - Configures the slider element with proper styling based on direction (vertical/horizontal)
	 * - Attaches the slider to the DOM
	 * - Binds pointer events (up/down/move/cancel) for interaction
	 * - Adds window resize handler
	 * - Sets up event prevention for select/context menu
	 * - Adds touch event prevention for mobile devices
	 *
	 * @returns {void}
	 */
	init(): void {
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
	 * Updates the visual representation of the slider based on its current value and direction.
	 * For vertical sliders, adjusts the height, while for horizontal sliders adjusts the width.
	 * The size is set as a percentage based on the current value.
	 * @private
	 * @memberof RetractableSlider
	 */
	updateUI(): void {
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
	updateContainerRectangle(): void {
		this.baseRect = this.base.getBoundingClientRect();
	}

	// ***<< EVENT HANDLERS >>***

	/**
	 * Handle Slider Down
	 */
	onSliderUp(e: PointerEvent): void {
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
	onSliderDown(e: PointerEvent): void {
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
	onSliderMove(e: PointerEvent): void {
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
