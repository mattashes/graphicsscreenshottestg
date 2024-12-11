import * as THREE from 'three';
import { Scene } from './baseScene.js';
import { createNoise4D } from 'simplex-noise';

class StellarNurseryScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.timeScale = 1.0;
        this.starFormationRate = 1.0;
        this.cloudDensity = 1.0;
        this.noise4D = createNoise4D();
        this.protoStars = [];
    }

    init() {
        // Create nebula cloud
        const cloudGeometry = new THREE.BufferGeometry();
        const cloudParticles = 200000;
        const positions = new Float32Array(cloudParticles * 3);
        const colors = new Float32Array(cloudParticles * 3);
        const sizes = new Float32Array(cloudParticles);

        for (let i = 0; i < cloudParticles; i++) {
            // Position particles in a disk-like volume
            const r = Math.pow(Math.random(), 0.5) * 40;
            const theta = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 10;

            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = r * Math.sin(theta);

            // Warm colors for the nebula (reds, oranges, and pinks)
            const t = Math.random();
            colors[i * 3] = 0.8 + 0.2 * t;     // R
            colors[i * 3 + 1] = 0.3 + 0.3 * t; // G
            colors[i * 3 + 2] = 0.4 + 0.2 * t; // B

            // Varying particle sizes
            sizes[i] = Math.random() * 2 + 1;
        }

        cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        cloudGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        cloudGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader material for nebula particles
        const cloudMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                attribute vec3 color;
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                uniform float cloudDensity;

                void main() {
                    vColor = color;
                    
                    // Animate position with noise
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Dynamic size based on density and distance
                    gl_PointSize = size * cloudDensity * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;

                    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.4);
                }
            `,
            uniforms: {
                time: { value: 0 },
                cloudDensity: { value: this.cloudDensity }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.nebula = new THREE.Points(cloudGeometry, cloudMaterial);
        this.mainScene.add(this.nebula);

        // Initialize proto-stars
        this.initProtoStars();

        // Enable post-processing effects
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 2.0;
            this.postProcessing.bokehPass.enabled = true;
            this.postProcessing.bokehPass.uniforms.focus.value = 15;
            this.postProcessing.bokehPass.uniforms.aperture.value = 0.02;
        }
    }

    initProtoStars() {
        const protoStarCount = 50;
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        
        for (let i = 0; i < protoStarCount; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1, 0.7, 0.3),
                transparent: true,
                opacity: 0.8
            });

            const protoStar = new THREE.Mesh(geometry, material);
            
            // Random position within the nebula
            const r = Math.pow(Math.random(), 0.5) * 35;
            const theta = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 8;

            protoStar.position.set(
                r * Math.cos(theta),
                height,
                r * Math.sin(theta)
            );

            protoStar.scale.setScalar(Math.random() * 0.5 + 0.5);
            this.protoStars.push({
                mesh: protoStar,
                age: Math.random() * Math.PI * 2,
                growthRate: Math.random() * 0.5 + 0.5
            });

            this.mainScene.add(protoStar);
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        const time = performance.now() * 0.001;

        // Update nebula
        const positions = this.nebula.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            // Apply noise-based movement
            const scale = 0.05;
            const noiseVal = this.noise4D(
                x * scale,
                y * scale,
                z * scale,
                time * 0.2
            ) * this.cloudDensity;

            positions[i] += Math.sin(noiseVal) * 0.02 * this.timeScale;
            positions[i + 1] += Math.cos(noiseVal) * 0.02 * this.timeScale;
            positions[i + 2] += Math.sin(noiseVal * 0.5) * 0.02 * this.timeScale;
        }

        this.nebula.geometry.attributes.position.needsUpdate = true;
        this.nebula.material.uniforms.time.value = time;

        // Update proto-stars
        this.protoStars.forEach(star => {
            star.age += deltaTime * this.starFormationRate * star.growthRate;
            
            // Pulsating effect
            const scale = 1 + Math.sin(star.age) * 0.2;
            star.mesh.scale.setScalar(scale * (0.5 + 0.5 * star.growthRate));
            
            // Varying brightness
            star.mesh.material.opacity = 0.6 + Math.sin(star.age * 0.5) * 0.4;
            
            // Color variation
            const hue = (Math.sin(star.age * 0.1) + 1) * 0.05;
            star.mesh.material.color.setHSL(hue, 0.7, 0.7);
        });
    }

    deactivate() {
        super.deactivate();
        if (this.nebula) {
            this.mainScene.remove(this.nebula);
            this.nebula.geometry.dispose();
            this.nebula.material.dispose();
        }
        this.protoStars.forEach(star => {
            this.mainScene.remove(star.mesh);
            star.mesh.geometry.dispose();
            star.mesh.material.dispose();
        });
        this.protoStars = [];
    }

    setCloudDensity(value) {
        this.cloudDensity = value;
        if (this.nebula) {
            this.nebula.material.uniforms.cloudDensity.value = value;
        }
    }

    setStarFormationRate(value) {
        this.starFormationRate = value;
    }
}

export default StellarNurseryScene; 