export class SceneSelector {
    constructor(container, sceneManager) {
        this.container = container;
        this.sceneManager = sceneManager;
        this.currentIndex = 0;
        this.isScrolling = false;
        this.scenes = [
            { id: 'galaxy', name: 'Galaxy' },
            { id: 'wormhole', name: 'Wormhole' },
            { id: 'quantumfield', name: 'Quantum Field' },
            { id: 'nebula', name: 'Nebula' },
            { id: 'blackhole', name: 'Black Hole' },
            { id: 'supernova', name: 'Supernova' },
            { id: 'pulsar', name: 'Pulsar' },
            { id: 'quantumstructure', name: 'Quantum Structure' },
            { id: 'quantumentanglement', name: 'Quantum Entanglement' },
            { id: 'darkmatterflow', name: 'Dark Matter Flow' },
            { id: 'stellarnursery', name: 'Stellar Nursery' }
        ];

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'scene-selector';

        const listContainer = document.createElement('div');
        listContainer.className = 'scene-list';

        this.scenes.forEach((scene, index) => {
            const button = document.createElement('button');
            button.className = 'scene-button';
            button.textContent = scene.name;
            button.setAttribute('data-scene', scene.id);
            
            if (index === this.currentIndex) {
                button.classList.add('active');
            }

            button.addEventListener('click', (e) => {
                if (!this.isScrolling) {
                    this.setScene(index);
                }
                e.preventDefault();
            });

            listContainer.appendChild(button);
        });

        selectorDiv.appendChild(listContainer);
        this.container.appendChild(selectorDiv);

        let startX;
        let scrollLeft;
        let isDragging = false;
        let lastX;
        let velocity = 0;
        let animationFrame;

        const startDragging = (e) => {
            isDragging = true;
            this.isScrolling = true;
            listContainer.classList.add('active');
            startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
            lastX = startX;
            scrollLeft = listContainer.scrollLeft;
            
            // Cancel any ongoing animation
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };

        const stopDragging = (e) => {
            if (!isDragging) return;
            isDragging = false;
            listContainer.classList.remove('active');

            // Apply momentum scrolling
            const momentumScroll = () => {
                if (Math.abs(velocity) > 0.1) {
                    listContainer.scrollLeft += velocity * 10;
                    velocity *= 0.95; // Decay factor
                    animationFrame = requestAnimationFrame(momentumScroll);
                } else {
                    this.isScrolling = false;
                    this.updateActiveScene();
                }
            };

            momentumScroll();
        };

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
            const dx = x - lastX;
            lastX = x;
            
            // Update velocity
            velocity = dx * 0.5;
            
            // Update scroll position
            listContainer.scrollLeft = listContainer.scrollLeft - dx;
        };

        // Mouse events
        listContainer.addEventListener('mousedown', startDragging);
        window.addEventListener('mousemove', drag, { passive: false });
        window.addEventListener('mouseup', stopDragging);

        // Touch events
        listContainer.addEventListener('touchstart', startDragging, { passive: true });
        listContainer.addEventListener('touchmove', drag, { passive: false });
        listContainer.addEventListener('touchend', stopDragging);
        listContainer.addEventListener('touchcancel', stopDragging);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });

        // Add styles
        if (!document.getElementById('scene-selector-styles')) {
            const style = document.createElement('style');
            style.id = 'scene-selector-styles';
            style.textContent = `
                .scene-selector {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.7);
                    padding: 10px;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    z-index: 1000;
                    width: 90%;
                    max-width: 600px;
                }

                .scene-list {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    overflow-y: hidden;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 5px;
                    cursor: grab;
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }

                .scene-list.active {
                    cursor: grabbing;
                    scroll-behavior: auto;
                }

                .scene-button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.8);
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    flex: 0 0 auto;
                    user-select: none;
                    -webkit-user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                .scene-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .scene-button.active {
                    background: rgba(183, 111, 255, 0.3);
                    border-color: rgba(183, 111, 255, 0.6);
                    color: white;
                }

                @media (max-width: 768px) {
                    .scene-selector {
                        bottom: 10px;
                        padding: 8px;
                        width: 95%;
                    }

                    .scene-button {
                        padding: 10px 16px;
                        font-size: 13px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Initial scroll to active scene
        this.scrollToScene(this.currentIndex);
    }

    updateActiveScene() {
        const listContainer = this.container.querySelector('.scene-list');
        const buttons = [...listContainer.querySelectorAll('.scene-button')];
        const containerCenter = listContainer.offsetWidth / 2;
        const scrollLeft = listContainer.scrollLeft;

        // Find the button closest to the center
        let closestButton = null;
        let closestDistance = Infinity;

        buttons.forEach((button, index) => {
            const buttonCenter = button.offsetLeft + (button.offsetWidth / 2) - scrollLeft;
            const distance = Math.abs(buttonCenter - containerCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestButton = button;
            }
        });

        if (closestButton) {
            const newIndex = buttons.indexOf(closestButton);
            if (newIndex !== this.currentIndex) {
                // Only update scene if we're significantly centered on it
                if (closestDistance < closestButton.offsetWidth / 3) {
                    this.setScene(newIndex, false);
                }
            }
        }
    }

    scrollToScene(index, smooth = true) {
        const listContainer = this.container.querySelector('.scene-list');
        const button = listContainer.querySelectorAll('.scene-button')[index];
        if (button) {
            const scrollOffset = button.offsetLeft - (listContainer.offsetWidth - button.offsetWidth) / 2;
            
            if (smooth) {
                listContainer.style.scrollBehavior = 'smooth';
                listContainer.scrollLeft = scrollOffset;
                setTimeout(() => {
                    listContainer.style.scrollBehavior = 'auto';
                }, 500);
            } else {
                listContainer.style.scrollBehavior = 'auto';
                listContainer.scrollLeft = scrollOffset;
            }
        }
    }

    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.scenes.length) {
            this.setScene(newIndex, true);
        }
    }

    setScene(index, scroll = true) {
        if (index === this.currentIndex && !scroll) return;

        const buttons = this.container.querySelectorAll('.scene-button');
        buttons.forEach(button => button.classList.remove('active'));
        buttons[index].classList.add('active');

        if (scroll) {
            this.scrollToScene(index);
        }

        this.currentIndex = index;
        this.sceneManager.setActiveScene(this.scenes[index].id);
    }
}
