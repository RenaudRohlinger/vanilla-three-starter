import { Mesh, MeshMatcapMaterial, Object3D } from 'three';

import { component } from '@/canvas/dispatcher';
import loader from '@/canvas/loader';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';
import trail from '@/canvas/utils/trail';

export default class extends component(Object3D, {
  raf: {
    renderPriority: 1,
    fps: 5,
  },
}) {
  init() {
    const _scene = loader.resources.suzanne.asset;
    const geometry = _scene.scene.children[0].geometry;
    this.geometry = geometry;

    const img = loader.resources.matcap.asset;

    this.material = new MeshMatcapMaterial({
      matcap: img,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uTrail = { value: trail.fbo.target };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform sampler2D uTrail;
        varying vec2 vUv;
        varying float vForce;
        float quarticOut(float t) {
          return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
        }
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <displacementmap_vertex>',
        `
        #include <displacementmap_vertex>
        vec4 pos = modelMatrix * vec4(position, 1.0);
        vec4 clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec2 uv = ((clipSpace.xy / clipSpace.w) + 1.0) / 2.0;
        float pointer = texture(uTrail, uv).r;
        float force = quarticOut(pointer);
        transformed.xyz += (normal * force) * .5;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        #include <project_vertex>
        vForce = force;
        vUv = uv;

        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform sampler2D uTrail;
        varying vec2 vUv;
        varying float vForce;
       

        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <normal_fragment_maps>',
        `
        #include <normal_fragment_maps>
        diffuseColor.rgb += vForce * 5.5;
        `
      );
    };

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.y = 2;
    this.mesh.updateMatrix();
    this.mesh.matrixAutoUpdate = false;
    renderer.compileAsync(this.mesh, scene).then(() => {
      this.add(this.mesh);
    });
  }
  onDebug({ gui }) {
    const folder = gui.addFolder('Suzanne');
    folder.add(this.raf, 'fps', 1, 120, 1);
  }

  onRaf({ delta }) {
    if (!this.mesh) {
      return;
    }
    this.mesh.rotation.x += 0.3 * delta;
    this.mesh.rotation.y += 0.3 * delta;
    this.mesh.updateMatrix();
  }
}
