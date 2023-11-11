precision highp float;

uniform vec2 uOffset;

in vec2 position;
out vec2 vUvR;
out vec2 vUvB;

void main() {
  vec2 uv = position * 0.5 + 0.5;
  vec2 shift = uOffset * vec2(1.0, 0.);
	vUvR = uv + shift;
	vUvB = uv - shift;

  gl_Position = vec4(position, 1.0, 1.0);
}