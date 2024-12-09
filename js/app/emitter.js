'use strict';

import { Particle } from './particle.js';
import * as vec3 from '../lib/glmatrix/vec3.js'

class Emitter {
    constructor(position, maxParticles, emissionRate, particleLifetime, snowBasePosition) {
        this.position = position; // vec3
        this.maxParticles = maxParticles;
        this.emissionRate = emissionRate; // Particles per second
        this.particleLifetime = particleLifetime;
        this.snowBasePosition = snowBasePosition; // Position of the snow base (vec3)

        this.particles = [];
        this.elapsedTime = 0;
    }

    applyShakeEffect(offset, shakeAmount) {
        // Apply the offset to all particles
        this.particles.forEach(particle => {
            particle.velocity[0] += offset[0] * shakeAmount;
            particle.velocity[1] += offset[1] * shakeAmount;
            particle.velocity[2] += offset[2] * shakeAmount;
        });
    }    

    update(deltaTime, globeModelMatrix, globeRadius, snowBaseRadius, meshes) {
        this.elapsedTime += deltaTime;
        const particlesToEmit = Math.floor(this.elapsedTime * this.emissionRate);
    
        // Create new particles
        for (let i = 0; i < particlesToEmit && this.particles.length < this.maxParticles; i++) {
            const velocity = [
                (Math.random() - 0.5) * 2, // Random velocity
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
            ];
    
            const acceleration = [0, -2, 0]; // Gravity
    
            const transformedVelocity = vec3.transformMat4(
                vec3.create(),
                velocity,
                globeModelMatrix
            );
    
            this.particles.push(new Particle([...this.position], transformedVelocity, acceleration, this.particleLifetime, this.snowBasePosition));
        }
    
        this.elapsedTime %= (1 / this.emissionRate);
    
        // Update existing particles
        for (const particle of this.particles) {
            particle.update(deltaTime, globeRadius, meshes);
        }
    
        // Remove dead particles
        this.particles = this.particles.filter((p) => !p.isDead());
    }

    render(gl, shader) {
        // Use instancing or buffer updates to render all particles in one draw call
        shader.use();

        // Example: Updating a dynamic VBO with particle positions
        const particlePositions = this.particles.flatMap(p => p.position);
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particlePositions), gl.DYNAMIC_DRAW);

        const positionLocation = shader.getAttributeLocation('a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Draw all particles
        gl.drawArrays(gl.POINTS, 0, this.particles.length);

        shader.unuse();
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

export default Emitter;
