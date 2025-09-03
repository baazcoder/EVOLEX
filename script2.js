// ===== Safe Storage Handler with Duplicate Protection =====
if (typeof SafeStorage === 'undefined') {
    window.SafeStorage = {
        // Check if localStorage is available
        isAvailable: function() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        // Get item with fallback
        getItem: function(key, defaultValue = null) {
            if (this.isAvailable()) {
                try {
                    return localStorage.getItem(key);
                } catch (e) {
                    console.warn('Could not read from localStorage:', e);
                    return defaultValue;
                }
            }
            return defaultValue;
        },
        
        // Set item with error handling
        setItem: function(key, value) {
            if (this.isAvailable()) {
                try {
                    localStorage.setItem(key, value);
                    return true;
                } catch (e) {
                    console.warn('Could not write to localStorage:', e);
                    return false;
                }
            }
            return false;
        },
        
        // Remove item
        removeItem: function(key) {
            if (this.isAvailable()) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.warn('Could not remove from localStorage:', e);
                    return false;
                }
            }
            return false;
        }
    };
}

// DOM elements
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const container = document.getElementById('textContainer');
const title = document.getElementById('title');
const hint = document.getElementById('hint');

// Theme configuration
const themes = ['dark', 'light', 'neon'];
let currentThemeIndex = 0;

// Check for saved theme preference with fallback
const preferredTheme = SafeStorage.getItem('preferred-theme');
if (preferredTheme && themes.includes(preferredTheme)) {
    currentThemeIndex = themes.indexOf(preferredTheme);
    body.setAttribute('data-theme', preferredTheme);
} else {
    // Apply default theme
    body.setAttribute('data-theme', themes[currentThemeIndex]);
}

// Update theme color meta tag
function updateThemeColor() {
    const themeColor = {
        'dark': '#0f0f12',
        'light': '#f8f9fa',
        'neon': '#000000'
    };
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor[themes[currentThemeIndex]]);
}


  // === Theme Toggle ===
  const toggleBtn = document.querySelector(".theme-toggle-btn");

  // Load saved theme from localStorage
  const localTheme = localStorage.getItem("theme");
  if (localTheme) {
    body.setAttribute("data-theme", localTheme);
    if (localTheme === "light") body.classList.add("light-theme");
  }

  toggleBtn.addEventListener("click", () => {
    let currentTheme = body.getAttribute("data-theme");

    if (currentTheme === "light") {
      // Switch to dark
      body.setAttribute("data-theme", "dark");
      body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    } else {
      // Switch to light
      body.setAttribute("data-theme", "light");
      body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    }
  });


// ===== Parallax Effect with performance optimization =====
let ticking = false;
const mousePos = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };

function updateParallax() {
    const x = (mousePos.clientX / window.innerWidth - 0.5) * 10;
    const y = (mousePos.clientY / window.innerHeight - 0.5) * 10;
    container.style.transform = `translateZ(50px) rotateX(${-y}deg) rotateY(${x}deg)`;
    ticking = false;
}

