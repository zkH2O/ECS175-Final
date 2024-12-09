attribute vec3 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_m; // Model matrix
uniform mat4 u_v; // View matrix
uniform mat4 u_p; // Projection matrix

varying vec2 v_texCoord;

void main() {
    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0);
    v_texCoord = a_texCoord; // Pass texture coordinates to fragment shader
}
