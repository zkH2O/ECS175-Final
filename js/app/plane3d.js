import * as mat4 from '../lib/glmatrix/mat4.js';

export class Plane3D {
    constructor(gl, shader) {
        this.gl = gl;
        this.shader = shader;

        // Define a simple plane (two triangles)
        this.vertices = [
            -0.75, 1.1, 0, 1, 1,   // Bottom-left
             0.75, 1.1, 0, 0, 1,  // Bottom-right
            -0.75, 1.50, 0, 1, 0,  // Top-left
             0.75, 1.50, 0, 0, 0  // Top-right
        ];

        this.indices = [
            0, 1, 2,  // First triangle
            1, 3, 2,  // Second triangle
        ];

        this.modelMatrix = mat4.create();
        this.texture = null;

        this.initBuffers();
    }

    initBuffers() {
        const { gl } = this;

        // Vertex buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        // Index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    setScale(scale) {
        mat4.scale(this.modelMatrix, this.modelMatrix, scale);
    }

    setPosition(x, y, z) {
        mat4.translate(this.modelMatrix, this.modelMatrix, [x, y, z]);
    }

    setRotation(angle, axis) {
        const rotationMatrix = mat4.create();
        mat4.rotate(rotationMatrix, rotationMatrix, angle, axis);
        mat4.multiply(this.modelMatrix, this.modelMatrix, rotationMatrix);
    }    

    render(gl) {
        this.shader.use();

        // Set uniforms
        this.shader.setUniform4x4f('u_m', this.modelMatrix);

        // Bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        const stride = 5 * Float32Array.BYTES_PER_ELEMENT; // 3 for position, 2 for texCoord

        // Position
        const positionLoc = this.shader.getAttributeLocation('a_position');
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(positionLoc);

        // Texture coordinates
        const texCoordLoc = this.shader.getAttributeLocation('a_texCoord');
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(texCoordLoc);

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            this.shader.setUniform1i('u_texture', 0);
        }

        // Draw the plane
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        // Clean up
        gl.disableVertexAttribArray(positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        this.shader.unuse();
    }
}

export default Plane3D;
