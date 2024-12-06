#version 300 es

#define MAX_LIGHTS 16

precision mediump float;

// Uniforms for toggling normal visualization and refraction index
uniform bool u_show_normals;
uniform float u_refractiveIndex; // Refraction index for glass (default ~1.5)
uniform samplerCube u_envMap; // Cube map sampler for the environment map

// Struct definitions
struct AmbientLight {
    vec3 color;
    float intensity;
};

struct DirectionalLight {
    vec3 direction;
    vec3 color;
    float intensity;
};

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
};

struct Material {
    vec3 kA; // Ambient reflectivity
    vec3 kD; // Diffuse reflectivity
    vec3 kS; // Specular reflectivity
    float shininess; // Shininess coefficient
};

// Lights and material
uniform AmbientLight u_lights_ambient[MAX_LIGHTS];
uniform DirectionalLight u_lights_directional[MAX_LIGHTS];
uniform PointLight u_lights_point[MAX_LIGHTS];
uniform Material u_material;

// Camera position
uniform vec3 u_eye;

// Input from the vertex shader
in vec3 o_vertex_normal_world;
in vec3 o_vertex_position_world;

// Output color
out vec4 o_fragColor;

// Utility function: Calculates Fresnel reflection coefficient
float calculateFresnel(vec3 incident, vec3 normal, float refractiveIndex) {
    float cosI = abs(dot(normal, incident));
    float sinT2 = (1.0 - cosI * cosI) / (refractiveIndex * refractiveIndex);
    if (sinT2 > 1.0) return 1.0; // Total internal reflection
    float cosT = sqrt(1.0 - sinT2);
    float rOrth = (cosI - refractiveIndex * cosT) / (cosI + refractiveIndex * cosT);
    float rPara = (refractiveIndex * cosI - cosT) / (refractiveIndex * cosI + cosT);
    return (rOrth * rOrth + rPara * rPara) / 2.0;
}

// Utility function: Shades ambient light
vec3 shadeAmbientLight(Material material, AmbientLight light) {
    if (light.intensity == 0.0) return vec3(0);
    return light.color * light.intensity * material.kA;
}

// Utility function: Shades directional light
vec3 shadeDirectionalLight(Material material, DirectionalLight light, vec3 normal, vec3 eye, vec3 vertex_position) {
    vec3 result = vec3(0);
    if (light.intensity == 0.0) return result;

    vec3 N = normalize(normal);
    vec3 L = -normalize(light.direction);
    vec3 V = normalize(eye - vertex_position);

    // Diffuse
    float LN = max(dot(L, N), 0.0);
    result += LN * light.color * light.intensity * material.kD;

    // Specular
    vec3 R = -reflect(L, N);
    result += pow(max(dot(R, V), 0.0), material.shininess) * light.color * light.intensity * material.kS;

    return result;
}

// Utility function: Shades point light
vec3 shadePointLight(Material material, PointLight light, vec3 normal, vec3 eye, vec3 vertex_position) {
    vec3 result = vec3(0);
    if (light.intensity == 0.0) return result;

    vec3 N = normalize(normal);
    float D = distance(light.position, vertex_position);
    vec3 L = normalize(light.position - vertex_position);
    vec3 V = normalize(eye - vertex_position);

    // Diffuse
    float LN = max(dot(L, N), 0.0);
    result += LN * light.color * light.intensity * material.kD;

    // Specular
    vec3 R = -reflect(L, N);
    result += pow(max(dot(R, V), 0.0), material.shininess) * light.color * light.intensity * material.kS;

    // Attenuation
    result *= 1.0 / (D * D + 1.0);

    return result;
}

// Main function
void main() {

    // Normalized vectors
    vec3 N = normalize(o_vertex_normal_world);
    vec3 V = normalize(u_eye - o_vertex_position_world); // View vector

    // Fresnel effect
    float fresnel = calculateFresnel(V, N, u_refractiveIndex);

    // Reflection vector
    vec3 R = reflect(-V, N);

    // Refraction vector
    vec3 refractionVec = refract(-V, N, 1.0 / u_refractiveIndex);

    // Sample cube map for reflection and refraction
    vec3 reflection = texture(u_envMap, R).rgb;
    vec3 refraction = texture(u_envMap, refractionVec).rgb;

    // Combine reflection and refraction using Fresnel effect
    vec3 glassColor = mix(refraction, reflection, fresnel);

    // Combine light contributions
    vec3 light_contribution = vec3(0.0);
    for (int i = 0; i < MAX_LIGHTS; i++) {
        light_contribution += shadeAmbientLight(u_material, u_lights_ambient[i]);
        light_contribution += shadeDirectionalLight(u_material, u_lights_directional[i], o_vertex_normal_world, u_eye, o_vertex_position_world);
        light_contribution += shadePointLight(u_material, u_lights_point[i], o_vertex_normal_world, u_eye, o_vertex_position_world);
    }

    // Final color
    vec3 finalColor = glassColor * light_contribution;

    // Output the fragment color
    o_fragColor = vec4(finalColor, 0.6); // Semi-transparent for glass effect
}
