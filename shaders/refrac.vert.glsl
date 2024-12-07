#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;

uniform mat4 u_mvp; // Model-View-Projection matrix
uniform mat4 u_model; // Model matrix

out vec3 v_normal; // Normal vector in world space
out vec3 v_worldPos; // World position of the vertex

void main() {
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_normal = mat3(u_model) * a_normal; // Transform normal to world space
    gl_Position = u_mvp * vec4(a_position, 1.0);
}
