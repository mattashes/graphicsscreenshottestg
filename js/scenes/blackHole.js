/**
 * Black Hole Visualization Scene
 * 
 * Visual Elements:
 * - Intense central singularity with bloom effect
 * - Accretion disk with particle trails
 * - Gravitational lensing effect on background stars
 * - Event horizon visualization
 * - Orbital particle streams
 * 
 * Particle Systems:
 * 1. Core Singularity
 *    - Dense central particle cluster
 *    - Intense bloom effect
 *    - Blue-white color gradient
 * 
 * 2. Accretion Disk
 *    - Spiral particle formation
 *    - Orange-red color gradient
 *    - Particle trails with history
 *    - Varying orbital velocities
 * 
 * 3. Background Star Field
 *    - Distorted by gravitational lensing
 *    - Particle size variation
 *    - Depth-based intensity
 * 
 * Effects:
 * - Post-processing bloom for glow
 * - Custom shader for gravitational lensing
 * - Particle trails with fade
 * - Dynamic color transitions
 * 
 * Camera:
 * - Orbital movement around black hole
 * - Dynamic focal length
 * - Depth of field effect
 * 
 * Physics:
 * - Relativistic orbital mechanics
 * - Particle acceleration near horizon
 * - Light bending calculations
 * - Time dilation visualization
 */

import * as THREE from 'three';
import Scene from './baseScene.js';
import { ParticleTrailManager } from '../effects/particleTrails.js';

class BlackHoleScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.scene = mainScene;
        this.trailManager = new ParticleTrailManager(this.scene);
        this.accretionDiskParticles = [];
        this.starfieldParticles = [];
        this.blackHoleRadius = 5;
        this.accretionDiskRadius = 15;
        this.timeScale = 1;
    }

    init() {
        console.log('Initializing BlackHoleScene');
        console.log('BlackHole Radius:', this.blackHoleRadius);

        // Check if blackHoleRadius is defined
        if (typeof this.blackHoleRadius !== 'number' || isNaN(this.blackHoleRadius)) {
            console.error('Error: blackHoleRadius is not defined or is not a number');
            return;
        }

        // Setup post-processing effects
        this.postProcessing.setBloomStrength(2.0);
        this.postProcessing.enableGravitationalLensing(true);
        this.postProcessing.setLensingParams(
            new THREE.Vector2(0.5, 0.5),
            0.15,
            0.2
        );

        // Create black hole core
        const blackHoleGeometry = new THREE.SphereGeometry(this.blackHoleRadius, 32, 32);
        const blackHoleMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.95
        });
        this.blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
        console.log('BlackHole Mesh:', this.blackHole);
        
        console.log('Scene:', this.scene);
        
        this.scene.add(this.blackHole);

        // Create event horizon glow
        const glowGeometry = new THREE.SphereGeometry(this.blackHoleRadius * 1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x0066ff) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(color, 1.0) * intensity;
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.blackHole.add(glow);

        // Initialize accretion disk particles
        this.initAccretionDisk();
        
        // Initialize starfield
        this.initStarfield();

        // Position camera
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
    }

    initAccretionDisk() {
        const particleCount = 1000;
        const colors = [0xff7700, 0xff3300, 0xffaa00];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const radius = this.blackHoleRadius + 
                (Math.random() * (this.accretionDiskRadius - this.blackHoleRadius));
            
            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 0.5, // Thin disk
                Math.sin(angle) * radius
            );

            const velocity = new THREE.Vector3(
                -position.z,
                0,
                position.x
            ).normalize();

            const speed = Math.sqrt(this.blackHoleRadius / radius) * 0.5;
            velocity.multiplyScalar(speed);

            // Create trail for this particle
            const trail = this.trailManager.createTrail(`disk_${i}`, {
                maxPoints: 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                width: 2,
                opacity: 0.6,
                fadeOut: true
            });

            this.accretionDiskParticles.push({
                position,
                velocity,
                trail
            });
        }
    }

    initStarfield() {
        const starCount = 2000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 100 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i3 + 2] = radius * Math.cos(phi);

            const color = new THREE.Color().setHSL(Math.random(), 0.2, 0.8);
            starColors[i3] = color.r;
            starColors[i3 + 1] = color.g;
            starColors[i3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }

    update(deltaTime) {
        // Update accretion disk particles
        this.accretionDiskParticles.forEach(particle => {
            // Calculate gravitational effect
            const distanceToCenter = particle.position.length();
            const gravitationalForce = this.blackHoleRadius / (distanceToCenter * distanceToCenter);
            
            // Update velocity based on gravity
            const acceleration = particle.position.clone()
                .normalize()
                .multiplyScalar(-gravitationalForce);
            
            particle.velocity.add(acceleration.multiplyScalar(deltaTime * this.timeScale));
            
            // Update position
            particle.position.add(
                particle.velocity.clone().multiplyScalar(deltaTime * this.timeScale)
            );

            // Update particle trail
            particle.trail.addPoint(particle.position);

            // Reset particle if too close to black hole
            if (distanceToCenter < this.blackHoleRadius) {
                const angle = Math.random() * Math.PI * 2;
                const radius = this.accretionDiskRadius;
                
                particle.position.set(
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 0.5,
                    Math.sin(angle) * radius
                );

                particle.velocity.set(
                    -particle.position.z,
                    0,
                    particle.position.x
                ).normalize().multiplyScalar(0.5);
            }
        });

        // Slowly rotate starfield
        this.starfield.rotation.y += deltaTime * 0.01;

        // Update post-processing parameters
        const screenPosition = new THREE.Vector3();
        this.blackHole.getWorldPosition(screenPosition);
        screenPosition.project(this.camera);
        
        this.postProcessing.setLensingParams(
            new THREE.Vector2(
                (screenPosition.x * 0.5) + 0.5,
                (screenPosition.y * 0.5) + 0.5
            ),
            0.15,
            0.2
        );
    }

    dispose() {
        super.dispose();
        this.trailManager.clear();
    }
}

export default BlackHoleScene;
