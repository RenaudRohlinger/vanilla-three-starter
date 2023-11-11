# Vanilla Three.js Starter

[starter.renaudrohlinger.com](https://starter.renaudrohlinger.com)

This project is an opinionated Vanilla Three.js starter
template, designed for modern web 3D graphics development. Fairly advanced level, gathering best practices with threejs and with a modular and scalable architecture.

## Getting Started

### Installation

Clone the repository and install dependencies using `pnpm install`.

### Development

Run `bun run dev` to start the development server.

```
src/
├─ canvas/
│  ├─ renderer.js     # Configures the WebGL renderer.
│  ├─ scene.js        # Sets up the Three.js scene.
│  ├─ camera.js       # Camera setup and controls.
│  ├─ loader.js       # Asset loading management.
│  ├─ postfx/         # Post-processing effects.
│  ├─ utils/          # Utility functions and helpers.
│  └─ meshes/         # Mesh definitions and implementations.
├─ dom/               # Handles DOM-related functionality.
├─ constants.js       # Project-wide constant values.
└─ main.js            # Entry point of the application.
```

## Key Features

### Modular Design

Component-Based Architecture: Organized into a modular structure, promoting code reusability and maintainability.

### Scene Management

Dedicated files for setting up and managing the Three.js scene, camera, and renderer.

## Global Pre-Loader System

### Efficient Asset Management

Centralized asset loading system using loader.js, supporting various file formats and ensuring efficient loading of resources.

### Dynamic Asset Loading

Implements a dynamic loading strategy, enabling asynchronous loading and management of loader like textures and 3D models.

## Event-Based, Singleton Architecture

### Dispatcher: A singleton-based event dispatcher

(dispatcher.js) facilitates communication between different components, enhancing the interactivity and responsiveness of the application.

## Customizable Loop System

### Adjustable FPS per Object

Fine-grained control over the rendering loop, allowing specification of frames per second on a per-object basis.

### Render Priority

Objects can define their render priority, ensuring critical visual elements are rendered preferentially.

## Performance Optimization

### Matrix Updates

Update matrices are disabled by default, optimizing performance for static or infrequently changing objects.

## Debugging System

### Debug Mode

Includes a toggleable debug mode, providing on-the-fly visualization and diagnostics.

This architecture is heavily based on and inspired by [Antipasto](https://github.com/luruke/antipasto), a robust and feature-rich boilerplate for threejs.
