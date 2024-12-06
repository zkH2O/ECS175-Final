#version 300 es

in vec3 a_position; // Cube vertices for the skybox
uniform mat4 u_p;    // Projection matrix
uniform mat4 u_v;    // View matrix (without translation)

out vec3 v_texcoord; // Pass the position to the fragment shader

void main() {
    v_texcoord = a_position;
    gl_Position = u_p * u_v * vec4(a_position, 1.0);
}
