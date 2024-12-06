#version 300 es
precision mediump float;

uniform samplerCube u_envMap;        // Environment map
uniform sampler2D u_sceneTexture;    // Scene texture (framebuffer)
uniform vec3 u_eye;                  // Camera position
uniform float u_refractiveIndex;     // Refractive index
uniform float u_roughness;           // Surface roughness
uniform vec3 u_absorption;           // Absorption coefficient

in vec3 v_normal;                    // Surface normal
in vec3 v_worldPos;                  // World position

out vec4 o_fragColor;

void main() {
    // View direction
    vec3 viewDir = normalize(v_worldPos - u_eye);

    // Fresnel effect
    float fresnel = pow(1.0 - dot(viewDir, normalize(v_normal)), 3.0);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // Refraction with roughness
    vec3 randomVector = normalize(vec3(fract(sin(dot(v_worldPos.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453))); // Random vector
    vec3 roughRefract = normalize(mix(
        refract(viewDir, normalize(v_normal), 1.0 / u_refractiveIndex),
        normalize(-v_normal + randomVector),
        u_roughness * u_roughness
    ));

    // Absorption (Beer’s Law)
    float distance = length(v_worldPos - u_eye); // Approximate thickness
    vec3 absorption = exp(-u_absorption * distance);

    // Sample environment map
    vec3 refractedColor = texture(u_envMap, roughRefract).rgb * absorption;

    // Reflection
    vec3 reflectionDir = reflect(viewDir, normalize(v_normal));
    vec3 reflectedColor = texture(u_envMap, reflectionDir).rgb;

    // Combine reflection and refraction using Fresnel
    vec3 finalColor = mix(refractedColor, reflectedColor, fresnel);

    o_fragColor = vec4(finalColor, 1.0); // Output color
}
