#version 300 es

precision mediump float;

in vec3 a_position;      // Input vertex position
uniform mat4 u_m;        // Model matrix
uniform mat4 u_v;        // View matrix
uniform mat4 u_p;        // Projection matrix

void main() {
    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0); // Calculate clip space position
    // gl_Position = vec4(a_position, 1.0);
}
