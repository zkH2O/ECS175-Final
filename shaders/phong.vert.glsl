#version 300 es

// Input attributes
in vec3 a_position; // Vertex position
in vec3 a_normal;   // Vertex normal

// Transformation matrices
uniform mat4 u_m; // Model matrix
uniform mat4 u_v; // View matrix
uniform mat4 u_p; // Projection matrix

// Outputs to fragment shader
out vec3 o_vertex_normal_world;   // Normal in world space
out vec3 o_vertex_position_world; // Position in world space

void main() {
    // Transform vertex position to world space
    vec4 vertex_position_world = u_m * vec4(a_position, 1.0);

    // Transform normal to world space
    mat3 normal_matrix = transpose(inverse(mat3(u_m)));
    vec3 vertex_normal_world = normalize(normal_matrix * a_normal);

    // Pass outputs to fragment shader
    gl_Position = u_p * u_v * vertex_position_world;
    o_vertex_normal_world = vertex_normal_world;
    o_vertex_position_world = vertex_position_world.xyz;
}
