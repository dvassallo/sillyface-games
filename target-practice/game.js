const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const ammoEl = document.getElementById('ammo');
const gameOverScreen = document.getElementById('game-over-screen');
const startScreen = document.getElementById('start-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game State
let gameState = 'start'; // start, playing, gameover
let score = 0;
let timeLeft = 60;
let lastTime = 0;
let targets = [];
let particles = [];
let trees = []; // Background trees
let mouse = { x: 0, y: 0 };
let ammo = 10;
const MAX_AMMO = 10;
let reloadTimer = 0;
const RELOAD_TIME = 1000; // ms
let isReloading = false;
const TARGET_COUNT = 3;

class Target {
    constructor() {
        this.radius = 40; // Fixed size for consistency with scoring rings
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
        
        // Random velocity
        const speed = 100 + Math.random() * 100; // pixels per second
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = '#ff4444';
        this.rings = 5; // 5 rings for 1-5 scoring
    }

    update(dt) {
        // Move
        const seconds = dt / 1000;
        this.x += this.vx * seconds;
        this.y += this.vy * seconds;

        // Bounce off walls
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -1;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -1;
        }
        
        return false; // Never expires on its own
    }

    draw(ctx) {
        // Draw target rings
        const ringColors = ['#e74c3c', '#ecf0f1', '#e74c3c', '#ecf0f1', '#e74c3c']; // Red/White pattern
        
        for (let i = this.rings; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, (this.radius / this.rings) * i, 0, Math.PI * 2);
            
            // Alternate colors
            if (i % 2 === 0) {
                ctx.fillStyle = 'white';
            } else {
                ctx.fillStyle = '#ff4444';
            }
            
            ctx.fill();
            ctx.strokeStyle = '#rgba(0,0,0,0.1)';
            ctx.stroke();
            ctx.closePath();
        }
        
        // Draw center dot number (optional, but requested 1-5)
        // Actually, let's just show rings.
    }

    checkHit(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    getScore(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 5 zones
        // 0 - 20% : 5 pts
        // 20 - 40% : 4 pts
        // ...
        const normalizedDist = dist / this.radius;
        if (normalizedDist > 1) return 0;
        
        if (normalizedDist < 0.2) return 5;
        if (normalizedDist < 0.4) return 4;
        if (normalizedDist < 0.6) return 3;
        if (normalizedDist < 0.8) return 2;
        return 1;
    }
}

class Particle {
    constructor(x, y, color, text) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.text = text; // If provided, draw text instead of circle
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        if (text) {
             this.vx *= 0.5;
             this.vy = -2 - Math.random() * 2; // Float up
        }

        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        return this.life <= 0;
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        if (this.text) {
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.strokeText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

function generateTrees() {
    trees = [];
    for (let i = 0; i < 20; i++) {
        trees.push({
            x: Math.random() * canvas.width,
            y: canvas.height - Math.random() * 150, // Bottom area
            size: 20 + Math.random() * 40,
            color: `rgb(${20 + Math.random() * 20}, ${40 + Math.random() * 40}, ${20 + Math.random() * 20})`
        });
    }
    // Sort by Y so lower trees are in front
    trees.sort((a, b) => a.y - b.y);
}

function drawBackground() {
    // Draw trees
    for (const tree of trees) {
        ctx.fillStyle = tree.color;
        // Simple triangle tree
        ctx.beginPath();
        ctx.moveTo(tree.x, tree.y - tree.size * 2);
        ctx.lineTo(tree.x - tree.size, tree.y);
        ctx.lineTo(tree.x + tree.size, tree.y);
        ctx.fill();
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateTrees();
}
window.addEventListener('resize', resize);
resize();

function spawnTarget() {
    targets.push(new Target());
}

function createExplosion(x, y, color, scoreVal) {
    // Score popup
    particles.push(new Particle(x, y, '#ffff00', `+${scoreVal}`));
    
    // Debris
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function startGame() {
    score = 0;
    timeLeft = 60;
    ammo = MAX_AMMO;
    targets = [];
    particles = [];
    gameState = 'playing';
    lastTime = performance.now();
    
    // Initial Spawn
    for (let i = 0; i < TARGET_COUNT; i++) {
        spawnTarget();
    }
    
    scoreEl.innerText = `Score: ${score}`;
    timerEl.innerText = `Time: ${timeLeft}`;
    updateAmmoDisplay();
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState = 'gameover';
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function updateAmmoDisplay() {
    if (isReloading) {
        ammoEl.innerText = 'Reloading...';
    } else {
        ammoEl.innerText = `Ammo: ${ammo}/${MAX_AMMO}`;
    }
}

function reload() {
    if (isReloading || ammo === MAX_AMMO) return;
    isReloading = true;
    updateAmmoDisplay();
    setTimeout(() => {
        ammo = MAX_AMMO;
        isReloading = false;
        updateAmmoDisplay();
    }, RELOAD_TIME);
}

function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    const dt = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();

    // Update Timer
    if (timeLeft > 0) {
        timeLeft -= dt / 1000;
        if (timeLeft <= 0) {
            timeLeft = 0;
            endGame();
        }
    }
    timerEl.innerText = `Time: ${Math.ceil(timeLeft)}`;

    // Maintain Target Count
    while (targets.length < TARGET_COUNT) {
        spawnTarget();
    }

    // Update & Draw Targets
    for (let i = targets.length - 1; i >= 0; i--) {
        targets[i].update(dt);
        targets[i].draw(ctx);
    }

    // Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].update()) {
            particles.splice(i, 1);
        } else {
            particles[i].draw(ctx);
        }
    }

    // Draw Crosshair
    ctx.strokeStyle = '#ffff00'; // Yellow for better visibility on green
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.moveTo(mouse.x - 15, mouse.y);
    ctx.lineTo(mouse.x + 15, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 15);
    ctx.lineTo(mouse.x, mouse.y + 15);
    ctx.stroke();
    
    // Draw dot in center
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
    ctx.fill();

    if (gameState === 'playing') {
        requestAnimationFrame(gameLoop);
    }
}

// Input Handling
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mousedown', (e) => {
    if (gameState !== 'playing') return;
    if (isReloading) return;

    if (ammo > 0) {
        ammo--;
        updateAmmoDisplay();
        
        // Check hits
        let hit = false;
        // Iterate backwards to hit top-most target first
        for (let i = targets.length - 1; i >= 0; i--) {
            if (targets[i].checkHit(mouse.x, mouse.y)) {
                const points = targets[i].getScore(mouse.x, mouse.y);
                
                score += points;
                scoreEl.innerText = `Score: ${score}`;
                
                createExplosion(targets[i].x, targets[i].y, targets[i].color, points);
                targets.splice(i, 1); // Remove hit target
                hit = true;
                break; // Only hit one target per shot
            }
        }
        
        if (!hit) {
            // Optional miss effect
        }
        
    } else {
        reload();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        reload();
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
