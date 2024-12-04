'use strict';

import { Object3D } from '../../assignment3.object3d.js';

/**
 * Box3D Class
 * Defines a 3D box shape with 8 vertices and 12 triangles.
 */
class Box3D extends Object3D {
    /**
     * Creates a Box3D object
     * @param {WebGL2RenderingContext} gl The WebGL context
     * @param {Shader} shader The shader program for the box
     * @param {Material | null} material Optional material for shading
     */
    constructor(gl, shader, material = null) {
        // Define the vertices of a box centered at the origin
        const vertices = [
            // Front face
            -0.5, -0.5,  0.5, // 0: bottom-left
             0.5, -0.5,  0.5, // 1: bottom-right
             0.5,  0.5,  0.5, // 2: top-right
            -0.5,  0.5,  0.5, // 3: top-left

            // Back face
            -0.5, -0.5, -0.5, // 4: bottom-left
             0.5, -0.5, -0.5, // 5: bottom-right
             0.5,  0.5, -0.5, // 6: top-right
            -0.5,  0.5, -0.5  // 7: top-left
        ];

        // Define the indices for the 12 triangles of the box
        const indices = [
            // Front face
            0, 1, 2,
            0, 2, 3,

            // Back face
            4, 5, 6,
            4, 6, 7,

            // Top face
            3, 2, 6,
            3, 6, 7,

            // Bottom face
            0, 1, 5,
            0, 5, 4,

            // Right face
            1, 2, 6,
            1, 6, 5,

            // Left face
            0, 3, 7,
            0, 7, 4
        ];

        // Call the parent class constructor
        super(gl, shader, vertices, indices, gl.TRIANGLES, material);
    }
}

export default Box3D;
