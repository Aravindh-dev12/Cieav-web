# Cieav AI

Animated monochrome product-launch website for Cieav AI, built with Vue, Zustand's vanilla store, Vite, and WebGPU.

## Stack

- Vue 3 for the UI
- Zustand vanilla store bridged into Vue for shared pointer / scroll / renderer state
- WebGPU for the realtime hero shader
- Canvas 2D fallback when WebGPU is unavailable
- Vite for development and production builds
- Pure CSS motion, responsive layout, and reduced-motion support

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The WebGPU hero progressively enhances on supported browsers and falls back to a Canvas-rendered ripple / light field elsewhere.
