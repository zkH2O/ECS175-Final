#version 300 es

#define MAX_LIGHTS 16

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

uniform bool u_show_normals;

// struct definitions
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
    vec3 kA;
    vec3 kD;
    vec3 kS;
    float shininess;
    sampler2D map_kD;
    sampler2D map_nS;
    sampler2D map_norm;
};

// lights and materials
uniform AmbientLight u_lights_ambient[MAX_LIGHTS];
uniform DirectionalLight u_lights_directional[MAX_LIGHTS];
uniform PointLight u_lights_point[MAX_LIGHTS];

uniform Material u_material;

// camera position
uniform vec3 u_eye;

// received from vertex stage
in mat3 o_tbn;
in vec3 o_vertex_position_world;
in vec2 o_texture_coord;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 o_fragColor;

// Shades an ambient light and returns this light's contribution
vec3 shadeAmbientLight(Material material, AmbientLight light) {
    if (light.intensity == 0.0)
        return vec3(0);

    return light.color * light.intensity * material.kA * texture(material.map_kD, o_texture_coord).rgb;
}

// Shades a directional light and returns its contribution
vec3 shadeDirectionalLight(Material material, DirectionalLight light, vec3 normal, vec3 eye, vec3 vertex_position) {
    vec3 result = vec3(0);
    if (light.intensity == 0.0)
        return result;

    vec3 N = normalize(normal);
    vec3 L = -normalize(light.direction);
    vec3 V = normalize(eye - vertex_position);


    // Diffuse
    float LN = max(dot(L, N), 0.0);
    result += LN * light.color * light.intensity * material.kD * texture(material.map_kD, o_texture_coord).rgb;

    // Specular
    vec3 R = -reflect(L, N);
    float roughness = material.shininess * max(0.1, texture(material.map_nS, o_texture_coord).r);
    result += pow( max(dot(R, V), 0.0), roughness) * light.color * light.intensity * material.kS;


    return result;
}

// Shades a point light and returns its contribution
vec3 shadePointLight(Material material, PointLight light, vec3 normal, vec3 eye, vec3 vertex_position) {
    vec3 result = vec3(0);
    if (light.intensity == 0.0)
        return result;

    vec3 N = normalize(normal);
    float D = distance(light.position, vertex_position);
    vec3 L = normalize(light.position - vertex_position);
    vec3 V = normalize(eye - vertex_position);

    // Diffuse
    float LN = max(dot(L, N), 0.0);
    result += LN * light.color * light.intensity * material.kD * texture(material.map_kD, o_texture_coord).rgb;

    // Specular
    vec3 R = -reflect(L, N);
    float roughness = material.shininess * max(0.1, texture(material.map_nS, o_texture_coord).r);
    result += pow( max(dot(R, V), 0.0), roughness) * light.color * light.intensity * material.kS;

    // Attenuation
    result *= 1.0 / (D*D+1.0);

    return result;
}

void main() {

    // calculate the normal from the normal map and tbn matrix
    vec3 normal = normalize(o_tbn * ( (2.0 * texture(u_material.map_norm, o_texture_coord).rgb) - 1.0 ));

    // if we only want to visualize the normals, no further computations are needed
    if (u_show_normals == true) {
        o_fragColor = vec4(normal, 1.0);
        return;
    }

    // we start at 0.0 contribution for this vertex
    vec3 light_contribution = vec3(0.0);

    // iterate over all possible lights and add their contribution
    for(int i = 0; i < MAX_LIGHTS; i++) {
        light_contribution += shadeAmbientLight(u_material, u_lights_ambient[i]);
        light_contribution += shadeDirectionalLight(u_material, u_lights_directional[i], normal, u_eye, o_vertex_position_world);
        light_contribution += shadePointLight(u_material, u_lights_point[i], normal, u_eye, o_vertex_position_world);
    }

    o_fragColor = vec4(light_contribution, 1.0);
}
