/**
 * Button Controller 🎮 - A class for on-screen button
 *
 * Button is a ui element for a on-screen button that returns a boolean value when pressed.
 */

/**
 * Options for configuring a joystick button.
 * @interface ButtonOptions
 * @property {string} [uid] - Unique identifier for the button
 * @property {HTMLElement} [container] - Container element for the button, defaults to document.body
 * @property {string} [top] - Top position of the button, defaults to "50%"
 * @property {string} [left] - Left position of the button, defaults to "50%"
 * @property {string} width - Width of the button
 * @property {string} height - Height of the button
 * @property {string} [color] - Color of the button
 * @property {string} [shadow] - Shadow style for the button
 * @property {number} [rotate] - Rotation angle of the button in degrees
 * @property {number} [radius] - Border radius for rounded corners
 * @property {string} [svg] - SVG icon string for the button
 * @property {boolean} [verboseLogging] - Enable verbose logging
 * @property {() => void} [onPressCallback] - Callback function triggered when button is pressed
 * @property {() => void} [onReleaseCallback] - Callback function triggered when button is released
 */
export interface ButtonOptions {
	/** Unique identifier for the button */
	uid?: string;
	/** Container element for the button, defaults to document.body */
	container?: HTMLElement;
	/** Top position of the button, defaults to "50%" */
	top?: string;
	/** Left position of the button, defaults to "50%" */
	left?: string;
	/** Width of the button */
	width: string;
	/** Height of the button */
	height: string;
	/** Color of the button */
	color?: string;
	/** Shadow style for the button */
	shadow?: string;
	/** Rotation angle of the button in degrees */
	rotate?: number;
	/** Border radius for rounded corners */
	radius?: number;
	/** SVG icon string for the button */
	svg?: string;
	/** Enable verbose logging */
	verboseLogging?: boolean;
	/** Callback function triggered when button is pressed */
	onPressCallback?: () => void;
	/** Callback function triggered when button is released */
	onReleaseCallback?: () => void;
}

/**
 * A class that creates and manages an interactive button controller element
 *
 * @remarks
 * The button is rendered as an absolute positioned div element with customizable properties.
 * It handles touch and mouse events, and provides visual feedback when pressed.
 * Can be used to create virtual gamepad buttons, touch controls, or interactive UI elements.
 *
 * @example
 * // Create a simple button
 * const button = new ButtonController({
 *   width: "60px",
 *   height: "60px",
 *   color: "#ff0000",
 *   top: "70%",
 *   left: "20%",
 *   onPressCallback: () => console.log("Button pressed!"),
 * });
 *
 * // Create a button with an SVG icon
 * const buttonWithIcon = new ButtonController({
 *   width: "80px",
 *   height: "80px",
 *   color: "#0000ff",
 *   svg: '<svg viewBox="0 0 24 24"><path fill="white" d="M8 5v14l11-7z"/></svg>',
 *   verboseLogging: true,
 * });
 *
 * @public
 * @class ButtonController
 * @property {string} uid - Unique identifier for the button
 * @property {HTMLElement} container - Button element container (usually document.body)
 * @property {string} top - Top position of the button
 * @property {string} left - Left position of the button
 * @property {string} width - Width of the button
 * @property {string} height - Height of the button
 * @property {string} color - Color of the button
 * @property {string} shadow - Shadow style of the button
 * @property {number} rotate - Rotation angle for the button in degrees
 * @property {number} radius - Border radius for rounded button corners
 * @property {SVGElement | null} svg - SVG icon element for the button (optional)
 * @property {boolean} verboseLogging - Enable verbose logging
 * @property {() => void} onPressCallback - Callback function triggered when button is pressed
 * @property {() => void} onReleaseCallback - Callback function triggered when button is released
 * @property {HTMLDivElement} base - HTML Base Element for the button
 * @property {boolean} isPressed - Current pressed state of the button
 *
 * @throws {Error} Throws an error if the button container is not found
 *
 */
export class ButtonController {
	/** Unique identifier for the button */
	uid: string;
	/** Button element container (usually document.body) */
	container: HTMLElement;
	/** Top position of the button */
	top: string;
	/** Left position of the button */
	left: string;
	/** Width of the button */
	width: string;
	/** Height of the button */
	height: string;
	/** Color of the button */
	color: string;
	/** Shadow style of the button */
	shadow: string;
	/** Rotation angle for the button in degrees */
	rotate: number;
	/** Border radius for rounded button corners */
	radius: number;
	/** SVG icon element for the button (optional) */
	svg: SVGElement | null;
	/** Enable verbose logging */
	verboseLogging: boolean;
	/** Callback function triggered when button is pressed */
	onPressCallback: () => void;
	/** Callback function triggered when button is released */
	onReleaseCallback: () => void;
	/** HTML Base Element for the button */
	base: HTMLDivElement;
	/** Current pressed state of the button */
	isPressed: boolean = false;

