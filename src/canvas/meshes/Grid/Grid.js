import {
  Color,
  DoubleSide,
  GLSL3,
  Mesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';

import { component, updateComponentRegistry } from '@/canvas/dispatcher';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';

// shader
import vertexShader from './Grid.vert';
import fragmentShader from './Grid.frag';

export class Grid extends component(Object3D, {
  raf: {
    renderPriority: 1,
    fps: Infinity,
  },
}) {
  init() {
    this.config = {
      baseColor: '#707070',
      majorLineColor: '#ffffff',
      minorLineColor: '#f1f1f1',
      xAxisColor: '#ff0000',
      zAxisColor: '#0000ff',
    };
    this.geometry = new PlaneGeometry(10000, 10000, 2, 2);
    this.material = new ShaderMaterial({
      side: DoubleSide,
      glslVersion: GLSL3,
      transparent: true,
      name: 'Plane',
      vertexShader,
      fragmentShader,
      uniforms: {
        u_baseAlpha: { value: 0.5 },
        u_majorLineWidth: { value: 0.04 }, // Example default value, adjust as needed
        u_minorLineWidth: { value: 0.01 }, // Example default value
        u_axisLineWidth: { value: 0.15 }, // Example default value
        u_majorGridDiv: { value: 10.0 }, // Example default value
        u_gridDiv: { value: 4.0 }, // Example default value
        u_majorLineColor: { value: new Color(this.config.majorLineColor) }, // White color
        u_minorLineColor: { value: new Color(this.config.minorLineColor) }, // White color
        u_baseColor: { value: new Color(this.config.baseColor) }, // Black color
        u_xAxisColor: { value: new Color(1, 0.3, 0.3) }, // Red color
        u_zAxisColor: { value: new Color(0.3, 0.3, 1) }, // Blue color
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.updateMatrix();
    this.mesh.matrixWorld.copy(this.matrixWorld);

    renderer.compileAsync(this.mesh, scene).then(() => {
      this.add(this.mesh);
      scene.add(this);
    });
  }
  onDebug({ gui }) {
    this.gui = gui.addFolder('Grid');
    this.gui
      .add(this.material.uniforms.u_majorLineWidth, 'value', 0, 1)
      .name('Major Line Width');
    this.gui
      .add(this.material.uniforms.u_minorLineWidth, 'value', 0, 0.5)
      .name('Minor Line Width');
    this.gui
      .add(this.material.uniforms.u_axisLineWidth, 'value', 0, 1)
      .name('Axis Line Width');

    this.gui
      .add(this.material.uniforms.u_gridDiv, 'value', 1, 20, 1)
      .name('Grid Div');
    this.gui
      .add(this.material.uniforms.u_majorGridDiv, 'value', 1, 50, 1)
      .name('Major Grid Div');
    this.gui
      .add(this.material.uniforms.u_baseAlpha, 'value', 0, 1)
      .name('Base Alpha');
    this.gui
      .addColor(this.config, 'baseColor')
      .onChange((value) => {
        this.material.uniforms.u_baseColor.value.set(value);
      })
      .name('Base Color');

    this.gui
      .addColor(this.config, 'majorLineColor')
      .onChange((value) => {
        this.material.uniforms.u_majorLineColor.value.set(value);
      })
      .name('Major Line Color');

    this.gui
      .addColor(this.config, 'minorLineColor')
      .onChange((value) => {
        this.material.uniforms.u_minorLineColor.value.set(value);
      })
      .name('Minor Line Color');

    this.gui
      .addColor(this.config, 'xAxisColor')
      .onChange((value) => {
        this.material.uniforms.u_xAxisColor.value.set(value);
      })
      .name('X Axis Color');

    this.gui
      .addColor(this.config, 'zAxisColor')
      .onChange((value) => {
        this.material.uniforms.u_zAxisColor.value.set(value);
      })
      .name('Z Axis Color');
  }
  onRaf() { }
  onResize() { }
  dispose() {
    super.dispose();
    if (this.gui) {
      this.gui.destroy();
    }
  }
}

// Minimal HMR setup
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    updateComponentRegistry('Grid', newModule);
  });
}
