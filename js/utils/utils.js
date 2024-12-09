'use strict'

import * as mat4 from '../lib/glmatrix/mat4.js'
import * as vec3 from '../lib/glmatrix/vec3.js'
import * as quat4 from '../lib/glmatrix/quat.js'

/**
 * Maximum number of lights per light type supported by our shaders
 */
const SHADER_MAX_LIGHTS = 16


/**
 * Loads a given URL; this is used to load the shaders from file
 * @param { String } url The relative url to the file to be loaded
 * @returns { String | null } The external file as text
 */
function loadExternalFile( url )
{

    let req = new XMLHttpRequest( );
    req.open( 'GET', url, false );
    req.send( null );

    return ( req.status == 200 ) ? req.responseText : null;

}

/**
 * Converts a hex color string to a normalized rgba array
 * @param { String } hex The hex color as a string
 * @returns { Array<number> } The color as normalized values
 */
function hex2rgb( hex )
{

    let rgb = hex.match( /\w\w/g )
        .map( x => parseInt( x, 16 ) / 255 );

    return [ rgb[ 0 ], rgb[ 1 ], rgb[ 2 ] ]

}

/**
 * Converts degrees to radians
 * @param {Double | Float} deg Angle in degrees
 * @returns {Double | Float} Angle in radians 
 */
function deg2rad( deg ) {
    return deg * (Math.PI / 180)
}

/**
 * Returns the mouse coordinates relative to a clicking target, in our case the canvas
 * @param event The mouse click event
 * @returns { { x: number, y: number } } The x and y coordinates relative to the canvas
 */
function getRelativeMousePosition( event )
{

    let target = event.target

    // if the mouse is not over the canvas, return invalid values
    if ( target.id != 'canvas' )
    {

        return {

            x: null,
            y: null,

        }

    }

    target = target || event.target;
    let rect = target.getBoundingClientRect( );

    return {

        x: event.clientX - rect.left,
        y: event.clientY - rect.top,

    }
}

/**
 * Converts a set of transformation configs as found in ./scenes/*.json to a mat4
 * @param {JSON} transform_config a json object (hierarchical mix of dictionaries and lists)
 */
 function json2transform( transform_config ) {

    let rotation = 'rotation' in transform_config ? transform_config.rotation : quat4.create()
    let translation = 'translation' in transform_config ? transform_config.translation : vec3.create()
    let scale = 'scale' in transform_config ? transform_config.scale : [1,1,1]

    if (rotation.length == 3)
        rotation = quat4.fromEuler( quat4.create(), rotation[0], rotation[1], rotation[2] )

    return mat4.fromRotationTranslationScale(mat4.create(), 
        rotation,
        translation,
        scale
    )
}


/**
 * Extracts the directory path from a file path
 * 
 * @param {String} path The path to a file
 */
function getFileDir(path) {
    let components = path.split('/')
    components.pop()

    let result = components.join('/')

    return result
}

function createTextTexture(gl, text, font = "30px Arial", color = "white") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set font and measure text
    ctx.font = font;
    canvas.width = 800;
    canvas.height = 200;

    // Flip the canvas vertically
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    ctx.translate(canvas.width, 0);
    ctx.scale(-1,1);

    // Set text styles and alignments
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create WebGL texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
}

function updateBillboard(modelMatrix, viewMatrix) {
    mat4.identity(modelMatrix);

    const rotationMatrix = mat4.clone(viewMatrix);
    rotationMatrix[12] = 0; // Remove translation (x)
    rotationMatrix[13] = 0; // Remove translation (y)
    rotationMatrix[14] = 0; // Remove translation (z)
    mat4.invert(rotationMatrix, rotationMatrix); // Invert for billboarding

    // Apply the billboard rotation
    mat4.multiply(modelMatrix, rotationMatrix, modelMatrix);
}

export
{
    
    SHADER_MAX_LIGHTS,
    loadExternalFile,
    hex2rgb,
    deg2rad,
    getRelativeMousePosition,
    json2transform,
    getFileDir,
    createTextTexture,
    updateBillboard

}
