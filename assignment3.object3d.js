'use strict'

import * as mat4 from './js/lib/glmatrix/mat4.js'
import * as vec3 from './js/lib/glmatrix/vec3.js'
import * as quat4 from './js/lib/glmatrix/quat.js'

import Material from './js/app/material.js'


/**
 * @Class
 * Base class for all drawable objects
 * 
 */
class Object3D
{
    /**
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     * @param {Array<Float>} vertices List of vertex positions
     * @param {Array<Int>} indices List of vertex indices
     * @param {WebGL2RenderingContext.GL_TRIANGLES | WebGL2RenderingContext.GL_POINTS} draw_mode The draw mode to use. In this assignment we use GL_TRIANGLES and GL_POINTS
     * @param {Material | null} material The material to render the object with
     */
    constructor( gl, shader, vertices, indices, draw_mode, material = null )
    {
        this.shader = shader
        this.material = material

        this.color = [1.0, 0, 1.0]
        this.vertices = vertices
        this.vertices_buffer = null
        this.createVBO( gl )

    
        this.indices = indices
        this.index_buffer = null
        this.createIBO( gl )

        this.draw_mode = draw_mode

        this.num_components_vec3 = 3
        this.num_components_vec2 = 2
        
        this.vertex_stride = (3 + 3 + 2) * Float32Array.BYTES_PER_ELEMENT; // Position + Normal + TextureCoords

        this.vertex_array_object = null;
        this.createVAO(gl, shader);

        this.model_matrix = mat4.identity(mat4.create());
    }

    /**
     * Change the object's shader
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader An instance of the shader to be used
     */
    setShader( gl, shader ) {
        this.shader = shader
        gl.deleteVertexArray(this.vertex_array_object)
        this.createVAO( gl, shader )
    }

    /**
     * Change the object's draw mode
     * 
     * @param {WebGL2RenderingContext.GL_TRIANGLES | WebGL2RenderingContext.GL_POINTS} draw_mode The draw mode to use. In this assignment we use GL_TRIANGLES and GL_POINTS
     */
    setDrawMode( draw_mode ) {
        this.draw_mode = draw_mode
    }


    /**
     * Set the object's color
     * @param {Array<Number>} color Array of [r, g, b] values
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Set this object's model transformation
     * 
     * @param {mat4} transformation glmatrix matrix representing the matrix
     */
    setTransformation( transformation ) {
        this.model_matrix = transformation
    }

    // Function to set the position
    setPosition(x, y, z) {
        mat4.translate(this.model_matrix, this.model_matrix, [x, y, z]);
    }

    getPosition() {
        return [this.model_matrix[12], this.model_matrix[13], this.model_matrix[14]]
    }

    // Function to set the scale
    setScale(scale) {
        mat4.scale(this.model_matrix, this.model_matrix, scale);
    }

    // Function to set rotation (around an axis)
    setRotation(angle, axis) {
        mat4.rotate(this.model_matrix, this.model_matrix, angle, axis);
    }

    /**
     * Sets up a vertex attribute object that is used during rendering to automatically tell WebGL how to access our buffers
     * 
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     */
    createVAO( gl, shader )
    {
        this.vertex_array_object = gl.createVertexArray();
        gl.bindVertexArray(this.vertex_array_object);
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertices_buffer )

        let location = shader.getAttributeLocation( 'a_position' )
        let stride = 0, offset = 0
        if (location >= 0) {
            gl.enableVertexAttribArray( location )
            stride = 0, offset = 0
            gl.vertexAttribPointer( location, this.num_components_vec3, gl.FLOAT, false, stride, offset )
        }

        location = shader.getAttributeLocation( 'a_normal' )
        if (location >= 0) {
            gl.enableVertexAttribArray( location )
            stride = 0, offset = (this.vertices.length / 2) * Float32Array.BYTES_PER_ELEMENT
            gl.vertexAttribPointer( location, this.num_components_vec3, gl.FLOAT, false, stride, offset )
        }

