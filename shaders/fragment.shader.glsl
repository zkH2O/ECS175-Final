#version 300 es

precision mediump float;

uniform vec3 u_color; // Color passed from JavaScript

out vec4 outColor;    // Output color to the screen

void main() {
    outColor = vec4(u_color, 1.0); // Set the fragment color
}
