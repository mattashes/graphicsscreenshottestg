let activePanel = null;

export class SceneControlPanel {
    constructor() {
        if (activePanel) {
            return activePanel;
        }
        this.panelElement = null;
        this.visible = true;
        activePanel = this;
    }

    updateForScene(scene, config) {
        if (!this.panelElement) {
            // First time initialization
            const result = this.createControlPanel(config);
            this.panelElement = result.element;
            this.dispose = result.dispose;
        } else {
            // Update existing panel
            this.updateControls(config);
        }
    }

    updateControls(config) {
        if (!this.panelElement) return;

        // Update title
        const titleElement = this.panelElement.querySelector('.control-panel-title');
        titleElement.textContent = config.title;

        // Clear existing controls
        const controlsContainer = this.panelElement.querySelector('.control-panel-controls');
        controlsContainer.innerHTML = '';

        // Add new controls
        const controls = [
            ...config.controls,
            {
                type: 'button',
                label: this.visible ? 'Hide Controls' : 'Show Controls',
                onClick: () => this.toggleVisibility()
            }
        ];

        controls.forEach(control => {
            const controlWrapper = document.createElement('div');
            controlWrapper.className = 'control-wrapper';

            const label = document.createElement('label');
            label.textContent = control.label;
            controlWrapper.appendChild(label);

            let input;
            switch (control.type) {
                case 'button':
                    input = document.createElement('button');
                    input.textContent = control.label;
                    input.addEventListener('click', control.onClick);
                    break;

                case 'slider':
                    input = document.createElement('input');
                    input.type = 'range';
                    input.min = control.min;
                    input.max = control.max;
                    input.step = control.step;
                    input.value = control.value;
                    
                    const valueDisplay = document.createElement('span');
                    valueDisplay.className = 'slider-value';
                    valueDisplay.textContent = control.value;
                    
                    input.addEventListener('input', (e) => {
                        const value = parseFloat(e.target.value);
                        valueDisplay.textContent = value.toFixed(1);
                        control.onChange(value);
                    });
                    
                    controlWrapper.appendChild(valueDisplay);
                    break;

                case 'checkbox':
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = control.value;
                    input.addEventListener('change', (e) => control.onChange(e.target.checked));
                    break;
            }

            input.className = `control-${control.type}`;
            controlWrapper.appendChild(input);
            controlsContainer.appendChild(controlWrapper);
        });
    }