        gl.bindVertexArray( null )
        gl.bindBuffer( gl.ARRAY_BUFFER, null )
    }

    /**
     * Creates vertex buffer object for vertex data
     * 
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     */
    createVBO( gl )
    {
        
        this.vertices_buffer = gl.createBuffer( );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertices_buffer )
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW )
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
    }

    /**
     * Creates index buffer object for vertex data
     * 
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     */
    createIBO( gl )
    {
        this.index_buffer = gl.createBuffer( );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.index_buffer )
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW )
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
    }

    /**
     * Perform any necessary updates. 
     * Children can override this.
     * 
     */
    udpate( ) 
    {
        return
    }

    /**
     * Render call for an individual object.
     * 
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     */
    render( gl )
    {
        this.shader.use( )
        this.shader.setUniform4x4f('u_m', this.model_matrix)
        this.shader.setUniform3f('u_color', this.color)
        // Bind vertex array object
        gl.bindVertexArray( this.vertex_array_object )

        // Bind index buffer
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.index_buffer )

        // Set up shader


        // Draw the element
        gl.drawElements( this.draw_mode, this.indices.length, gl.UNSIGNED_INT, 0 )

        // Clean Up
        gl.bindVertexArray( null )
        gl.bindBuffer( gl.ARRAY_BUFFER, null )
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null )
        this.shader.unuse( )
    }

}

/**
 * In addition to Object3D's functionality, ShadedObject3Ds have a material
 * This material is used to shade an object and its properties need to be 
 * passed to the object's shader 
 * 
 */
class ShadedObject3D extends Object3D { 

    /**
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     * @param {Array<Float>} vertices List of vertex positions
     * @param {Array<Int>} indices List of vertex indices
     * @param {WebGL2RenderingContext.GL_TRIANGLES | WebGL2RenderingContext.GL_POINTS} draw_mode The draw mode to use. In this assignment we use GL_TRIANGLES and GL_POINTS
     * @param {Material} material The material to render the object with
     */
     constructor( gl, shader, vertices, indices, draw_mode, material ) {
        super(gl, shader, vertices, indices, draw_mode, material)
     }

    /**
     * Sets up a vertex attribute object that is used during rendering to automatically tell WebGL how to access our buffers
     * 
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     */
    createVAO( gl, shader )
    {
        this.vertex_array_object = gl.createVertexArray();
        gl.bindVertexArray(this.vertex_array_object);
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertices_buffer )

        let location = shader.getAttributeLocation( 'a_position' )
        let stride = 0, offset = 0
        let num_total_components = 6
        num_total_components += this.material.hasTexture() ? 5 : 0

        if (location >= 0) {
            gl.enableVertexAttribArray( location )
            stride = 0, offset = 0
            gl.vertexAttribPointer( location, this.num_components_vec3, gl.FLOAT, false, stride, offset )
        }

        location = shader.getAttributeLocation( 'a_normal' )
        if (location >= 0) {
            gl.enableVertexAttribArray( location )
            stride = 0, offset = (this.vertices.length * 3 / num_total_components) * Float32Array.BYTES_PER_ELEMENT
            gl.vertexAttribPointer( location, this.num_components_vec3, gl.FLOAT, false, stride, offset )
        }

        location = shader.getAttributeLocation( 'a_tangent' )
        if (location >= 0 && this.material.hasTexture()) {
            gl.enableVertexAttribArray( location )
            stride = 0, offset = (this.vertices.length * 6 / num_total_components) * Float32Array.BYTES_PER_ELEMENT
            gl.vertexAttribPointer( location, this.num_components_vec3, gl.FLOAT, false, stride, offset )
        }

        location = shader.getAttributeLocation( 'a_texture_coord' )
        if (location >= 0 && this.material.hasTexture()) {
            gl.enableVertexAttribArray( location )
            stride = 0, offset = (this.vertices.length *  9 / num_total_components) * Float32Array.BYTES_PER_ELEMENT
            gl.vertexAttribPointer( location, this.num_components_vec2, gl.FLOAT, false, stride, offset )
        }

        gl.bindVertexArray( null )
        gl.bindBuffer( gl.ARRAY_BUFFER, null )
    }

    /**
     * Render call for an individual object.
     * This method passes the material properties to the object's shader
     * and subsequently calls its parent's render method
     * 
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     */
    render(gl) {
        this.shader.use();
    
        // Pass basic material properties
        this.shader.setUniform3f('u_material.kA', this.material.kA);
        this.shader.setUniform3f('u_material.kD', this.material.kD);
        this.shader.setUniform3f('u_material.kS', this.material.kS);
        this.shader.setUniform1f('u_material.shininess', this.material.shininess);
    
        // Bind texture maps
        if (this.material.hasMapKD()) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.material.map_kD.getGlTexture());
            this.shader.setUniform1i('u_material.map_kD', 0);
        }
    
        if (this.material.hasMapNorm()) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.material.map_norm.getGlTexture());
            this.shader.setUniform1i('u_material.map_norm', 1);
        }
    
        // Bind environment map
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envMap);
        this.shader.setUniform1i('u_envMap', 2);
    
        // Call parent render method
        super.render(gl);
    
        // Unbind textures
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        this.shader.unuse();
    }
    
}

export {
    Object3D,
    ShadedObject3D,
}
