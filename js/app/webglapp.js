'use strict'

import { hex2rgb, deg2rad, loadExternalFile } from '../utils/utils.js'
import Sphere3D from './sphere3d.js'
import Cylinder3D from './cylinder3d.js';
import Box3D from './box3d.js'
import Input from '../input/input.js'
import CubeMapLoader from './cubemaploader.js';
import Skybox3D from './skybox3d.js';
import Emitter from './emitter.js';
import { createTextTexture } from '../utils/utils.js';
import { Plane3D } from './plane3d.js'; // If Plane3D is a new class
import { updateBillboard } from '../utils/utils.js'; // If this was modularized
import * as mat4 from '../lib/glmatrix/mat4.js'
import * as vec3 from '../lib/glmatrix/vec3.js'
import * as quat from '../lib/glmatrix/quat.js'

import { OBJLoader } from '../../assignment3.objloader.js'
import { Scene, SceneNode } from './scene.js'

/**
 * @Class
 * WebGlApp that will call basic GL functions, manage a list of shapes, and take care of rendering them
 * 
 * This class will use the Shapes that you have implemented to store and render them
 */
class WebGlApp 
{
    /**
     * Initializes the app with a box, and the model, view, and projection matrices
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Map<String,Shader>} shader The shaders to be used to draw the object
     * @param {AppState} app_state The state of the UI
     */
    constructor( gl, shaders, app_state )
    {
        // Set GL flags
        this.setGlFlags( gl )


        // Store the shader(s)
        this.shaders = shaders // Collection of all shaders
        this.light_shader = this.shaders[this.shaders.length - 1]
        this.active_shader = 2

        // Create a sphere instance and create a variable to track its rotation
        this.sphere = new Sphere3D( gl, this.shaders[6])
        this.animation_step = 0
        this.sphere.shader.use();
        this.sphere.shader.setUniform1i('u_isGlass', true);
        this.sphere.shader.setUniform1f('u_refractiveIndex', 1); // Glass index
        this.sphere.setDrawMode(gl.TRIANGLES)
        this.sphere.shader.unuse();
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


        //Creatating small snow layer
        this.snowBase = new Cylinder3D(gl, this.shaders[4], 0.76, 0.01);
        this.snowBase.shader.use();
        this.snowBase.setPosition(0, -0.66, 0);
        this.snowBase.setColor([150.0, 149.0, 146.0])
        this.snowBase.shader.unuse()
        this.particleEmitter = new Emitter(
            [0, 0.9, 0], // Center of the globe
            16,      // Max particles
            6,        // Emission rate
            4.0,        // Particle lifespan
            this.snowBase.getPosition()
        );
        //creating the bottom platform
        this.bottom = new Box3D(gl, this.shaders[7])
        this.bottom.setPosition(0, -0.93, 0);
        this.bottom.setScale([1.45, 0.53, 1.45]); // Stretch it vertically
        this.bottom.setRotation(Math.PI / 4, [0, 1, 0]); // Rotate around Y-axis
        this.bottom.setColor([0.0 ,0.0 ,0.0])
        this.bottom.shader.use();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envMap);
        this.bottom.shader.setUniform1i('u_envMap', 0); // Texture unit 0
        this.bottom.shader.unuse();

        // loading cubemap
        //doing the skybox yippeee
        this.cubeMapFaces = [
            '../../textures/px.png', // +x
            '../../textures/nx.png', // -x
            '../../textures/py.png', // +y
            '../../textures/ny.png', // -y
            '../../textures/pz.png', // +z
            '../../textures/nz.png'  // -z
        ];
        this.envMap = CubeMapLoader.load(gl, this.cubeMapFaces);

