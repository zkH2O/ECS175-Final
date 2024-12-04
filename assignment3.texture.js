'use strict'

/**
 * The Texture class is used to store texture information and load image data
 * 
 */
class Texture {

    constructor(filename, gl, flip_y = true) {
        this.filename = filename 
        this.texture = null
        this.texture = this.createTexture( gl, flip_y )
    }

    getGlTexture() {
        return this.texture
    }

    createTexture( gl, flip_y ) {

        // Set up texture flipping (see Book Ch7)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip_y)

        // Create and bind a new GL texture
        let texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
    
        // First fill the texture with some fallback data
        // This is needed since images are loaded asynchronously and image data might not be immediately available
        const level = 0
        const internal_format = gl.RGBA
        const width = 1
        const height = 1
        const border = 0
        const src_format = gl.RGBA
        const src_type = gl.UNSIGNED_BYTE
        const pixel = new Uint8Array([0, 0, 255, 255])  // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, level, internal_format,
                        width, height, border, src_format, src_type,
                        pixel)
    
        // Create a new image to load image data from disk
        const image = new Image();
        image.onload = () => {
            // Bind the texture and upload image data to the texture
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, level, internal_format, src_format, src_type, image)
    
            // Generate mipmap from the full-size texture
            gl.generateMipmap(gl.TEXTURE_2D)
     
            // Set up texture wrapping mode to repeat the texture when UVs exceed [(0,0),(1,1)]
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    
            // Set up texture MIN/MAG filtering
            // Use mipmapping and linear filterin
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        
        }
        
        // By setting the image's src parameter the image will start loading data from disk
        // When the data is available, image.onload will be called
        image.src = this.filename
    
        return texture
    }
}

export default Texture