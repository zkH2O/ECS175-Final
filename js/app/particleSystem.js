'use strict';

import { Object3D } from '../../assignment3.object3d.js';

class Particle {
    constructor(position, velocity, size) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
    }

    update() {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
        this.position[2] += this.velocity[2];
    }
}

export class ParticleSystem extends Object3D {
    constructor(gl, sphere, shader, particleCount = 1000) {
        const vertices = [];
        const indices = [];
        
        super(gl, shader, vertices, indices, gl.POINTS);

        this.gl = gl;
        this.sphere = sphere;
        this.shader = shader;
        this.radius = this.sphere.radius;
        this.particleCount = particleCount;
        this.particles = [];
        this.particlesBuffer = this.gl.createBuffer();

        this.initParticles();
        this.initVBO();
    }

    initParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const position = [
                (Math.random() - 0.5) * 2 * this.radius,
                Math.random() * this.radius,
                (Math.random() - 0.5) * 2 * this.radius,
            ];

            const velocity = [
                (Math.random() - 0.5) * 0.01,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.01,
            ];

            const particle = new Particle(position, velocity, 5.0);
            this.particles.push(particle);
        }
    }

    initVBO() {
    const gl = this.gl;

    // Ensure the buffer is created only once
    if (!this.particlesBuffer) {
        this.particlesBuffer = gl.createBuffer(); // Create the buffer
    }

    // Calculate buffer size (e.g., 3 * 1000 floats per particle)
    const positions = new Float32Array(this.particles.flatMap(p => p.position));
    const bufferSize = positions.byteLength; // Expected 12000 for 1000 particles

    console.log("Buffer size:", bufferSize); // Log buffer size

    // Bind buffer and allocate data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW); // Allocate space for particles
    
    // Log allocated buffer size immediately after bufferData
    const bufferSizeAllocated = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
    console.log("Buffer size allocated after bufferData:", bufferSizeAllocated);

    // Upload the particle data (if not already done)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);

    // Set up vertex attribute pointers
    const positionLocation = gl.getAttribLocation(this.shader.program, 'a_position');
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // Unbind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

updateParticles() {
    if (!this.particlesBuffer) {
        console.error("particlesBuffer is not initialized");
        return;
    }

    const positions = new Float32Array(this.particles.flatMap(p => p.position));

    // Bind buffer and update its contents
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particlesBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, positions);
    
    // Log the buffer size after updating the buffer
    const bufferSizeAllocated = this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE);
    console.log("Buffer size allocated after update:", bufferSizeAllocated);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
}
    
    renderParticles(shader) {
        const gl = this.gl;

        shader.use();
    
        // Update uniforms
        const colorLocation = gl.getUniformLocation(shader.program, 'u_color');
        gl.uniform3fv(colorLocation, [1.0, 1.0, 1.0]);
    
        // Bind buffer and VAO
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesBuffer);
        gl.bindVertexArray(this.vertex_array_object);
    
        // Draw the particles
        gl.drawArrays(gl.POINTS, 0, this.particleCount);
    
        // Clean up
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
        shader.unuse();
    }
}