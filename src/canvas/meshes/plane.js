import {
  Color,
  DoubleSide,
  GLSL3,
  Mesh,
  Object3D,
  PlaneGeometry,
  RawShaderMaterial,
} from 'three';

import { component } from '@/canvas/dispatcher';
import loader from '@/canvas/loader';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';
import trail from '@/canvas/utils/trail';

export class Plane extends component(Object3D, {
  raf: {
    renderPriority: 1,
    fps: Infinity,
  },
}) {
  init() {
    this.geometry = new PlaneGeometry(8, 8, 64, 64);
    this.material = new RawShaderMaterial({
      wireframe: false,
      side: DoubleSide,
      glslVersion: GLSL3,
      name: 'Plane',

      vertexShader: /* glsl */ `
        precision highp float;
        
        in vec3 normal;
        in vec3 position;

        uniform sampler2D uTrail;
        uniform mat3 normalMatrix;
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        out float vForce;
        out vec2 vUv;
        float quarticOut(float t) {
          return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
        }

        void main() {
          vec4 clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

          vec2 uv = ((clipSpace.xy / clipSpace.w) + 1.0) / 2.0;
          vUv = uv;
          float pointer = texture(uTrail, uv).r;
          vec4 pos = modelMatrix * vec4(position, 1.0);

          float force = quarticOut(pointer);
          vForce = force;

          vec3 norm = normalMatrix * normal;
          pos.rgb += (norm * force) * .5;

          gl_Position = projectionMatrix * viewMatrix * pos;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform sampler2D uMap;
        in float vForce;
        in vec2 vUv;
        layout(location = 0) out vec4 gColor;

        void main() {
          gColor = vec4(mix(texture(uMap, vUv).rgb, colorB, vForce), 1.0);
        }
      `,
      uniforms: {
        uMap: { value: loader.resources.matcap.asset },
        uTrail: { value: trail.fbo.target },
        colorA: { value: new Color('#ff0000') },
        colorB: { value: new Color('#ffffff') },
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.updateMatrix();

    renderer.compileAsync(this.mesh, scene).then(() => {
      this.add(this.mesh);
    });
  }

  onRaf() {}
  onResize() {}
}
