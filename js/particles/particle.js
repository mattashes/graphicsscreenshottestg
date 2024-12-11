/**
 * Single Particle Logic
 * Defines:
 * - Particle properties
 * - Individual particle behavior
 * - Lifecycle management
 */

import * as THREE from 'three';

class Particle {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.color = new THREE.Color();
        this.size = 1.0;
        this.life = 1.0;
        this.maxLife = 1.0;
    }

    update(deltaTime) {
        this.velocity.add(this.acceleration.multiplyScalar(deltaTime));
        this.position.add(this.velocity.multiplyScalar(deltaTime));
        this.life -= deltaTime;
    }

    isDead() {
        return this.life <= 0;
    }

    reset(position, velocity) {
        this.position.copy(position);
        this.velocity.copy(velocity);
        this.life = this.maxLife;
    }
}

export default Particle;
