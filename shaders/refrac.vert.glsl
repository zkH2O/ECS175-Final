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
    // Transform the vertex position to world space
    vec4 world_position = u_m * vec4(a_position, 1.0);
    o_vertex_position_world = world_position.xyz;

    // Transform the normal to world space
    o_vertex_normal_world = mat3(u_m) * a_normal; // Use the upper-left 3x3 of the model matrix to transform normals

    // Calculate the final clip-space position (MVP transformation)
    gl_Position = u_p * u_v * world_position;
}
