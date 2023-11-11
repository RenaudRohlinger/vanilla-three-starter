/*
this.position = new FBO({
  width: 128,
  height: 128,
  name: 'position',
  shader: require('@/canvas/position.frag'),
  uniforms: {
    uTime: {
      value: 0
    },
  },
});

this.position.target
this.position.update()
*/

import {
  Camera,
  DataTexture,
  FloatType,
  GLSL3,
  HalfFloatType,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RawShaderMaterial,
  RGBAFormat,
  Scene,
  Vector2,
  WebGLRenderTarget,
} from 'three';

import camera from '@/canvas/camera';
import renderer from '@/canvas/renderer';
import triangle from '@/canvas/utils/triangle';

export default class FBO {
  constructor({
    width,
    height,
    data,
    name,
    shader,
    texture,
    uniforms = {},
    debug = false,
  }) {
    this.options = arguments[0];
    this.renderer = renderer;
    this.camera = new Camera();
    this.scene = new Scene();
    this.index = 0;
    this.copyData = true;
    this.texture =
      texture ||
      new DataTexture(
        data || new Float32Array(width * height * 4),
        width,
        height,
        RGBAFormat,
        FloatType
      );
    this.texture.needsUpdate = true;

    this.rt = [this.createRT(), this.createRT()];

    this.material = new RawShaderMaterial({
      name: name || 'FBO',
      glslVersion: GLSL3,
      uniforms: {
        ...uniforms,
        u_texture: {
          value: this.texture,
        },
        u_resolution: {
          value: new Vector2(width, height),
        },
      },
      vertexShader: `
        precision highp float;
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = position.xy * .5 + .5;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader:
        shader ||
        `
        precision highp float;
        uniform sampler2D u_texture;
        in vec2 vUv;
        layout(location = 0) out vec4 gColor;

        void main() {
          gColor = texture2D(u_texture, vUv);
        }
      `,
    });

    this.mesh = new Mesh(triangle, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    if (debug) {
      this.initDebug();
    }
  }

  initDebug() {
    this.debugGeometry = new PlaneGeometry(2, 2);
    this.debugMaterial = new MeshBasicMaterial({
      map: this.target,
    });

    this.debugMesh = new Mesh(this.debugGeometry, this.debugMaterial);
    this.debugMesh.position.set(-1, -1, -5);

    camera.add(this.debugMesh);
  }

  createRT() {
    return new WebGLRenderTarget(
      this.options.width,
      this.options.height,
      Object.assign(
        {
          minFilter: NearestFilter,
          magFilter: NearestFilter,
          stencilBuffer: false,
          depthBuffer: false,
          depthWrite: false,
          depthTest: false,
          type: HalfFloatType,
        },
        this.options.rtOptions
      )
    );
  }

  get target() {
    return this.rt[this.index].texture;
  }

  get uniforms() {
    return this.material.uniforms;
  }

  resize(width, height) {
    this.material.uniforms.u_resolution.set(width, height);
    this.options.width = width;
    this.options.height = height;

    this.rt.forEach((rt) => {
      rt.setSize(width, height);
    });
  }

  update(switchBack = true) {
    const destIndex = this.index === 0 ? 1 : 0;
    const old = this.rt[this.index];
    const dest = this.rt[destIndex];

    this.material.uniforms.u_texture.value = this.copyData
      ? this.texture
      : old.texture;

    const oldMainTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(dest);
    this.renderer.render(this.scene, this.camera);
    switchBack && this.renderer.setRenderTarget(oldMainTarget);

    this.index = destIndex;
    this.copyData = false;
  }
}
