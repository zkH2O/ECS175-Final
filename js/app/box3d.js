'use strict';

import { Object3D } from '../../assignment3.object3d.js';

class Box3D extends Object3D {
    /**
     * Constructor for a 3D Box object
     * 
     * @param {WebGL2RenderingContext} gl The WebGL rendering context
     * @param {Shader} shader The shader used to render this box
     * @param {Array<Float>} color Optional color for the box
     */
    constructor(gl, shader, color = [1.0, 0, 1.0]) {
        // Define vertices and indices for a cube
        const vertices = [
            // Front face
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            // Back face
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,
        ];

        const indices = [
            // Front face
            0, 1, 2,  0, 2, 3,

            // Back face
            4, 5, 6,  4, 6, 7,

            // Top face
            3, 2, 6,  3, 6, 7,

            // Bottom face
            0, 1, 5,  0, 5, 4,

            // Right face
            1, 2, 6,  1, 6, 5,

            // Left face
            0, 3, 7,  0, 7, 4,
        ];

        super(gl, shader, vertices, indices, gl.TRIANGLES);
        this.shader.use()
        this.shader.setUniform3f('u_color', this.color);
        console.log("Color set for object:", this.color);

        // Set the initial color
        this.setColor(color);
        this.shader.unuse()
    }
}

export default Box3D;
