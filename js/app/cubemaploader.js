'use strict';

class CubeMapLoader {
    /**
     * Loads a cube map texture.
     * 
     * @param {WebGL2RenderingContext} gl The WebGL2 rendering context.
     * @param {Array<String>} faces Array of 6 image URLs for the cube map (order: +x, -x, +y, -y, +z, -z).
     * @returns {WebGLTexture} The cube map texture.
     */
    static load(gl, faces) {
        const cubeMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

        let loadedImages = 0; // Track loaded images
        faces.forEach((face, index) => {
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
                gl.texImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + index,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    image
                );

                loadedImages++;
                if (loadedImages === 6) {
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
                }
            };
            image.onerror = () => console.error(`Failed to load cube map face: ${face}`);
            image.src = face;
        });

        return cubeMap;
    }
}

export default CubeMapLoader;
