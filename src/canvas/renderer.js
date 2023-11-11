import { WebGLRenderer } from 'three';

import { component } from '@/canvas/dispatcher';
import settings from '@/canvas/settings';

class Renderer extends component(WebGLRenderer) {
  constructor() {
    super({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
    });

    this.setPixelRatio(settings.dpr);
  }

  onResize({ width, height }) {
    this.setSize(width, height);
  }
}

export default new Renderer();
