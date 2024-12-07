#version 300 es
precision mediump float;

// Uniforms
uniform samplerCube u_envMap;        // Environment map
uniform vec3 u_eye;                  // Camera position
uniform float u_refractiveIndex;     // Refractive index
uniform float u_roughness;           // Surface roughness
uniform vec3 u_absorption;           // Absorption coefficient

// Inputs from vertex shader
in vec3 o_vertex_normal_world;       // Normal in world space
in vec3 o_vertex_position_world;     // Position in world space

// Output color
out vec4 o_fragColor;

void main() {
    // Normalize the world-space normal
    vec3 normal = normalize(o_vertex_normal_world);

    // View direction
    vec3 viewDir = normalize(o_vertex_position_world - u_eye);

    // Fresnel effect
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // Refraction with roughness
    vec3 randomVector = normalize(vec3(fract(sin(dot(o_vertex_position_world.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453))); // Random vector
    vec3 roughRefract = normalize(mix(
        refract(viewDir, normal, 1.0 / u_refractiveIndex),
        normalize(-normal + randomVector),
        u_roughness * u_roughness
    ));

    // Absorption (Beer’s Law)
    float distance = length(o_vertex_position_world - u_eye); // Approximate thickness
    vec3 absorption = exp(-u_absorption * distance);

    // Sample environment map for refraction
    vec3 refractedColor = texture(u_envMap, roughRefract).rgb * absorption;

    // Reflection
    vec3 reflectionDir = reflect(viewDir, normal);
    vec3 reflectedColor = texture(u_envMap, reflectionDir).rgb;

    // Combine reflection and refraction using Fresnel
    vec3 finalColor = mix(refractedColor, reflectedColor, fresnel);

    o_fragColor = vec4(finalColor, 1.0); // Output final color
}
