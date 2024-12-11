import * as THREE from 'three';
import BaseScene from './baseScene.js';

class SupernovaScene extends BaseScene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.particles = [];
        this.particleSystem = null;
        this.explosionTime = 0;
    }

    init() {
        // Create supernova particle system
        const particleCount = 50000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color = new THREE.Color();
        for (let i = 0; i < particleCount; i++) {
            // Initial compact sphere
            const r = 2 * Math.random();
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Explosion velocities
            velocities[i * 3] = positions[i * 3] * 2;
            velocities[i * 3 + 1] = positions[i * 3 + 1] * 2;
            velocities[i * 3 + 2] = positions[i * 3 + 2] * 2;

            // Color - yellow/orange supernova colors
            const hue = 0.1 + 0.05 * Math.random(); // Yellow-orange range
            const saturation = 0.8 + 0.2 * Math.random();
            const lightness = 0.6 + 0.2 * Math.random();
            color.setHSL(hue, saturation, lightness);
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Size
            sizes[i] = 2.0 * (1 + Math.random());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Store velocities for animation
        this.velocities = velocities;

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.mainScene.add(this.particleSystem);
    }

    update(deltaTime) {
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position;
            const sizes = this.particleSystem.geometry.attributes.size;

            // Increment explosion time
            this.explosionTime += deltaTime;

            // Update particle positions based on velocities
            for (let i = 0; i < positions.count; i++) {
                const explosionFactor = Math.min(this.explosionTime * 0.5, 1.0);
                
                positions.array[i * 3] += this.velocities[i * 3] * deltaTime * explosionFactor;
                positions.array[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime * explosionFactor;
                positions.array[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime * explosionFactor;

                // Pulsing size effect
                sizes.array[i] = 2.0 * (1 + Math.sin(this.explosionTime * 5 + i) * 0.3);
            }

            positions.needsUpdate = true;
            sizes.needsUpdate = true;
        }
    }

    activate() {
        super.activate();
        if (this.particleSystem) {
            this.particleSystem.visible = true;
            this.explosionTime = 0; // Reset explosion on activation
            
            // Reset particle positions
            const positions = this.particleSystem.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const r = 2 * Math.random();
                const theta = 2 * Math.PI * Math.random();
                const phi = Math.acos(2 * Math.random() - 1);
                
                positions.array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions.array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions.array[i * 3 + 2] = r * Math.cos(phi);
            }
            positions.needsUpdate = true;
        }
    }

    deactivate() {
        super.deactivate();
        if (this.particleSystem) {
            this.particleSystem.visible = false;
        }
    }
}

export default SupernovaScene;
