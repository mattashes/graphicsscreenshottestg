import * as THREE from 'three';

class ParticleTrail {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.maxPoints = options.maxPoints || 50;
        this.trailWidth = options.width || 2;
        this.trailColor = options.color || 0xffffff;
        this.fadeOut = options.fadeOut !== undefined ? options.fadeOut : true;
        this.points = [];
        
        // Create geometry for the trail
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.maxPoints * 3);
        this.colors = new Float32Array(this.maxPoints * 3);
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        
        // Create material with custom parameters
        this.material = new THREE.LineBasicMaterial({
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: options.opacity || 0.8,
            linewidth: this.trailWidth
        });
        
        // Create the line and add to scene
        this.line = new THREE.Line(this.geometry, this.material);
        this.scene.add(this.line);
        
        // Convert trail color to RGB
        this.colorObj = new THREE.Color(this.trailColor);
    }
    
    addPoint(position) {
        // Add new point to the beginning
        this.points.unshift(position.clone());
        
        // Remove excess points
        if (this.points.length > this.maxPoints) {
            this.points.pop();
        }
        
        // Update geometry
        this.updateGeometry();
    }
    
    updateGeometry() {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;
        
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const i3 = i * 3;
            
            // Update positions
            positions[i3] = point.x;
            positions[i3 + 1] = point.y;
            positions[i3 + 2] = point.z;
            
            // Update colors with fade out
            const alpha = this.fadeOut ? 1 - (i / this.points.length) : 1;
            colors[i3] = this.colorObj.r * alpha;
            colors[i3 + 1] = this.colorObj.g * alpha;
            colors[i3 + 2] = this.colorObj.b * alpha;
        }
        
        // Clear remaining points
        for (let i = this.points.length; i < this.maxPoints; i++) {
            const i3 = i * 3;
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;
            colors[i3] = 0;
            colors[i3 + 1] = 0;
            colors[i3 + 2] = 0;
        }
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }
    
    setColor(color) {
        this.colorObj.set(color);
    }
    
    setWidth(width) {
        this.material.linewidth = width;
    }
    
    setOpacity(opacity) {
        this.material.opacity = opacity;
    }
    
    clear() {
        this.points = [];
        this.updateGeometry();
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.line);
    }
}

class ParticleTrailManager {
    constructor(scene) {
        this.scene = scene;
        this.trails = new Map();
    }
    
    createTrail(id, options = {}) {
        const trail = new ParticleTrail(this.scene, options);
        this.trails.set(id, trail);
        return trail;
    }
    
    getTrail(id) {
        return this.trails.get(id);
    }
    
    updateTrail(id, position) {
        const trail = this.trails.get(id);
        if (trail) {
            trail.addPoint(position);
        }
    }
    
    removeTrail(id) {
        const trail = this.trails.get(id);
        if (trail) {
            trail.dispose();
            this.trails.delete(id);
        }
    }
    
    clear() {
        this.trails.forEach(trail => {
            trail.dispose();
        });
        this.trails.clear();
    }
}

export { ParticleTrail, ParticleTrailManager };
