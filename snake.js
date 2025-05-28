// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('snakeScore');
        this.startButton = document.getElementById('snakeStart');
        
        // Game settings
        this.gridSize = 20;
        this.canvasSize = 400;
        this.gridCount = this.canvasSize / this.gridSize;
        
        // Game state
        this.snake = [];
        this.food = {};
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.bindEvents();
        this.reset();
        this.draw();
    }

    setupCanvas() {
        // Make canvas responsive
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        if (containerWidth < this.canvasSize) {
            const scale = containerWidth / this.canvasSize;
            this.canvas.style.width = (this.canvasSize * scale) + 'px';
            this.canvas.style.height = (this.canvasSize * scale) + 'px';
        }
    }

    bindEvents() {
        // Start button
        this.startButton.addEventListener('click', () => {
            if (this.isRunning) {
                this.stop();
            } else {
                this.start();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            
            const key = e.key.toLowerCase();
            
            // Arrow keys and WASD
            switch (key) {
                case 'arrowup':
                case 'w':
                    if (this.direction.y !== 1) {
                        this.direction = { x: 0, y: -1 };
                    }
                    break;
                case 'arrowdown':
                case 's':
                    if (this.direction.y !== -1) {
                        this.direction = { x: 0, y: 1 };
                    }
                    break;
                case 'arrowleft':
                case 'a':
                    if (this.direction.x !== 1) {
                        this.direction = { x: -1, y: 0 };
                    }
                    break;
                case 'arrowright':
                case 'd':
                    if (this.direction.x !== -1) {
                        this.direction = { x: 1, y: 0 };
                    }
                    break;
            }
        });

        // Mobile controls
        const controlBtns = document.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.isRunning) return;
                
                const direction = btn.getAttribute('data-direction');
                
                switch (direction) {
                    case 'up':
                        if (this.direction.y !== 1) {
                            this.direction = { x: 0, y: -1 };
                        }
                        break;
                    case 'down':
                        if (this.direction.y !== -1) {
                            this.direction = { x: 0, y: 1 };
                        }
                        break;
                    case 'left':
                        if (this.direction.x !== 1) {
                            this.direction = { x: -1, y: 0 };
                        }
                        break;
                    case 'right':
                        if (this.direction.x !== -1) {
                            this.direction = { x: 1, y: 0 };
                        }
                        break;
                }
            });
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startButton.textContent = 'Stop Game';
        this.startButton.style.backgroundColor = 'var(--danger)';
        
        // Start the game loop
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 150);
        
        showNotification('Snake game started! 🐍', 'success');
    }

    stop() {
        this.isRunning = false;
        this.startButton.textContent = 'Start Game';
        this.startButton.style.backgroundColor = 'var(--accent)';
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    reset() {
        this.stop();
        
        // Reset snake to center
        const center = Math.floor(this.gridCount / 2);
        this.snake = [
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center }
        ];
        
        // Reset direction
        this.direction = { x: 1, y: 0 };
        
        // Reset score
        this.score = 0;
        this.updateScore();
        
        // Generate first food
        this.generateFood();
    }

    update() {
        // Move snake head
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridCount || 
            head.y < 0 || head.y >= this.gridCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            
            // Add effect
            showNotification('+10 points! 🍎', 'success');
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--bg-secondary').trim();
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Draw snake
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent').trim();
        
        this.snake.forEach((segment, index) => {
            // Snake head is slightly different
            if (index === 0) {
                this.ctx.fillStyle = getComputedStyle(document.documentElement)
                    .getPropertyValue('--accent-hover').trim();
            } else {
                this.ctx.fillStyle = getComputedStyle(document.documentElement)
                    .getPropertyValue('--accent').trim();
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--danger').trim();
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Add food glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--danger').trim();
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        this.ctx.shadowBlur = 0;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    gameOver() {
        this.stop();
        showNotification(`Game Over! Final Score: ${this.score}`, 'error');
        
        // Auto reset after a delay
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
}

// Initialize snake game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.snakeGame = new SnakeGame();
});