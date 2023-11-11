import { LinearFilter, Vector2 } from 'three';

import { component } from '@/canvas/dispatcher';
import FBO from '@/canvas/utils/fbo';

const shader = /* glsl */ `
precision highp float;

uniform sampler2D u_texture;
uniform vec2 uPointer;

in vec2 vUv;
float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
  uv -= disc_center;
  float dist = sqrt(dot(uv, uv));
  return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
}

layout(location = 0) out vec4 gColor;
void main() {
  vec4 color = texture(u_texture, vUv);

  color.rgb += circle(vUv, uPointer, 0.0, 0.05);
  color.rgb = mix(color.rgb, vec3(0.0), .04);
  color.rgb = clamp(color.rgb, vec3(0.0), vec3(1.0));
  color.a = 1.0;

  gColor = color;
}
`;

class Trail extends component(null, {
  raf: {
    renderPriority: 0,
    fps: Infinity,
  },
}) {
  init() {
    this.fbo = new FBO({
      width: 1024,
      height: 1024,
      name: 'trail',
      shader,
      uniforms: {
        uPointer: { value: new Vector2() },
      },
      rtOptions: {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
      },
      // debug: true,
    });

    this.pointerTarget = new Vector2();
  }

  onPointerMove({ pointer }) {
    this.pointerTarget.set(
      pointer.x / window.innerWidth,
      1 - pointer.y / window.innerHeight
    );
  }

  onRaf() {
    // this.fbo.uniforms.uPointer.value.lerp(this.pointerTarget, 7 * delta);
    this.fbo.uniforms.uPointer.value.copy(this.pointerTarget);
    this.fbo.update();
  }
}

export default new Trail();
