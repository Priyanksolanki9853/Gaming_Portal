// --- AUDIO ENGINE ---
// FIXED: Initialize audio context safely. 
// Modern browsers block AudioContext from starting without a user gesture.
let audioCtx = null;
let isMuted = false;

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("AudioContext not supported");
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Add a global click listener to unlock audio
document.addEventListener('click', initAudio, { once: true });

function playSound(type) {
    // If audio context isn't ready or suspended, just return silently
    if (!audioCtx || isMuted || audioCtx.state === 'suspended') {
        return;
    }
    
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'click') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1);
            osc.frequency.setValueAtTime(659, now + 0.2);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'type') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.01, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        }
    } catch (err) {
        // Ignore audio errors
    }
}

// --- PARTICLE BACKGROUND ---
function initParticles() {
    const canvas = document.getElementById('bg-particles');
    if(!canvas) return; // Safety check
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // FIXED: Fallback color if CSS variable isn't ready
        let color = '#00f3ff';
        try {
            const styleColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
            if(styleColor) color = styleColor;
        } catch(e) {}
        
        ctx.fillStyle = color;
        
        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            particles.forEach((p2, index2) => {
                if (index !== index2) {
                    let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 150) {
                        ctx.strokeStyle = color; // Simplified for robustness
                        ctx.globalAlpha = 0.5; // Use globalAlpha instead of hex manipulation
                        ctx.lineWidth = 0.2;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1.0; // Reset
                    }
                }
            });
        });
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// --- ACHIEVEMENT SYSTEM ---
const unlockedAchievements = new Set();
function unlockAchievement(title) {
    if(unlockedAchievements.has(title)) return;
    unlockedAchievements.add(title);
    playSound('success');
    
    const container = document.getElementById('achievement-container');
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.innerHTML = `<span class="trophy-icon">🏆</span><div><div style="font-size:0.8em; color:var(--accent-primary)">ACHIEVEMENT UNLOCKED</div><div>${title}</div></div>`;
    container.appendChild(card);
    
    requestAnimationFrame(() => card.classList.add('show'));
    setTimeout(() => {
        card.classList.remove('show');
        setTimeout(() => card.remove(), 600);
    }, 4000);
}

