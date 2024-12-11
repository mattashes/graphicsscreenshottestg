import * as THREE from 'three';
import BaseScene from './baseScene.js';

class PulsarScene extends BaseScene {
    constructor(mainScene, renderer, camera) {
        super(mainScene, renderer, camera);
        this.pulsar = null;
        this.beams = [];
        this.rotationSpeed = 2.0;
    }

    init() {
        // Create pulsar star
        const pulsarGeometry = new THREE.SphereGeometry(2, 32, 32);
        const pulsarMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.8
        });
        this.pulsar = new THREE.Mesh(pulsarGeometry, pulsarMaterial);
        
        // Create magnetic field lines
        const fieldLines = new THREE.Group();
        const curvePoints = [];
        for (let i = 0; i < 50; i++) {
            const t = i / 49;
            const radius = 5 + 15 * t;
            const angle = 4 * Math.PI * t;
            curvePoints.push(
                new THREE.Vector3(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    10 * (t - 0.5)
                )
            );
        }
        
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const fieldGeometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.3
        });
        const fieldLine = new THREE.Mesh(fieldGeometry, fieldMaterial);
        fieldLines.add(fieldLine);
        
        // Create radiation beams
        const beamGeometry = new THREE.CylinderGeometry(0, 2, 20, 32);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        // Create two opposing beams
        const beam1 = new THREE.Mesh(beamGeometry, beamMaterial);
        beam1.position.y = 10;
        beam1.rotation.x = Math.PI / 2;
        
        const beam2 = new THREE.Mesh(beamGeometry, beamMaterial);
        beam2.position.y = -10;
        beam2.rotation.x = -Math.PI / 2;
        
        this.beams.push(beam1, beam2);
        
        // Create group for all pulsar components
        this.pulsarSystem = new THREE.Group();
        this.pulsarSystem.add(this.pulsar);
        this.pulsarSystem.add(fieldLines);
        this.pulsarSystem.add(beam1);
        this.pulsarSystem.add(beam2);
        
        // Add to main scene
        this.mainScene.add(this.pulsarSystem);
        
        // Set initial rotation
        this.pulsarSystem.rotation.x = Math.PI / 6;
    }

    update(deltaTime) {
        if (this.pulsarSystem) {
            // Rotate the entire pulsar system
            this.pulsarSystem.rotation.y += this.rotationSpeed * deltaTime;
            
            // Pulse the beams
            const pulseScale = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
            this.beams.forEach(beam => {
                beam.scale.x = pulseScale;
                beam.scale.z = pulseScale;
                beam.material.opacity = 0.3 * pulseScale;
            });
            
            // Pulse the pulsar
            const starScale = 1 + 0.1 * Math.sin(Date.now() * 0.005);
            this.pulsar.scale.set(starScale, starScale, starScale);
        }
    }

    activate() {
        super.activate();
        if (this.pulsarSystem) {
            this.pulsarSystem.visible = true;
        }
    }

    deactivate() {
        super.deactivate();
        if (this.pulsarSystem) {
            this.pulsarSystem.visible = false;
        }
    }
}

export default PulsarScene;
