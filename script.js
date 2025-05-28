// Main app functionality
class App {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupTabs();
        this.setupBackToTop();
        this.bindEvents();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        darkModeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Add a subtle animation to the toggle button
        const toggle = document.getElementById('darkModeToggle');
        toggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            toggle.style.transform = '';
        }, 300);
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active class from all tabs and buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // Reset games when switching tabs
                if (targetTab === 'snake' && window.snakeGame) {
                    window.snakeGame.reset();
                }
            });
        });
    }

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Smooth scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    bindEvents() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + D to toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Tab navigation with Ctrl/Cmd + 1/2
            if ((e.ctrlKey || e.metaKey) && e.key === '1') {
                e.preventDefault();
                document.querySelector('[data-tab="snake"]').click();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === '2') {
                e.preventDefault();
                document.querySelector('[data-tab="clicker"]').click();
            }
        });

        // Add touch support for mobile
        this.setupTouchSupport();
    }

    setupTouchSupport() {
        // Prevent zoom on double tap for buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.click();
            });
        });

        // Add haptic feedback if available
        if ('vibrate' in navigator) {
            const clickButton = document.getElementById('clickButton');
            if (clickButton) {
                clickButton.addEventListener('click', () => {
                    navigator.vibrate(50); // Short vibration
                });
            }
        }
    }
}

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatTime(seconds) {
    return seconds.toFixed(1) + 's';
}

function showNotification(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--accent);
        color: white;
        border-radius: 8px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.background = 'var(--success)';
    } else if (type === 'error') {
        notification.style.background = 'var(--danger)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to UselessSuit! 🎮', 'success');
    }, 500);
});