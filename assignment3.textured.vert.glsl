#version 300 es

// Input attributes
in vec3 a_position;       // Vertex position
in vec3 a_normal;         // Vertex normal
in vec3 a_tangent;        // Tangent vector
in vec2 a_texture_coord;  // Texture coordinates

// Uniforms for transformations
uniform mat4 u_m; // Model matrix
uniform mat4 u_v; // View matrix
uniform mat4 u_p; // Projection matrix

// Outputs to fragment shader
out vec3 v_position;      // World-space position of the vertex
out vec2 v_texcoord;      // Texture coordinates
out mat3 v_tbn;           // Tangent-Bitangent-Normal (TBN) matrix

void main() {
    // Compute the world-space position of the vertex
    vec4 position_world = u_m * vec4(a_position, 1.0);
    v_position = position_world.xyz;

    // Forward the texture coordinates
    v_texcoord = a_texture_coord;

    // Compute the normal matrix (inverse transpose of the model matrix)
    mat3 normal_matrix = transpose(inverse(mat3(u_m)));

    // Transform the normal, tangent, and bitangent to world space
    vec3 normal = normalize(normal_matrix * a_normal);
    vec3 tangent = normalize(normal_matrix * a_tangent);
    vec3 bitangent = cross(normal, tangent);

    // Re-orthogonalize the tangent using Gram-Schmidt
    tangent = normalize(tangent - dot(tangent, normal) * normal);

    // Construct the TBN matrix
    v_tbn = mat3(tangent, bitangent, normal);

    // Calculate the clip-space position for rendering
    gl_Position = u_p * u_v * position_world;
}
