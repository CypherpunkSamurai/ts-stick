# ts-stick 🎮

A lightweight TypeScript library for adding on-screen game controls to web applications. Includes customizable joystick, d-pad, buttons and slider controls.

[![npm version](https://badge.fury.io/js/ts-stick.svg)](https://www.npmjs.com/package/ts-stick)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ts-stick)](https://bundlephobia.com/package/ts-stick)

## Key Features

- 🕹️ **Virtual Joystick**: Responsive analog joystick with customizable appearance and sensitivity
- 🎮 **D-pad Controller**: Precise 8-direction d-pad with configurable styling
- 🔘 **Interactive Buttons**: Fully customizable buttons supporting SVG icons and animations
- 📊 **Retractable Slider**: Smart vertical/horizontal slider with auto-return functionality
- 🎨 **Extensive Styling**: Complete control over colors, dimensions, positions, and animations
- 📱 **Cross-Platform**: Seamless support for both touch and mouse interactions
- 🪶 **Zero Dependencies**: Lightweight implementation using pure TypeScript and DOM APIs
- 📦 **Tree-Shakeable**: Import only what you need to minimize bundle size

## Quick Start

You can use ts-stick in your project by including the library from a CDN or installing it via NPM.

### Using NPM

Install the package using your preferred package manager:

```bash
# npm
npm install ts-stick

# pnpm
pnpm add ts-stick

# yarn
yarn add ts-stick
```

#### Joystick Controller

JoyStickController is a virtual joystick that can be used to control the movement of an object in a 2D space. The controller can be customized with different colors, sizes, and sensitivity levels. The `onInputCallback` function is called whenever the joystick is moved, providing the x and y coordinates of the thumbstick within the range of -1 to 1.

```typescript
import { JoystickController } from "ts-stick";

const joystick = new JoystickController({
	container: document.getElementById("joystick-container"),
	radius: 100,
	color: "#CCC",
	thumbColor: "#333",
	onInputCallback: (x: number, y: number) => {
		console.log(`Position: x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
	},
});
```

#### D-pad Controller

DpadController is a directional pad that can be used to control the movement of an object in 9 directions (`up`, `down`, `left`, `right`, `up-left`, `up-right`, `down-left`, `down-right`, `center`). The controller can be customized with different colors, sizes, and callback functions. The `onPressCallback` function is called whenever a direction is pressed.

```typescript
import { DpadController } from "ts-stick";

const dpad = new DpadController({
	container: document.getElementById("dpad-container"),
	radius: 150,
	colorBase: "#4a4a4a",
	colorPressed: "#2a2a2a",
	onPressCallback: (direction: string) => {
		console.log(`Direction: ${direction}`);
	},
});
```

#### Button Controller

ButtonController is a simple button that can be used to trigger an action when pressed. The controller can be customized with different colors, sizes, and an optional icon. The `onPressCallback` function is called whenever the button is pressed.

```typescript
import { ButtonController } from "ts-stick";

const button = new ButtonController({
	container: document.getElementById("button-container"),
	width: "80px",
	height: "80px",
	color: "#3498db",
	pressedColor: "#2980b9",
	icon: "path/to/icon.svg", // Optional
	onPressCallback: () => {
		console.log("Button activated");
	},
});
```

#### Retractable Slider

RetractableSlider is a vertical or horizontal slider that can be used to outpu a value when moved. The controller can be customized with different colors, sizes, and callback functions. The `onSlideCallback` function is called whenever the slider is moved, providing the current value between 0 and 100.

```typescript
import { RetractableSlider } from "ts-stick";

const slider = new RetractableSlider({
	container: document.getElementById("slider-container"),
	direction: "vertical",
	height: "200px",
	color: "#e74c3c",
	trackColor: "#c0392b",
	onSlideCallback: (value: number) => {
		console.log(`Value: ${value.toFixed(2)}`);
	},
});
```

## Todo

Planned Features and Improvements:

- [ ] 🔄 Add rotation support to button controller
- [ ] 📚 Add typedoc documentation

## Browser Support

ts-stick is designed to work on all modern browsers and devices. The library has been tested on the following platforms:

- Chrome (latest) 🌐
- Firefox (latest) 🦊
- Safari (latest) 🧭
- Edge (latest) 🌐
- iOS Safari (latest) 📱
- Chrome for Android (latest) 📱

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

ts-stick is [MIT licensed](LICENSE).
