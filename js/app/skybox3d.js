'use strict';

import { Object3D } from '../../assignment3.object3d.js';

class Skybox3D extends Object3D {
    constructor(gl, shader, cubemapTexture) {
        // Call the parent class constructor with a cube's vertices and indices
        const vertices = [
            -1,  1, -1, // 0: Left-Top-Back
            -1, -1, -1, // 1: Left-Bottom-Back
             1, -1, -1, // 2: Right-Bottom-Back
             1,  1, -1, // 3: Right-Top-Back
            -1,  1,  1, // 4: Left-Top-Front
            -1, -1,  1, // 5: Left-Bottom-Front
             1, -1,  1, // 6: Right-Bottom-Front
             1,  1,  1, // 7: Right-Top-Front
        ];
        
        const indices = [
            0, 1, 2, 0, 2, 3, // Back face
            4, 5, 6, 4, 6, 7, // Front face
            0, 1, 5, 0, 5, 4, // Left face
            3, 2, 6, 3, 6, 7, // Right face
            0, 3, 7, 0, 7, 4, // Top face
            1, 2, 6, 1, 6, 5, // Bottom face
        ];
        

        super(gl, shader, vertices, indices, gl.TRIANGLES);
        this.cubemapTexture = cubemapTexture;
    }

    render(gl) {
        // Disable depth test temporarily for skybox
        gl.depthFunc(gl.LEQUAL);

        // Use the skybox shader
        this.shader.use();
        this.shader.setUniform1i('u_envMap', 0);

        // Bind the cubemap texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture);

        // Render the box
        super.render(gl);

        // Re-enable depth test
        gl.depthFunc(gl.LESS);
    }
}

export default Skybox3D;