// --- GAME APP LOGIC ---
const app = {
    settings: {
        themePrimary: '#00f3ff',
        themeSecondary: '#bc13fe',
        sound: true,
        retro: false,
        highScore: 0
    },

    loadSettings: () => {
        try {
            const saved = localStorage.getItem('portalSettings');
            if (saved) {
                app.settings = JSON.parse(saved);
                app.changeTheme(app.settings.themePrimary, app.settings.themeSecondary, false);
                isMuted = !app.settings.sound;
                const soundBtn = document.getElementById('sound-btn');
                if(soundBtn) soundBtn.innerText = isMuted ? '🔇' : '🔊';
                if (app.settings.retro) document.body.classList.add('retro-mode');
            }
        } catch(e) { console.warn("Storage access failed"); }
    },

    saveSettings: () => {
        try {
            localStorage.setItem('portalSettings', JSON.stringify(app.settings));
        } catch(e) {}
    },

    showSection: (sectionId) => {
        playSound('click');
        document.querySelectorAll('.section-view').forEach(sec => sec.classList.remove('active-section'));
        const target = document.getElementById(sectionId);
        if(target) target.classList.add('active-section');
        
        document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
        const navLink = document.getElementById('nav-' + sectionId);
        if(navLink) navLink.classList.add('active');
        
        window.scrollTo(0, 0);
    },

    initFilter: () => {
        const genreSelect = document.getElementById('genre-select');
        if(!genreSelect) return;
        const gameCards = document.querySelectorAll('.game-card'); 
        genreSelect.addEventListener('change', () => {
            playSound('click');
            const selectedGenre = genreSelect.value;
            gameCards.forEach(card => {
                const cardGenre = card.getAttribute('data-genre');
                const shouldShow = (selectedGenre === 'all' || selectedGenre === cardGenre);
                if (shouldShow) {
                    card.style.display = 'flex'; 
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    },

    changeTheme: (primary, secondary, save = true) => {
        if(save) playSound('click');
        document.documentElement.style.setProperty('--accent-primary', primary);
        document.documentElement.style.setProperty('--accent-secondary', secondary);
        document.documentElement.style.setProperty('--accent-glow', primary + '80');
        if(save) {
            app.settings.themePrimary = primary;
            app.settings.themeSecondary = secondary;
            app.saveSettings();
            unlockAchievement("System Hacker");
        }
    },

    toggleSound: () => {
        isMuted = !isMuted;
        app.settings.sound = !isMuted;
        const soundBtn = document.getElementById('sound-btn');
        if(soundBtn) soundBtn.innerText = isMuted ? '🔇' : '🔊';
        app.saveSettings();
        if(!isMuted) playSound('click');
    },

    toggleRetro: () => {
        document.body.classList.toggle('retro-mode');
        app.settings.retro = document.body.classList.contains('retro-mode');
        app.saveSettings();
        playSound('click');
        unlockAchievement("Time Traveler");
    },

    init: () => {
        // Boot Sequence
        const bootScreen = document.getElementById('boot-screen');
        const lines = ["INITIALIZING CORE...", "LOADING ASSETS...", "ACCESS GRANTED."];
        let delay = 0;
        lines.forEach((line) => {
            setTimeout(() => {
                const p = document.createElement('div');
                p.className = 'boot-text-line';
                p.innerText = "> " + line;
                if(bootScreen) bootScreen.appendChild(p);
                playSound('type');
            }, delay);
            delay += 600;
        });
        setTimeout(() => {
            if(bootScreen) {
                bootScreen.style.opacity = '0';
                setTimeout(() => bootScreen.style.display = 'none', 500);
            }
            setTimeout(() => typeWriter("Handcrafted Worlds", "typewriter-text"), 500);
        }, delay + 500);

        app.loadSettings();
        app.initFilter();
        // FIXED: Init particles here, guaranteed to run
        initParticles();

        // 3D Tilt & FIXED 360 Rotation Logic
        const cards = document.querySelectorAll('.game-card');
        const rotateCursor = document.getElementById('rotation-cursor');

        cards.forEach(card => {
            const cardImg = card.querySelector('.card-image');

            // Existing 3D Tilt
            card.addEventListener('mousemove', (e) => {
                if(window.innerWidth < 768) return; 
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${y / -10}deg) rotateY(${x / 10}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
            
            card.addEventListener('mouseenter', () => playSound('hover'));

            // FIXED: 360 Rotation Icon Logic
            if (cardImg && rotateCursor) {
                cardImg.addEventListener('mouseenter', () => {
                    rotateCursor.style.display = 'block';
                    setTimeout(() => {
                        rotateCursor.style.width = '60px';
                        rotateCursor.style.height = '60px';
                    }, 10);
                });
                
                cardImg.addEventListener('mouseleave', () => {
                    rotateCursor.style.display = 'none';
                    rotateCursor.style.width = '50px';
                    rotateCursor.style.height = '50px';
                });

                cardImg.addEventListener('mousemove', (e) => {
                    rotateCursor.style.left = (e.clientX - 30) + 'px'; 
                    rotateCursor.style.top = (e.clientY - 30) + 'px';
                    const rotation = e.clientX; 
                    rotateCursor.style.transform = `rotate(${rotation}deg)`;
                });
            }
        });

        document.querySelectorAll('a, button, .logo, .theme-dot, select, .social-icon').forEach(el => {
            el.addEventListener('mouseenter', () => playSound('hover'));
        });

        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                unlockAchievement("Deep Diver");
            }
        });
    }
};

// --- TYPEWRITER ---
function typeWriter(text, elementId) {
    let i = 0;
    const element = document.getElementById(elementId);
    if(!element) return;
    element.innerHTML = ""; 
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 100);
        } else {
            element.innerHTML += '<span class="typewriter-cursor">&nbsp;</span>';
        }
    }
    type();
}

// --- KONAMI CODE ---
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            document.body.classList.add('god-mode-active');
            unlockAchievement("God Mode Activated");
            playSound('success');
            konamiIndex = 0;
        }
    } else { konamiIndex = 0; }
});

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://zkqvefcuiltkilxlvqbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcXZlZmN1aWx0a2lseGx2cWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE0NTUsImV4cCI6MjA4MTA0NzQ1NX0.0x6sBQrqMkvW2gJvdov6pDJcV3wJvKk4qngaMeBA83s';

