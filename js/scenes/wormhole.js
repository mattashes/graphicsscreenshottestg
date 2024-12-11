/**
 * Wormhole Scene
 * Creates:
 * - Spiral particle flow
 * - Space-time distortion
 * - Tunnel effect
 */

import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import Scene from './baseScene.js';
import { SceneControlPanel, getControlsForScene } from '../ui/controlPanel.js';

class WormholeScene extends Scene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.time = 0;
        this.particles = null;
        this.spaceTimePass = null;
        this.tunnelMesh = null;
        this.controls = new SceneControlPanel();
    }

    init() {
        // Create tunnel and particle systems
        this.createTunnel();
        this.createParticleSystem();
        
        // Setup camera
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, -100);
        this.camera.fov = 90;
        this.camera.updateProjectionMatrix();

        // Setup post-processing
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 3.0;
            this.postProcessing.bokehPass.enabled = true;
            this.postProcessing.bokehPass.uniforms.focus.value = 5.0;
            this.postProcessing.bokehPass.uniforms.aperture.value = 0.025;
            this.postProcessing.bokehPass.uniforms.maxblur.value = 0.01;
        }

        // Add space-time distortion shader
        this.initSpaceTimeShader();

        // Initialize UI controls
        const config = getControlsForScene(this);
        if (config) {
            this.controls.updateForScene(this, config);
        }
    }

    createTunnel() {
        const geometry = new THREE.CylinderGeometry(20, 2, 2000, 32, 100, true);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                colorSpeed: { value: 0.8 },
                noiseScale: { value: 3.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying float vDepth;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    
                    // Add vertex displacement for tunnel warping
                    vec3 pos = position;
                    float angle = atan(pos.x, pos.y);
                    float dist = length(pos.xy);
                    float z = pos.z;
                    
                    // Create spiral warping effect
                    float warpFactor = sin(z * 0.02 + time * 2.0) * 2.0;
                    pos.x += sin(angle + time * 0.5) * warpFactor;
                    pos.y += cos(angle + time * 0.5) * warpFactor;
                    
                    // Add progressive narrowing effect
                    float narrowing = 1.0 - (z + 1000.0) / 2000.0;
                    pos.xy *= mix(1.0, 0.3, narrowing);
                    
                    vPosition = pos;
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    vDepth = -mvPosition.z / 1000.0;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float colorSpeed;
                uniform float noiseScale;
                varying vec2 vUv;
                varying vec3 vPosition;
                varying float vDepth;

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
                    float noise = snoise(vec3(vUv * noiseScale + time * 0.2, time * 0.1));
                    float pattern = abs(noise);
                    
                    // More dramatic color palette
                    vec3 color1 = vec3(0.1, 0.0, 0.3); // Deep purple
                    vec3 color2 = vec3(0.0, 0.1, 0.4); // Deep blue
                    vec3 color3 = vec3(0.5, 0.0, 0.5); // Bright purple
                    
                    // Create light streaks effect
                    float streak = pow(abs(sin(vPosition.z * 0.01 + time * 2.0)), 20.0);
                    float radialStreak = pow(abs(sin(atan(vPosition.x, vPosition.y) * 8.0 + time)), 5.0);
                    
                    // Mix colors based on depth and effects
                    vec3 baseColor = mix(color1, color2, pattern);
                    baseColor = mix(baseColor, color3, streak * 0.5);
                    baseColor += vec3(1.0, 0.8, 1.0) * radialStreak * 0.5;
                    
                    // Enhanced depth-based intensity
                    float depthFade = pow(1.0 - vDepth, 3.0);
                    float edgeGlow = 1.0 - abs(vUv.y - 0.5) * 2.0;
                    edgeGlow = pow(edgeGlow, 2.0);
                    
                    // Add energy pulse effect
                    float pulse = 0.8 + 0.4 * sin(vPosition.z * 0.02 + time * 3.0);
                    
                    vec3 finalColor = baseColor * (0.5 + depthFade);
                    finalColor *= pulse;
                    finalColor += vec3(0.2, 0.3, 0.5) * edgeGlow * depthFade;
                    
                    gl_FragColor = vec4(finalColor, 0.8 * depthFade * edgeGlow);
                }
            `,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.tunnelMesh = new THREE.Mesh(geometry, material);
        this.tunnelMesh.rotation.x = Math.PI / 2;
        this.tunnelMesh.position.z = -1000;
        this.mainScene.add(this.tunnelMesh);
    }

    createParticleSystem() {
        const particleCount = 15000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount);

        const geometry = new THREE.BufferGeometry();

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Create a more focused particle stream
            const t = Math.random();
            const radius = Math.pow(t, 2.0) * 20; // Exponential distribution for better depth
            const angle = Math.random() * Math.PI * 2;
            const z = -2000 + t * 2000;
            
            // Spiral distribution
            const spiralFactor = z * 0.01;
            positions[i3] = Math.cos(angle + spiralFactor) * radius;
            positions[i3 + 1] = Math.sin(angle + spiralFactor) * radius;
            positions[i3 + 2] = z;
            
            // Brighter particles near the center
            const distFromCenter = radius / 20;
            const brightness = 0.5 + (1.0 - distFromCenter) * 0.5;
            colors[i3] = brightness * 0.9;
            colors[i3 + 1] = brightness * 0.7;
            colors[i3 + 2] = brightness;
            
            // Varied particle sizes based on position
            sizes[i] = 0.5 + (1.0 - distFromCenter) * 2.0;
            speeds[i] = 1.0 + (1.0 - distFromCenter) * 2.0; // Faster particles near center
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute float speed;
                varying vec3 vColor;
                varying float vDepth;
                uniform float time;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    float speedFactor = speed * 600.0; // Increased speed
                    pos.z = mod(pos.z + time * speedFactor + 2000.0, 2000.0) - 2000.0;
                    
                    // Enhanced spiral motion
                    float depthFactor = (pos.z + 2000.0) / 2000.0;
                    float angle = time * (0.5 + speed * 0.5) + depthFactor * 2.0;
                    float radius = length(pos.xy);
                    float spiral = radius * (1.0 - depthFactor * 0.3); // Particles converge as they approach
                    pos.x = cos(angle) * spiral;
                    pos.y = sin(angle) * spiral;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    vDepth = -mvPosition.z;
                    
                    // Enhanced size attenuation
                    gl_PointSize = size * (3000.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vDepth;
                
                void main() {
                    float depth = vDepth / 2000.0;
                    vec4 color = vec4(vColor * (0.5 + depth * 0.5), 1.0) * texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = color;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.mainScene.add(this.particles);
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    initSpaceTimeShader() {
        this.spaceTimePass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                distortion: { value: 0.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float distortion;
                varying vec2 vUv;
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 uv = vUv;
                    
                    // Calculate distance from center
                    float dist = length(uv - center);
                    
                    // Create spiral distortion
                    float angle = atan(uv.y - center.y, uv.x - center.x);
                    float spiral = angle + time * 0.5 + dist * 4.0;
                    
                    // Apply psychedelic distortion
                    uv.x += cos(spiral) * dist * distortion * (0.5 + 0.5 * sin(time * 2.0));
                    uv.y += sin(spiral) * dist * distortion * (0.5 + 0.5 * cos(time * 2.0));
                    
                    // Sample with distorted coordinates
                    vec4 color = texture2D(tDiffuse, uv);
                    
                    // Add chromatic aberration
                    float aberration = dist * 0.05;
                    color.r = texture2D(tDiffuse, uv + vec2(aberration, 0.0)).r;
                    color.b = texture2D(tDiffuse, uv - vec2(aberration, 0.0)).b;
                    
                    // Add color cycling
                    color.rgb *= vec3(1.0 + 0.2 * sin(time + uv.x * 10.0),
                                    1.0 + 0.2 * sin(time * 1.2 + uv.y * 10.0),
                                    1.0 + 0.2 * sin(time * 0.8 + dist * 10.0));
                    
                    gl_FragColor = color;
                }
            `
        });

        if (this.postProcessing && this.postProcessing.composer) {
            this.postProcessing.composer.addPass(this.spaceTimePass);
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        this.time += deltaTime;

        // More dramatic camera motion
        const cameraSpeed = 0.2;
        const bobAmount = 0.5;
        const bobSpeed = 1.5;
        
        // Enhanced camera movement
        this.camera.position.x = Math.sin(this.time * bobSpeed) * bobAmount;
        this.camera.position.y = Math.cos(this.time * bobSpeed * 0.7) * bobAmount;
        this.camera.position.z = 5 + Math.sin(this.time * 0.3) * 3;
        
        // More dynamic look target
        const lookTarget = new THREE.Vector3(
            Math.sin(this.time * 0.2) * 3,
            Math.sin(this.time * 0.3) * 3,
            -100 - Math.sin(this.time * 0.5) * 20
        );
        this.camera.lookAt(lookTarget);

        // Faster tunnel movement
        if (this.tunnelMesh) {
            this.tunnelMesh.material.uniforms.time.value = this.time;
            this.tunnelMesh.position.z = -1000 + (this.time * 100) % 500;
        }

        // Update materials
        if (this.particles) {
            this.particles.material.uniforms.time.value = this.time;
        }

        // Update space-time distortion with more subtle effect
        if (this.spaceTimePass) {
            this.spaceTimePass.uniforms.time.value = this.time;
            this.spaceTimePass.uniforms.distortion.value = 0.2 + Math.sin(this.time * 0.5) * 0.1;
        }
    }

    deactivate() {
        if (this.spaceTimePass && this.postProcessing && this.postProcessing.composer) {
            this.postProcessing.composer.removePass(this.spaceTimePass);
        }

        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.mainScene.remove(this.particles);
            this.particles = null;
        }

        if (this.tunnelMesh) {
            this.tunnelMesh.geometry.dispose();
            this.tunnelMesh.material.dispose();
            this.mainScene.remove(this.tunnelMesh);
            this.tunnelMesh = null;
        }

        super.deactivate();
    }
}

export default WormholeScene;
