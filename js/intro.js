// Create rain drops for thunderstorm
function createRain() {
    const rainContainer = document.getElementById('rainContainer');
    if (!rainContainer) return;
    
    for (let i = 0; i < 150; i++) {
        const rainDrop = document.createElement('div');
        rainDrop.className = 'rain-drop';
        rainDrop.style.left = Math.random() * 100 + '%';
        rainDrop.style.animationDuration = (Math.random() * 0.5 + 0.3) + 's';
        rainDrop.style.animationDelay = Math.random() * 2 + 's';
        rainContainer.appendChild(rainDrop);
    }
}

// Intro sequence controller
class IntroSequence {
    constructor() {
        this.currentStage = 0;
        this.stages = document.querySelectorAll('.intro-stage');
        this.skipBtn = document.getElementById('skipIntroBtn');
        this.stageDuration = 3000; // 3 seconds per stage
        this.totalStages = 6; // 0 to 5
        this.stageTimers = [];
        this.isSkipped = false;
        
        this.init();
    }
    
    init() {
        createRain();
        this.showSkipButton();
        this.startSequence();
        this.bindEvents();
    }
    
    bindEvents() {
        this.skipBtn.addEventListener('click', () => {
            this.skipIntro();
        });
    }
    
    showSkipButton() {
        setTimeout(() => {
            if (!this.isSkipped) {
                this.skipBtn.classList.add('visible');
            }
        }, 2000);
    }
    
    startSequence() {
        // Start with stage 0 for 1 second, then begin sequence
        setTimeout(() => {
            this.advanceToNextStage();
        }, 1000);
    }
    
    advanceToNextStage() {
        if (this.isSkipped || this.currentStage >= this.totalStages - 1) {
            if (this.currentStage >= this.totalStages - 1) {
                this.showTitleScreen();
            }
            return;
        }
        
        // Hide current stage
        if (this.stages[this.currentStage]) {
            this.stages[this.currentStage].classList.remove('active');
        }
        
        this.currentStage++;
        
        // Show next stage
        if (this.stages[this.currentStage]) {
            this.stages[this.currentStage].classList.add('active');
        }
        
        // Set timer for next stage
        if (this.currentStage < this.totalStages - 1) {
            this.stageTimers.push(
                setTimeout(() => {
                    this.advanceToNextStage();
                }, this.getStageDuration(this.currentStage))
            );
        } else {
            // Last stage (title screen) - show it and allow interaction
            setTimeout(() => {
                this.showTitleScreen();
            }, this.getStageDuration(this.currentStage));
        }
    }
    
    getStageDuration(stage) {
        switch(stage) {
            case 0: return 1000;  // Black screen
            case 1: return 3000;  // Thunderstorm
            case 2: return 4000;  // Farmhouse reveal
            case 3: return 3500;  // Approaching
            case 4: return 4000;  // Entering house
            case 5: return 5000;  // Title screen (but we'll stay here)
            default: return 3000;
        }
    }
    
    showTitleScreen() {
        // Ensure we're on stage 5
        this.stages.forEach((stage, index) => {
            stage.classList.remove('active');
        });
        if (this.stages[5]) {
            this.stages[5].classList.add('active');
        }
        this.currentStage = 5;
        this.hideSkipButton();
    }
    
    skipIntro() {
        this.isSkipped = true;
        this.hideSkipButton();
        
        // Clear all timers
        this.stageTimers.forEach(timer => clearTimeout(timer));
        this.stageTimers = [];
        
        // Go straight to title screen
        this.stages.forEach((stage, index) => {
            stage.classList.remove('active');
        });
        if (this.stages[5]) {
            this.stages[5].classList.add('active');
        }
        this.currentStage = 5;
    }
    
    hideSkipButton() {
        this.skipBtn.classList.remove('visible');
    }
}

// Enter main site function
function enterMainSite() {
    // Fade out intro
    const introSequence = document.getElementById('introSequence');
    introSequence.style.transition = 'opacity 1.5s ease';
    introSequence.style.opacity = '0';
    
    setTimeout(() => {
        // Navigate to main site
        window.location.href = 'pages/home.html';
    }, 1500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }, 3000);
    
    // Start intro sequence after loading
    setTimeout(() => {
        new IntroSequence();
    }, 4000);
});
