'use strict';

class Particle {
    constructor(position, velocity, acceleration, lifespan) {
        this.position = position; // vec3
        this.velocity = velocity; // vec3
        this.acceleration = acceleration; // vec3
        this.lifespan = lifespan; // Total time the particle exists
        this.age = 0; // Time the particle has been alive
    }

    update(deltaTime) {
        // Update the age of the particle
        this.age += deltaTime;

        // Update velocity and position
        for (let i = 0; i < this.position.length; i++) {
            this.velocity[i] += this.acceleration[i] * deltaTime;
            this.position[i] += this.velocity[i] * deltaTime;
        }
    }

    isDead() {
        return this.age >= this.lifespan;
    }
}

export { Particle };

