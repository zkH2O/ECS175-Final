'use strict'

import Input from '../input/input.js'
import AppState from './appstate.js'
import Shader from '../utils/shader.js'
import WebGlApp from './webglapp.js'
import Physics from './physics.js'

class App
{

    constructor( )
    {

        console.log( 'Initializing App' )

        // canvas & gl
        this.canvas = document.getElementById( 'canvas' )
        this.canvas.addEventListener( 'contextmenu', event => event.preventDefault( ) );
        this.gl = this.initGl( )

        // shaders
        console.log( 'Loading Shaders' )
        this.shaders = [
            new Shader( this.gl, '../../shaders/unlit.vert.glsl', '../../shaders/unlit.frag.glsl' ),
            new Shader( this.gl, '../../shaders/phong.vert.glsl', '../../shaders/phong.frag.glsl' ),
            new Shader( this.gl, '../../assignment3.textured.vert.glsl', '../../assignment3.textured.frag.glsl' ),
            new Shader( this.gl, '../../shaders/lights.vert.glsl', '../../shaders/lights.frag.glsl' ),
            new Shader(this.gl, '../../shaders/vertex.shader.glsl', '../../shaders/fragment.shader.glsl'),
            new Shader(this.gl, '../../shaders/skybox.vert.glsl', '../../shaders/skybox.frag.glsl'),
            new Shader(this.gl, '../../shaders/refrac.vert.glsl', '../../shaders/refrac.frag.glsl'),
            new Shader(this.gl, '../../shaders/box.vert.glsl', '../../shaders/box.frag.glsl'),
            new Shader(this.gl, '../../shaders/part.vert.glsl', '../../shaders/part.frag.glsl')
        ]

        // resize handling
        this.resizeToDisplay( )
        this.initial_width = this.canvas.width
        this.initial_height = this.canvas.height
        window.onresize = this.resizeToDisplay.bind( this )

        // time tracking
        this.last_tick = Date.now() / 1000.0
        this.delta_time = 0

        // app state
        this.app_state = new AppState( )

        // webgl app implementation
        this.impl = new WebGlApp( this.gl, this.shaders, this.app_state )

        // physics system
        console.log('Initializing Physics');
        this.physics = new Physics(this.gl, this.app_state);
        // initialize with 500 snowflakes
        this.physics.initializeSnowflakes(500);

    }

    /**
     * Initializes webgl2 with settings
     * @returns { WebGL2RenderingContext | null } The WebGL2 context or Null
     */
    initGl( )
    {
        let canvas = document.getElementById('canvas')
        return canvas.getContext('webgl2')
    }

    /** 
     * Resizes canvas to pixel-size-corrected display size
     */
    resizeToDisplay( )
    {

        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight

    }

    /**
     * Starts render loop
     */
    start( )
    {

        requestAnimationFrame( ( ) =>
        {

            this.update( )

        } )

    }

    /**
     * Called every frame, triggers input and app state update and renders a frame
     */
    update( )
    {
        this.delta_time = (Date.now() / 1000.0) - this.last_tick
        this.last_tick = Date.now() / 1000.0

        this.app_state.update( )
        Input.update( )

        this.physics.update(this.delta_time);

        this.impl.update( this.gl, this.app_state, this.delta_time )
        this.render( )
        requestAnimationFrame( ( ) =>
        {

            this.update( )

        } )

    }

    /**
     * Main render loop
     */
    render( )
    {
        this.impl.render( this.gl, this.canvas.width, this.canvas.height )
        // Render snowflakes
        this.physics.render(this.gl);
    }

}


export default App
