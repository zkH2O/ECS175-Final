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
    

    update(deltaTime, globeModelMatrix, globeRadius, snowBaseRadius) {
        this.elapsedTime += deltaTime;
        const particlesToEmit = Math.floor(this.elapsedTime * this.emissionRate);
    
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
    
            this.particles.push(new Particle([...this.position], transformedVelocity, acceleration, this.particleLifetime));
        }
    
        this.elapsedTime %= (1 / this.emissionRate);
    
        for (const particle of this.particles) {
            particle.update(deltaTime);
    
            const dx = particle.position[0] - this.snowBasePosition[0];
            const dz = particle.position[2] - this.snowBasePosition[2];
            const distanceXZ = Math.sqrt(dx * dx + dz * dz); // Distance from center in XZ plane
            const height = particle.position[1]; // Y-axis height
    
            // Check if the particle is near the snow base's height
            const snowBaseHeight = this.snowBasePosition[1];
            if (height <= snowBaseHeight + 0.1) {
                particle.velocity = [0, 0, 0]; // Stop motion
                particle.acceleration = [0, 0, 0]; // Stop applying forces
                particle.position[1] = snowBaseHeight; // Snap to the snow base height
    
                // Constrain particles to within the radius of the snow base
                if (distanceXZ > snowBaseRadius) {
                    const scale = snowBaseRadius / distanceXZ;
                    particle.position[0] = this.snowBasePosition[0] + dx * scale;
                    particle.position[2] = this.snowBasePosition[2] + dz * scale;
                }
            } else {
                // Apply boundary reflection for particles outside the globe
                const distanceFromCenter = vec3.length(particle.position);
                if (distanceFromCenter > globeRadius) {
                    const normal = vec3.normalize(vec3.create(), particle.position);
                    const velocityDotNormal = vec3.dot(particle.velocity, normal);
                    const reflection = vec3.scale(vec3.create(), normal, 2 * velocityDotNormal);
                    vec3.subtract(particle.velocity, particle.velocity, reflection);
                    const penetrationDepth = distanceFromCenter - globeRadius;
                    vec3.scaleAndAdd(particle.position, particle.position, normal, -penetrationDepth);
                }
            }
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
