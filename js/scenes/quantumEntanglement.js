/**
 * Quantum Entanglement Visualization Scene
 * 
 * Visual Elements:
 * - Entangled particle pairs
 * - Energy stream connections
 * - State visualization
 * - Quantum correlation effects
 * - Multi-dimensional representation
 * 
 * Particle Systems:
 * 1. Entangled Pairs
 *    - Synchronized states
 *    - Quantum spin visualization
 *    - State correlation
 *    - Measurement effects
 * 
 * 2. Energy Streams
 *    - Connection visualization
 *    - State transfer
 *    - Quantum information flow
 *    - Entanglement strength
 * 
 * 3. State Space
 *    - Bloch sphere representation
 *    - Quantum state vectors
 *    - Superposition effects
 *    - Measurement collapse
 * 
 * Effects:
 * - Custom quantum shaders
 * - Energy stream trails
 * - State transition effects
 * - Correlation visualization
 * 
 * Camera:
 * - Multi-particle tracking
 * - State space navigation
 * - Measurement perspective
 * 
 * Interactions:
 * - State measurement
 * - Entanglement creation
 * - Correlation observation
 * - Quantum operations
 */

import * as THREE from 'three';
import Scene from './baseScene.js';

class QuantumEntanglementScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.time = 0;
        this.timeScale = 1.0;
        this.particlePairs = [];
        this.entanglementStrength = 0.5;
        this.coherence = 1.0;
        this.measured = false;
        this.energyField = null;
        this.quantumField = null;
    }

    init() {
        // Setup post-processing for enhanced visuals
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 2.0;
            this.postProcessing.bokehPass.enabled = true;
            this.postProcessing.bokehPass.uniforms.focus.value = 15.0;
            this.postProcessing.bokehPass.uniforms.aperture.value = 0.02;
            this.postProcessing.bokehPass.uniforms.maxblur.value = 0.02;
        }

        // Create quantum field background
        this.createQuantumField();
        
        // Create energy field
        this.createEnergyField();

        // Create initial particle pairs
        this.createParticlePairs();

        // Setup camera
        this.camera.position.set(0, 40, 60);
        this.camera.lookAt(0, 0, 0);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x111111);
        this.mainScene.add(ambientLight);

        // Add point lights for dramatic lighting
        const colors = [0x0088ff, 0x00ff88, 0xff0088];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 2, 100);
            const angle = (i / colors.length) * Math.PI * 2;
            light.position.set(Math.cos(angle) * 30, 20, Math.sin(angle) * 30);
            this.mainScene.add(light);
        });
    }

    createQuantumField() {
        const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                coherence: { value: this.coherence }
            },
            vertexShader: `
                varying vec2 vUv;
                varying float vElevation;
                uniform float time;
                uniform float coherence;
                
                // Simplex noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Create complex wave patterns
                    float elevation1 = snoise(vec3(pos.x * 0.05, pos.y * 0.05, time * 0.1)) * 2.0;
                    float elevation2 = snoise(vec3(pos.x * 0.1, pos.y * 0.1, time * 0.2 + 100.0));
                    float elevation = mix(elevation1, elevation2, coherence) * 5.0;
                    
                    pos.z += elevation;
                    vElevation = elevation;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying float vElevation;
                uniform float time;
                uniform float coherence;
                
                vec3 hsl2rgb(vec3 c) {
                    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
                    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
                }
                
                void main() {
                    float hue = 0.6 + vElevation * 0.1;
                    float saturation = 0.8;
                    float lightness = 0.3 + coherence * 0.2;
                    
                    vec3 color = hsl2rgb(vec3(hue, saturation, lightness));
                    
                    // Add glow effect
                    float glow = sin(time * 2.0 + vUv.x * 10.0 + vUv.y * 10.0) * 0.5 + 0.5;
                    color += vec3(0.1, 0.2, 0.3) * glow * coherence;
                    
                    gl_FragColor = vec4(color, 0.6);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.quantumField = new THREE.Mesh(geometry, material);
        this.quantumField.rotation.x = -Math.PI / 2;
        this.quantumField.position.y = -20;
        this.mainScene.add(this.quantumField);
    }

    createEnergyField() {
        const geometry = new THREE.SphereGeometry(40, 64, 64);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                strength: { value: this.entanglementStrength }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                varying vec2 vUv;
                uniform float time;
                uniform float strength;
                
                void main() {
                    vec3 color = vec3(0.0, 0.5, 1.0);
                    
                    // Create energy field effect
                    float pattern = sin(vPosition.x * 0.2 + time) * 
                                  cos(vPosition.y * 0.2 + time) * 
                                  sin(vPosition.z * 0.2 + time);
                    
                    float alpha = (0.1 + strength * 0.2) * (0.5 + pattern * 0.5);
                    alpha *= smoothstep(1.0, 0.8, length(vPosition) / 40.0);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        this.energyField = new THREE.Mesh(geometry, material);
        this.mainScene.add(this.energyField);
    }

    createParticlePairs(numPairs = 8) {
        // Clear existing particles
        this.particlePairs.forEach(pair => {
            pair.particles.forEach(p => this.mainScene.remove(p));
            if (pair.connection) this.mainScene.remove(pair.connection);
            if (pair.orbits) pair.orbits.forEach(o => this.mainScene.remove(o));
        });
        this.particlePairs = [];

        // Create particle material with more complex effects
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                coherence: { value: this.coherence },
                measured: { value: false },
                color: { value: new THREE.Color(0x00ff88) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    // Add subtle vertex animation
                    vec3 pos = position;
                    float wave = sin(time * 5.0 + length(pos) * 2.0) * 0.1;
                    pos += normal * wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float coherence;
                uniform bool measured;
                uniform vec3 color;
                varying vec2 vUv;
                varying vec3 vPosition;

                void main() {
                    // Create complex particle effect
                    float d = length(vUv - vec2(0.5));
                    float alpha = smoothstep(0.5, 0.2, d);
                    
                    // Add quantum fluctuation effect
                    float fluctuation = measured ? 1.0 : sin(time * 5.0) * 0.5 + 0.5;
                    vec3 finalColor = color * (0.5 + coherence * 0.5) * (0.8 + fluctuation * 0.2);
                    
                    // Add energy pulse
                    float pulse = sin(time * 3.0 - d * 10.0) * 0.5 + 0.5;
                    finalColor += vec3(0.2, 0.5, 1.0) * pulse * coherence;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        // Create connection material with more dynamic effects
        const connectionMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                strength: { value: this.entanglementStrength },
                measured: { value: false }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float strength;
                uniform bool measured;
                varying vec2 vUv;
                varying vec3 vPosition;

                void main() {
                    // Create dynamic energy stream effect
                    float wave = sin(vUv.x * 20.0 + time * 5.0) * 0.5 + 0.5;
                    float wave2 = cos(vUv.x * 15.0 - time * 3.0) * 0.5 + 0.5;
                    float alpha = measured ? 0.1 : strength * (0.3 + wave * wave2 * 0.3);
                    
                    // Create color gradient
                    vec3 color1 = vec3(0.0, 1.0, 0.5);
                    vec3 color2 = vec3(0.0, 0.5, 1.0);
                    vec3 color = measured ? vec3(0.5) : mix(color1, color2, wave);
                    
                    // Add pulse effect
                    float pulse = sin(time * 2.0 + vUv.x * 10.0) * 0.5 + 0.5;
                    color += vec3(0.2, 0.3, 0.5) * pulse * strength;
                    
                    gl_FragColor = vec4(color, alpha * smoothstep(0.5, 0.0, abs(vUv.y - 0.5)));
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        // Create particle pairs with orbital paths
        for (let i = 0; i < numPairs; i++) {
            const angle = (i / numPairs) * Math.PI * 2;
            const radius = 15;
            const height = (Math.random() - 0.5) * 20;

            // Create particles with more complex geometry
            const geometry = new THREE.IcosahedronGeometry(1, 1);
            const particle1 = new THREE.Mesh(geometry, particleMaterial.clone());
            const particle2 = new THREE.Mesh(geometry, particleMaterial.clone());

            // Position particles
            particle1.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            particle2.position.set(
                -Math.cos(angle) * radius,
                height,
                -Math.sin(angle) * radius
            );

            // Create orbital paths
            const orbits = [];
            for (let j = 0; j < 3; j++) {
                const orbitGeometry = new THREE.TorusGeometry(2 + j * 0.5, 0.05, 16, 100);
                const orbitMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        baseColor: { value: new THREE.Color(0x00ff88) }
                    },
                    vertexShader: `
                        varying vec2 vUv;
                        uniform float time;
                        
                        void main() {
                            vUv = uv;
                            vec3 pos = position;
                            
                            // Add wave motion to orbital rings
                            float wave = sin(time * 2.0 + pos.x * 2.0 + pos.y * 2.0) * 0.1;
                            pos += normal * wave;
                            
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;
                        uniform vec3 baseColor;
                        varying vec2 vUv;
                        
                        void main() {
                            float pulse = sin(time * 3.0 + vUv.x * 10.0) * 0.5 + 0.5;
                            vec3 color = baseColor + vec3(0.2, 0.3, 0.5) * pulse;
                            float alpha = 0.3 + pulse * 0.2;
                            gl_FragColor = vec4(color, alpha);
                        }
                    `,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                
                const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                orbit.scale.set(1, 1, 1);
                orbits.push(orbit);
                particle1.add(orbit);
            }

            // Create connection with dynamic geometry
            const points = [];
            const numPoints = 50;
            for (let j = 0; j < numPoints; j++) {
                const t = j / (numPoints - 1);
                const point = new THREE.Vector3(
                    particle1.position.x * (1 - t) + particle2.position.x * t,
                    particle1.position.y * (1 - t) + particle2.position.y * t,
                    particle1.position.z * (1 - t) + particle2.position.z * t
                );
                points.push(point);
            }
            const connectionGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const connection = new THREE.Line(connectionGeometry, connectionMaterial.clone());

            // Add to scene
            this.mainScene.add(particle1);
            this.mainScene.add(particle2);
            this.mainScene.add(connection);

            // Store references
            this.particlePairs.push({
                particles: [particle1, particle2],
                connection: connection,
                orbits: orbits,
                state: Math.random() > 0.5 ? 1 : -1,
                basePosition: {
                    p1: particle1.position.clone(),
                    p2: particle2.position.clone()
                }
            });
        }
    }

    entangleParticles() {
        this.measured = false;
        this.createParticlePairs();
    }

    measureState() {
        this.measured = true;
        this.particlePairs.forEach(pair => {
            // Collapse quantum state with visual effect
            const state = Math.random() > 0.5 ? 1 : -1;
            pair.state = state;
            
            // Update materials to show measured state
            pair.particles.forEach(p => {
                p.material.uniforms.measured.value = true;
                p.material.uniforms.color.value.setHSL(
                    state > 0 ? 0.3 : 0.0,
                    0.8,
                    0.5
                );
            });
            pair.connection.material.uniforms.measured.value = true;
        });
    }

    setEntanglementStrength(value) {
        this.entanglementStrength = value;
        this.particlePairs.forEach(pair => {
            pair.connection.material.uniforms.strength.value = value;
        });
        if (this.energyField) {
            this.energyField.material.uniforms.strength.value = value;
        }
    }

    setCoherence(value) {
        this.coherence = value;
        this.particlePairs.forEach(pair => {
            pair.particles.forEach(p => {
                p.material.uniforms.coherence.value = value;
            });
        });
        if (this.quantumField) {
            this.quantumField.material.uniforms.coherence.value = value;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        this.time += deltaTime * this.timeScale;

        // Update quantum field
        if (this.quantumField) {
            this.quantumField.material.uniforms.time.value = this.time;
        }

        // Update energy field
        if (this.energyField) {
            this.energyField.material.uniforms.time.value = this.time;
            this.energyField.rotation.y = this.time * 0.1;
        }

        // Update particle pairs with more complex motion
        this.particlePairs.forEach(pair => {
            // Update particle shaders and add orbital motion
            pair.particles.forEach((p, index) => {
                p.material.uniforms.time.value = this.time;
                
                // Add complex orbital motion
                const basePos = index === 0 ? pair.basePosition.p1 : pair.basePosition.p2;
                const orbitSpeed = pair.state * (index === 0 ? 1 : -1);
                const orbitRadius = 2;
                
                p.position.x = basePos.x + Math.cos(this.time * 2 * orbitSpeed) * orbitRadius;
                p.position.y = basePos.y + Math.sin(this.time * 3) * orbitRadius * 0.5;
                p.position.z = basePos.z + Math.sin(this.time * 2 * orbitSpeed) * orbitRadius;
                
                // Rotate particles
                p.rotation.x = this.time * orbitSpeed;
                p.rotation.y = this.time * orbitSpeed * 1.5;
                p.rotation.z = this.time * orbitSpeed * 0.5;
                
                // Update orbital rings
                if (index === 0) {
                    pair.orbits.forEach((orbit, i) => {
                        orbit.rotation.x = this.time * (i + 1) * 0.5;
                        orbit.rotation.y = this.time * (i + 1) * 0.3;
                    });
                }
            });

            // Update connection with dynamic curve
            const points = [];
            const numPoints = 50;
            for (let i = 0; i < numPoints; i++) {
                const t = i / (numPoints - 1);
                const point = new THREE.Vector3();
                
                // Create curved path between particles
                point.x = pair.particles[0].position.x * (1 - t) + pair.particles[1].position.x * t;
                point.y = pair.particles[0].position.y * (1 - t) + pair.particles[1].position.y * t;
                point.z = pair.particles[0].position.z * (1 - t) + pair.particles[1].position.z * t;
                
                // Add wave motion to connection
                const wave = Math.sin(t * Math.PI + this.time * 5) * 2;
                point.y += wave * (1 - Math.abs(t - 0.5) * 2);
                
                points.push(point);
            }
            pair.connection.geometry.setFromPoints(points);
            pair.connection.material.uniforms.time.value = this.time;
        });

        // Camera motion
        const cameraRadius = 60;
        const cameraSpeed = 0.1;
        const cameraHeight = 40 + Math.sin(this.time * 0.5) * 10;
        
        this.camera.position.x = Math.cos(this.time * cameraSpeed) * cameraRadius;
        this.camera.position.z = Math.sin(this.time * cameraSpeed) * cameraRadius;
        this.camera.position.y = cameraHeight;
        this.camera.lookAt(0, 0, 0);
    }

    dispose() {
        if (this.quantumField) {
            this.quantumField.geometry.dispose();
            this.quantumField.material.dispose();
        }
        if (this.energyField) {
            this.energyField.geometry.dispose();
            this.energyField.material.dispose();
        }
        this.particlePairs.forEach(pair => {
            pair.particles.forEach(p => {
                p.geometry.dispose();
                p.material.dispose();
            });
            pair.connection.geometry.dispose();
            pair.connection.material.dispose();
            pair.orbits.forEach(o => {
                o.geometry.dispose();
                o.material.dispose();
            });
        });
    }
}

export default QuantumEntanglementScene;
