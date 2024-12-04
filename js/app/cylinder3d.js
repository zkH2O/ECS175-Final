'use strict';

import { Object3D } from '../../assignment3.object3d.js';

class Cylinder3D extends Object3D {
    constructor(gl, shader, radius = 1, height = 1, segments = 32) {
        const vertices = [];
        const indices = [];

        // Generate vertices for the top and bottom circles
        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            // Top circle
            vertices.push(x, height / 2, z);

            // Bottom circle
            vertices.push(x, -height / 2, z);
        }

        // Generate indices for the side faces
        for (let i = 0; i < segments; i++) {
            const top1 = i * 2;
            const bottom1 = i * 2 + 1;
            const top2 = ((i + 1) % segments) * 2;
            const bottom2 = ((i + 1) % segments) * 2 + 1;

            // Side face
            indices.push(top1, bottom1, top2);
            indices.push(bottom1, bottom2, top2);
        }

        // Generate indices for the top and bottom circles
        const topCenter = vertices.length / 3;
        const bottomCenter = topCenter + 1;
        vertices.push(0, height / 2, 0); // Top center
        vertices.push(0, -height / 2, 0); // Bottom center

        for (let i = 0; i < segments; i++) {
            const top1 = i * 2;
            const top2 = ((i + 1) % segments) * 2;

            const bottom1 = i * 2 + 1;
            const bottom2 = ((i + 1) % segments) * 2 + 1;

            // Top circle
            indices.push(top1, top2, topCenter);

            // Bottom circle
            indices.push(bottom1, bottom2, bottomCenter);
        }

        super(gl, shader, vertices, indices, gl.TRIANGLES);
    }

    update() {
        return;
    }
}

export default Cylinder3D;
