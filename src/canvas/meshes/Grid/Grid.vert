precision highp float;

// Uniforms
uniform float u_majorGridDiv;

out vec2 v_uv; // Passed to the fragment shader
out vec2 v_worldPos;
void main() {
  vec4 transformed = vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformed;

    vec3 worldPosition = (modelMatrix * transformed).xyz;

    // Adjust world position relative to the camera
    vec3 cameraRelativeWorldPos = worldPosition - cameraPosition;
    v_worldPos = worldPosition.xz;
    // v_worldPos = cameraRelativeWorldPos.xz / u_majorGridDiv;

    // Use local position for grid calculations
    vec3 localPos = transformed.xyz;
    vec3 cameraCenteringOffset = floor(cameraPosition);
    vec3 cameraSnappedWorldPos = worldPosition.xyz - cameraCenteringOffset;
    v_uv = cameraSnappedWorldPos.xz;

}
