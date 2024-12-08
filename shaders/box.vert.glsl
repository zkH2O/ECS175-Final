#version 300 es

// Inputs
in vec3 a_position;       // Vertex position
in vec3 a_normal;         // Vertex normal

// Uniforms
uniform mat4 u_m;         // Model matrix
uniform mat4 u_v;         // View matrix
uniform mat4 u_p;         // Projection matrix

// Outputs to fragment shader
out vec3 o_vertex_normal_world;   // Normal in world space
out vec3 o_vertex_position_world; // Position in world space

void main() {
    // Compute world-space position
    vec4 worldPos = u_m * vec4(a_position, 1.0);
    o_vertex_position_world = worldPos.xyz;

    // Transform the normal to world space
    o_vertex_normal_world = mat3(u_m) * a_normal;

    // Compute the clip-space position
    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0);
}
