'use strict';

import { Object3D } from '../../assignment3.object3d.js';

class Cylinder3D extends Object3D {
    /**
     * Constructor for a 3D Cylinder object
     * 
     * @param {WebGL2RenderingContext} gl The WebGL rendering context
     * @param {Shader} shader The shader used to render this cylinder
     * @param {Number} radius The radius of the cylinder
     * @param {Number} height The height of the cylinder
     * @param {Array<Float>} color Optional color for the cylinder
     * @param {Number} segments Number of segments for the cylinder (default is 36)
     */
    constructor(gl, shader, radius = 0.5, height = 1.0, color = [1.0, 1.0, 1.0], segments = 36) {
        const vertices = [];
        const indices = [];

        // Generate vertices for the cylinder
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Top circle vertices
            vertices.push(x, height / 2, z);

            // Bottom circle vertices
            vertices.push(x, -height / 2, z);
        }

        // Generate indices for the cylinder walls
        for (let i = 0; i < segments; i++) {
            const top1 = i * 2;
            const bottom1 = top1 + 1;
            const top2 = (i + 1) * 2;
            const bottom2 = top2 + 1;

            // Two triangles per segment
            indices.push(top1, bottom1, top2); // Top triangle
            indices.push(bottom1, bottom2, top2); // Bottom triangle
        }

        // Generate indices for the top and bottom caps
        const topCenterIndex = vertices.length / 3;
        const bottomCenterIndex = topCenterIndex + 1;
        vertices.push(0, height / 2, 0); // Top center
        vertices.push(0, -height / 2, 0); // Bottom center

        for (let i = 0; i < segments; i++) {
            const top1 = i * 2;
            const top2 = (i + 1) * 2;
            indices.push(top1, top2, topCenterIndex);

            const bottom1 = i * 2 + 1;
            const bottom2 = (i + 1) * 2 + 1;
            indices.push(bottom1, bottomCenterIndex, bottom2);
        }

        super(gl, shader, vertices, indices, gl.TRIANGLES);
        this.shader.use()
        this.shader.setUniform3f('u_color', this.color);

        // Set the initial color
        this.setColor(color);
        this.shader.unuse()
    }
}

export default Cylinder3D;