	/**
	 * Creates a new Button Controller instance
	 * @param {ButtonOptions} options - Configuration options for the button controller
	 */
	constructor(options: ButtonOptions) {
		this.uid = options.uid || Math.random().toString(36).substring(7);
		this.container = options.container || document.body;
		this.top = options.top || "50%";
		this.left = options.left || "50%";
		this.width = options.width || "1rem";
		this.height = options.height || "1rem";
		this.color = options.color || "gray";
		this.shadow =
			options.shadow || `0 4px 16px 0 ${this.color}, inset 0 0 0 1px #FFFFFF0D`;
		this.rotate = options.rotate || 0;
		this.radius = options.radius || 5;
		this.svg = options.svg
			? (new DOMParser().parseFromString(options.svg, "image/svg+xml")
					.documentElement as unknown as SVGElement)
			: null;
		this.verboseLogging = options.verboseLogging || false;
		this.onPressCallback =
			options.onPressCallback ||
			(() => {
				if (this.verboseLogging)
					console.log(`[ButtonController:${this.uid}] Button pressed!`);
			});
		this.onReleaseCallback =
			options.onReleaseCallback ||
			(() => {
				if (this.verboseLogging)
					console.log(`[ButtonController:${this.uid}] Button released!`);
			});

		// init base
		this.base = document.createElement("div");
		this.base.id = `ts-button-${this.uid}`;

		// Init
		this.init();
	}

	/**
	 * Log a message to the console if verbose logging is enabled
	 *
	 * @param {string} message - The message to log
	 * @returns {void}
	 */
	log(message: string): void {
		if (this.verboseLogging)
			console.log(`[ButtonController:${this.uid}] ${message}`);
	}

	/**
	 * Initialize the Button Controller
	 *
	 * Initializes the button controller by rendering the button to the DOM and adding event handlers.
	 *
	 * @throws {Error} Throws an error if the button container is not found
	 * @returns {void}
	 */
	init(): void {
		// Log
		this.log("Initializing Button Controller...");

		// Check Container Exists
		if (!this.container) {
			throw new Error("Button Container not found!");
		}

		// render button
		this.render();

		// add event handlers
		this.log("Adding Event Handlers...");
		this.container.addEventListener("pointerup", this.onButtonUp.bind(this));
		this.container.addEventListener(
			"pointerdown",
			this.onButtonDown.bind(this)
		);
		// prevent default touch events
		[
			"touchstart",
			"touchmove",
			"touchend",
			"touchcancel",
			"selectstart",
			"contextmenu",
		].forEach((e) =>
			this.container.addEventListener(e, (event) => event.preventDefault())
		);
	}

	/**
	 * Renders the button to the DOM by applying styles and appending elements
	 *
	 * @returns {void}
	 */
	render(): void {
		// log
		this.log("Rendering Button...");
		// calculate border radius
		const borderRadius = Math.pow(this.radius / 100, 1.5) * 50;

		// render styles
		this.base.style.cssText = `
            position: absolute;
            top: ${this.top};
            left: ${this.left};
            width: ${this.width};
            height: ${this.height};
            border: 4px solid ${this.color};
            border-radius: ${borderRadius}%;
            z-index: 1000;
            background-color: ${this.color};
            backdrop-filter: blur(10px);
            box-shadow: ${this.shadow};
            transition: opacity 0.2s linear;
            opacity: 0.6;
            /* Place Items at the center */
            display: flex;
            justify-content: center;
            align-items: center;
            /* Rotate if specified */
            transform: rotate(${this.rotate}deg);
        `;
		// if there is a svg icon render it
		if (this.svg) {
			this.base.appendChild(this.svg);
			this.svg.style.cssText = `
              width: fit;
              height: fit;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 1000;
              color: #FFFFFF;
              `;
		}

		// add to container
		this.container.appendChild(this.base);
	}

	// ***<< EVENT HANDLERS >>***

	/**
	 * Handle Button Up
	 *
	 * Handles the button up event and triggers the onReleaseCallback if it exists.
	 *
	 * @returns {void}
	 */
	onButtonUp(): void {
		if (!this.isPressed) {
			return;
		}
		this.log("Button Up!");
		this.isPressed = false;
		this.base.style.opacity = "0.6";
		if (this.onReleaseCallback) {
			this.onReleaseCallback.call(this);
		}
	}

	/**
	 * Handles the button press event.
	 *
	 * Handles the button press event and triggers the onPressCallback if it exists.
	 *
	 * @returns {void}
	 */
	onButtonDown(): void {
		if (this.isPressed) return;
		this.log("Button Down!");
		this.isPressed = true;
		this.base.style.opacity = "0.8";
		if (this.onPressCallback) {
			this.onPressCallback.call(this);
		}
	}
}