    createControlPanel(config) {
        const panel = document.createElement('div');
        panel.className = 'control-panel';
        if (config.position) panel.classList.add(`position-${config.position}`);

        // Create title
        const titleElement = document.createElement('div');
        titleElement.className = 'control-panel-title';
        titleElement.textContent = config.title;
        panel.appendChild(titleElement);

        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'control-panel-controls';
        panel.appendChild(controlsContainer);

        document.body.appendChild(panel);

        // Add initial controls
        this.updateControls(config);

        // Add styles if they don't exist
        if (!document.getElementById('control-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'control-panel-styles';
            style.textContent = `
                .control-panel {
                    position: fixed;
                    background: rgba(15, 15, 20, 0.7);
                    border-radius: 16px;
                    padding: 16px;
                    color: white;
                    font-family: system-ui, -apple-system, sans-serif;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(10px);
                    z-index: 1000;
                    min-width: 180px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .control-panel.position-top-right {
                    top: 20px;
                    right: 20px;
                    transform: translateX(0);
                }

                .control-panel.position-top-right.collapsed {
                    transform: translateX(calc(100% - 40px));
                }

                .control-panel-title {
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 16px;
                    color: #b76fff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .control-panel-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    opacity: 1;
                    transition: opacity 0.3s ease;
                }

                .control-panel.collapsed .control-panel-controls {
                    opacity: 0;
                    pointer-events: none;
                }

                .control-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .control-wrapper label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .control-button {
                    background: rgba(183, 111, 255, 0.2);
                    border: 1px solid rgba(183, 111, 255, 0.3);
                    border-radius: 8px;
                    color: #b76fff;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(5px);
                }

                .control-button:hover {
                    background: rgba(183, 111, 255, 0.3);
                    border-color: rgba(183, 111, 255, 0.5);
                }

                .control-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    outline: none;
                }

                .control-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #b76fff;
                    cursor: pointer;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.2s ease;
                    box-shadow: 0 0 10px rgba(183, 111, 255, 0.3);
                }

                .control-slider::-webkit-slider-thumb:hover {
                    background: #9f4ff0;
                    transform: scale(1.1);
                }

                .slider-value {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.9);
                    font-variant-numeric: tabular-nums;
                    min-width: 32px;
                    text-align: right;
                }

                .control-checkbox {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 2px solid rgba(183, 111, 255, 0.5);
                    -webkit-appearance: none;
                    outline: none;
                    cursor: pointer;
                    position: relative;
                    background: rgba(183, 111, 255, 0.1);
                    transition: all 0.2s ease;
                }

                .control-checkbox:checked {
                    background: rgba(183, 111, 255, 0.3);
                    border-color: rgba(183, 111, 255, 0.8);
                }

                .control-checkbox:checked::before {
                    content: '✓';
                    position: absolute;
                    color: #b76fff;
                    font-size: 12px;
                    left: 2px;
                    top: -1px;
                }

                .toggle-controls {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .toggle-controls:hover {
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.1);
                }

                .toggle-controls svg {
                    width: 16px;
                    height: 16px;
                    transition: transform 0.3s ease;
                }

                .control-panel.collapsed .toggle-controls svg {
                    transform: rotate(180deg);
                }
            `;
            document.head.appendChild(style);
        }

        return {
            element: panel,
            dispose: () => {
                panel.remove();
            }
        };
    }

    toggleVisibility() {
        this.visible = !this.visible;
        if (this.panelElement) {
            if (this.visible) {
                this.panelElement.style.transform = 'translateX(0)';
                this.panelElement.querySelector('button:last-child').textContent = 'Hide Controls';
            } else {
                this.panelElement.style.transform = 'translateX(calc(100% - 40px))';
                this.panelElement.querySelector('button:last-child').textContent = 'Show Controls';
            }
        }
    }

    dispose() {
        if (this.panelElement) {
            this.panelElement.remove();
            this.panelElement = null;
        }
        activePanel = null;
    }
}

// Helper function to get control configurations for different scenes
export function getControlsForScene(scene) {
    // Use scene ID instead of constructor name for identification
    switch (scene.sceneId) {
        case 'quantumstructure':
            return {
                title: 'Quantum Structure Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'button',
                        label: 'Excite State',
                        onClick: () => scene.exciteState()
                    },
                    {
                        type: 'button',
                        label: 'Relax State',
                        onClick: () => scene.relaxState()
                    },
                    {
                        type: 'slider',
                        label: 'Time Scale',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.timeScale,
                        onChange: (value) => {
                            scene.timeScale = value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Probability Amplitude',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.probabilityAmplitude,
                        onChange: (value) => {
                            scene.probabilityAmplitude = value;
                        }
                    }
                ]
            };

        case 'quantumfield':
            return {
                title: 'Quantum Field Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Wave Frequency',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: 0.5,
                        onChange: (value) => {
                            if (scene.emitters[0]) {
                                scene.emitters[0].updateFunction = createQuantumUpdateFunction(scene, value);
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Particle Speed',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            scene.time *= value;
                        }
                    }
                ]
            };

        case 'wormhole':
            return {
                title: 'Wormhole Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Travel Speed',
                        min: 0.5,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            if (scene.tunnelMesh) {
                                scene.tunnelMesh.material.uniforms.time.value *= value;
                            }
                            if (scene.particles) {
                                scene.particles.material.uniforms.time.value *= value;
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Distortion',
                        min: 0.1,
                        max: 1.0,
                        step: 0.1,
                        value: 0.5,
                        onChange: (value) => {
                            if (scene.spaceTimePass) {
                                scene.spaceTimePass.uniforms.distortion.value = value;
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Glow Intensity',
                        min: 0.5,
                        max: 5.0,
                        step: 0.1,
                        value: 3.0,
                        onChange: (value) => {
                            if (scene.postProcessing) {
                                scene.postProcessing.bloomPass.strength = value;
                            }
                        }
                    }
                ]
            };

        case 'blackhole':
            return {
                title: 'Black Hole Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Time Scale',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.timeScale,
                        onChange: (value) => {
                            scene.timeScale = value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Gravitational Pull',
                        min: 1.0,
                        max: 10.0,
                        step: 0.5,
                        value: scene.blackHoleRadius,
                        onChange: (value) => {
                            scene.blackHoleRadius = value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Accretion Disk Size',
                        min: 10,
                        max: 30,
                        step: 1,
                        value: scene.accretionDiskRadius,
                        onChange: (value) => {
                            scene.accretionDiskRadius = value;
                        }
                    }
                ]
            };

        case 'pulsar':
            return {
                title: 'Pulsar Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Rotation Speed',
                        min: 0.5,
                        max: 5.0,
                        step: 0.1,
                        value: scene.rotationSpeed,
                        onChange: (value) => {
                            scene.rotationSpeed = value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Beam Intensity',
                        min: 0.1,
                        max: 1.0,
                        step: 0.1,
                        value: 0.3,
                        onChange: (value) => {
                            scene.beams.forEach(beam => {
                                beam.material.opacity = value;
                            });
                        }
                    }
                ]
            };