// FIXED: Wrap in Try-Catch so the whole site doesn't crash if database fails
let _supabase = null;
try {
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.warn("Supabase script not loaded.");
    }
} catch (err) {
    console.error("Supabase init failed:", err);
}

// Function to fetch and display scores
async function updateLeaderboard() {
    if(!_supabase) return; 

    const list = document.getElementById('leaderboard-list');
    if(!list) return;
    
    // Get top 10 scores, ordered by score descending
    const { data, error } = await _supabase
        .from('scores')
        .select('player_name, score')
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching scores:', error);
        list.innerHTML = '<li style="color:red">Failed to load scores.</li>';
        return;
    }

    // Render list
    list.innerHTML = data.map((entry, index) => {
        let color = '#fff';
        if(index === 0) color = '#ffd700'; // Gold
        if(index === 1) color = '#c0c0c0'; // Silver
        if(index === 2) color = '#cd7f32'; // Bronze
        
        return `<li style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">
            <span style="color:${color}">#${index + 1} ${entry.player_name}</span>
            <span style="color:var(--accent-primary)">${entry.score}</span>
        </li>`;
    }).join('');
}

if(_supabase) updateLeaderboard();

// --- SNAKE GAME LOGIC (Updated for Cloud) ---
let snakeGameInterval;

function startSnakeGame() {
    playSound('click');
    const canvas = document.getElementById('snakeGame');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const box = 20;
    let snake = [{x: 9 * box, y: 10 * box}];
    let food = { x: Math.floor(Math.random() * 19 + 1) * box, y: Math.floor(Math.random() * 19 + 1) * box };
    let score = 0;
    let d;

    document.addEventListener("keydown", direction);
    function direction(event) {
        if(event.keyCode == 37 && d != "RIGHT") d = "LEFT";
        else if(event.keyCode == 38 && d != "DOWN") d = "UP";
        else if(event.keyCode == 39 && d != "LEFT") d = "RIGHT";
        else if(event.keyCode == 40 && d != "UP") d = "DOWN";
    }

    function draw() {
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, 400, 400);
        for(let i = 0; i < snake.length; i++) {
            ctx.fillStyle = (i == 0) ? app.settings.themePrimary : app.settings.themeSecondary;
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.strokeStyle = "#000"; ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }
        ctx.fillStyle = "red"; ctx.fillRect(food.x, food.y, box, box);

        let snakeX = snake[0].x; let snakeY = snake[0].y;
        if(d == "LEFT") snakeX -= box;
        if(d == "UP") snakeY -= box;
        if(d == "RIGHT") snakeX += box;
        if(d == "DOWN") snakeY += box;

        if(snakeX == food.x && snakeY == food.y) {
            score++;
            playSound('hover');
            food = { x: Math.floor(Math.random() * 19 + 1) * box, y: Math.floor(Math.random() * 19 + 1) * box };
        } else { snake.pop(); }

        // GAME OVER CHECK
        if(snakeX < 0 || snakeX > 19 * box || snakeY < 0 || snakeY > 19 * box || collision(snakeX, snakeY, snake)) {
            clearInterval(snakeGameInterval);
            playSound('success'); 
            
            // --- NEW: Ask for name and save to cloud ---
            setTimeout(async () => {
                let playerName = prompt(`GAME OVER! Score: ${score}\nEnter your name for the Global Leaderboard:`);
                
                if (playerName && playerName.trim() !== "" && _supabase) {
                    const { error } = await _supabase
                        .from('scores')
                        .insert([{ player_name: playerName, score: score }]);
                    
                    if (!error) {
                        alert("Score Uploaded!");
                        updateLeaderboard(); 
                    } else {
                        console.error(error);
                        alert("Error uploading score.");
                    }
                }
            }, 100);
        }
        
        let newHead = { x: snakeX, y: snakeY };
        snake.unshift(newHead);
    }

    function collision(headX, headY, array) {
        for(let i = 0; i < array.length; i++) {
            if(headX == array[i].x && headY == array[i].y) return true;
        }
        return false;
    }

    if (snakeGameInterval) clearInterval(snakeGameInterval);
    snakeGameInterval = setInterval(draw, 100);
}

document.addEventListener('DOMContentLoaded', app.init);