import * as THREE from 'three';
import Scene from './baseScene.js';
import ParticleEmitter from '../particles/emitter.js';

class QuantumScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.time = 0;
    }

    init() {
        // Create particle emitter for quantum effect
        const emitter = new ParticleEmitter(this.mainScene, 75000);
        
        // Configure particle properties
        emitter.setParticleProperties({
            size: { min: 0.03, max: 0.08 },
            color: new THREE.Color(0x0a84ff), // Blue
            speed: { min: 0.2, max: 0.4 },
            lifetime: { min: 2, max: 4 }
        });

        // Set up camera
        this.camera.position.z = 100;
        this.camera.position.y = 30;
        this.camera.lookAt(0, 0, 0);

        // Custom update function for quantum movement
        emitter.setUpdateFunction((particle, deltaTime) => {
            // Wave function parameters
            const frequency = 0.5;
            const amplitude = 20;
            const wavelength = 0.1;
            
            // Calculate wave motion
            const waveX = Math.sin(particle.position.z * wavelength + this.time * frequency) * amplitude;
            const waveY = Math.cos(particle.position.x * wavelength + this.time * frequency) * amplitude;
            
            // Apply quantum tunneling effect
            if (Math.random() < 0.001) {
                particle.position.x = -particle.position.x;
                particle.position.y = -particle.position.y;
            }
            
            // Update position with wave motion
            particle.position.x += (waveX - particle.position.x) * deltaTime;
            particle.position.y += (waveY - particle.position.y) * deltaTime;
            
            // Color based on position and time
            const phase = Math.sin(this.time * 2 + particle.position.length() * 0.1);
            particle.color.setHSL(0.6 + phase * 0.1, 0.8, 0.5);
        });

        // Initialize quantum field
        for (let i = 0; i < emitter.particles.length; i++) {
            const particle = emitter.particles[i];
            
            // Create grid-like structure
            const gridSize = Math.ceil(Math.sqrt(emitter.particles.length));
            const spacing = 200 / gridSize;
            
            const x = (i % gridSize - gridSize / 2) * spacing;
            const z = (Math.floor(i / gridSize) - gridSize / 2) * spacing;
            
            particle.position.set(x, 0, z);
            particle.velocity.set(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            );
        }

        this.emitters.push(emitter);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.time += deltaTime;
        
        // Camera movement
        const radius = 120;
        const height = 30 + Math.sin(this.time * 0.2) * 20;
        const angle = this.time * 0.1;
        
        this.camera.position.x = Math.cos(angle) * radius;
        this.camera.position.z = Math.sin(angle) * radius;
        this.camera.position.y = height;
        this.camera.lookAt(0, 0, 0);
    }
}

export default QuantumScene;
