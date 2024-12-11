import * as THREE from 'three';

class ParticleEffect {
    constructor(scene) {
        this.scene = scene;
        this.trails = [];
        this.maxTrailLength = 50;
    }
    
    createTrail(position, color) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
            color: color,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.6
        });
        
        const points = new Float32Array(this.maxTrailLength * 3);
        const colors = new Float32Array(this.maxTrailLength * 3);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        
        return {
            line: line,
            points: [],
            maxLength: this.maxTrailLength
        };
    }
    
    updateTrail(trail, newPosition) {
        trail.points.unshift(newPosition.clone());
        if (trail.points.length > trail.maxLength) {
            trail.points.pop();
        }
        
        const positions = trail.line.geometry.attributes.position;
        const colors = trail.line.geometry.attributes.color;
        
        for (let i = 0; i < trail.points.length; i++) {
            const point = trail.points[i];
            positions.array[i * 3] = point.x;
            positions.array[i * 3 + 1] = point.y;
            positions.array[i * 3 + 2] = point.z;
            
            // Fade out the trail
            const alpha = 1 - (i / trail.maxLength);
            colors.array[i * 3] = alpha;
            colors.array[i * 3 + 1] = alpha;
            colors.array[i * 3 + 2] = alpha;
        }
        
        positions.needsUpdate = true;
        colors.needsUpdate = true;
    }
    
    createEnergyBeam(start, end, color) {
        const points = [];
        const segments = 20;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pos = new THREE.Vector3().lerpVectors(start, end, t);
            
            // Add some noise to make it look more energetic
            if (i > 0 && i < segments) {
                pos.x += (Math.random() - 0.5) * 2;
                pos.y += (Math.random() - 0.5) * 2;
                pos.z += (Math.random() - 0.5) * 2;
            }
            
            points.push(pos);
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, segments, 0.1, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    createQuantumNode(position, size, color) {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8,
            envMapIntensity: 1
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        
        // Add glow
        const glowGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(color) }
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
        
        return sphere;
    }
}

export default ParticleEffect;
