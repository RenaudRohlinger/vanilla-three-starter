precision highp float;

// Uniforms
uniform float u_majorGridDiv;

out vec4 v_uv; // Passed to the fragment shader

void main() {
  vec4 transformed = vec4(position, 1.0);
    // Convert position to clip space (replacing Unity's UnityObjectToClipPos)
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformed;

    float div = max(2.0, round(u_majorGridDiv));

    // Use local position for grid calculations
    vec3 localPos = transformed.xyz;

    vec3 cameraCenteringOffset = floor((vec4(cameraPosition, 1.0)).xyz / div) * div;
    v_uv.yx = (localPos - cameraCenteringOffset).xy;
    v_uv.wz = localPos.xy;
}
