import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

class PostProcessingPipeline {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = new EffectComposer(renderer);
        
        // Add main render pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);
        
        // Add bloom effect
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(this.bloomPass);
        
        // Add depth of field
        this.bokehPass = new BokehPass(scene, camera, {
            focus: 1000,
            aperture: 0.025,
            maxblur: 0.01
        });
        this.bokehPass.enabled = false;
        this.composer.addPass(this.bokehPass);
        
        // Add custom effects
        this.initializeCustomEffects();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    initializeCustomEffects() {
        // Color correction
        this.colorPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                brightness: { value: 0.3 },
                contrast: { value: 1.2 },
                saturation: { value: 1.3 }
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
                uniform float brightness;
                uniform float contrast;
                uniform float saturation;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Brightness
                    color.rgb += brightness;
                    
                    // Contrast
                    color.rgb = (color.rgb - 0.5) * contrast + 0.5;
                    
                    // Saturation
                    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    color.rgb = mix(vec3(luminance), color.rgb, saturation);
                    
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(this.colorPass);

        // Gravitational lensing effect
        this.lensingPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                blackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
                blackHoleRadius: { value: 0.15 },
                distortionStrength: { value: 0.1 }
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
                uniform vec2 blackHolePosition;
                uniform float blackHoleRadius;
                uniform float distortionStrength;
                varying vec2 vUv;
                
                void main() {
                    vec2 center = blackHolePosition;
                    vec2 pos = vUv - center;
                    float dist = length(pos);
                    
                    // Calculate distortion
                    float strength = 1.0 - smoothstep(0.0, blackHoleRadius, dist);
                    vec2 offset = normalize(pos) * strength * distortionStrength;
                    
                    // Sample with distortion
                    vec4 color = texture2D(tDiffuse, vUv - offset);
                    
                    // Darken near center
                    float darkness = 1.0 - strength * 2.0;
                    color.rgb *= darkness;
                    
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(this.lensingPass);
    }
    
    onWindowResize(width, height) {
        this.composer.setSize(width || window.innerWidth, height || window.innerHeight);
        
        // Update bloom pass resolution
        if (this.bloomPass) {
            this.bloomPass.resolution.set(width || window.innerWidth, height || window.innerHeight);
        }
    }
    
    setBloomStrength(strength) {
        if (this.bloomPass) {
            this.bloomPass.strength = strength;
        }
    }
    
    enableGravitationalLensing(enabled) {
        if (this.lensingPass) {
            this.lensingPass.enabled = enabled;
        }
    }
    
    setLensingParams(position, radius, strength) {
        if (this.lensingPass) {
            this.lensingPass.uniforms.blackHolePosition.value = position;
            this.lensingPass.uniforms.blackHoleRadius.value = radius;
            this.lensingPass.uniforms.distortionStrength.value = strength;
        }
    }
    
    render() {
        this.composer.render();
    }
}

export default PostProcessingPipeline;
