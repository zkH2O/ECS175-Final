import * as THREE from '/node_modules/three/build/three.module.js';

class Physics {
    constructor(gl, appState) {
        this.gl = gl;
        this.appState = appState;

        this.snowflakes = [];
        this.gravity = -0.01;
        this.snowflakeShader = null;
    }

    // Initialize snowflakes as a particle system
    initializeSnowflakes(count = 1000) {
        console.log('Initializing Snowflakes');

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions.push(
                (Math.random() - 0.5) * 20,
                Math.random() * 20,
                (Math.random() - 0.5) * 20 
            );
            velocities.push(
                0,
                Math.random() * -1,
                0
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

        this.snowflakeMesh = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })
        );
    }

    // Update physics logic for snowflakes
    update(deltaTime) {
        const positions = this.snowflakeMesh.geometry.attributes.position.array;
        const velocities = this.snowflakeMesh.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Update velocity
            velocities[i + 1] += this.gravity * deltaTime;

            // Update position
            positions[i] += velocities[i] * deltaTime;
            positions[i + 1] += velocities[i + 1] * deltaTime;
            positions[i + 2] += velocities[i + 2] * deltaTime;
        }

        this.snowflakeMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Render snowflakes
    render(gl) {
        // Render the snowflakes using THREE.js or WebGL
    }
}

export default Physics;
