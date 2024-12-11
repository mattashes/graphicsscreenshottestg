import * as THREE from 'three';
import WormholeScene from '../scenes/wormhole.js';
import GalaxyScene from '../scenes/galaxy.js';
import QuantumScene from '../scenes/quantum.js';
import BlackHoleScene from '../scenes/blackHole.js';
import NebulaScene from '../scenes/nebula.js';
import SupernovaScene from '../scenes/supernova.js';
import PulsarScene from '../scenes/pulsar.js';
import QuantumStructureScene from '../scenes/quantumStructure.js';
import QuantumEntanglementScene from '../scenes/quantumEntanglement.js';
import PostProcessingPipeline from '../effects/postProcessing.js';
import { SceneControlPanel, getControlsForScene } from '../ui/controlPanel.js';
import DarkMatterFlowScene from '../scenes/darkMatterFlow.js';
import StellarNurseryScene from '../scenes/stellarNursery.js';

class SceneManager {
    constructor(mainScene, renderer, camera) {
        this.mainScene = mainScene;
        this.renderer = renderer;
        this.camera = camera;
        this.scenes = new Map();
        this.activeScene = null;
        
        // Initialize post-processing
        this.postProcessing = new PostProcessingPipeline(renderer, mainScene, camera);
        
        // Initialize the singleton control panel
        this.controlPanel = new SceneControlPanel();
        
        this.initScenes();
    }

    initScenes() {
        // Initialize all scenes
        const scenes = [
            { id: 'wormhole', Scene: WormholeScene },
            { id: 'galaxy', Scene: GalaxyScene },
            { id: 'quantumfield', Scene: QuantumScene },
            { id: 'nebula', Scene: NebulaScene },
            { id: 'blackhole', Scene: BlackHoleScene },
            { id: 'supernova', Scene: SupernovaScene },
            { id: 'pulsar', Scene: PulsarScene },
            { id: 'quantumstructure', Scene: QuantumStructureScene },
            { id: 'quantumentanglement', Scene: QuantumEntanglementScene },
            { id: 'darkmatterflow', Scene: DarkMatterFlowScene },
            { id: 'stellarnursery', Scene: StellarNurseryScene }
        ];

        scenes.forEach(({ id, Scene }) => {
            const scene = new Scene(this.mainScene, this.renderer, this.camera);
            scene.postProcessing = this.postProcessing;
            scene.sceneId = id;
            this.scenes.set(id, scene);
        });

        // Set default scene
        this.setActiveScene('galaxy');
    }

    setActiveScene(sceneId) {
        // Reset post-processing
        if (this.postProcessing) {
            this.postProcessing.bloomPass.strength = 1.5;
            this.postProcessing.bokehPass.enabled = false;
            this.postProcessing.lensingPass.enabled = false;
        }

        // Deactivate current scene
        if (this.activeScene) {
            this.activeScene.deactivate();
            // Clear main scene
            while(this.mainScene.children.length > 0) { 
                this.mainScene.remove(this.mainScene.children[0]); 
            }
        }

        // Activate new scene
        this.activeScene = this.scenes.get(sceneId);
        if (this.activeScene) {
            // Reset camera position
            this.camera.position.set(0, 0, 30);
            this.camera.lookAt(0, 0, 0);
            
            // Reset scene
            this.mainScene.background = new THREE.Color(0x000000);
            
            // Activate the scene
            if (this.activeScene.activate) {
                this.activeScene.activate();
            } else {
                this.activeScene.init();
            }

            // Update control panel for the new scene
            const config = getControlsForScene(this.activeScene);
            if (config) {
                this.controlPanel.updateForScene(this.activeScene, config);
            }
        }
    }

    update(deltaTime) {
        if (this.activeScene && this.activeScene.update) {
            this.activeScene.update(deltaTime);
        }
        
        // Update post-processing
        if (this.postProcessing) {
            this.postProcessing.composer.render(deltaTime);
        }
    }

    resize(width, height) {
        if (this.activeScene && this.activeScene.resize) {
            this.activeScene.resize(width, height);
        }
        
        // Update post-processing
        if (this.postProcessing) {
            this.postProcessing.onWindowResize(width, height);
        }
    }
}

export default SceneManager;
