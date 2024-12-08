#version 300 es

precision mediump float;

// Material structure
struct Material {
    vec3 kA;         // Ambient coefficient
    vec3 kD;         // Diffuse coefficient
    vec3 kS;         // Specular coefficient
    float shininess; // Shininess factor
    sampler2D map_kD;   // Diffuse texture map
    sampler2D map_nS;   // Shininess/roughness map
    sampler2D map_norm; // Normal map
};

// Uniforms
uniform Material u_material;
uniform samplerCube u_envMap;   // Environment map
uniform vec3 u_eye;             // Camera position in world space
uniform bool u_show_normals;    // Debug flag to show normals

// Inputs from vertex shader
in vec3 v_position;  // World-space position of the fragment
in vec2 v_texcoord;  // Texture coordinates
in mat3 v_tbn;       // Tangent-Bitangent-Normal (TBN) matrix

// Output color
out vec4 o_fragColor;

void main() {
    // Calculate the normal using the normal map and TBN matrix
    vec3 normalMap = texture(u_material.map_norm, v_texcoord).rgb * 2.0 - 1.0; // Convert to [-1, 1]
    vec3 normal = normalize(v_tbn * normalMap);


    // View direction
    vec3 viewDir = normalize(u_eye - v_position);

    // Reflection direction for environment mapping
    vec3 reflectionDir = reflect(-viewDir, normal);

    // Sample the diffuse texture
    vec3 textureColor = texture(u_material.map_kD, v_texcoord).rgb;

    // Calculate ambient contribution using kA and the texture color
    vec3 ambient = u_material.kA * textureColor;

    // Sample environment map for reflections
    vec3 envReflection = texture(u_envMap, reflectionDir).rgb;

    // Combine ambient and reflections
    vec3 finalColor = mix(ambient, envReflection, 0.5); // Adjust blend factor as needed

    // Output the final color
    o_fragColor = vec4(finalColor, 1.0);
}
