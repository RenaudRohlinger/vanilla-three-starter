import {
  Color,
  DoubleSide,
  GLSL3,
  Mesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';

import { component } from '@/canvas/dispatcher';
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
        u_xAxisColor: { value: new Color(1, 0, 0) }, // Red color
        u_yAxisColor: { value: new Color(0, 1, 0) }, // Green color
        u_zAxisColor: { value: new Color(0, 0, 1) }, // Blue color
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.updateMatrix();

    renderer.compileAsync(this.mesh, scene).then(() => {
      this.add(this.mesh);
    });
  }
  onDebug({ gui }) {
    const folder = gui.addFolder('Grid');
    folder
      .add(this.material.uniforms.u_majorLineWidth, 'value', 0, 0.05)
      .name('Major Line Width');
    folder
      .add(this.material.uniforms.u_minorLineWidth, 'value', 0, 0.05)
      .name('Minor Line Width');
    folder
      .add(this.material.uniforms.u_axisLineWidth, 'value', 0, 1)
      .name('Axis Line Width');

    folder
      .add(this.material.uniforms.u_gridDiv, 'value', 0, 20, 1)
      .name('Grid Div');
    folder
      .add(this.material.uniforms.u_majorGridDiv, 'value', 0, 50, 1)
      .name('Major Grid Div');
    folder
      .add(this.material.uniforms.u_baseAlpha, 'value', 0, 1)
      .name('Base Alpha');
    folder
      .addColor(this.config, 'baseColor')
      .onChange((value) => {
        this.material.uniforms.u_baseColor.value.set(value);
      })
      .name('Base Color');

    folder
      .addColor(this.config, 'majorLineColor')
      .onChange((value) => {
        this.material.uniforms.u_majorLineColor.value.set(value);
      })
      .name('Major Line Color');

    folder
      .addColor(this.config, 'minorLineColor')
      .onChange((value) => {
        this.material.uniforms.u_minorLineColor.value.set(value);
      })
      .name('Minor Line Color');
  }
  onRaf() {}
  onResize({ width, height }) {}
}
