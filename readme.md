# Vanilla Three.js Starter

[starter.renaudrohlinger.com](https://starter.renaudrohlinger.com)

This project is an opinionated Vanilla Three.js starter
template, designed for modern web 3D graphics development. Fairly advanced level, gathering best practices with threejs and with a modular and scalable architecture.

## Getting Started

The goal with this starter is to make an architecture framework proof. You can find a list of implementaiton with different frameworks in [examples/](https://github.com/RenaudRohlinger/vanilla-three-starter/tree/main/src/examples) folder.

### Installation

Clone the repository and install dependencies using `pnpm install`.

### Getting started

Anywhere in your code simply init the project:

```js
import { init, dispatcher } from '/src/main.js';
init({
  debug: true,
});
dispatcher.on('loadProgress', ({ progress }) => {
  console.log(`⏳ Loading ${progress.toFixed(2)}%`);
});
```

### Development

Run `pnpm run dev` to start the development server.

```
src/
├─ canvas/
│  ├─ renderer.js     # Configures the WebGL renderer.
│  ├─ scene.js        # Sets up the Three.js scene.
│  ├─ camera.js       # Camera setup and controls.
│  ├─ loader.js       # Asset loading management.
│  ├─ postfx/         # Post-processing effects.
│  ├─ utils/          # Utility functions and helpers.
│  ├─ meshes/         # Mesh definitions and implementations.
│  └─ dispatcher/     # Helpers shared by all components
└─ main.js            # Entry point of the application.
```

### Example of a Mesh:

```js
import {
  Mesh,
  Object3D,
} from 'three';

import { component } from '@/canvas/dispatcher';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';

export class Plane extends component(Object3D, {
  raf: {
    renderPriority: 1, // the order in the main loop
    fps: Infinity, // can be throttled by specifying the fps
  },
}) {
  init() {
    this.mesh = new Mesh();
    this.mesh.updateMatrix(); // required since we disabled by default
    renderer.compileAsync(this.mesh, scene).then(() => { // better compile for GPU
      this.add(this.mesh);
    });
  }

  onRaf({ delta }) {
    this.mesh.rotation.x += 0.01; // example of animation
    this.mesh.updateMatrix();
  }
  onResize({width, height, ratio}) {}
  onDebug({gui}) { // lil-gui debug is now accessible }
}
```

Any custom event can be added and gets emitted like so:

```js
dispatcher.trigger({ name: 'debug', fireAtStart: true }, { gui });
```

This will call `onDebug` to all the classes extending component or custom listeners `dispatcher.on('debug', () => {}`

### Debug Mode

Includes a toggleable debug mode, providing on-the-fly visualization and diagnostics.

## Credits

This architecture is heavily based on and inspired by [Antipasto](https://github.com/luruke/antipasto), a robust and feature-rich boilerplate for threejs.

## Maintainers :

- [`twitter @onirenaud`](https://twitter.com/onirenaud)
- [`twitter @utsuboco`](https://twitter.com/utsuboco)
