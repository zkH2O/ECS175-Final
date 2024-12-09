'use strict';

import { Object3D } from '../../assignment3.object3d.js';

class Sphere3D extends Object3D {
    constructor(gl, shader, radius = 1, latSegments = 32, lonSegments = 32) {
        let vertices = [];
        let indices = [];

        // Generate sphere vertices with positions and normals
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

                const nx = sinTheta * cosPhi;
                const ny = cosTheta;
                const nz = sinTheta * sinPhi;

                vertices.push(x, y, z, nx, ny, nz);
            }
        }

        // Generate sphere indices
        for (let lat = 0; lat < latSegments; lat++) {
            for (let lon = 0; lon < lonSegments; lon++) {
                const first = lat * (lonSegments + 1) + lon;
                const second = first + lonSegments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        super(gl, shader, vertices, indices, gl.LINES);
        this.radius = radius;
    }

    createVAO(gl, shader) {
        this.vertex_array_object = gl.createVertexArray();
        gl.bindVertexArray(this.vertex_array_object);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices_buffer);

        // Position attribute (vec3)
        let location = shader.getAttributeLocation('a_position');
        if (location >= 0) {
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(
                location,
                3, // 3 components for position
                gl.FLOAT,
                false,
                6 * Float32Array.BYTES_PER_ELEMENT, // Stride includes position + normal
                0 // Offset starts at 0
            );
        }

        // Normal attribute (vec3)
        location = shader.getAttributeLocation('a_normal');
        if (location >= 0) {
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(
                location,
                3, // 3 components for normal
                gl.FLOAT,
                false,
                6 * Float32Array.BYTES_PER_ELEMENT, // Stride includes position + normal
                3 * Float32Array.BYTES_PER_ELEMENT // Offset for normals
            );
        }

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    // function for defining the snowglobe boundary
    isPointInside(point) {
        const [x,y,z] = point;
        const distance = Math.sqrt(x * x + y * y + z * z);
        return distance <= this.radius;
    }
}

export default Sphere3D;