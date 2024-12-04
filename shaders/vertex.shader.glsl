#version 300 es
precision mediump float;

in vec3 a_position;
uniform mat4 u_m;    // Model matrix
uniform vec3 u_color;
out vec3 v_color;

void main() {
    gl_Position = u_m * vec4(a_position, 1.0);
    v_color = u_color;
}
