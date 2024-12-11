/**
 * Quantum Structure Visualization Scene
 * 
 * Visual Elements:
 * - Metallic quantum spheres
 * - Orbital path lines
 * - Probability cloud effects
 * - Quantum state transitions
 * - Geometric symmetry patterns
 * 
 * Particle Systems:
 * 1. Quantum Spheres
 *    - Metallic material with reflection
 *    - Size oscillation
 *    - State-based color changes
 *    - Position uncertainty blur
 * 
 * 2. Orbital Paths
 *    - Glowing line geometry
 *    - Dynamic path updates
 *    - Probability-based visibility
 *    - Interference patterns
 * 
 * 3. Probability Cloud
 *    - Volumetric particle system
 *    - Density-based color
 *    - Wave function visualization
 *    - Quantum tunneling effects
 * 
 * Effects:
 * - Environment mapping for reflections
 * - Custom shaders for metallic look
 * - Glow post-processing
 * - Wave function animation
 * 
 * Camera:
 * - Smooth orbital movement
 * - Focus on quantum transitions
 * - Dynamic composition framing
 * 
 * Interactions:
 * - Quantum state manipulation
 * - Orbital path visualization
 * - Wave function collapse
 * - Entanglement demonstration
 */

import * as THREE from 'three';
import Scene from './baseScene.js';
import { ParticleTrailManager } from '../effects/particleTrails.js';
import { SceneControlPanel, getControlsForScene } from '../ui/controlPanel.js';

class QuantumStructureScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.trailManager = new ParticleTrailManager(this.mainScene);
        this.quantumNodes = [];
        this.orbitalPaths = [];
        this.timeScale = 1;
        this.controls = new SceneControlPanel();
        
        // Quantum state parameters
        this.stateEnergy = 1.0;
        this.waveFunctionPhase = 0;
        this.probabilityAmplitude = 1.0;
    }

    init() {
        // Setup post-processing
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 1.5;
            this.postProcessing.bokehPass.enabled = true;
            this.postProcessing.bokehPass.uniforms.focus.value = 30.0;
            this.postProcessing.bokehPass.uniforms.aperture.value = 0.015;
            this.postProcessing.bokehPass.uniforms.maxblur.value = 0.015;
        }

        // Initialize UI controls
        const config = getControlsForScene(this);
        if (config) {
            this.controls.updateForScene(this, config);
        }

        // Create environment map for metallic reflections
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
        const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
        this.mainScene.add(cubeCamera);

        // Initialize quantum nodes
        this.initQuantumNodes(cubeRenderTarget.texture);
        
        // Initialize orbital paths
        this.initOrbitalPaths();
        
        // Initialize probability cloud
        this.initProbabilityCloud();

        // Position camera
        this.camera.position.set(30, 20, 30);
        this.camera.lookAt(0, 0, 0);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.mainScene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.mainScene.add(directionalLight);
    }

    initQuantumNodes(envMap) {
        const nodeCount = 3;
        const baseRadius = 5;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = baseRadius;
            
            // Create metallic sphere
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color().setHSL(i / nodeCount, 0.8, 0.5),
                metalness: 0.9,
                roughness: 0.1,
                envMap: envMap,
                envMapIntensity: 1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            // Create glow effect
            const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
            const glowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new THREE.Color().setHSL(i / nodeCount, 0.8, 0.5) }
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
                        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                        gl_FragColor = vec4(color, 1.0) * intensity;
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            sphere.add(glow);
            
            // Create orbital trail
            const trail = this.trailManager.createTrail(`quantum_${i}`, {
                maxPoints: 100,
                color: new THREE.Color().setHSL(i / nodeCount, 0.8, 0.5).getHex(),
                width: 2,
                opacity: 0.6,
                fadeOut: true
            });
            
            this.quantumNodes.push({
                sphere,
                trail,
                basePosition: sphere.position.clone(),
                phase: Math.random() * Math.PI * 2,
                frequency: 1 + (i * 0.5)
            });
            
            this.mainScene.add(sphere);
        }
    }

    initOrbitalPaths() {
        const pathCount = 5;
        const baseRadius = 8;
        
        for (let i = 0; i < pathCount; i++) {
            const radius = baseRadius * (1 + i * 0.3);
            const points = [];
            const segments = 64;
            
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle * 2) * 0.5, // Add some vertical oscillation
                    Math.sin(angle) * radius
                ));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: new THREE.Color().setHSL(i / pathCount, 0.8, 0.5),
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            
            const orbital = new THREE.Line(geometry, material);
            this.orbitalPaths.push(orbital);
            this.mainScene.add(orbital);
        }
    }

    initProbabilityCloud() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const radius = 15 * Math.random();
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            const color = new THREE.Color().setHSL(
                Math.random(),
                0.8,
                0.5 + Math.random() * 0.2
            );
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.probabilityCloud = new THREE.Points(geometry, material);
        this.mainScene.add(this.probabilityCloud);
    }

    update(deltaTime) {
        if (!this.active) return;

        // Update quantum nodes
        this.quantumNodes.forEach((node, index) => {
            // Calculate quantum state evolution
            node.phase += deltaTime * node.frequency * this.timeScale;
            
            // Update position with quantum oscillation
            const oscillation = Math.sin(node.phase) * 2;
            const position = node.basePosition.clone();
            
            // Apply quantum uncertainty
            position.x += Math.sin(this.waveFunctionPhase + index) * this.probabilityAmplitude;
            position.y += oscillation * this.probabilityAmplitude;
            position.z += Math.cos(this.waveFunctionPhase + index) * this.probabilityAmplitude;
            
            node.sphere.position.copy(position);
            
            // Update trail
            node.trail.addPoint(position);
            
            // Update sphere color based on state energy
            const hue = (index / this.quantumNodes.length + this.stateEnergy * 0.2) % 1;
            node.sphere.material.color.setHSL(hue, 0.8, 0.5);
            node.sphere.children[0].material.uniforms.color.value.setHSL(hue, 0.8, 0.5);
        });

        // Update probability cloud
        if (this.probabilityCloud) {
            const positions = this.probabilityCloud.geometry.attributes.position.array;
            const colors = this.probabilityCloud.geometry.attributes.color.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Apply wave function modulation
                const radius = Math.sqrt(
                    positions[i] * positions[i] + 
                    positions[i + 1] * positions[i + 1] + 
                    positions[i + 2] * positions[i + 2]
                );
                
                const waveFunction = Math.exp(-radius / (10 * this.probabilityAmplitude));
                const phase = Math.atan2(positions[i + 2], positions[i]) + this.waveFunctionPhase;
                
                // Update particle positions based on wave function
                const scale = 1 + waveFunction * Math.sin(phase) * 0.2;
                positions[i] *= scale;
                positions[i + 1] *= scale;
                positions[i + 2] *= scale;
                
                // Update colors based on probability density
                const colorIndex = i / 3;
                const hue = (waveFunction + this.stateEnergy * 0.2) % 1;
                const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
                colors[colorIndex * 3] = color.r;
                colors[colorIndex * 3 + 1] = color.g;
                colors[colorIndex * 3 + 2] = color.b;
            }
            
            this.probabilityCloud.geometry.attributes.position.needsUpdate = true;
            this.probabilityCloud.geometry.attributes.color.needsUpdate = true;
        }

        // Update wave function phase
        this.waveFunctionPhase += deltaTime * this.timeScale;

        // Rotate orbital paths
        this.orbitalPaths.forEach((orbital, index) => {
            orbital.rotation.y += deltaTime * 0.1 * (index + 1) * this.timeScale;
            orbital.rotation.x += deltaTime * 0.05 * (index + 1) * this.timeScale;
        });
    }

    // Wave function collapse animation
    collapseWaveFunction(targetState) {
        const initialAmplitude = this.probabilityAmplitude;
        const initialEnergy = this.stateEnergy;
        const duration = 1.0; // seconds
        let elapsed = 0;

        const animate = () => {
            if (elapsed >= duration) {
                this.probabilityAmplitude = 0.2;
                this.stateEnergy = targetState;
                return;
            }

            elapsed += 0.016; // Approximate for 60fps
            const t = elapsed / duration;
            const easing = 1 - Math.pow(1 - t, 3); // Cubic easing

            // Collapse probability amplitude
            this.probabilityAmplitude = initialAmplitude * (1 - easing) + 0.2 * easing;
            
            // Transition energy state
            this.stateEnergy = initialEnergy * (1 - easing) + targetState * easing;

            requestAnimationFrame(animate);
        };

        animate();
    }

    // State manipulation methods
    exciteState() {
        const nextState = Math.min(this.stateEnergy + 1, 3);
        this.collapseWaveFunction(nextState);
    }

    relaxState() {
        const nextState = Math.max(this.stateEnergy - 1, 1);
        this.collapseWaveFunction(nextState);
    }

    dispose() {
        // Dispose geometry and materials
        this.quantumNodes.forEach(node => {
            node.sphere.geometry.dispose();
            node.sphere.material.dispose();
            node.sphere.children[0].geometry.dispose();
            node.sphere.children[0].material.dispose();
            if (node.trail) {
                node.trail.geometry.dispose();
                node.trail.material.dispose();
            }
        });

        this.orbitalPaths.forEach(orbital => {
            orbital.geometry.dispose();
            orbital.material.dispose();
        });

        if (this.probabilityCloud) {
            this.probabilityCloud.geometry.dispose();
            this.probabilityCloud.material.dispose();
        }

        // Clear arrays
        this.quantumNodes = [];
        this.orbitalPaths = [];
        this.probabilityCloud = null;
    }

    deactivate() {
        // Don't dispose controls, they're shared
        this.dispose();
        super.deactivate();
    }
}

export default QuantumStructureScene;
