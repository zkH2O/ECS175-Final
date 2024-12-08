#version 300 es
precision mediump float;

// Uniforms
uniform samplerCube u_envMap;        // Environment map
uniform vec3 u_eye;                  // Camera position

// Inputs from vertex shader
in vec3 o_vertex_normal_world;       // Normal in world space
in vec3 o_vertex_position_world;     // Position in world space

// Output color
out vec4 o_fragColor;

void main() {
    // Recalculate the normal
    vec3 fragPos = o_vertex_position_world;
    vec3 dFdxPos = dFdx(fragPos); // Partial derivative in X direction
    vec3 dFdyPos = dFdy(fragPos); // Partial derivative in Y direction
    vec3 recalculatedNormal = normalize(cross(dFdxPos, dFdyPos));

    // Mix recalculated normal with original normal for smoothing
    float normalBlendFactor = 0.5; // Adjust blend strength (0 = original normal, 1 = recalculated normal)
    vec3 normal = normalize(mix(o_vertex_normal_world, recalculatedNormal, normalBlendFactor));

    // View direction
    vec3 viewDir = normalize(u_eye - fragPos);

    // Reflection direction
    vec3 reflectionDir = reflect(viewDir, normal);

    // Sample the environment map
    vec3 reflectionColor = texture(u_envMap, reflectionDir).rgb;

    // Blend reflection with black color
    float mixFactor = 0.1; // Higher value = more black, lower value = more reflection
    vec3 finalColor = mix(vec3(0.0, 0.0, 0.0), reflectionColor, mixFactor);

    o_fragColor = vec4(finalColor, 1.0); // Output final color
}
