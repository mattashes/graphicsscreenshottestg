import { getControlsForScene } from '../ui/controlPanel.js';

class Scene {
    constructor(mainScene, renderer, camera) {
        this.mainScene = mainScene;
        this.renderer = renderer;
        this.camera = camera;
        this.emitters = [];
        this.active = false;
        this.postProcessing = null; // Will be set by SceneManager
    }

    init() {
        // Controls will be managed by SceneManager
    }

    update(deltaTime) {
        if (!this.active) return;
        // Update all emitters
        this.emitters.forEach(emitter => emitter.update(deltaTime));
    }

    resize(width, height) {
        // Handle resize events
    }

    activate() {
        this.active = true;
        // Reset post-processing settings
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 1.5;
            this.postProcessing.bokehPass.enabled = false;
            this.postProcessing.lensingPass.enabled = false;
        }
        this.init(); // Reinitialize when activated
    }

    deactivate() {
        this.active = false;
        // Clean up emitters
        this.emitters.forEach(emitter => {
            if (emitter.points && emitter.points.parent) {
                emitter.points.parent.remove(emitter.points);
            }
        });
        this.emitters = [];
    }
}

export default Scene;
