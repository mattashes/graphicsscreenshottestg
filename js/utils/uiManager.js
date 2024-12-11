class UIManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.createUI();
    }

    createUI() {
        // Create main UI container
        const ui = document.createElement('div');
        ui.className = 'ui-container';
        
        // Create scene selector
        const sceneSelector = document.createElement('div');
        sceneSelector.className = 'scene-selector';
        
        // Add scene buttons
        const scenes = [
            { id: 'wormhole', name: 'Wormhole', icon: '🌀' },
            { id: 'galaxy', name: 'Galaxy', icon: '🌌' },
            { id: 'quantum', name: 'Quantum', icon: '⚛️' }
        ];

        scenes.forEach(scene => {
            const button = document.createElement('button');
            button.className = 'scene-button';
            button.innerHTML = `
                <span class="scene-icon">${scene.icon}</span>
                <span class="scene-name">${scene.name}</span>
            `;
            button.addEventListener('click', () => {
                this.sceneManager.setActiveScene(scene.id);
                // Update active button state
                document.querySelectorAll('.scene-button').forEach(btn => 
                    btn.classList.remove('active'));
                button.classList.add('active');
            });
            sceneSelector.appendChild(button);
        });

        ui.appendChild(sceneSelector);
        document.body.appendChild(ui);
    }
}

export default UIManager;
