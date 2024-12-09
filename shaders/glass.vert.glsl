#version 300 es
precision mediump float;

in vec3 a_position;   // Vertex position
in vec3 a_normal;     // Vertex normal

uniform mat4 u_mvp;   // Model-View-Projection matrix
uniform mat4 u_model; // Model matrix
uniform mat4 u_view;  // View matrix

out vec3 v_normal;    // Pass the transformed normal to the fragment shader
out vec3 v_viewDir;   // Pass the view direction to the fragment shader

void main() {
    // Transform position
    gl_Position = u_mvp * vec4(a_position, 1.0);

    // Transform normal to world space
    v_normal = mat3(u_model) * a_normal;

    // Calculate view direction
    vec3 worldPosition = (u_model * vec4(a_position, 1.0)).xyz;
    v_viewDir = normalize(-worldPosition); // Camera always at (0,0,0) in view space
}
