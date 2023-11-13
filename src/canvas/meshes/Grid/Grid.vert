precision highp float;

// Uniforms
uniform float u_majorGridDiv;
uniform float u_gridDiv;

out vec2 v_uv; // Passed to the fragment shader
out vec2 v_worldPos;
void main() {
  vec4 transformed = vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformed;

    vec3 worldPosition = (modelMatrix * transformed).xyz;

    v_worldPos = worldPosition.xz * u_gridDiv;

    // Use local position for grid calculations
    vec3 localPos = transformed.xyz;
    vec3 cameraCenteringOffset = floor(cameraPosition);
    vec3 cameraSnappedWorldPos = worldPosition.xyz - cameraCenteringOffset;
    v_uv = cameraSnappedWorldPos.xz * u_gridDiv;

}
