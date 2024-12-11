/**
 * Particle Emitter System
 * Handles:
 * - Particle generation
 * - Emission patterns
 * - Particle system management
 */

import * as THREE from 'three';
import Particle from './particle.js';

class ParticleEmitter {
    constructor(scene, maxParticles = 1000) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.particles = [];
        this.updateFunction = null;
        this.particleProperties = {
            size: { min: 0.1, max: 0.1 },
            color: new THREE.Color(0xffffff),
            speed: { min: 1, max: 1 },
            lifetime: { min: 1, max: 1 }
        };
        
        // Create geometry for all possible particles
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);
        
        // Set up attributes
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        
        // Create material
        this.material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        
        // Create points system
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        // Initialize particles
        this.initializeParticles();
    }

    setParticleProperties(properties) {
        this.particleProperties = { ...this.particleProperties, ...properties };
        if (properties.size) {
            this.material.size = properties.size.max;
        }
    }

    setUpdateFunction(fn) {
        this.updateFunction = fn;
    }

    initializeParticles() {
        // Create initial set of particles
        for (let i = 0; i < this.maxParticles; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
            
            const velocity = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            );

            const particle = new Particle(position, velocity);
            particle.color = this.particleProperties.color.clone();
            particle.size = this.particleProperties.size.min + 
                Math.random() * (this.particleProperties.size.max - this.particleProperties.size.min);
            
            this.particles.push(particle);
        }
        this.updateGeometry();
    }

    updateGeometry() {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;
            
            // Update positions
            this.positions[i3] = particle.position.x;
            this.positions[i3 + 1] = particle.position.y;
            this.positions[i3 + 2] = particle.position.z;
            
            // Update colors
            this.colors[i3] = particle.color.r;
            this.colors[i3 + 1] = particle.color.g;
            this.colors[i3 + 2] = particle.color.b;
        }
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    update(deltaTime) {
        if (!this.updateFunction) return;
        
        for (const particle of this.particles) {
            this.updateFunction(particle, deltaTime);
        }
        
        this.updateGeometry();
    }

    dispose() {
        if (this.points && this.points.parent) {
            this.points.parent.remove(this.points);
        }
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        this.particles = [];
        this.points = null;
    }
}

export default ParticleEmitter;