        // Pass the environment map to shaders
        for (let shader of this.shaders) {
            shader.use();
            gl.activeTexture(gl.TEXTURE0); // Use texture unit 0
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envMap);
            shader.setUniform1i('u_envMap', 0); // Bind to texture unit 0
            shader.unuse();
        }
        this.skybox = new Skybox3D(gl, this.shaders[5], this.envMap)

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envMap);

        // Declare a variable to hold a Scene
        // Scene files can be loaded through the UI (see below)
        this.scene = null
        // Bind a callback to the file dialog in the UI that loads a scene file
        app_state.onOpen3DScene((filename) => {
            let scene_config = JSON.parse(loadExternalFile(`./scenes/${filename}`))
            this.scene = new Scene(scene_config, gl, this.shaders[this.active_shader], this.light_shader)
            return this.scene
        })

        // Bind textures
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envMap);
        this.shaders[this.active_shader].setUniform1i('u_envMap', 1);

        // Set reflectivity
        this.shaders[this.active_shader].setUniform1f('u_reflectivity', 0.5); // Adjust as needed
        this.shaders[this.active_shader].unuse()
        // Create the view matrix
        this.eye     =   [2.0, 0.5, -2.0]
        this.center  =   [0, 0, 0]
       
        this.forward =   null
        this.right   =   null
        this.up      =   null
        // Forward, Right, and Up are initialized based on Eye and Center
        this.updateViewSpaceVectors()
        this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up)


        // Create the projection matrix
        this.fovy = 60
        this.aspect = 16/9
        this.near = 0.001
        this.far = 1000.0
        this.projection = mat4.perspective(mat4.create(), deg2rad(this.fovy), this.aspect, this.near, this.far)
        // Use the shader's setUniform4x4f function to pass the matrices
        for (let shader of this.shaders) {
            shader.use()
            shader.setUniform3f('u_eye', this.eye);
            shader.setUniform4x4f('u_v', this.view)
            shader.setUniform4x4f('u_p', this.projection)
            shader.unuse()
            
        }

        
        this.skyboxViewMatrix = mat4.clone(this.view);
        this.skyboxViewMatrix[12] = 0; // Remove translation (x)
        this.skyboxViewMatrix[13] = 0; // Remove translation (y)
        this.skyboxViewMatrix[14] = 0; // Remove translation (z)
        
        this.shaders[5].use(); // Use the skybox shader
        this.shaders[5].setUniform4x4f('u_v', this.skyboxViewMatrix);
        this.shaders[5].setUniform4x4f('u_p', this.projection); // Projection matrix
        this.shaders[5].setUniform3f('u_eye', this.eye); // Camera position
        this.shaders[5].unuse();
        this.initializeFramebuffer(gl);

        this.textLabel = new Plane3D(gl, shaders[9]); // Create a plane for text
        this.textLabel.texture = createTextTexture(gl, "");
        this.textLabel.setPosition(0, 0, 0); // Position above the snowglobe
        
        // Store initial object positions 
        this.originalSpherePos = {
            x: this.sphere.getPosition()[0],
            y: this.sphere.getPosition()[1],
            z: this.sphere.getPosition()[2]
        };
        
        this.originalSnowBasePos = {
            x: this.snowBase.getPosition()[0],
            y: this.snowBase.getPosition()[1],
            z: this.snowBase.getPosition()[2]
        };
        
        this.originalBottomPos = {
            x: this.bottom.getPosition()[0],
            y: this.bottom.getPosition()[1],
            z: this.bottom.getPosition()[2]
        };
        
        this.originalEmitterPos = {
            x: this.particleEmitter.position.x,
            y: this.particleEmitter.position.y,
            z: this.particleEmitter.position.z
        };

        this.originalNodePosition = null

        this.shakeTimer = 0;
        this.shakeDuration = 3;
    }  

    initializeFramebuffer(gl) {
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    
        // Create texture to store color
        this.framebufferTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.framebufferTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
        // Create a renderbuffer for depth
        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
    
        // Attach texture and renderbuffer to framebuffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.framebufferTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error("Framebuffer is not complete.");
        }
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Sets up GL flags
     * In this assignment we are drawing 3D data, so we need to enable the flag 
     * for depth testing. This will prevent from geometry that is occluded by other 
     * geometry from 'shining through' (i.e. being wrongly drawn on top of closer geomentry)
     * 
     * Look into gl.enable() and gl.DEPTH_TEST to learn about this topic
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    setGlFlags( gl ) {

        // Enable depth test
        gl.enable(gl.DEPTH_TEST)

    }

    setupShaderUniforms(gl, shader) {
        shader.use();
    
        // Pass camera position
        shader.setUniform3f('u_eye', this.eye);
    
        // Global lights
        this.lights.ambient.forEach((light, i) => {
            shader.setUniform3f(`u_lights_ambient[${i}].color`, light.color);
            shader.setUniform1f(`u_lights_ambient[${i}].intensity`, light.intensity);
        });
    
        this.lights.directional.forEach((light, i) => {
            shader.setUniform3f(`u_lights_directional[${i}].direction`, light.direction);
            shader.setUniform3f(`u_lights_directional[${i}].color`, light.color);
            shader.setUniform1f(`u_lights_directional[${i}].intensity`, light.intensity);
        });
    
        this.lights.point.forEach((light, i) => {
            shader.setUniform3f(`u_lights_point[${i}].position`, light.position);
            shader.setUniform3f(`u_lights_point[${i}].color`, light.color);
            shader.setUniform1f(`u_lights_point[${i}].intensity`, light.intensity);
        });
    
        shader.unuse();
    }
    

    /**
     * Sets the viewport of the canvas to fill the whole available space so we draw to the whole canvas
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} width 
     * @param {Number} height 
     */
    setViewport( gl, width, height )
    {
        gl.viewport( 0, 0, width, height )
    }

    /**
     * Clears the canvas color
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    clearCanvas( gl )
    {
        gl.clearColor(...hex2rgb('#2B2B2B'), 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    // Function to update shake effect (called in render loop)
    updateShake(deltaTime) {
        if (this.shakeTimer < this.shakeDuration) {
            this.shakeTimer += deltaTime;

            // Apply shake effect to every object
            const shakeAmount = 0.01 * ((this.shakeDuration - this.shakeTimer) / this.shakeDuration);
            const time = this.shakeTimer * 10;
            const dx = Math.sin(time + Math.random() - 0.5) * shakeAmount;
            const dy = Math.sin(time + Math.random() - 0.5) * shakeAmount;
            const dz = Math.sin(time + Math.random() - 0.5) * shakeAmount;
    
            const spherePos = this.sphere.getPosition()
            this.sphere.setRawPosition(spherePos[0] + dx, spherePos[1] + dy, spherePos[2] + dz);

            const snowBasePos = this.snowBase.getPosition();
            this.snowBase.setRawPosition(snowBasePos[0] + dx, snowBasePos[1] + dy, snowBasePos[2] + dz);

            const bottomPos = this.bottom.getPosition();
            this.bottom.setRawPosition(bottomPos[0] + dx, bottomPos[1] + dy, bottomPos[2] + dz);

            this.particleEmitter.position.x = spherePos[0] + dx;
            this.particleEmitter.position.y = spherePos[1] + 1 + dy;
            this.particleEmitter.position.z = spherePos[2] + dz;

            if (this.scene) {
                this.scene.getNodes().forEach((node) => {
                    if (!this.originalNodePosition) {
                        this.originalNodePosition = node.getPosition();
                    }
                    const currPosition = node.getPosition();
                    const newX = currPosition[0] + dx;
                    const newY = currPosition[1] + dy;
                    const newZ = currPosition[2] + dz;
                    
                    node.setPosition(newX, newY, newZ);
                })
                this.scene.getMeshes().forEach((mesh) => {
                    mesh.position.x += dx;
                    mesh.position.y += dy;
                    mesh.position.z += dz;
                })
            }

            this.particleEmitter.applyShakeEffect([dx, dy, dz], shakeAmount);
        } else {
            // Reset object positions
            this.shakeTimer = 0;
            // Set shaking to false first
            this.shaking = false;
        }
    }

    /**
     * Updates components of this app
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {AppState} app_state The state of the UI
     * @param {Number} delta_time The time in fractional seconds since the last frame
     */
    update( gl, app_state, delta_time ) 
    {
        if (this.shaking) {
            this.updateShake(delta_time);
        }
        if (this.particleEmitter) {
            const globeModelMatrix = this.sphere.model_matrix; // Access sphere's model matrix
            if (this.scene != null) {
                this.particleEmitter.update(delta_time, globeModelMatrix, 1, 0.72, this.scene.getMeshes()); // Pass matrix to the emitter
            }
            else {
                this.particleEmitter.update(delta_time, globeModelMatrix, 1, 0.72, []);
            }        }
        
        // Control
        switch(app_state.getState('Control')) {
            case 'Camera':
                this.updateCamera( delta_time )
                break
            case 'Shake Globe':
                if (!this.shaking) {
                    this.shakeTimer = 0
                    this.shaking = true
                }
                break
        }
    }

    /**
     * Update the Forward, Right, and Up vector according to changes in the 
     * camera position (Eye) or the center of focus (Center)
     */
     updateViewSpaceVectors( ) {
        this.forward = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.eye, this.center))
        this.right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), [0,1,0], this.forward))
        this.up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.forward, this.right))
    }

    /**
     * Update the camera view based on user input and the arcball viewing model
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the view's center
     * 2) Middle Mouse Button or Space+Left Mouse Button - Pan the view relative view-space
     * 3) Right Mouse Button - Zoom towards or away from the view's center
     * 
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateCamera(delta_time) {
        let view_dirty = false;
    
        // Control - Zoom
        if (Input.isMouseDown(2)) {
            // Scale camera position
            let translation = vec3.scale(vec3.create(), this.forward, -Input.getMouseDy() * delta_time);
            this.eye = vec3.add(vec3.create(), this.eye, translation);
    
            // Set dirty flag to trigger view matrix updates
            view_dirty = true;
        }
    
        // Control - Rotate
        if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {
            // Rotate around xz plane around Y
            this.eye = vec3.rotateY(vec3.create(), this.eye, this.center, deg2rad(-10 * Input.getMouseDx() * delta_time));
            
            // Rotate around view-aligned rotation axis
            let rotation = mat4.fromRotation(mat4.create(), deg2rad(-10 * Input.getMouseDy() * delta_time), this.right);
            this.eye = vec3.transformMat4(vec3.create(), this.eye, rotation);
    
            // Set dirty flag to trigger view matrix updates
            view_dirty = true;
        }
    
        // Control - Pan
        if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {
            // Create translation on two view-aligned axes
            let translation = vec3.add(
                vec3.create(),
                vec3.scale(vec3.create(), this.right, -0.75 * Input.getMouseDx() * delta_time),
                vec3.scale(vec3.create(), this.up, 0.75 * Input.getMouseDy() * delta_time)
            );
    
            // Translate both eye and center in parallel
            this.eye = vec3.add(vec3.create(), this.eye, translation);
            this.center = vec3.add(vec3.create(), this.center, translation);
    
            view_dirty = true;
        }
    
        // Update view matrix if needed
        if (view_dirty) {
            // Update Forward, Right, and Up vectors
            this.updateViewSpaceVectors();
    
            // Update the camera's view matrix
            this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up);
    
            // Calculate the skybox view matrix (remove translation)
            this.skyboxViewMatrix = mat4.clone(this.view);
            this.skyboxViewMatrix[12] = 0; // Remove translation (X)
            this.skyboxViewMatrix[13] = 0; // Remove translation (Y)
            this.skyboxViewMatrix[14] = 0; // Remove translation (Z)
    
            // Pass the updated view and skybox matrices to the shaders
            for (let i = 0; i < this.shaders.length; i++) {
                const shader = this.shaders[i];
                shader.use();
                
                if (i === 5) { // Assuming shader[5] is the skybox shader
                    shader.setUniform4x4f('u_v', this.skyboxViewMatrix); // Skybox view matrix
                } else {
                    shader.setUniform4x4f('u_v', this.view); // Normal view matrix
                }
                
                shader.setUniform3f('u_eye', this.eye);
                shader.unuse();
            }
        }
    }
    

    /**
     * Update a SceneNode's local transformation
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the node relative to the view along the Up and Right axes
     * 2) Middle Mouse Button or Space+Left Mouse Button - Translate the node relative to the view along the Up and Right axes
     * 3) Right Mouse Button - Scales the node around it's local center
     * 
     * @param {SceneNode} node The SceneNode to manipulate
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateSceneNode( node, delta_time ) {
        let node_dirty = false

        let translation = mat4.create()
        let rotation = mat4.create()
        let scale = mat4.create()

        // Control - Scale
        if (Input.isMouseDown(2)) {
            let factor = 1.0 + Input.getMouseDy() * delta_time
            scale = mat4.fromScaling(mat4.create(), [factor, factor, factor])

            node_dirty = true
        }

        // Control - Rotate
        if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {

            let rotation_up = mat4.fromRotation(mat4.create(), deg2rad(10 * Input.getMouseDx() * delta_time), this.up)
            let rotation_right = mat4.fromRotation(mat4.create(), deg2rad(10 * Input.getMouseDy() * delta_time), this.right)

            rotation = mat4.multiply(mat4.create(), rotation_right, rotation_up)

            node_dirty = true
        }

        // Control - Translate
        if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {

            translation = mat4.fromTranslation(mat4.create(),
                vec3.add(vec3.create(), 
                    vec3.scale(vec3.create(), this.right, 0.75 * Input.getMouseDx() * delta_time),
                    vec3.scale(vec3.create(), this.up, -0.75 * Input.getMouseDy() * delta_time)
                ))

            node_dirty = true
        }


        // Update node transformation if needed
        if (node_dirty) {

            // Get the world rotation and scale of the node
            // Construct the inverse transformation of that matrix
            // We isolate the rotation and scale by setting the right column of the matrix to 0,0,0,1
            // If this is the root node, we set both matrices to identity
            let world_rotation_scale = mat4.clone(node.getWorldTransformation())
            let world_rotation_scale_inverse = null
            if (world_rotation_scale != null) {
                world_rotation_scale[12] = 0, world_rotation_scale[13] = 0, world_rotation_scale[14] = 0
                world_rotation_scale_inverse = mat4.invert(mat4.create(), world_rotation_scale)
            } else {
                world_rotation_scale = mat4.create()
                world_rotation_scale_inverse = mat4.create()
            }

            // Get the node's local transformation that we modify
            let transformation = node.getTransformation()

            // It's best to read this block from the bottom up
            // This is the order in which the transformations will take effect
            // Fourth, apply the scaling
            transformation = mat4.multiply(mat4.create(), transformation, scale)
            // Third, remove the full world rotation and scale to turn this back into a local matrix
            transformation = mat4.multiply(mat4.create(), transformation, world_rotation_scale_inverse)
            // Second, apply rotation and translation in world space alignment
            transformation = mat4.multiply(mat4.create(), transformation, translation)
            transformation = mat4.multiply(mat4.create(), transformation, rotation)
            // First, temporarily apply the full world rotation and scale to align the object in world space
            transformation = mat4.multiply(mat4.create(), transformation, world_rotation_scale)        

            // Update the node's transformation
            node.setTransformation(transformation)
        }
    }

    /**
     * Main render loop which sets up the active viewport (i.e. the area of the canvas we draw to)
     * clears the canvas with a background color and draws the scene
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} canvas_width The canvas width. Needed to set the viewport
     * @param {Number} canvas_height The canvas height. Needed to set the viewport
     */
    render(gl, canvas_width, canvas_height) {
        // Set viewport and clear the canvas
        gl.viewport(0, 0, canvas_width, canvas_height);
        this.clearCanvas(gl);
    

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.clearCanvas(gl);
    
        // Render the scene objects into the framebuffer
        this.snowBase.render(gl);
        if (this.scene) this.scene.render(gl);
        this.bottom.render(gl);
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    

        gl.depthMask(false);
        this.skybox.render(gl);
        gl.depthMask(true);
        this.sphere.shader.use();
        this.sphere.shader.setUniform1i('u_sceneTexture', 1);
        gl.depthMask(false);
        this.sphere.render(gl);
        gl.depthMask(true); 
        this.sphere.shader.unuse();

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.framebufferTexture);
        this.particleEmitter.render(gl, this.shaders[8])
        this.bottom.render(gl);

        this.snowBase.render(gl);

        if (this.scene) this.scene.render(gl);

        // default text
        let text = "Hello, Snowglobe";
        //this.textLabel.texture = createTextTexture(gl, text, "80px Arial", "white");

        // change text based on file uploaded
        document.getElementById("openfileActionInput").addEventListener("change", (evt) => {
            const fileInput = evt.target;
            const file = fileInput.files[0];

            if (file) {
                const fileName = file.name.replace(/\.json$/, '');
                text = fileName;

                this.textLabel.texture = createTextTexture(gl, fileName, "80px Arial", "white");
            }
        })

        updateBillboard(this.textLabel.modelMatrix, this.view); // Align the text with the camera
        this.textLabel.render(gl);
    }
    
    

}

export default WebGlApp
