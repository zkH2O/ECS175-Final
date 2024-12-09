#version 300 es
precision mediump float;

in vec3 a_position;       // Particle position
uniform mat4 u_mvp;       // Combined Model-View-Projection matrix

void main() {
    gl_Position = u_mvp * vec4(a_position, 1.0); // Transform to clip space
    gl_PointSize = 5.0;                         // Set particle size (adjust as needed)
}
