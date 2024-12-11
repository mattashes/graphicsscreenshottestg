/**
 * Core Three.js Setup
 * Responsible for:
 * - Scene initialization
 * - Basic Three.js setup
 * - Environment configuration
 */

import * as THREE from 'three';
import SceneManager from '../utils/sceneManager.js';
import UIManager from '../utils/uiManager.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance",
    alpha: true
});

// Set up renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Set initial camera position
camera.position.z = 50;

// Initialize managers
const sceneManager = new SceneManager(scene, renderer, camera);
const uiManager = new UIManager(sceneManager);

// Initialize scene selector
import { SceneSelector } from '../ui/sceneSelector.js';
const selectorContainer = document.getElementById('scene-selector-container');
const sceneSelector = new SceneSelector(selectorContainer, sceneManager);

// Animation variables
const clock = new THREE.Clock();

// Create effect composer
const renderPass = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    sceneManager.update(deltaTime);
    composer.render(deltaTime);
}

// Start animation
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneManager.resize(window.innerWidth, window.innerHeight);
});
