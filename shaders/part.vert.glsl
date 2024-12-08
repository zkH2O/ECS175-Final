#version 300 es

in vec3 a_position;

uniform mat4 u_v;
uniform mat4 u_p;

void main() {
    gl_Position = u_p * u_v * vec4(a_position, 1.0);
    gl_PointSize = 5.0; // Size of each particle
}
