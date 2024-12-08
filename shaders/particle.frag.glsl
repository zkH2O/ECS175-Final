#version 300 es
precision mediump float;

uniform vec3 u_color; // Particle color

out vec4 outColor;

void main() {
    outColor = vec4(u_color, 1.0); // Solid particle color
}
