precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uModulationOffset;
in vec2 vUvR;
in vec2 vUvB;

layout(location = 0) out vec4 gColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 color = texture(uScene, uv);

  vec2 ra = color.ra;
	vec2 ba = color.ba;

		const vec2 center = vec2(0.5);
		float d = distance(uv, center) * 2.0;
		d = max(d - uModulationOffset, 0.0);

		if(d > 0.0) {

			ra = texture(uScene, mix(uv, vUvR, d)).ra;
			ba = texture(uScene, mix(uv, vUvB, d)).ba;

		}
    
	gColor = vec4(ra.x, color.g, ba.x, max(max(ra.y, ba.y), color.a));
}