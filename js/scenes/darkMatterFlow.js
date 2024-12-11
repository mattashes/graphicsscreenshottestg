import * as THREE from 'three';
import { Scene } from './baseScene.js';
import { createNoise3D } from 'simplex-noise';

class DarkMatterFlowScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.timeScale = 1.0;
        this.flowIntensity = 1.0;
        this.particleCount = 100000;
        this.noise3D = createNoise3D();
    }

    init() {
        // Create dark matter particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            // Position particles in a spherical volume
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.pow(Math.random(), 0.3) * 50;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Initialize velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

            // Dark matter color gradient from deep purple to blue
            const t = Math.random();
            colors[i * 3] = 0.2 + 0.1 * t;     // R
            colors[i * 3 + 1] = 0.1 + 0.2 * t; // G
            colors[i * 3 + 2] = 0.4 + 0.3 * t; // B
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Custom shader material for dark matter particles
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform float flowIntensity;

                void main() {
                    vColor = color;
                    
                    // Calculate position with flow effect
                    vec3 pos = position + velocity * time * flowIntensity;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Size attenuation
                    gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main() {
                    // Circular point shape
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;

                    // Smooth edges and apply color
                    float alpha = 1.0 - smoothstep(0.45, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.6);
                }
            `,
            uniforms: {
                time: { value: 0 },
                flowIntensity: { value: this.flowIntensity }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.mainScene.add(this.particles);

        // Enable post-processing effects
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 1.8;
            this.postProcessing.bokehPass.enabled = true;
            this.postProcessing.bokehPass.uniforms.focus.value = 20;
            this.postProcessing.bokehPass.uniforms.aperture.value = 0.01;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        const time = performance.now() * 0.001;
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;

        // Update particle positions based on flow field
        for (let i = 0; i < this.particleCount; i++) {
            const ix = i * 3;
            const iy = ix + 1;
            const iz = ix + 2;

            // Get current position
            const x = positions[ix];
            const y = positions[iy];
            const z = positions[iz];

            // Calculate flow field influence
            const scale = 0.05;
            const noiseX = this.noise3D(x * scale, y * scale, time * 0.2) * this.flowIntensity;
            const noiseY = this.noise3D(y * scale, z * scale, time * 0.2) * this.flowIntensity;
            const noiseZ = this.noise3D(z * scale, x * scale, time * 0.2) * this.flowIntensity;

            // Update velocities based on flow field
            velocities[ix] += noiseX * 0.01;
            velocities[iy] += noiseY * 0.01;
            velocities[iz] += noiseZ * 0.01;

            // Apply velocity damping
            velocities[ix] *= 0.99;
            velocities[iy] *= 0.99;
            velocities[iz] *= 0.99;

            // Update positions
            positions[ix] += velocities[ix] * this.timeScale;
            positions[iy] += velocities[iy] * this.timeScale;
            positions[iz] += velocities[iz] * this.timeScale;

            // Keep particles within bounds
            const radius = Math.sqrt(x * x + y * y + z * z);
            if (radius > 50) {
                const scale = 49 / radius;
                positions[ix] *= scale;
                positions[iy] *= scale;
                positions[iz] *= scale;
            }
        }

        // Update geometry attributes
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.velocity.needsUpdate = true;
        this.particles.material.uniforms.time.value = time;
    }

    deactivate() {
        super.deactivate();
        if (this.particles) {
            this.mainScene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
    }

    setFlowIntensity(value) {
        this.flowIntensity = value;
        if (this.particles) {
            this.particles.material.uniforms.flowIntensity.value = value;
        }
    }
}

export default DarkMatterFlowScene; 