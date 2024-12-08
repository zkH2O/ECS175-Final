'use strict';

import * as vec3 from '../lib/glmatrix/vec3.js'
import * as THREE from '/node_modules/three/build/three.module.js';

class Particle {
    constructor(position, velocity, acceleration, lifespan, snowBasePosition) {
        this.position = position; // vec3
        this.velocity = velocity; // vec3
        this.acceleration = acceleration; // vec3
        this.lifespan = lifespan; // Total time the particle exists
        this.age = 0; // Time the particle has been alive
        this.snowBasePosition = snowBasePosition; // Position of the snow base (vec3)
    }

    isDead() {
        return this.age >= this.lifespan;
    }

    // For bouncing off walls or objects
    handleCollisions(globeRadius, sceneNodes) {
        sceneNodes.forEach(node => node.updateWorldMatrix());

        // If particle is outside globe, bounce back inside globe
        const distanceFromCenter = vec3.length(this.position);
        if (distanceFromCenter > globeRadius) {
            const normal = vec3.normalize(vec3.create(), this.position);
            const velocityDotNormal = vec3.dot(this.velocity, normal);
            const reflection = vec3.scale(vec3.create(), normal, 2 * velocityDotNormal);
            vec3.subtract(this.velocity, this.velocity, reflection);
            const penetrationDepth = distanceFromCenter - globeRadius;
            vec3.scaleAndAdd(this.position, this.position, normal, -penetrationDepth);
        }

        // Handle collisions with 3D objects
        for (const object of sceneNodes) {
            const objectBoundingBox = new THREE.Box3().setFromObject(object);
            const particlePosition = new THREE.Vector3(...this.position);
    
            if (objectBoundingBox.containsPoint(particlePosition)) {
                const collisionNormal = new THREE.Vector3().subVectors(particlePosition, object.position).normalize();
                const velocityDotNormal = this.velocity[0] * collisionNormal.x + this.velocity[1] * collisionNormal.y + this.velocity[2] * collisionNormal.z;
                const reflection = collisionNormal.multiplyScalar(2 * velocityDotNormal);
    
                this.velocity[0] -= reflection.x;
                this.velocity[1] -= reflection.y;
                this.velocity[2] -= reflection.z;
    
                // Position the particle outside the object
                const penetrationDepth = particlePosition.distanceTo(object.position) - objectBoundingBox.getSize(new THREE.Vector3()).length();
                this.position[0] -= collisionNormal.x * penetrationDepth;
                this.position[1] -= collisionNormal.y * penetrationDepth;
                this.position[2] -= collisionNormal.z * penetrationDepth;
            }
        }
    }

    // For settling particles on the snowglobe floor
    settleParticle(snowBaseHeight) {
        this.velocity = [0, 0, 0]; // Stop the vertical motion
        this.position[1] = snowBaseHeight; // Adjust position to floor level
    }

    update(deltaTime, globeRadius, sceneNodes) {
        // Update the age of the particle
        this.age += deltaTime;

        // Update velocity and position
        for (let i = 0; i < this.position.length; i++) {
            this.velocity[i] += this.acceleration[i] * deltaTime;
            this.position[i] += this.velocity[i] * deltaTime;
        }

        if (this.position[1] <= this.snowBasePosition[1] + 0.1) {
            this.settleParticle(this.snowBasePosition[1]);
        }

        this.handleCollisions(globeRadius, sceneNodes);
    }
}

export { Particle };