document.addEventListener('mousemove', (e) => {
    mousePos.clientX = e.clientX;
    mousePos.clientY = e.clientY;
    
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// ===== Konami Code (↑↑↓↓←→←→BA) =====
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    // Prevent default for konami code keys to avoid page scrolling
    if (konami.includes(e.key) || 
        (konamiIndex > 0 && ['b', 'a'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
    }

    const key = e.key.toLowerCase();
    const expected = konami[konamiIndex].toLowerCase();

    if (key === expected) {
        konamiIndex++;
        if (konamiIndex === konami.length) {
            activateNeonMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateNeonMode() {
    currentThemeIndex = themes.indexOf('neon');
    body.setAttribute('data-theme', 'neon');
    
    // Save preference if possible
    if (SafeStorage.setItem('preferred-theme', 'neon')) {
        console.log('Neon theme saved');
    } else {
        console.log('Theme preference will not be saved');
    }
    
    updateThemeColor();
    createParticles(50);
    showHint('🎉 NEON MODE ACTIVATED!');
}

// ===== Click Sound with user preference =====
let soundEnabled = SafeStorage.getItem('sound', 'on') !== 'off';

themeToggle.setAttribute('aria-label', soundEnabled ? 
    'Toggle theme and sound settings' : 'Toggle theme, sound disabled');
    
themeToggle.addEventListener('click', (e) => {
    if (e.detail === 3) { // Triple click disables sound
        soundEnabled = !soundEnabled;
        
        // Save preference if possible
        if (SafeStorage.setItem('sound', soundEnabled ? 'on' : 'off')) {
            console.log('Sound preference saved');
        }
        
        themeToggle.setAttribute('aria-label', soundEnabled ? 
            'Toggle theme and sound settings' : 'Toggle theme, sound disabled');
        showHint(soundEnabled ? '🔊 Sound enabled' : '🔇 Sound disabled');
    }
});

// Create audio element only if needed
let clickSound = null;
try {
    clickSound = new Audio("audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEZgEVGME0yBlFm278a8u8eavNRX+dZv/PrwP+5ZdPp/POYiWfkWgAKOIcAYvgoEKZ6IpLdDpDgml5fI8fuj5GwQCVsN5SKVW12QVWpmsK12YTWeA2WPsiWem2SItY2M6mBvH50twBd8xEfbm6USuL8bCkS4I6TTCi5AAAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEZgEVGME0yBlFm278a8u8eavNRX+dZv/PrwP+5ZdPp/POYiWfkWgAKOIcAYvgoEKZ6IpLdDpDgml5fI8fuj5GwQCVsN5SKVW12QVWpmsK12YTWeA2WPsiWem2SItY2M6mBvH50twBd8xEfbm6USuL8bCkS4I6TTCi5AQAAABQAABEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAA");
    clickSound.volume = 0.2;
} catch (e) {
    console.warn('Audio could not be initialized:', e);
    clickSound = null;
}

document.addEventListener('click', (e) => {
    // Only play sound for interactive elements and if sound is enabled
    if (soundEnabled && clickSound && 
        (e.target.matches('.cta-button, .theme-toggle, .main-title, .falling-text'))) {
        try {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }
});

// ===== Title Easter Egg (5 clicks) =====
let clickCount = 0;

title.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 5) {
        activateMatrix();
        clickCount = 0;
        showHint('💚 Matrix mode activated!');
    }
    
    // Reset counter after 2 seconds of inactivity
    clearTimeout(title.clickTimeout);
    title.clickTimeout = setTimeout(() => { clickCount = 0; }, 2000);
});

function activateMatrix() {
    const canvas = document.getElementById('matrix');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Japanese katakana and numbers for authentic matrix feel
    const chars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50); // Start at random positions
    }

    // Track animation frame for cleanup
    let animationId;
    let frameCount = 0;
    const maxFrames = 300; // ~10 seconds at 30fps

    function draw() {
        // Add semi-transparent layer for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f0';
        ctx.font = fontSize + 'px monospace';
        ctx.textBaseline = 'top';

        // Draw each column
        for (let i = 0; i < drops.length; i++) {
            // Choose a random character
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            
            // Leading character is brighter
            if (Math.random() > 0.975) {
                ctx.fillStyle = '#fff';
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                ctx.fillStyle = '#0f0';
            } else {
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            }
            
            // Reset when drops reach bottom or randomly
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            // Move drop down
            drops[i]++;
        }
        
        frameCount++;
        if (frameCount < maxFrames) {
            animationId = requestAnimationFrame(draw);
        } else {
            // Clean up
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
        }
    }

    // Start animation
    animationId = requestAnimationFrame(draw);
    
    // Allow early exit with ESC key
    function exitMatrix(e) {
        if (e.key === 'Escape') {
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
            document.removeEventListener('keydown', exitMatrix);
            showHint('Matrix mode deactivated');
        }
    }
    
    document.addEventListener('keydown', exitMatrix);
}

// ===== Hidden Command: Type "future" =====
let futureBuffer = '';

document.addEventListener('keydown', (e) => {
    // Developer hint with Ctrl+Shift+H
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        showHint('💡 Developer hints enabled: Try typing "future" or ↑↑↓↓←→←→BA');
        return;
    }

    // Only process printable characters
    if (e.key.length === 1 || e.key === 'Backspace') {
        if (e.key === 'Backspace' && futureBuffer.length > 0) {
            futureBuffer = futureBuffer.slice(0, -1);
        } else {
            futureBuffer += e.key.toLowerCase();
        }
        
        // Keep buffer at max 6 characters
        futureBuffer = futureBuffer.slice(-6);
        
        if (futureBuffer === 'future') {
            showModal('🎉 You found the secret!', 
                      'The future is already here — keep exploring and discovering new possibilities.');
            futureBuffer = '';
        }
    }
});

// Custom modal for better accessibility
function showModal(title, message) {
    // Check if modal already exists
    if (document.getElementById('custom-modal')) return;
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-describedby', 'modal-description');
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 2rem;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--bg);
        color: var(--text);
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        position: relative;
        border: 1px solid rgba(255,255,255,0.1);
    `;
    
    const titleEl = document.createElement('h2');
    titleEl.id = 'modal-title';
    titleEl.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.5rem; color: var(--accent);';
    titleEl.textContent = title;
    
    const descEl = document.createElement('p');
    descEl.id = 'modal-description';
    descEl.style.cssText = 'margin: 0 0 1.5rem 0; line-height: 1.6;';
    descEl.textContent = message;
    
    const button = document.createElement('button');
    button.textContent = 'Close';
    button.style.cssText = `
        background: var(--accent);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
    `;
    button.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Assemble modal
    modalContent.appendChild(titleEl);
    modalContent.appendChild(descEl);
    modalContent.appendChild(button);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Focus the button for accessibility
    setTimeout(() => button.focus(), 100);
    
    // Allow closing with Escape key
    function closeModal(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeModal);
        }
    }
    document.addEventListener('keydown', closeModal);
    
    // Clean up when modal is removed
    modal.addEventListener('animationend', () => {
        if (!document.body.contains(modal)) {
            document.removeEventListener('keydown', closeModal);
        }
    });
}

// ===== Helper: Show Hint =====
function showHint(message) {
    hint.textContent = message;
    hint.style.opacity = 1;
    
    // Clear any existing timeout
    if (hint.timeoutId) {
        clearTimeout(hint.timeoutId);
    }
    
    // Auto-hide after 3 seconds
    hint.timeoutId = setTimeout(() => {
        hint.style.opacity = 0;
    }, 3000);
}

// ===== Sparkles on Interaction =====
function createParticles(count) {
    // Cancel if prefers-reduced-motion is enabled
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.style.cssText = `
            position: fixed;
            width: 6px; height: 6px;
            background: ${Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent2)'};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${Math.random() * window.innerWidth}px;
            top: ${Math.random() * window.innerHeight}px;
            transform: scale(0);
            animation: particlePop 1s ease forwards;
            filter: drop-shadow(0 0 2px rgba(255,255,255,0.5));
        `;
        document.body.appendChild(p);
        
        // Clean up after animation completes
        setTimeout(() => {
            if (p && p.parentNode) {
                p.remove();
            }
        }, 1000);
    }
}

// Inject animation
const style = document.createElement('style');
style.textContent = `
    @keyframes particlePop {
        to { transform: scale(1.5); opacity: 0; }
    }
    
    /* Animation for text reveal */
    @keyframes revealText {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== Page Load Animation =====
document.addEventListener('DOMContentLoaded', () => {
    // Add subtle animation to text elements after page load
    setTimeout(() => {
        const leftElements = document.querySelector('.left-content').children;
        for (let i = 0; i < leftElements.length; i++) {
            if (leftElements[i].classList.contains('main-title') || 
                leftElements[i].classList.contains('subtitle') ||
                leftElements[i].id === 'cta') {
                leftElements[i].style.animation = 'revealText 0.6s ease forwards';
                leftElements[i].style.animationDelay = `${0.2 + i * 0.2}s`;
            }
        }
    }, 100);
    
    // Show initial hint
    showHint('Try typing "future" or ↑↑↓↓←→←→BA');
});

// ===== Responsive handling =====
window.addEventListener('resize', () => {
    // Throttle resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        // Update canvas if matrix is active
        const canvas = document.getElementById('matrix');
        if (window.getComputedStyle(canvas).display !== 'none') {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }, 100);
});