        case 'supernova':
            return {
                title: 'Supernova Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'button',
                        label: 'Trigger Explosion',
                        onClick: () => {
                            scene.explosionTime = 0;
                            if (scene.particleSystem) {
                                scene.particleSystem.visible = true;
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Explosion Speed',
                        min: 0.5,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            scene.explosionSpeed = value;
                        }
                    }
                ]
            };

        case 'galaxy':
            return {
                title: 'Galaxy Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Rotation Speed',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            scene.time *= value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Star Density',
                        min: 0.5,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            if (scene.emitters[0]) {
                                scene.emitters[0].setParticleCount(Math.floor(75000 * value));
                            }
                        }
                    }
                ]
            };

        case 'nebula':
            return {
                title: 'Nebula Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Color Shift',
                        min: 0,
                        max: 1,
                        step: 0.1,
                        value: 0.5,
                        onChange: (value) => {
                            if (scene.particleSystem) {
                                scene.particleSystem.material.uniforms.colorShift.value = value;
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Turbulence',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            if (scene.particleSystem) {
                                scene.particleSystem.material.uniforms.turbulence.value = value;
                            }
                        }
                    }
                ]
            };

        case 'quantumentanglement':
            return {
                title: 'Quantum Entanglement Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'button',
                        label: 'Entangle Particles',
                        onClick: () => {
                            if (scene.entangleParticles) {
                                scene.entangleParticles();
                            }
                        }
                    },
                    {
                        type: 'button',
                        label: 'Measure State',
                        onClick: () => {
                            if (scene.measureState) {
                                scene.measureState();
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Entanglement Strength',
                        min: 0.1,
                        max: 1.0,
                        step: 0.1,
                        value: 0.5,
                        onChange: (value) => {
                            if (scene.setEntanglementStrength) {
                                scene.setEntanglementStrength(value);
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Quantum Coherence',
                        min: 0.1,
                        max: 1.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            if (scene.setCoherence) {
                                scene.setCoherence(value);
                            }
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Visualization Speed',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: 1.0,
                        onChange: (value) => {
                            if (scene.timeScale !== undefined) {
                                scene.timeScale = value;
                            }
                        }
                    }
                ]
            };

        case 'darkmatterflow':
            return {
                title: 'Dark Matter Flow Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Time Scale',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.timeScale,
                        onChange: (value) => {
                            scene.timeScale = value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Flow Intensity',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.flowIntensity,
                        onChange: (value) => {
                            scene.setFlowIntensity(value);
                        }
                    }
                ]
            };

        case 'stellarnursery':
            return {
                title: 'Stellar Nursery Controls',
                position: 'top-right',
                controls: [
                    {
                        type: 'slider',
                        label: 'Time Scale',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.timeScale,
                        onChange: (value) => {
                            scene.timeScale = value;
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Cloud Density',
                        min: 0.5,
                        max: 2.0,
                        step: 0.1,
                        value: scene.cloudDensity,
                        onChange: (value) => {
                            scene.setCloudDensity(value);
                        }
                    },
                    {
                        type: 'slider',
                        label: 'Star Formation Rate',
                        min: 0.1,
                        max: 2.0,
                        step: 0.1,
                        value: scene.starFormationRate,
                        onChange: (value) => {
                            scene.setStarFormationRate(value);
                        }
                    }
                ]
            };

        default:
            return null;
    }
}

// Helper function to create quantum field update function
function createQuantumUpdateFunction(scene, frequency) {
    return (particle, deltaTime) => {
        const amplitude = 20;
        const wavelength = 0.1;
        
        // Calculate wave motion
        const waveX = Math.sin(particle.position.z * wavelength + scene.time * frequency) * amplitude;
        const waveY = Math.cos(particle.position.x * wavelength + scene.time * frequency) * amplitude;
        
        // Apply quantum tunneling effect
        if (Math.random() < 0.001) {
            particle.position.x = -particle.position.x;
            particle.position.y = -particle.position.y;
        }
        
        // Update position with wave motion
        particle.position.x += (waveX - particle.position.x) * deltaTime;
        particle.position.y += (waveY - particle.position.y) * deltaTime;
        
        // Color based on position and time
        const phase = Math.sin(scene.time * 2 + particle.position.length() * 0.1);
        particle.color.setHSL(0.6 + phase * 0.1, 0.8, 0.5);
    };
} 