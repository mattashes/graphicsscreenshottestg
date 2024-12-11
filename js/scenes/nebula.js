import * as THREE from 'three';
import BaseScene from './baseScene.js';

class NebulaScene extends BaseScene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.particles = [];
        this.particleSystem = null;
    }

    init() {
        // Create nebula particle system
        const particleCount = 10000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color = new THREE.Color();
        for (let i = 0; i < particleCount; i++) {
            // Position
            const r = 30 * Math.random();
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Color - pink/purple nebula colors
            const hue = 0.8 + 0.1 * Math.random(); // Purple range
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
            this.particleSystem.rotation.y += deltaTime * 0.1;
            
            // Animate particle sizes
            const sizes = this.particleSystem.geometry.attributes.size;
            for (let i = 0; i < sizes.count; i++) {
                sizes.array[i] *= 1 + Math.sin(Date.now() * 0.001 + i) * 0.01;
            }
            sizes.needsUpdate = true;
        }
    }

    activate() {
        super.activate();
        if (this.particleSystem) {
            this.particleSystem.visible = true;
        }
    }

    deactivate() {
        super.deactivate();
        if (this.particleSystem) {
            this.particleSystem.visible = false;
        }
    }
}

export default NebulaScene;
