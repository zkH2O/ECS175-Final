#version 300 es

precision mediump float;

in vec3 v_texcoord; // Interpolated cube map direction
uniform samplerCube u_envMap; // Cube map sampler

out vec4 o_fragColor;

void main() {
    o_fragColor = texture(u_envMap, normalize(v_texcoord));
}
