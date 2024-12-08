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
    handleCollisions(globeRadius, meshes) {
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
        else {
            // FIXME: this is a basic test for raycaster to collide w something. still no intersections to indicate collisions, but there should be...
            // Create a simple sphere for testing
            const testSphere = new THREE.Mesh(
                new THREE.SphereGeometry(1),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            testSphere.position.set(0, 0, 0);

            // Test raycasting with the simple sphere
            const raycaster = new THREE.Raycaster();
            const particlePosition = new THREE.Vector3(0, 0, 5);
            const velocity = new THREE.Vector3(0, 0, -1);

            // Set near and far planes for raycaster
            raycaster.near = 0.1;  
            raycaster.far = 1000;

            // Ensure velocity is normalized
            raycaster.ray.origin.copy(particlePosition);
            raycaster.ray.direction.copy(velocity).normalize();

            // Update world transformations before raycasting
            testSphere.updateMatrixWorld();

            // Perform intersection test
            const intersects = raycaster.intersectObject(testSphere);
            if (intersects > 0) {
                console.log("Intersects with test sphere:", intersects);
            }
            // // Handle collisions with 3D objects
            // for (const node of meshes) {            
            //     const boundingSphere = node.geometry.boundingSphere;
            //     const particlePosition = new THREE.Vector3(this.position[0], this.position[1], this.position[2]);
            //     const distanceSquared = boundingSphere.center.distanceToSquared(particlePosition);
            //     if (distanceSquared <= Math.pow(boundingSphere.radius, 2)) {
            //         // Handle intersection logic here
            //         // If particle is within bounding volume, perform detailed collision check
            //         // const worldMatrix = node.matrixWorld;
            //         // node.geometry.applyMatrix4(worldMatrix);

            //         // Create a raycaster for collision detection
            //         const raycaster = new THREE.Raycaster();

            //         // Debugging: Log positions, velocity, and ray direction
            //         raycaster.ray.origin.copy(particlePosition);
            //         raycaster.ray.direction.copy(this.velocity).normalize(); 

            //         const intersects = raycaster.intersectObject(node);
            //         console.log("Intersects:", intersects);

            //         if (intersects.length > 0) {
            //             console.log("!", this.position)
            //             const intersection = intersects[0];
            //             const normal = intersection.face.normal;
            //             this.velocity.reflect(normal);
            //             this.position.set(intersection.point.x, intersection.point.y, intersection.point.z);
            //             console.log(".", this.position)
            //         }
            //     }
            // }
        }
    }

    // For settling particles on the snowglobe floor
    settleParticle(snowBaseHeight) {
        this.velocity = [0, 0, 0]; // Stop the vertical motion
        this.position[1] = snowBaseHeight; // Adjust position to floor level
    }

    update(deltaTime, globeRadius, meshes) {
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

        this.handleCollisions(globeRadius, meshes);
    }
}

export { Particle };

