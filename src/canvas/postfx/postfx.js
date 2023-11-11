import {
  Camera,
  GLSL3,
  Mesh,
  RawShaderMaterial,
  Scene,
  Vector2,
  WebGLRenderTarget,
} from 'three';

import { component } from '@/canvas/dispatcher';
import fragmentShader from '@/canvas/postfx/postfx.frag';
import vertexShader from '@/canvas/postfx/postfx.vert';
import renderer from '@/canvas/renderer';
import triangle from '@/canvas/utils/triangle';

class PostFX extends component() {
  init() {
    this.scene = new Scene();
    this.dummyCamera = new Camera();
    this.resolution = new Vector2();
    this.renderer = renderer;

    this.target = new WebGLRenderTarget(this.resolution.x, this.resolution.y, {
      samples: 4,
    });

    const defines = {};

    const params = {
      offset: [0.008, 0.0008],
    };

    this.material = new RawShaderMaterial({
      glslVersion: GLSL3,
      defines,
      fragmentShader,
      vertexShader,
      uniforms: {
        uOffset: { value: new Vector2().fromArray(params.offset) },
        uModulationOffset: { value: 0.15 },
        uScene: { value: this.target.texture },
        uResolution: { value: this.resolution },
      },
    });

    this.triangle = new Mesh(triangle, this.material);
    this.triangle.frustumCulled = false;
    this.scene.add(this.triangle);
  }
  onDebug({ gui }) {
    const folder = gui.addFolder('PostFX');
    folder
      .add(this.material.uniforms.uModulationOffset, 'value', -1, 1)
      .name('Modulation offset');
  }

  onResize() {
    this.renderer.getDrawingBufferSize(this.resolution);
    this.target.setSize(this.resolution.x, this.resolution.y);
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.dummyCamera);
  }
}

export default new PostFX();
