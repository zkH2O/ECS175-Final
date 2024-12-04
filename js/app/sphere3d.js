'use strict'

import { Object3D } from '../../assignment3.object3d.js';

class Sphere3D extends Object3D {
    constructor(gl, shader, radius = 1, latSegments = 32, lonSegments = 32) {
        let vertices = [];
        let indices = [];

        // Generate sphere vertices
        for (let lat = 0; lat <= latSegments; lat++) {
            const theta = (lat * Math.PI) / latSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= lonSegments; lon++) {
                const phi = (lon * 2 * Math.PI) / lonSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = radius * sinTheta * cosPhi;
                const y = radius * cosTheta;
                const z = radius * sinTheta * sinPhi;

                vertices.push(x, y, z);
            }
        }

        // Generate sphere indices
        for (let lat = 0; lat < latSegments; lat++) {
            for (let lon = 0; lon < lonSegments; lon++) {
                const first = lat * (lonSegments + 1) + lon;
                const second = first + lonSegments + 1;

                indices.push(first, second);
                indices.push(first, first + 1);
                indices.push(second, second + 1);
            }
        }

        super(gl, shader, vertices, indices, gl.LINES);
    }

    update() {
        return;
    }
}

export default Sphere3D;
