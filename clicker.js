// Clicker Game Implementation
class ClickerGame {
    constructor() {
        this.clickButton = document.getElementById('clickButton');
        this.clickCountElement = document.getElementById('clickCount');
        this.timerElement = document.getElementById('timer');
        this.cpsElement = document.getElementById('cps');
        this.highScoreElement = document.getElementById('highScore');
        this.resetButton = document.getElementById('resetClicker');
        this.startTimerButton = document.getElementById('startTimer');
        
        // Game state
        this.clickCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isTimerRunning = false;
        this.highScore = parseInt(localStorage.getItem('clickerHighScore')) || 0;
        this.gameTime = 0;
        
        // Click tracking for CPS calculation
        this.clickTimes = [];
        
        this.init();
    }

    init() {
        this.updateDisplay();
        this.bindEvents();
        this.loadHighScore();
    }

    bindEvents() {
        // Main click button
        this.clickButton.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Reset button
        this.resetButton.addEventListener('click', () => {
            this.reset();
        });

        // Start timer button
        this.startTimerButton.addEventListener('click', () => {
            if (this.isTimerRunning) {
                this.stopTimer();
            } else {
                this.startTimer();
            }
        });

        // Keyboard support - spacebar for clicking
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.getElementById('clicker').classList.contains('active')) {
                e.preventDefault();
                this.handleClick();
            }
        });

        // Prevent context menu on long press
        this.clickButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Double-click protection
        this.clickButton.addEventListener('dblclick', (e) => {
            e.preventDefault();
        });
    }

    handleClick(e) {
        const currentTime = Date.now();
        
        // Increment click count
        this.clickCount++;
        
        // Track click time for CPS calculation
        this.clickTimes.push(currentTime);
        
        // Keep only clicks from the last second for CPS
        this.clickTimes = this.clickTimes.filter(time => currentTime - time <= 1000);
        
        // Update display
        this.updateDisplay();
        
        // Add visual effects
        this.addClickEffect(e);
        
        // Check for new high score
        this.checkHighScore();
        
        // Check for achievements
        this.checkAchievements();
        
        // Auto-start timer on first click if not already running
        if (!this.isTimerRunning && !this.startTime) {
            this.startTimer();
        }
    }

    addClickEffect(e) {
        // Add click ripple effect
        this.clickButton.classList.add('clicked');
        setTimeout(() => {
            this.clickButton.classList.remove('clicked');
        }, 600);
        
        // Create floating +1 text
        const floatingText = document.createElement('div');
        floatingText.textContent = '+1';
        floatingText.style.cssText = `
            position: absolute;
            color: var(--accent);
            font-weight: bold;
            font-size: 1.2rem;
            pointer-events: none;
            z-index: 1000;
            animation: floatUp 1s ease-out forwards;
        `;
        
        // Position near click location if event available
        if (e && e.clientX && e.clientY) {
            floatingText.style.left = e.clientX + 'px';
            floatingText.style.top = e.clientY + 'px';
        } else {
            // Fallback positioning
            const rect = this.clickButton.getBoundingClientRect();
            floatingText.style.left = (rect.left + rect.width / 2) + 'px';
            floatingText.style.top = rect.top + 'px';
        }
        
        document.body.appendChild(floatingText);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1000);
        
        // Add CSS for float animation if not exists
        if (!document.getElementById('floatAnimation')) {
            const style = document.createElement('style');
            style.id = 'floatAnimation';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px) scale(1.2);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    startTimer() {
        if (this.isTimerRunning) return;
        
        this.isTimerRunning = true;
        this.startTime = Date.now();
        this.startTimerButton.textContent = 'Stop Timer';
        this.startTimerButton.style.backgroundColor = 'var(--danger)';
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 100);
        
        showNotification('Timer started! Click away! ⏰', 'success');
    }

    stopTimer() {
        if (!this.isTimerRunning) return;
        
        this.isTimerRunning = false;
        this.startTimerButton.textContent = 'Start Timer';
        this.startTimerButton.style.backgroundColor = 'var(--accent)';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Final stats
        const finalCPS = this.gameTime > 0 ? (this.clickCount / this.gameTime).toFixed(2) : 0;
        showNotification(`Timer stopped! Final CPS: ${finalCPS}`, 'info');
    }

    updateTimer() {
        if (!this.startTime) return;
        
        this.gameTime = (Date.now() - this.startTime) / 1000;
        this.timerElement.textContent = formatTime(this.gameTime);
    }

    updateDisplay() {
        // Update click count
        this.clickCountElement.textContent = formatNumber(this.clickCount);
        
        // Update CPS (clicks per second over last second)
        const currentCPS = this.clickTimes.length;
        this.cpsElement.textContent = currentCPS.toFixed(1);
        
        // Update timer if running
        if (this.isTimerRunning) {
            this.updateTimer();
        }
    }

    checkHighScore() {
        if (this.clickCount > this.highScore) {
            this.highScore = this.clickCount;
            this.highScoreElement.textContent = formatNumber(this.highScore);
            localStorage.setItem('clickerHighScore', this.highScore.toString());
            
            // Celebrate new high score
            showNotification(`New High Score: ${formatNumber(this.highScore)}! 🎉`, 'success');
            
            // Add special effect
            this.clickButton.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                this.clickButton.style.animation = '';
            }, 500);
        }
    }

    loadHighScore() {
        this.highScoreElement.textContent = formatNumber(this.highScore);
    }

    reset() {
        // Stop timer if running
        this.stopTimer();
        
        // Reset all counters
        this.clickCount = 0;
        this.gameTime = 0;
        this.startTime = null;
        this.clickTimes = [];
        
        // Update display
        this.updateDisplay();
        this.timerElement.textContent = '0.0s';
        this.cpsElement.textContent = '0.0';
        
        // Reset button states
        this.startTimerButton.textContent = 'Start Timer';
        this.startTimerButton.style.backgroundColor = 'var(--accent)';
        
        showNotification('Game reset! Ready for another round? 🔄', 'info');
    }

    // Auto-clicker detection (basic)
    detectAutoClicker() {
        const recentClicks = this.clickTimes.slice(-10);
        if (recentClicks.length >= 10) {
            const intervals = [];
            for (let i = 1; i < recentClicks.length; i++) {
                intervals.push(recentClicks[i] - recentClicks[i-1]);
            }
            
            // Check if intervals are suspiciously consistent
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            const variance = intervals.reduce((sum, interval) => {
                return sum + Math.pow(interval - avgInterval, 2);
            }, 0) / intervals.length;
            
            // If variance is very low and interval is very short, might be auto-clicking
            if (variance < 5 && avgInterval < 50) {
                showNotification('Suspicious clicking detected! 🤖', 'warning');
                return true;
            }
        }
        return false;
    }

    // Achievement system
    checkAchievements() {
        const achievements = [
            { threshold: 100, name: 'Century Club', emoji: '💯' },
            { threshold: 500, name: 'Click Master', emoji: '👑' },
            { threshold: 1000, name: 'Millennium Clicker', emoji: '🏆' },
            { threshold: 5000, name: 'Click Legend', emoji: '⭐' },
            { threshold: 10000, name: 'Ultimate Clicker', emoji: '🌟' }
        ];
        
        achievements.forEach(achievement => {
            const storageKey = `achievement_${achievement.threshold}`;
            if (this.clickCount >= achievement.threshold && !localStorage.getItem(storageKey)) {
                localStorage.setItem(storageKey, 'true');
                showNotification(`Achievement Unlocked: ${achievement.name} ${achievement.emoji}`, 'success');
            }
        });
    }
}

// Initialize clicker game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.clickerGame = new ClickerGame();
    
    // Add pulse animation for high score celebrations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});