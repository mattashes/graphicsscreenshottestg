import * as THREE from 'three';
import Scene from './baseScene.js';
import ParticleEmitter from '../particles/emitter.js';

class GalaxyScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.time = 0;
    }

    init() {
        // Create particle emitter for galaxy effect
        const emitter = new ParticleEmitter(this.mainScene, 100000);
        
        // Configure particle properties
        emitter.setParticleProperties({
            size: { min: 0.02, max: 0.1 },
            color: new THREE.Color(0xff375f), // Pink
            speed: { min: 0.1, max: 0.3 },
            lifetime: { min: 2, max: 4 }
        });

        // Set up camera
        this.camera.position.z = 150;
        this.camera.position.y = 50;
        this.camera.lookAt(0, 0, 0);

        // Custom update function for galaxy movement
        emitter.setUpdateFunction((particle, deltaTime) => {
            // Calculate distance from center
            const distance = particle.position.length();
            
            // Orbital speed based on distance (Keplerian motion)
            const orbitalSpeed = 0.5 / Math.sqrt(Math.max(0.1, distance));
            
            // Update particle position
            const x = particle.position.x;
            const z = particle.position.z;
            
            particle.position.x = x * Math.cos(orbitalSpeed * deltaTime) - z * Math.sin(orbitalSpeed * deltaTime);
            particle.position.z = x * Math.sin(orbitalSpeed * deltaTime) + z * Math.cos(orbitalSpeed * deltaTime);
            
            // Color based on distance
            const colorProgress = Math.min(distance / 100, 1);
            particle.color.setHSL(0.7 - colorProgress * 0.5, 0.8, 0.6);
        });

        // Initialize galaxy structure
        for (let i = 0; i < emitter.particles.length; i++) {
            const particle = emitter.particles[i];
            
            // Random angle and distance for spiral arms
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.pow(Math.random(), 0.5) * 100;
            
            // Spiral arm offset
            const armOffset = (angle / (Math.PI * 2)) * Math.PI * 4;
            
            // Set position
            particle.position.x = Math.cos(angle + armOffset) * distance;
            particle.position.z = Math.sin(angle + armOffset) * distance;
            particle.position.y = (Math.random() - 0.5) * distance * 0.1;
            
            // Set velocity for orbital motion
            const speed = Math.sqrt(1 / Math.max(0.1, distance));
            particle.velocity.x = -Math.sin(angle) * speed;
            particle.velocity.z = Math.cos(angle) * speed;
        }

        this.emitters.push(emitter);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.time += deltaTime;
        
        // Slowly rotate camera around galaxy
        const cameraAngle = this.time * 0.05;
        const cameraRadius = 150;
        this.camera.position.x = Math.cos(cameraAngle) * cameraRadius;
        this.camera.position.z = Math.sin(cameraAngle) * cameraRadius;
        this.camera.lookAt(0, 0, 0);
    }
}

export default GalaxyScene;
