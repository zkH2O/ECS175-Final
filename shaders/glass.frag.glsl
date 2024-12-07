#version 300 es
precision mediump float;

uniform samplerCube u_envMap; // Environment map
uniform float u_refractiveIndex; // Refractive index

in vec3 v_normal; // Normal from vertex shader
in vec3 v_viewDir; // View direction

out vec4 o_fragColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 viewDir = normalize(v_viewDir);

    // Reflection
    vec3 reflectedDir = reflect(viewDir, normal);
    vec4 reflectionColor = texture(u_envMap, reflectedDir);

    // Refraction
    vec3 refractedDir = refract(viewDir, normal, 1.0 / u_refractiveIndex);
    vec4 refractionColor = texture(u_envMap, refractedDir);

    // Fresnel effect
    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    vec4 finalColor = mix(refractionColor, reflectionColor, fresnel);

    // Transparency
    o_fragColor = vec4(finalColor.rgb, 0.5); // Semi-transparent
}
