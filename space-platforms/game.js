import * as THREE from 'three';

// Game State
const state = {
    started: false,
    gameOver: false,
    reachedSummit: false,
    coins: 0,
    maxHeight: 0,
    totalCoins: 0, // Persistent coins for shop
    playerVelocity: new THREE.Vector3(),
    playerOnGround: false,
    keys: {},
    cameraOffset: new THREE.Vector3(0, 8, 12),
    platforms: [],
    collectibles: [],
    particles: [],
    battleMode: false,
    opponent: null,
    playerHealth: 100,
    opponentHealth: 100,
    punchCooldown: 0,
    headbuttCooldown: 0,
    // Shop items - owned and active state
    ownedItems: {
        speed: false,
        jump: false,
        power: false,
        'double-coins': false,
        'glow-mode': false,
        'big-mode': false,
        'low-gravity': false,
        'shield': false,
        'trail-mode': false,
        'tiny-mode': false,
        'super-speed': false,
        'moon-jump': false,
        'magnet': false,
        'ghost-mode': false,
        'spin-attack': false,
        'rocket-boots': false
    },
    activeItems: {
        speed: false,
        jump: false,
        power: false,
        'double-coins': false,
        'glow-mode': false,
        'big-mode': false,
        'low-gravity': false,
        'shield': false,
        'trail-mode': false,
        'tiny-mode': false,
        'super-speed': false,
        'moon-jump': false,
        'magnet': false,
        'ghost-mode': false,
        'spin-attack': false,
        'rocket-boots': false
    },
    canDoubleJump: false,
    hasDoubleJumped: false,
    shieldActive: false,  // Shield blocks one hit then turns off
    trailParticles: [],   // For rainbow trail
    // Career stats
    careerStats: {
        coinsEarned: 0,
        battlesWon: 0,
        knockouts: 0,
        boxFightsWins: 0,
        boxFightsKills: 0,
        journeysCompleted: 0,
        maxHeightEver: 0,
        totalBaskets: 0,
        basketballBest: 0,
        basketballWins: 0,
        goalsScored: 0,
        soccerWins: 0,
        golfHolesCompleted: 0,
        racesWon: 0,
        racingTotalLaps: 0,
        survivalBestWave: 0,
        targetBestHits: 0
    }
};

// Load saved data from localStorage
function loadSaveData() {
    try {
        const saved = localStorage.getItem('nicogame_save');
        if (saved) {
            const data = JSON.parse(saved);
            state.totalCoins = data.totalCoins || 0;
            state.ownedItems = data.ownedItems || state.ownedItems;
            state.activeItems = data.activeItems || state.activeItems;
            // Merge career stats with defaults to handle new stats added later
            if (data.careerStats) {
                state.careerStats = {
                    ...state.careerStats,  // defaults
                    ...data.careerStats    // saved values
                };
            }
        }
    } catch (e) {
        console.log('No save data found');
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('nicogame_save', JSON.stringify({
            totalCoins: state.totalCoins,
            ownedItems: state.ownedItems,
            activeItems: state.activeItems,
            careerStats: state.careerStats
        }));
        updateCareerCoins();
    } catch (e) {
        console.log('Could not save data');
    }
}

// Update career coins display
function updateCareerCoins() {
    const el = document.getElementById('career-coins');
    if (el) el.textContent = state.totalCoins;
}

loadSaveData();
updateCareerCoins();

// Constants
const GRAVITY = -30;
const JUMP_FORCE = 12;
const MOVE_SPEED = 8;
const SPRINT_MULTIPLIER = 1.6;
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.4;

// Audio Setup
let audioContext = null;
let musicPlaying = false;
let musicNodes = [];
let musicGain = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Background Music System - Calm & Relaxing Ambient Music
function startBackgroundMusic() {
    if (musicPlaying) return;
    
    const ctx = initAudio();
    if (!ctx) return;
    
    musicPlaying = true;
    
    // Master gain for music
    musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(0, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // Fade in
    musicGain.connect(ctx.destination);
    
    // Ambient pad frequencies (peaceful chord: Cmaj7 with extensions)
    const padFrequencies = [130.81, 164.81, 196.00, 246.94, 293.66]; // C3, E3, G3, B3, D4
    
    // Create ambient pads
    padFrequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Gentle filter for warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1, ctx.currentTime);
        
        // Soft volume with slight variation
        gain.gain.setValueAtTime(0.08 - index * 0.01, ctx.currentTime);
        
        // Add slow vibrato for ethereal feel
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.type = 'sine';
        vibrato.frequency.setValueAtTime(0.2 + index * 0.05, ctx.currentTime);
        vibratoGain.gain.setValueAtTime(2, ctx.currentTime);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);
        osc.start();
        
        musicNodes.push(osc, vibrato, gain, filter);
    });
    
    // Melodic arpeggios - gentle and sparse
    playAmbientMelody();
}

function playAmbientMelody() {
    if (!musicPlaying) return;
    
    const ctx = initAudio();
    if (!ctx || !musicGain) return;
    
    // Pentatonic scale notes for peaceful melody (C major pentatonic)
    const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    
    // Pick a random note
    const freq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    
    // Gentle attack and long decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3);
    
    // Schedule next note (random interval for organic feel)
    const nextDelay = 2000 + Math.random() * 3000; // 2-5 seconds
    setTimeout(() => {
        if (musicPlaying) playAmbientMelody();
    }, nextDelay);
}

function stopBackgroundMusic() {
    if (!musicPlaying) return;
    
    musicPlaying = false;
    
    // Fade out
    if (musicGain && audioContext) {
        musicGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    }
    
    // Stop all music nodes after fade
    setTimeout(() => {
        musicNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        musicNodes = [];
        musicGain = null;
    }, 1100);
}

function toggleMusic() {
    if (musicPlaying) {
        stopBackgroundMusic();
        document.getElementById('music-btn').textContent = '🔇';
        document.getElementById('music-btn').title = 'Music Off';
    } else {
        startBackgroundMusic();
        document.getElementById('music-btn').textContent = '🎵';
        document.getElementById('music-btn').title = 'Music On';
    }
}

// Sound Effects
function playLandingSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Landing sound - low thump
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
}

function playJumpSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Jump sound - ascending tone
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
}

function playCoinSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Coin sound - bright ding
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
}

function playPunchSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Punch sound - impact noise
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
}

function playHitSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Hit sound - painful thud
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
}

function playRevealSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Reveal sound - magical whoosh
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
}

// Scene Setup
const canvas = document.getElementById('game-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Space background with stars and nebula
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 1024;
skyCanvas.height = 1024;
const skyCtx = skyCanvas.getContext('2d');

// Deep space gradient
const skyGradient = skyCtx.createRadialGradient(512, 512, 0, 512, 512, 720);
skyGradient.addColorStop(0, '#0a0a15');
skyGradient.addColorStop(0.3, '#050510');
skyGradient.addColorStop(0.6, '#020208');
skyGradient.addColorStop(1, '#000005');
skyCtx.fillStyle = skyGradient;
skyCtx.fillRect(0, 0, 1024, 1024);

// Add nebula clouds
const nebulaColors = [
    { color: 'rgba(100, 0, 150, 0.15)', x: 200, y: 300, r: 300 },
    { color: 'rgba(0, 100, 150, 0.1)', x: 700, y: 200, r: 250 },
    { color: 'rgba(150, 50, 100, 0.12)', x: 500, y: 700, r: 350 },
    { color: 'rgba(50, 0, 100, 0.1)', x: 800, y: 600, r: 200 }
];

nebulaColors.forEach(nebula => {
    const gradient = skyCtx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.r);
    gradient.addColorStop(0, nebula.color);
    gradient.addColorStop(1, 'transparent');
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, 1024, 1024);
});

// Add stars
for (let i = 0; i < 500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const size = Math.random() * 2;
    const brightness = Math.random();
    
    // Star color variation (white, blue, yellow, red stars)
    const colors = ['#ffffff', '#aaccff', '#ffffaa', '#ffaaaa', '#aaaaff'];
    skyCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    skyCtx.globalAlpha = 0.3 + brightness * 0.7;
    
    skyCtx.beginPath();
    skyCtx.arc(x, y, size, 0, Math.PI * 2);
    skyCtx.fill();
    
    // Add glow to brighter stars
    if (brightness > 0.7) {
        skyCtx.globalAlpha = 0.1;
        skyCtx.beginPath();
        skyCtx.arc(x, y, size * 3, 0, Math.PI * 2);
        skyCtx.fill();
    }
}
skyCtx.globalAlpha = 1;

// Add a few distant galaxies
for (let i = 0; i < 3; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 1024;
    const galaxyGradient = skyCtx.createRadialGradient(gx, gy, 0, gx, gy, 30);
    galaxyGradient.addColorStop(0, 'rgba(200, 180, 255, 0.3)');
    galaxyGradient.addColorStop(0.5, 'rgba(150, 100, 200, 0.1)');
    galaxyGradient.addColorStop(1, 'transparent');
    skyCtx.fillStyle = galaxyGradient;
    skyCtx.fillRect(0, 0, 1024, 1024);
}

scene.background = new THREE.CanvasTexture(skyCanvas);
scene.fog = new THREE.FogExp2(0x050510, 0.008);

// Add 3D stars around the scene
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Spread stars in a sphere around the scene
        const radius = 100 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Star colors
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
            colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // White
        } else if (colorChoice < 0.75) {
            colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1; // Blue
        } else if (colorChoice < 0.9) {
            colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.7; // Yellow
        } else {
            colors[i * 3] = 1; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.7; // Red
        }
        
        sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    return starField;
}

const starField = createStarField();

// Create Earth in the background
function createEarth() {
    const earthGroup = new THREE.Group();
    
    // Earth texture using canvas
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 512;
    earthCanvas.height = 256;
    const ctx = earthCanvas.getContext('2d');
    
    // Ocean base (deep blue)
    ctx.fillStyle = '#1a4d7c';
    ctx.fillRect(0, 0, 512, 256);
    
    // Add ocean variation
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(30, 100, 180, ${Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 50 + 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Continents (simplified shapes)
    ctx.fillStyle = '#2d5a3d';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(100, 80, 60, 40, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(130, 170, 30, 50, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe/Africa
    ctx.beginPath();
    ctx.ellipse(270, 100, 35, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(380, 80, 70, 45, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(420, 180, 25, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some green variation to continents
    ctx.fillStyle = '#3d7a4d';
    ctx.beginPath();
    ctx.ellipse(95, 75, 40, 25, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(375, 75, 50, 30, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Add deserts (tan/brown areas)
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath();
    ctx.ellipse(280, 110, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(350, 95, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ice caps
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, 512, 15);
    ctx.fillRect(0, 241, 512, 15);
    
    // Clouds (white swirls)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.ellipse(
            Math.random() * 512, 
            Math.random() * 256, 
            Math.random() * 60 + 20, 
            Math.random() * 15 + 5, 
            Math.random() * Math.PI, 
            0, Math.PI * 2
        );
        ctx.fill();
    }
    
    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    
    // Earth sphere
    const earthGeometry = new THREE.SphereGeometry(30, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);
    
    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(31, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);
    
    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(33, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    earthGroup.add(glow);
    
    // Position Earth in the background
    earthGroup.position.set(-80, -40, -150);
    earthGroup.rotation.z = 0.4; // Tilt
    
    scene.add(earthGroup);
    return earthGroup;
}

const earth = createEarth();

// Create Moon
function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(5, 32, 32);
    
    // Moon texture
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 256;
    moonCanvas.height = 128;
    const ctx = moonCanvas.getContext('2d');
    
    // Base gray
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 256, 128);
    
    // Craters
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 128;
        const r = Math.random() * 15 + 3;
        
        // Crater shadow
        ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.5 + 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Crater highlight
        ctx.fillStyle = `rgba(150, 150, 150, ${Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const moonTexture = new THREE.CanvasTexture(moonCanvas);
    
    const moonMaterial = new THREE.MeshStandardMaterial({
        map: moonTexture,
        roughness: 1,
        metalness: 0
    });
    
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(-40, 20, -120);
    
    scene.add(moon);
    return moon;
}

const moon = createMoon();

// Create Saturn with rings
function createSaturn() {
    const saturnGroup = new THREE.Group();
    
    // Saturn texture using canvas
    const saturnCanvas = document.createElement('canvas');
    saturnCanvas.width = 256;
    saturnCanvas.height = 128;
    const ctx = saturnCanvas.getContext('2d');
    
    // Base color - golden/tan
    const gradient = ctx.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, '#c9a227');
    gradient.addColorStop(0.3, '#e6c868');
    gradient.addColorStop(0.5, '#d4a84b');
    gradient.addColorStop(0.7, '#c9a227');
    gradient.addColorStop(1, '#a67c00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 128);
    
    // Add horizontal bands
    for (let i = 0; i < 20; i++) {
        const y = (i / 20) * 128;
        ctx.fillStyle = `rgba(${150 + Math.random() * 50}, ${120 + Math.random() * 40}, ${50 + Math.random() * 30}, ${0.2 + Math.random() * 0.2})`;
        ctx.fillRect(0, y, 256, 4 + Math.random() * 6);
    }
    
    const saturnTexture = new THREE.CanvasTexture(saturnCanvas);
    
    // Saturn sphere
    const saturnGeometry = new THREE.SphereGeometry(20, 64, 64);
    const saturnMaterial = new THREE.MeshStandardMaterial({
        map: saturnTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturnGroup.add(saturn);
    
    // Create rings
    const ringInnerRadius = 25;
    const ringOuterRadius = 40;
    const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 64);
    
    // Ring texture
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 64;
    const ringCtx = ringCanvas.getContext('2d');
    
    // Multiple ring bands
    const ringGradient = ringCtx.createLinearGradient(0, 0, 512, 0);
    ringGradient.addColorStop(0, 'rgba(180, 150, 100, 0.0)');
    ringGradient.addColorStop(0.1, 'rgba(200, 170, 120, 0.6)');
    ringGradient.addColorStop(0.2, 'rgba(180, 150, 100, 0.3)');
    ringGradient.addColorStop(0.3, 'rgba(220, 190, 140, 0.7)');
    ringGradient.addColorStop(0.4, 'rgba(160, 130, 80, 0.2)');
    ringGradient.addColorStop(0.5, 'rgba(200, 170, 120, 0.5)');
    ringGradient.addColorStop(0.6, 'rgba(180, 150, 100, 0.4)');
    ringGradient.addColorStop(0.7, 'rgba(220, 190, 140, 0.6)');
    ringGradient.addColorStop(0.85, 'rgba(180, 150, 100, 0.3)');
    ringGradient.addColorStop(1, 'rgba(180, 150, 100, 0.0)');
    
    ringCtx.fillStyle = ringGradient;
    ringCtx.fillRect(0, 0, 512, 64);
    
    // Add some sparkle/detail
    for (let i = 0; i < 200; i++) {
        ringCtx.fillStyle = `rgba(255, 255, 200, ${Math.random() * 0.3})`;
        ringCtx.fillRect(Math.random() * 512, Math.random() * 64, 2, 2);
    }
    
    const ringTexture = new THREE.CanvasTexture(ringCanvas);
    
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.9
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    saturnGroup.add(ring);
    
    // Position Saturn in the background (opposite side from Earth)
    saturnGroup.position.set(120, 30, -180);
    saturnGroup.rotation.x = 0.4;
    saturnGroup.rotation.z = -0.2;
    
    scene.add(saturnGroup);
    return saturnGroup;
}

const saturn = createSaturn();

// Space Lighting
const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
scene.add(ambientLight);

// Distant star/sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(50, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Blue nebula glow
const blueLight = new THREE.PointLight(0x4488ff, 0.8, 150);
blueLight.position.set(-50, 30, -50);
scene.add(blueLight);

// Purple nebula glow
const purpleLight = new THREE.PointLight(0x8844ff, 0.6, 150);
purpleLight.position.set(60, 50, 40);
scene.add(purpleLight);

// Warm distant star
const warmLight = new THREE.PointLight(0xff8844, 0.5, 200);
warmLight.position.set(0, 80, -80);
scene.add(warmLight);

// Materials
const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.3,
    metalness: 0.8,
    transparent: true,
    opacity: 0.6
});

const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b35,
    emissive: 0xff6b35,
    emissiveIntensity: 0.8
});

const playerMaterial = new THREE.MeshStandardMaterial({
    color: 0xf7c59f,
    roughness: 0.4,
    metalness: 0.2
});

// Create Player
function createPlayer() {
    const group = new THREE.Group();
    
    // Body with its own material for color changing
    const bodyGeometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.4,
        metalness: 0.3,
        emissive: 0xff0000,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = PLAYER_HEIGHT / 2;
    group.add(body);
    
    // Store reference for color cycling
    group.userData.bodyMesh = body;
    group.userData.bodyMaterial = bodyMaterial;
    
    // Limb material (slightly darker)
    const limbMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc0000,
        roughness: 0.5,
        metalness: 0.2
    });
    group.userData.limbMaterial = limbMaterial;
    
    // === ARMS ===
    // Left arm pivot
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.45, PLAYER_HEIGHT - 0.6, 0);
    group.add(leftArmPivot);
    
    const leftArmGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
    const leftArm = new THREE.Mesh(leftArmGeo, limbMaterial);
    leftArm.position.y = -0.25;
    leftArmPivot.add(leftArm);
    
    // Left hand
    const handGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.6 });
    const leftHand = new THREE.Mesh(handGeo, handMaterial);
    leftHand.position.y = -0.5;
    leftArmPivot.add(leftHand);
    
    group.userData.leftArm = leftArmPivot;
    
    // Right arm pivot
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.45, PLAYER_HEIGHT - 0.6, 0);
    group.add(rightArmPivot);
    
    const rightArm = new THREE.Mesh(leftArmGeo.clone(), limbMaterial);
    rightArm.position.y = -0.25;
    rightArmPivot.add(rightArm);
    
    // Right hand
    const rightHand = new THREE.Mesh(handGeo.clone(), handMaterial);
    rightHand.position.y = -0.5;
    rightArmPivot.add(rightHand);
    
    group.userData.rightArm = rightArmPivot;
    
    // === LEGS ===
    // Left leg pivot
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.2, 0.5, 0);
    group.add(leftLegPivot);
    
    const legGeo = new THREE.CapsuleGeometry(0.12, 0.35, 4, 8);
    const leftLeg = new THREE.Mesh(legGeo, limbMaterial);
    leftLeg.position.y = -0.25;
    leftLegPivot.add(leftLeg);
    
    // Left foot
    const footGeo = new THREE.BoxGeometry(0.18, 0.1, 0.3);
    const footMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const leftFoot = new THREE.Mesh(footGeo, footMaterial);
    leftFoot.position.set(0, -0.5, 0.05);
    leftLegPivot.add(leftFoot);
    
    group.userData.leftLeg = leftLegPivot;
    
    // Right leg pivot
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.2, 0.5, 0);
    group.add(rightLegPivot);
    
    const rightLeg = new THREE.Mesh(legGeo.clone(), limbMaterial);
    rightLeg.position.y = -0.25;
    rightLegPivot.add(rightLeg);
    
    // Right foot
    const rightFoot = new THREE.Mesh(footGeo.clone(), footMaterial);
    rightFoot.position.set(0, -0.5, 0.05);
    rightLegPivot.add(rightFoot);
    
    group.userData.rightLeg = rightLegPivot;
    
    // Eyes that also change color
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e, 
        emissive: 0x00ffff, 
        emissiveIntensity: 0.8 
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, PLAYER_HEIGHT - 0.4, 0.3);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, PLAYER_HEIGHT - 0.4, 0.3);
    group.add(rightEye);
    
    // Store eye material reference
    group.userData.eyeMaterial = eyeMaterial;
    
    // Create name tag "Bob"
    const nameTag = createNameTag("Bob");
    nameTag.position.set(0, PLAYER_HEIGHT + 0.5, 0);
    group.add(nameTag);
    group.userData.nameTag = nameTag;
    
    // Animation state
    group.userData.isJumping = false;
    group.userData.walkCycle = 0;
    
    group.position.set(0, 5, 0);
    scene.add(group);
    
    return group;
}

// Animate player limbs
function animatePlayerLimbs(deltaTime) {
    if (!player) return;
    
    const isMoving = state.keys['KeyW'] || state.keys['KeyS'] || state.keys['KeyA'] || state.keys['KeyD'];
    const isJumping = !state.playerOnGround;
    
    if (isJumping) {
        // Jumping pose - arms up, legs tucked
        if (player.userData.leftArm) {
            player.userData.leftArm.rotation.z = -0.8; // Arms up
            player.userData.leftArm.rotation.x = -0.3;
        }
        if (player.userData.rightArm) {
            player.userData.rightArm.rotation.z = 0.8;
            player.userData.rightArm.rotation.x = -0.3;
        }
        if (player.userData.leftLeg) {
            player.userData.leftLeg.rotation.x = 0.5; // Legs tucked forward
        }
        if (player.userData.rightLeg) {
            player.userData.rightLeg.rotation.x = 0.5;
        }
    } else if (isMoving) {
        // Walking animation
        player.userData.walkCycle += deltaTime * 10;
        const swing = Math.sin(player.userData.walkCycle) * 0.5;
        
        if (player.userData.leftArm) {
            player.userData.leftArm.rotation.x = swing;
            player.userData.leftArm.rotation.z = 0;
        }
        if (player.userData.rightArm) {
            player.userData.rightArm.rotation.x = -swing;
            player.userData.rightArm.rotation.z = 0;
        }
        if (player.userData.leftLeg) {
            player.userData.leftLeg.rotation.x = -swing;
        }
        if (player.userData.rightLeg) {
            player.userData.rightLeg.rotation.x = swing;
        }
    } else {
        // Idle - return to neutral with slight sway
        const idleSway = Math.sin(Date.now() * 0.002) * 0.1;
        
        if (player.userData.leftArm) {
            player.userData.leftArm.rotation.x = idleSway;
            player.userData.leftArm.rotation.z = 0;
        }
        if (player.userData.rightArm) {
            player.userData.rightArm.rotation.x = -idleSway;
            player.userData.rightArm.rotation.z = 0;
        }
        if (player.userData.leftLeg) {
            player.userData.leftLeg.rotation.x = 0;
        }
        if (player.userData.rightLeg) {
            player.userData.rightLeg.rotation.x = 0;
        }
    }
}

// Create a name tag sprite
function createNameTag(name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    // Background with rounded rectangle
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    roundRect(context, 10, 5, 236, 54, 10);
    context.fill();
    
    // Border
    context.strokeStyle = '#ff6b35';
    context.lineWidth = 3;
    roundRect(context, 10, 5, 236, 54, 10);
    context.stroke();
    
    // Text
    context.font = 'bold 36px Orbitron, Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Text shadow/glow
    context.shadowColor = '#ff6b35';
    context.shadowBlur = 10;
    context.fillStyle = '#ffffff';
    context.fillText(name, 128, 32);
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);
    
    return sprite;
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Create Platform
// Rainbow colors for platform tops
const rainbowColors = [
    0xff0000, // Red
    0xff7700, // Orange
    0xffff00, // Yellow
    0x00ff00, // Green
    0x0077ff, // Blue
    0x8800ff, // Indigo
    0xff00ff  // Violet
];
let platformColorIndex = 0;

function createPlatform(x, y, z, width, height, depth) {
    const group = new THREE.Group();
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const platform = new THREE.Mesh(geometry, platformMaterial);
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);
    
    // Rainbow glowing edge on top
    const rainbowColor = rainbowColors[platformColorIndex % rainbowColors.length];
    platformColorIndex++;
    
    const rainbowMaterial = new THREE.MeshStandardMaterial({
        color: rainbowColor,
        emissive: rainbowColor,
        emissiveIntensity: 0.8
    });
    
    const edgeGeometry = new THREE.BoxGeometry(width + 0.1, 0.15, depth + 0.1);
    const topEdge = new THREE.Mesh(edgeGeometry, rainbowMaterial);
    topEdge.position.y = height / 2;
    group.add(topEdge);
    
    group.position.set(x, y, z);
    group.userData.bounds = {
        minX: x - width / 2,
        maxX: x + width / 2,
        minY: y - height / 2,
        maxY: y + height / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2
    };
    
    scene.add(group);
    state.platforms.push(group);
    
    return group;
}

// Create Coin
function createCoin(x, y, z) {
    const group = new THREE.Group();
    
    const coinGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.5,
        metalness: 0.9
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.z = Math.PI / 2;
    group.add(coin);
    
    group.position.set(x, y, z);
    group.userData.collected = false;
    group.userData.baseY = y;
    
    scene.add(group);
    state.collectibles.push(group);
    
    return group;
}

// Victory Orb - the goal at the end!
let victoryOrb = null;

function createVictoryOrb(x, y, z) {
    const orbGroup = new THREE.Group();
    
    // Main orb - glowing sphere
    const orbGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
        metalness: 0.3,
        roughness: 0.1
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orbGroup.add(orb);
    
    // Inner core - brighter
    const coreGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    orbGroup.add(core);
    
    // Outer glow ring 1
    const ring1Geometry = new THREE.TorusGeometry(1.8, 0.08, 16, 64);
    const ring1Material = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.7
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 2;
    orbGroup.add(ring1);
    
    // Outer glow ring 2
    const ring2Geometry = new THREE.TorusGeometry(2.2, 0.06, 16, 64);
    const ring2Material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    orbGroup.add(ring2);
    
    // Outer glow ring 3
    const ring3Geometry = new THREE.TorusGeometry(2.5, 0.04, 16, 64);
    const ring3Material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.4
    });
    const ring3 = new THREE.Mesh(ring3Geometry, ring3Material);
    ring3.rotation.x = Math.PI / 6;
    ring3.rotation.z = Math.PI / 3;
    orbGroup.add(ring3);
    
    // Sparkle particles around the orb
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 30;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 2 + Math.random() * 1.5;
        
        sparklePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        sparklePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        sparklePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    
    const sparkleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    orbGroup.add(sparkles);
    
    // Store references for animation
    orbGroup.userData.orb = orb;
    orbGroup.userData.core = core;
    orbGroup.userData.ring1 = ring1;
    orbGroup.userData.ring2 = ring2;
    orbGroup.userData.ring3 = ring3;
    orbGroup.userData.sparkles = sparkles;
    orbGroup.userData.baseY = y;
    
    orbGroup.position.set(x, y, z);
    
    scene.add(orbGroup);
    victoryOrb = orbGroup;
    
    return orbGroup;
}

// Create background particles
function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(300 * 3);
    
    for (let i = 0; i < 300; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 50 - 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.3,
        color: 0xff6b35,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    return particles;
}

// Player instance
const player = createPlayer();
const particleSystem = createParticles();

// Initialize Journey Mode
// Platform configurations for each difficulty
const difficultyConfigs = {
    easy: {
        mainSize: 14,
        platforms: [
            { x: 0, y: 2, z: 4, w: 7, d: 7 },
            { x: 0, y: 4, z: -3, w: 7, d: 7 },
            { x: 2, y: 6, z: 3, w: 6, d: 6 },
            { x: -2, y: 8, z: -2, w: 6, d: 6 },
            { x: 1, y: 10, z: 2, w: 6, d: 6 },
            { x: -1, y: 12, z: -1, w: 6, d: 6 },
            { x: 0, y: 14, z: 1, w: 6, d: 6 },
            { x: 0, y: 16, z: 0, w: 8, d: 8 }  // Summit
        ]
    },
    normal: {
        mainSize: 12,
        platforms: [
            { x: 0, y: 2, z: 5, w: 5, d: 5 },
            { x: 0, y: 4, z: -3, w: 5, d: 5 },
            { x: 3, y: 6, z: 2, w: 4, d: 4 },
            { x: -2, y: 8, z: -2, w: 4, d: 4 },
            { x: 1, y: 10, z: 3, w: 4, d: 4 },
            { x: -1, y: 12, z: -1, w: 4, d: 4 },
            { x: 2, y: 14, z: 0, w: 4, d: 4 },
            { x: -2, y: 16, z: 2, w: 4, d: 4 },
            { x: 0, y: 18, z: -2, w: 4, d: 4 },
            { x: 0, y: 20, z: 0, w: 6, d: 6 }  // Summit
        ]
    },
    hard: {
        mainSize: 10,
        platforms: [
            // Small platforms, still reachable (max 2 unit vertical, 6 unit horizontal)
            { x: 3, y: 2, z: 4, w: 3, d: 3 },
            { x: -2, y: 4, z: 0, w: 3, d: 3 },
            { x: 3, y: 6, z: -3, w: 2.5, d: 2.5 },
            { x: -1, y: 8, z: 2, w: 2.5, d: 2.5 },
            { x: 4, y: 10, z: -1, w: 2.5, d: 2.5 },
            { x: 0, y: 12, z: 3, w: 2.5, d: 2.5 },
            { x: -3, y: 14, z: -2, w: 2.5, d: 2.5 },
            { x: 2, y: 16, z: 1, w: 2.5, d: 2.5 },
            { x: -2, y: 18, z: -1, w: 2.5, d: 2.5 },
            { x: 1, y: 20, z: 2, w: 2.5, d: 2.5 },
            { x: -1, y: 22, z: -2, w: 2.5, d: 2.5 },
            { x: 0, y: 24, z: 0, w: 4, d: 4 }  // Summit
        ]
    },
    extreme: {
        mainSize: 8,
        platforms: [
            // Tiny platforms, tight jumps but still possible (max 2 unit vertical, 5 unit horizontal)
            { x: 3, y: 2, z: 3, w: 2, d: 2 },
            { x: -1, y: 4, z: -1, w: 2, d: 2 },
            { x: 3, y: 6, z: 2, w: 1.8, d: 1.8 },
            { x: -2, y: 8, z: -2, w: 1.8, d: 1.8 },
            { x: 2, y: 10, z: 1, w: 1.8, d: 1.8 },
            { x: -1, y: 12, z: -3, w: 1.8, d: 1.8 },
            { x: 3, y: 14, z: 0, w: 1.5, d: 1.5 },
            { x: -2, y: 16, z: 2, w: 1.5, d: 1.5 },
            { x: 1, y: 18, z: -2, w: 1.5, d: 1.5 },
            { x: -1, y: 20, z: 1, w: 1.5, d: 1.5 },
            { x: 2, y: 22, z: -1, w: 1.5, d: 1.5 },
            { x: -2, y: 24, z: 2, w: 1.5, d: 1.5 },
            { x: 1, y: 26, z: -1, w: 1.5, d: 1.5 },
            { x: -1, y: 28, z: 1, w: 1.5, d: 1.5 },
            { x: 0, y: 30, z: 0, w: 3, d: 3 }  // Summit
        ]
    }
};

function initJourneyMode(difficulty = 'normal') {
    clearScene();
    platformColorIndex = 0; // Reset rainbow colors
    state.revealedPlatforms = new Set([0]); // Track revealed platforms, start with main
    state.currentPlatformIndex = 0;
    
    const config = difficultyConfigs[difficulty] || difficultyConfigs.normal;
    
    // Main platform (always visible)
    createPlatform(0, 0, 0, config.mainSize, 2, config.mainSize);
    state.platforms[0].userData.revealed = true;
    state.platforms[0].userData.level = 0;
    
    // Journey platforms - initially hidden
    const configs = config.platforms;
    
    configs.forEach((c, i) => {
        const platform = createPlatform(c.x, c.y, c.z, c.w, 1.5, c.d);
        platform.userData.level = i + 1;
        platform.userData.revealed = false;
        // Hide platform initially
        platform.visible = false;
        platform.scale.set(0, 0, 0);
    });
    
    // Reveal first platform above main
    revealPlatform(1);
    
    // Place coins (they'll appear with platforms)
    state.platforms.forEach((platform, i) => {
        if (i > 0 && platform.userData.bounds) {
            const b = platform.userData.bounds;
            const coin = createCoin((b.minX + b.maxX) / 2, b.maxY + 1.5, (b.minZ + b.maxZ) / 2);
            coin.userData.platformLevel = i;
            coin.visible = platform.visible; // Match platform visibility
        }
    });
    
    // Add victory orb on the last platform!
    if (state.platforms.length > 1) {
        const lastPlatform = state.platforms[state.platforms.length - 1];
        if (lastPlatform && lastPlatform.userData.bounds) {
            const b = lastPlatform.userData.bounds;
            createVictoryOrb(
                (b.minX + b.maxX) / 2,
                b.maxY + 3,
                (b.minZ + b.maxZ) / 2
            );
            victoryOrb.visible = false; // Hidden until platform is revealed
            victoryOrb.userData.platformLevel = state.platforms.length - 1;
        }
    }
    
    // Reset player
    player.position.set(0, 5, 0);
    state.playerVelocity.set(0, 0, 0);
    state.coins = 0;
    state.maxHeight = 0;
    state.battleMode = false;
    
    // Remove gloves and show arms again
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    updateHUD();
}

// Initialize Battle Mode
function initBattleMode() {
    clearScene();
    platformColorIndex = 0; // Reset rainbow colors
    
    // Boxing ring platform
    createPlatform(0, 0, 0, 20, 2, 20);
    
    // Add boxing ring elements
    createBoxingRing();
    
    // Reset player
    player.position.set(-5, 3, 0);
    state.playerVelocity.set(0, 0, 0);
    state.battleMode = true;
    state.playerHealth = 100;
    state.opponentHealth = 100;
    state.punchCooldown = 0;
    state.headbuttCooldown = 0;
    
    // Hide arms and add gloves to player
    if (player.userData.leftArm) player.userData.leftArm.visible = false;
    if (player.userData.rightArm) player.userData.rightArm.visible = false;
    addGlovesToCharacter(player, 0x0066ff);
    
    // Create opponent
    createOpponent();
    
    // Update HUD labels
    document.querySelector('#hud .hud-item:first-child .label').textContent = 'YOUR HP';
    document.querySelector('#hud .hud-item:nth-child(2) .label').textContent = 'ENEMY HP';
    document.getElementById('altitude-value').textContent = '100';
    document.getElementById('coins-value').textContent = '100';
}

// Create boxing ring decorations
function createBoxingRing() {
    const ringSize = 9; // Half size of ring
    
    // Corner post material (red)
    const postMaterial = new THREE.MeshStandardMaterial({
        color: 0xe94560,
        emissive: 0xe94560,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.8
    });
    
    // Corner post positions
    const corners = [
        { x: ringSize, z: ringSize },
        { x: -ringSize, z: ringSize },
        { x: ringSize, z: -ringSize },
        { x: -ringSize, z: -ringSize }
    ];
    
    // Create corner posts
    corners.forEach(corner => {
        const postGeometry = new THREE.CylinderGeometry(0.3, 0.4, 5, 16);
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(corner.x, 3.5, corner.z);
        post.castShadow = true;
        scene.add(post);
        state.ringElements = state.ringElements || [];
        state.ringElements.push(post);
        
        // Post top cap
        const capGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const cap = new THREE.Mesh(capGeometry, postMaterial);
        cap.position.set(corner.x, 6, corner.z);
        scene.add(cap);
        state.ringElements.push(cap);
    });
    
    // Rope materials (3 colors)
    const ropeColors = [
        { color: 0xff0000, emissive: 0xff0000 }, // Red - bottom
        { color: 0xffffff, emissive: 0xffffff }, // White - middle
        { color: 0x0066ff, emissive: 0x0066ff }  // Blue - top
    ];
    
    const ropeHeights = [2, 3.5, 5];
    
    ropeHeights.forEach((height, colorIndex) => {
        const ropeMat = new THREE.MeshStandardMaterial({
            color: ropeColors[colorIndex].color,
            emissive: ropeColors[colorIndex].emissive,
            emissiveIntensity: 0.2,
            roughness: 0.6
        });
        
        // North rope
        const ropeN = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, ringSize * 2, 8),
            ropeMat
        );
        ropeN.rotation.z = Math.PI / 2;
        ropeN.position.set(0, height, ringSize);
        scene.add(ropeN);
        state.ringElements.push(ropeN);
        
        // South rope
        const ropeS = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, ringSize * 2, 8),
            ropeMat
        );
        ropeS.rotation.z = Math.PI / 2;
        ropeS.position.set(0, height, -ringSize);
        scene.add(ropeS);
        state.ringElements.push(ropeS);
        
        // East rope
        const ropeE = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, ringSize * 2, 8),
            ropeMat
        );
        ropeE.rotation.x = Math.PI / 2;
        ropeE.position.set(ringSize, height, 0);
        scene.add(ropeE);
        state.ringElements.push(ropeE);
        
        // West rope
        const ropeW = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, ringSize * 2, 8),
            ropeMat
        );
        ropeW.rotation.x = Math.PI / 2;
        ropeW.position.set(-ringSize, height, 0);
        scene.add(ropeW);
        state.ringElements.push(ropeW);
    });
    
    // Corner padding (turnbuckle pads)
    const padMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 0.2
    });
    
    corners.forEach(corner => {
        const padGeometry = new THREE.BoxGeometry(1.5, 3.5, 1.5);
        const pad = new THREE.Mesh(padGeometry, padMaterial);
        pad.position.set(corner.x, 3.5, corner.z);
        scene.add(pad);
        state.ringElements.push(pad);
    });
    
    // Ring canvas mat texture (center logo area)
    const matMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        emissive: 0xff6b35,
        emissiveIntensity: 0.05,
        roughness: 0.9
    });
    
    const matGeometry = new THREE.CircleGeometry(5, 32);
    const ringMat = new THREE.Mesh(matGeometry, matMaterial);
    ringMat.rotation.x = -Math.PI / 2;
    ringMat.position.set(0, 1.01, 0);
    scene.add(ringMat);
    state.ringElements.push(ringMat);
    
    // Center ring circle
    const circleMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 0.3
    });
    
    const ringCircle = new THREE.Mesh(
        new THREE.RingGeometry(4.5, 5, 32),
        circleMaterial
    );
    ringCircle.rotation.x = -Math.PI / 2;
    ringCircle.position.set(0, 1.02, 0);
    scene.add(ringCircle);
    state.ringElements.push(ringCircle);
    
    // Corner markers (blue and red corners)
    const blueCornerMat = new THREE.MeshStandardMaterial({
        color: 0x0066ff,
        emissive: 0x0066ff,
        emissiveIntensity: 0.3
    });
    
    const redCornerMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
    });
    
    // Blue corner (player's corner)
    const blueCorner = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        blueCornerMat
    );
    blueCorner.rotation.x = -Math.PI / 2;
    blueCorner.position.set(-ringSize + 1.5, 1.03, -ringSize + 1.5);
    scene.add(blueCorner);
    state.ringElements.push(blueCorner);
    
    // Red corner (opponent's corner)
    const redCorner = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        redCornerMat
    );
    redCorner.rotation.x = -Math.PI / 2;
    redCorner.position.set(ringSize - 1.5, 1.03, ringSize - 1.5);
    scene.add(redCorner);
    state.ringElements.push(redCorner);
}

// Add boxing gloves to a character
function addGlovesToCharacter(character, color) {
    // Create space-themed galaxy texture for gloves
    const gloveCanvas = document.createElement('canvas');
    gloveCanvas.width = 128;
    gloveCanvas.height = 128;
    const ctx = gloveCanvas.getContext('2d');
    
    // Deep space background
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, '#1a0033');
    gradient.addColorStop(0.3, '#0d001a');
    gradient.addColorStop(0.6, '#1a0044');
    gradient.addColorStop(1, '#000011');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    // Add nebula swirls
    for (let i = 0; i < 5; i++) {
        const nebulaGradient = ctx.createRadialGradient(
            Math.random() * 128, Math.random() * 128, 0,
            Math.random() * 128, Math.random() * 128, 40
        );
        const colors = ['#ff00ff', '#00ffff', '#ff6600', '#6600ff', '#00ff66'];
        nebulaGradient.addColorStop(0, colors[i] + '44');
        nebulaGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(0, 0, 128, 128);
    }
    
    // Add stars
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const size = Math.random() * 2 + 0.5;
        const brightness = Math.random();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + brightness * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Star glow
        if (brightness > 0.7) {
            ctx.fillStyle = `rgba(200, 220, 255, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const gloveTexture = new THREE.CanvasTexture(gloveCanvas);
    
    const gloveMaterial = new THREE.MeshStandardMaterial({
        map: gloveTexture,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x220044,
        emissiveIntensity: 0.4
    });
    
    // Left glove with stars
    const leftGlove = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), gloveMaterial);
    leftGlove.position.set(-0.7, PLAYER_HEIGHT / 2 + 0.3, 0.5);
    leftGlove.scale.set(1, 0.8, 1.2);
    character.add(leftGlove);
    character.userData.leftGlove = leftGlove;
    
    // Add glowing ring around left glove
    const ringGeometry = new THREE.TorusGeometry(0.38, 0.03, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.7 
    });
    const leftRing = new THREE.Mesh(ringGeometry, ringMaterial);
    leftRing.rotation.x = Math.PI / 2;
    leftGlove.add(leftRing);
    
    // Right glove with stars
    const rightGlove = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), gloveMaterial.clone());
    rightGlove.position.set(0.7, PLAYER_HEIGHT / 2 + 0.3, 0.5);
    rightGlove.scale.set(1, 0.8, 1.2);
    character.add(rightGlove);
    character.userData.rightGlove = rightGlove;
    
    // Add glowing ring around right glove
    const rightRing = new THREE.Mesh(ringGeometry.clone(), new THREE.MeshBasicMaterial({ 
        color: 0xff00ff, 
        transparent: true, 
        opacity: 0.7 
    }));
    rightRing.rotation.x = Math.PI / 2;
    rightGlove.add(rightRing);
    
    // Store ring references for animation
    character.userData.leftGloveRing = leftRing;
    character.userData.rightGloveRing = rightRing;
}

// Create opponent
function createOpponent() {
    const group = new THREE.Group();
    
    const opponentMaterial = new THREE.MeshStandardMaterial({
        color: 0xe94560,
        roughness: 0.4,
        metalness: 0.2
    });
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 8, 16);
    const body = new THREE.Mesh(bodyGeometry, opponentMaterial);
    body.castShadow = true;
    body.position.y = PLAYER_HEIGHT / 2;
    group.add(body);
    
    // Angry eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xff0000, emissiveIntensity: 0.8 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, PLAYER_HEIGHT - 0.4, 0.3);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, PLAYER_HEIGHT - 0.4, 0.3);
    group.add(rightEye);
    
    // Add red gloves
    addGlovesToCharacter(group, 0xff0000);
    
    // Add name tag for opponent
    const nameTag = createNameTag("Rex");
    nameTag.position.set(0, PLAYER_HEIGHT + 0.5, 0);
    group.add(nameTag);
    
    group.position.set(5, 3, 0);
    group.userData.punchCooldown = 0;
    
    scene.add(group);
    state.opponent = group;
}

// Reveal a platform with animation
function revealPlatform(index) {
    if (index >= state.platforms.length) return;
    if (state.revealedPlatforms && state.revealedPlatforms.has(index)) return;
    
    const platform = state.platforms[index];
    if (!platform || platform.userData.revealed) return;
    
    platform.userData.revealed = true;
    platform.visible = true;
    state.revealedPlatforms.add(index);
    
    // Play reveal sound
    playRevealSound();
    
    // Animate platform appearing
    platform.scale.set(0.1, 0.1, 0.1);
    platform.userData.animating = true;
    platform.userData.targetScale = 1;
    
    // Also reveal the coin on this platform
    state.collectibles.forEach(coin => {
        if (coin.userData.platformLevel === index) {
            coin.visible = true;
        }
    });
    
    // Also reveal the victory orb if this is the last platform
    if (victoryOrb && victoryOrb.userData.platformLevel === index) {
        victoryOrb.visible = true;
    }
}

// Check if player landed on a platform and reveal next
function checkPlatformLanding(platformIndex) {
    if (!state.battleMode && platformIndex !== undefined) {
        // Reveal the next platform(s) above this one
        const nextIndex = platformIndex + 1;
        if (nextIndex < state.platforms.length) {
            revealPlatform(nextIndex);
        }
    }
}

// Clear scene
function clearScene() {
    // Remove all game objects from scene (keep player, lights, camera, stars, planets)
    const keepObjects = [player, ambientLight, sunLight, starField, earth, saturn, moon];
    
    // Get all children to remove
    const toRemove = [];
    scene.traverse((obj) => {
        if (obj !== scene && 
            !keepObjects.includes(obj) && 
            obj.type !== 'AmbientLight' && 
            obj.type !== 'DirectionalLight' &&
            !obj.isCamera) {
            // Check if it's not a child of player or other kept objects
            let isChildOfKept = false;
            for (const kept of keepObjects) {
                if (kept && kept.getObjectById && kept.getObjectById(obj.id)) {
                    isChildOfKept = true;
                    break;
                }
            }
            if (!isChildOfKept && obj.parent === scene) {
                toRemove.push(obj);
            }
        }
    });
    
    toRemove.forEach(obj => scene.remove(obj));
    
    // Ensure space background elements are in the scene
    if (starField && !scene.children.includes(starField)) scene.add(starField);
    if (earth && !scene.children.includes(earth)) scene.add(earth);
    if (saturn && !scene.children.includes(saturn)) scene.add(saturn);
    if (moon && !scene.children.includes(moon)) scene.add(moon);
    
    // Clear intervals
    if (state.basketballInterval) {
        clearInterval(state.basketballInterval);
        state.basketballInterval = null;
    }
    if (state.soccerInterval) {
        clearInterval(state.soccerInterval);
        state.soccerInterval = null;
    }
    
    // Reset all game object references
    victoryOrb = null;
    state.opponent = null;
    basketballOpponent = null;
    basketball = null;
    basketballHoop = null;
    soccerBall = null;
    soccerGoalPlayer = null;
    soccerGoalOpponent = null;
    soccerOpponent = null;
    golfBall = null;
    golfHole = null;
    golfFlag = null;
    windmillBlades = null;
    if (golfClub && player) {
        player.remove(golfClub);
    }
    golfClub = null;
    
    // Clear racing objects
    if (racingTrack) {
        scene.remove(racingTrack);
        racingTrack = null;
    }
    racingCheckpoints.forEach(cp => {
        // Find and remove checkpoint visuals
        scene.children.forEach(child => {
            if (child.userData && child.userData.checkpointIndex !== undefined) {
                scene.remove(child);
            }
        });
    });
    racingCheckpoints = [];
    racingAsteroids.forEach(asteroid => scene.remove(asteroid));
    racingAsteroids = [];
    if (racingOpponent) {
        scene.remove(racingOpponent);
        racingOpponent = null;
    }
    if (playerCar) {
        player.remove(playerCar);
        playerCar = null;
    }
    if (state.racingInterval) {
        clearInterval(state.racingInterval);
        state.racingInterval = null;
    }
    state.racingMode = false;
    
    // Restore player body visibility
    if (player && player.userData) {
        if (player.userData.body) player.userData.body.visible = true;
        if (player.userData.head) player.userData.head.visible = true;
        if (player.userData.leftArm) player.userData.leftArm.visible = true;
        if (player.userData.rightArm) player.userData.rightArm.visible = true;
        if (player.userData.leftLeg) player.userData.leftLeg.visible = true;
        if (player.userData.rightLeg) player.userData.rightLeg.visible = true;
        if (player.userData.nameTag) player.userData.nameTag.visible = true;
    }
    isSwinging = false;
    
    // Reset state
    state.platforms = [];
    state.collectibles = [];
    state.ringElements = [];
    state.revealedPlatforms = new Set();
    state.basketballMode = false;
    state.soccerMode = false;
    state.golfMode = false;
    state.racingMode = false;
    state.coinCollectorMode = false;
    state.survivalMode = false;
    
    // Clean up coin collector
    coinCollectorCoins.forEach(coin => scene.remove(coin));
    coinCollectorCoins = [];
    if (coinCollectorTed) {
        scene.remove(coinCollectorTed);
        coinCollectorTed = null;
    }
    if (state.coinCollectorInterval) {
        clearInterval(state.coinCollectorInterval);
        state.coinCollectorInterval = null;
    }
    if (state.coinSpawnInterval) {
        clearInterval(state.coinSpawnInterval);
        state.coinSpawnInterval = null;
    }
    
    // Clean up survival mode
    survivalTrees.forEach(tree => scene.remove(tree));
    survivalTrees = [];
    survivalEnemies.forEach(enemy => scene.remove(enemy));
    survivalEnemies = [];
    if (survivalForestGround) {
        scene.remove(survivalForestGround);
        survivalForestGround = null;
    }
    if (survivalSword) {
        player.remove(survivalSword);
        survivalSword = null;
    }
    swordSwinging = false;
    if (state.survivalInterval) {
        clearInterval(state.survivalInterval);
        state.survivalInterval = null;
    }
    
    // Clean up target practice
    state.targetPracticeMode = false;
    if (targetDummy) {
        scene.remove(targetDummy);
        targetDummy = null;
    }
    if (targetPracticeGround) {
        scene.remove(targetPracticeGround);
        targetPracticeGround = null;
    }
    if (targetPistol) {
        player.remove(targetPistol);
        targetPistol = null;
    }
    bullets.forEach(b => scene.remove(b));
    bullets = [];
    if (state.targetPracticeInterval) {
        clearInterval(state.targetPracticeInterval);
        state.targetPracticeInterval = null;
    }
    
    // Clean up speed race
    state.speedRaceMode = false;
    if (speedRaceTrack) {
        scene.remove(speedRaceTrack);
        speedRaceTrack = null;
    }
    if (speedRaceOpponent) {
        scene.remove(speedRaceOpponent);
        speedRaceOpponent = null;
    }
    speedRaceFinishLine = null;
    if (state.speedRaceInterval) {
        clearInterval(state.speedRaceInterval);
        state.speedRaceInterval = null;
    }
}

// Platform collision
function checkPlatformCollision(position, velocity) {
    let onGround = false;
    let newY = position.y;
    let landedPlatformIndex = undefined;
    
    for (let i = 0; i < state.platforms.length; i++) {
        const platform = state.platforms[i];
        const bounds = platform.userData.bounds;
        if (!bounds) continue;
        if (!platform.visible) continue; // Skip hidden platforms
        
        const playerBottom = position.y;
        
        if (position.x >= bounds.minX - PLAYER_RADIUS && 
            position.x <= bounds.maxX + PLAYER_RADIUS &&
            position.z >= bounds.minZ - PLAYER_RADIUS && 
            position.z <= bounds.maxZ + PLAYER_RADIUS) {
            
            if (velocity.y <= 0 && playerBottom <= bounds.maxY + 0.3 && playerBottom >= bounds.maxY - 0.5) {
                newY = bounds.maxY;
                onGround = true;
                velocity.y = 0;
                landedPlatformIndex = i;
            }
        }
    }
    
    return { onGround, newY, landedPlatformIndex };
}

// Player punch
function playerPunch() {
    if ((!state.battleMode && !state.boxFightsMode) || state.punchCooldown > 0 || state.gameOver) return;
    
    state.punchCooldown = 0.5;
    playPunchSound();
    
    // Animate glove
    if (player.userData.rightGlove) {
        const glove = player.userData.rightGlove;
        glove.position.z = 1.2;
        setTimeout(() => { if (glove) glove.position.z = 0.5; }, 150);
    }
    
    // Check hit
    if (state.opponent) {
        const dist = player.position.distanceTo(state.opponent.position);
        if (dist < 3) {
            state.opponentHealth -= getPunchDamage();
            document.getElementById('coins-value').textContent = Math.max(0, state.opponentHealth);
            
            // Knockback opponent
            const dir = new THREE.Vector3().subVectors(state.opponent.position, player.position).normalize();
            state.opponent.position.x += dir.x * 2;
            state.opponent.position.z += dir.z * 2;
            
            if (state.opponentHealth <= 0) {
                endBattle(true);
            }
        }
    }
}

// Player headbutt - E key
function playerHeadbutt() {
    if ((!state.battleMode && !state.boxFightsMode) || state.headbuttCooldown > 0 || state.gameOver) return;
    
    state.headbuttCooldown = 1.2; // Longer cooldown than punch
    playHeadbuttSound();
    
    // Face opponent
    if (state.opponent) {
        const dir = new THREE.Vector3().subVectors(state.opponent.position, player.position);
        player.rotation.y = Math.atan2(dir.x, dir.z);
    }
    
    // Lean forward animation (rotate on X axis - positive = head forward)
    player.rotation.x = 0.8; // Lean forward
    
    // Return to upright after delay
    setTimeout(() => {
        player.rotation.x = 0;
    }, 250);
    
    // Check hit - headbutt has shorter range but more damage
    if (state.opponent) {
        const dist = player.position.distanceTo(state.opponent.position);
        if (dist < 2.5) {
            // Headbutt does 1.5x punch damage
            const damage = Math.floor(getPunchDamage() * 1.5);
            state.opponentHealth -= damage;
            document.getElementById('coins-value').textContent = Math.max(0, state.opponentHealth);
            
            // Bigger knockback
            const knockDir = new THREE.Vector3().subVectors(state.opponent.position, player.position).normalize();
            state.opponent.position.x += knockDir.x * 3;
            state.opponent.position.z += knockDir.z * 3;
            
            // Stun effect - opponent can't attack briefly
            state.opponent.userData.punchCooldown = 2;
            
            if (state.opponentHealth <= 0) {
                endBattle(true);
            }
        }
    }
}

// Headbutt sound
function playHeadbuttSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    // Impact thud
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    
    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    
    // Crack sound
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(800, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    
    gain2.gain.setValueAtTime(0.2, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.1);
}

// Update opponent AI
function updateOpponent(deltaTime) {
    if (!state.opponent || state.gameOver) return;
    
    const opponent = state.opponent;
    const dist = opponent.position.distanceTo(player.position);
    
    // Face player
    const dir = new THREE.Vector3().subVectors(player.position, opponent.position).normalize();
    opponent.rotation.y = Math.atan2(dir.x, dir.z);
    
    // Move towards player
    if (dist > 2.5) {
        opponent.position.x += dir.x * 3 * deltaTime;
        opponent.position.z += dir.z * 3 * deltaTime;
    }
    
    // Keep on platform
    opponent.position.x = Math.max(-8, Math.min(8, opponent.position.x));
    opponent.position.z = Math.max(-8, Math.min(8, opponent.position.z));
    opponent.position.y = 3;
    
    // Punch cooldown
    if (opponent.userData.punchCooldown > 0) {
        opponent.userData.punchCooldown -= deltaTime;
    }
    
    // AI punch
    if (dist < 2.5 && opponent.userData.punchCooldown <= 0 && Math.random() < 0.03) {
        opponent.userData.punchCooldown = 1.5;
        
        // Animate glove
        if (opponent.userData.rightGlove) {
            const glove = opponent.userData.rightGlove;
            glove.position.z = 1.2;
            setTimeout(() => { if (glove) glove.position.z = 0.5; }, 150);
        }
        
        // Hit player
        state.playerHealth -= 10;
        document.getElementById('altitude-value').textContent = Math.max(0, state.playerHealth);
        playHitSound();
        
        // Knockback player
        const knockDir = new THREE.Vector3().subVectors(player.position, opponent.position).normalize();
        state.playerVelocity.x = knockDir.x * 8;
        state.playerVelocity.z = knockDir.z * 8;
        state.playerVelocity.y = 3;
        
        if (state.playerHealth <= 0) {
            endBattle(false);
        }
    }
}

// End battle
function endBattle(playerWon) {
    if (playerWon) {
        state.careerStats.battlesWon += 1;
        state.careerStats.knockouts += 1;
        saveData();
    }
    showGameOver(playerWon, true);
}

// Epic game over screen
function showGameOver(victory, isBattle = false) {
    state.gameOver = true;
    document.getElementById('hud').classList.add('hidden');
    
    const gameOverEl = document.getElementById('game-over');
    const skullIcon = document.querySelector('.skull-icon');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    const scoreEl = document.getElementById('final-score');
    const heightEl = document.getElementById('final-height');
    
    // Set victory class for golden styling
    if (victory) {
        gameOverEl.classList.add('victory');
    } else {
        gameOverEl.classList.remove('victory');
        // Play death sound with lasers!
        playDeathSound();
    }
    
    // Update content based on game mode and outcome
    if (isBattle) {
        if (victory) {
            skullIcon.textContent = '🏆';
            title.textContent = 'KNOCKOUT!';
            message.textContent = 'You defeated your opponent!';
            scoreEl.textContent = state.opponentHealth <= 0 ? 'KO' : state.opponentHealth;
            heightEl.textContent = state.playerHealth;
            document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'ENEMY HP';
            document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'YOUR HP';
        } else {
            skullIcon.textContent = '💀';
            title.textContent = 'KNOCKED OUT!';
            message.textContent = 'You were defeated...';
            scoreEl.textContent = state.playerHealth <= 0 ? 'KO' : state.playerHealth;
            heightEl.textContent = state.opponentHealth;
            document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'YOUR HP';
            document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'ENEMY HP';
        }
    } else {
        // Journey mode
        skullIcon.textContent = '💀';
        title.textContent = 'FELL INTO THE VOID';
        message.textContent = getRandomDeathMessage();
        scoreEl.textContent = state.coins;
        heightEl.textContent = Math.floor(state.maxHeight);
        document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'COINS';
        document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'MAX HEIGHT';
    }
    
    gameOverEl.classList.remove('hidden');
}

// Random death messages
function getRandomDeathMessage() {
    const messages = [
        'The void claims another...',
        'Gravity always wins.',
        'Better luck next time!',
        'The sky wasn\'t the limit after all.',
        'Down, down, down you go...',
        'That\'s gonna leave a mark!',
        'Insert coin to continue... oh wait.',
        'Ground control to Major Tom...',
        'Achievement unlocked: Meet the void!',
        'You tried. That\'s what counts... right?'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Victory screen
function showVictory() {
    state.reachedSummit = true;
    state.gameOver = true;
    
    // Play victory sound
    playVictorySound();
    
    document.getElementById('hud').classList.add('hidden');
    
    const victoryScreen = document.getElementById('victory-screen');
    victoryScreen.classList.remove('hidden');
    
    // Update victory stats
    document.getElementById('victory-coins').textContent = state.coins;
    document.getElementById('victory-height').textContent = Math.floor(state.maxHeight);
    document.getElementById('victory-difficulty').textContent = (state.difficulty || 'normal').toUpperCase();
    
    // Bonus coins for completing the level
    const bonusCoins = { easy: 5, normal: 10, hard: 20, extreme: 50 };
    const bonus = bonusCoins[state.difficulty] || 10;
    state.totalCoins += bonus;
    
    // Update career stats
    state.careerStats.journeysCompleted += 1;
    state.careerStats.coinsEarned += bonus + state.coins;
    if (state.maxHeight > state.careerStats.maxHeightEver) {
        state.careerStats.maxHeightEver = Math.floor(state.maxHeight);
    }
    saveData();
    
    document.getElementById('victory-bonus').textContent = bonus;
}

// Victory sound
function playVictorySound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    // Play a triumphant fanfare
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        
        oscillator.start(ctx.currentTime + i * 0.15);
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
}

// Death sound - dramatic falling into void
function playDeathSound() {
    const ctx = initAudio();
    if (!ctx) return;
    
    // Descending doom sound
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    const gainNode2 = ctx.createGain();
    
    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);
    gainNode1.connect(ctx.destination);
    gainNode2.connect(ctx.destination);
    
    // Main descending tone
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.5);
    
    gainNode1.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    
    // Low rumble
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5);
    
    gainNode2.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    
    oscillator1.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + 1.5);
    oscillator2.start(ctx.currentTime);
    oscillator2.stop(ctx.currentTime + 1.5);
    
    // Add some "laser zap" sounds for the lasers on screen
    setTimeout(() => {
        const zapOsc = ctx.createOscillator();
        const zapGain = ctx.createGain();
        zapOsc.connect(zapGain);
        zapGain.connect(ctx.destination);
        
        zapOsc.type = 'square';
        zapOsc.frequency.setValueAtTime(2000, ctx.currentTime);
        zapOsc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        
        zapGain.gain.setValueAtTime(0.15, ctx.currentTime);
        zapGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        zapOsc.start(ctx.currentTime);
        zapOsc.stop(ctx.currentTime + 0.3);
    }, 200);
    
    // Another zap
    setTimeout(() => {
        const zapOsc = ctx.createOscillator();
        const zapGain = ctx.createGain();
        zapOsc.connect(zapGain);
        zapGain.connect(ctx.destination);
        
        zapOsc.type = 'square';
        zapOsc.frequency.setValueAtTime(1500, ctx.currentTime);
        zapOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        
        zapGain.gain.setValueAtTime(0.12, ctx.currentTime);
        zapGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        zapOsc.start(ctx.currentTime);
        zapOsc.stop(ctx.currentTime + 0.25);
    }, 500);
    
    // Rocket whoosh sounds
    setTimeout(() => {
        const rocketOsc = ctx.createOscillator();
        const rocketGain = ctx.createGain();
        const rocketFilter = ctx.createBiquadFilter();
        
        rocketOsc.connect(rocketFilter);
        rocketFilter.connect(rocketGain);
        rocketGain.connect(ctx.destination);
        
        // White noise-ish rocket sound
        rocketOsc.type = 'sawtooth';
        rocketOsc.frequency.setValueAtTime(100, ctx.currentTime);
        rocketOsc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
        
        rocketFilter.type = 'bandpass';
        rocketFilter.frequency.setValueAtTime(500, ctx.currentTime);
        rocketFilter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.5);
        rocketFilter.Q.value = 2;
        
        rocketGain.gain.setValueAtTime(0.15, ctx.currentTime);
        rocketGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2);
        rocketGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        
        rocketOsc.start(ctx.currentTime);
        rocketOsc.stop(ctx.currentTime + 0.6);
    }, 300);
    
    // Second rocket
    setTimeout(() => {
        const rocketOsc = ctx.createOscillator();
        const rocketGain = ctx.createGain();
        
        rocketOsc.connect(rocketGain);
        rocketGain.connect(ctx.destination);
        
        rocketOsc.type = 'sawtooth';
        rocketOsc.frequency.setValueAtTime(150, ctx.currentTime);
        rocketOsc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.4);
        
        rocketGain.gain.setValueAtTime(0.1, ctx.currentTime);
        rocketGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
        rocketGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        rocketOsc.start(ctx.currentTime);
        rocketOsc.stop(ctx.currentTime + 0.5);
    }, 700);
}

// Return to title screen
function returnToTitle() {
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
    
    // Reset game state
    state.started = false;
    state.gameOver = false;
    state.reachedSummit = false;
    state.battleMode = false;
    state.boxFightsMode = false;
    state.basketballMode = false;
    resetMouseControl();
    
    // Reset HUD label
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    // Clear the scene
    clearScene();
    
    // Create title screen platform
    platformColorIndex = 0;
    createPlatform(0, 0, 0, 12, 2, 12);
    
    // Reset player position
    player.position.set(0, 5, 0);
    state.playerVelocity.set(0, 0, 0);
    
    // Remove gloves and show arms again
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
}

// Update HUD
function updateHUD() {
    if (!state.battleMode && !state.boxFightsMode) {
        document.getElementById('altitude-value').textContent = Math.floor(player.position.y);
        document.getElementById('coins-value').textContent = state.coins;
    }
}

// Input handling
document.addEventListener('keydown', (e) => {
    state.keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
    
    // Q to punch in battle mode
    if (e.code === 'KeyQ' && state.battleMode) {
        playerPunch();
    }
    
    // E to headbutt in battle mode, or shoot in box fights
    if (e.code === 'KeyE' && state.battleMode) {
        playerHeadbutt();
    }
    if (e.code === 'KeyE' && state.boxFightsMode) {
        boxFightsShoot();
    }
    
    // R for spin attack in battle mode
    if (e.code === 'KeyR' && state.battleMode) {
        doSpinAttack();
    }
    
    // M to shoot basketball
    if (e.code === 'KeyM' && state.basketballMode) {
        shootBasketball();
    }
    
    // N to grab basketball
    if (e.code === 'KeyN' && state.basketballMode && basketball) {
        const dist = player.position.distanceTo(basketball.position);
        if (dist < 3 && !state.holdingBall) {
            state.holdingBall = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    state.keys[e.code] = false;
});

// Click to punch
canvas.addEventListener('click', () => {
    if (state.battleMode && state.started && !state.gameOver) {
        playerPunch();
    }
});

// Reset controls when entering game modes
function resetMouseControl() {
    // Clear any stuck keys
    state.keys = {};
}

// Game loop
let lastTime = 0;
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    
    if (state.started && !state.gameOver) {
        // Movement (keyboard or trackpad/mouse)
        const moveDir = new THREE.Vector3();
        
        // Keyboard controls
        if (state.keys['KeyW'] || state.keys['ArrowUp']) moveDir.z += 1;
        if (state.keys['KeyS'] || state.keys['ArrowDown']) moveDir.z -= 1;
        if (state.keys['KeyA'] || state.keys['ArrowLeft']) moveDir.x += 1;
        if (state.keys['KeyD'] || state.keys['ArrowRight']) moveDir.x -= 1;
        
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            const camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);
            camDir.y = 0;
            camDir.normalize();
            
            const angle = Math.atan2(camDir.x, camDir.z);
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            
            const baseSpeed = (state.keys['ShiftLeft'] || state.keys['ShiftRight']) 
                ? MOVE_SPEED * SPRINT_MULTIPLIER 
                : MOVE_SPEED;
            const speed = baseSpeed * getSpeedMultiplier();
            
            state.playerVelocity.x = moveDir.x * speed;
            state.playerVelocity.z = moveDir.z * speed;
            
            player.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        } else {
            state.playerVelocity.x *= 0.85;
            state.playerVelocity.z *= 0.85;
        }
        
        // Jump
        if (state.keys['Space'] && state.playerOnGround) {
            state.playerVelocity.y = JUMP_FORCE * getJumpMultiplier();
            state.playerOnGround = false;
            state.hasDoubleJumped = false; // Reset double jump
            playJumpSound();
        } else if (state.keys['Space'] && !state.playerOnGround && isItemActive('rocket-boots') && !state.hasDoubleJumped) {
            // Double jump with rocket boots
            state.playerVelocity.y = JUMP_FORCE * getJumpMultiplier() * 0.8;
            state.hasDoubleJumped = true;
            playJumpSound();
        }
        
        // Gravity
        state.playerVelocity.y += GRAVITY * getGravityMultiplier() * deltaTime;
        
        // Update position
        player.position.x += state.playerVelocity.x * deltaTime;
        player.position.z += state.playerVelocity.z * deltaTime;
        player.position.y += state.playerVelocity.y * deltaTime;
        
        // Collision
        const collision = checkPlatformCollision(player.position, state.playerVelocity);
        const wasOnGround = state.playerOnGround;
        state.playerOnGround = collision.onGround;
        if (collision.onGround) {
            player.position.y = collision.newY;
            // Play landing sound if just landed
            if (!wasOnGround) {
                playLandingSound();
            }
            // Reveal next platform when landing
            if (collision.landedPlatformIndex !== undefined) {
                checkPlatformLanding(collision.landedPlatformIndex);
            }
        }
        
        // Battle mode updates
        if (state.battleMode) {
            updateOpponent(deltaTime);
            if (state.punchCooldown > 0) state.punchCooldown -= deltaTime;
            if (state.headbuttCooldown > 0) state.headbuttCooldown -= deltaTime;
            
            // Prevent player and opponent from overlapping
            if (state.opponent) {
                const dist = player.position.distanceTo(state.opponent.position);
                const minDist = 1.5;
                
                if (dist < minDist && dist > 0.01) {
                    const pushDir = new THREE.Vector3()
                        .subVectors(player.position, state.opponent.position)
                        .normalize();
                    const pushAmount = (minDist - dist) / 2;
                    
                    player.position.x += pushDir.x * pushAmount;
                    player.position.z += pushDir.z * pushAmount;
                    state.opponent.position.x -= pushDir.x * pushAmount;
                    state.opponent.position.z -= pushDir.z * pushAmount;
                }
            }
            
            // Keep player on ring
            player.position.x = Math.max(-8, Math.min(8, player.position.x));
            player.position.z = Math.max(-8, Math.min(8, player.position.z));
        } else if (state.boxFightsMode) {
            // Box fights mode updates
            updateBoxFightsOpponent(deltaTime);
            updateBoxFightsBullets(deltaTime);
            if (state.boxFightsShootCooldown > 0) state.boxFightsShootCooldown -= deltaTime;
            
            // Keep player in bigger box (40x40 arena)
            player.position.x = Math.max(-19, Math.min(19, player.position.x));
            player.position.z = Math.max(-19, Math.min(19, player.position.z));
            
            // Check for raised platform collision (manual check for reliability)
            const onRaisedPlatform = player.position.x >= -10 && player.position.x <= 10 &&
                                     player.position.z >= -4 && player.position.z <= 4 &&
                                     player.position.y >= 3 && player.position.y <= 5;
            
            if (onRaisedPlatform && state.playerVelocity.y <= 0 && player.position.y <= 4.2) {
                player.position.y = 4;
                state.playerVelocity.y = 0;
                state.playerOnGround = true;
            } else if (!onRaisedPlatform && player.position.y <= 1 && state.playerVelocity.y <= 0) {
                // Ground floor collision
                player.position.y = 1;
                state.playerVelocity.y = 0;
                state.playerOnGround = true;
            }
        } else if (state.basketballMode) {
            // Basketball mode updates
            updateBasketball(deltaTime);
            updateBasketballOpponent(deltaTime);
            
            // Keep player on court
            player.position.x = Math.max(-9, Math.min(9, player.position.x));
            player.position.z = Math.max(-9, Math.min(9, player.position.z));
        } else if (state.soccerMode) {
            // Soccer mode updates
            updateSoccer(deltaTime);
            updateSoccerOpponent(deltaTime);
            
            // Keep player on field
            player.position.x = Math.max(-19, Math.min(19, player.position.x));
            player.position.z = Math.max(-19, Math.min(19, player.position.z));
        } else if (state.golfMode) {
            // Golf mode updates
            updateGolf(deltaTime);
            
            // Keep player on course
            player.position.x = Math.max(-14, Math.min(14, player.position.x));
            player.position.z = Math.max(-29, Math.min(19, player.position.z));
        } else if (state.racingMode) {
            // Racing mode updates
            updateRacing(deltaTime);
        } else if (state.coinCollectorMode) {
            // Coin collector updates
            updateCoinCollector(deltaTime);
        } else if (state.survivalMode) {
            // Survival mode updates
            updateSurvival(deltaTime);
        } else if (state.targetPracticeMode) {
            // Target practice updates
            updateTargetPractice(deltaTime);
        } else if (state.speedRaceMode) {
            // Speed race updates
            updateSpeedRace(deltaTime);
        } else {
            // Journey mode - collect coins
            state.collectibles.forEach(coin => {
                if (!coin.userData.collected && player.position.distanceTo(coin.position) < 1.5) {
                    coin.userData.collected = true;
                    const coinAmount = getCoinMultiplier();
                    state.coins += coinAmount;
                    state.totalCoins += coinAmount;
                    saveData();
                    scene.remove(coin);
                    updateHUD();
                    playCoinSound();
                }
            });
            
            // Track max height
            if (player.position.y > state.maxHeight) {
                state.maxHeight = player.position.y;
            }
            
            // Check for victory (reached summit - last platform)
            if (!state.reachedSummit && state.platforms.length > 1) {
                const summitPlatform = state.platforms[state.platforms.length - 1];
                if (summitPlatform && summitPlatform.userData.bounds && summitPlatform.visible) {
                    const bounds = summitPlatform.userData.bounds;
                    if (player.position.y >= bounds.maxY - 0.5 &&
                        player.position.x >= bounds.minX && player.position.x <= bounds.maxX &&
                        player.position.z >= bounds.minZ && player.position.z <= bounds.maxZ) {
                        showVictory();
                    }
                }
            }
            
            // Fall death
            if (player.position.y < -30) {
                showGameOver(false);
            }
            
            updateHUD();
        }
        
        // Camera follow
        const targetCamPos = new THREE.Vector3(
            player.position.x + state.cameraOffset.x,
            player.position.y + state.cameraOffset.y,
            player.position.z + state.cameraOffset.z
        );
        camera.position.lerp(targetCamPos, 0.05);
        camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
    }
    
    // Animate platforms appearing
    state.platforms.forEach(platform => {
        if (platform.userData.animating) {
            const target = platform.userData.targetScale || 1;
            const current = platform.scale.x;
            const newScale = current + (target - current) * 0.1;
            platform.scale.set(newScale, newScale, newScale);
            
            // Stop animating when close enough
            if (Math.abs(newScale - target) < 0.01) {
                platform.scale.set(target, target, target);
                platform.userData.animating = false;
            }
        }
    });
    
    // Animate coins
    state.collectibles.forEach(coin => {
        if (!coin.userData.collected && coin.visible) {
            coin.rotation.y += deltaTime * 2;
            coin.position.y = coin.userData.baseY + Math.sin(currentTime * 0.003) * 0.2;
        }
    });
    
    // Coin magnet effect
    updateCoinMagnet();
    
    // Animate victory orb
    if (victoryOrb && victoryOrb.visible) {
        // Floating motion
        victoryOrb.position.y = victoryOrb.userData.baseY + Math.sin(currentTime * 0.002) * 0.5;
        
        // Rotate rings
        if (victoryOrb.userData.ring1) {
            victoryOrb.userData.ring1.rotation.z += deltaTime * 1.5;
        }
        if (victoryOrb.userData.ring2) {
            victoryOrb.userData.ring2.rotation.x += deltaTime * 1.2;
            victoryOrb.userData.ring2.rotation.y += deltaTime * 0.8;
        }
        if (victoryOrb.userData.ring3) {
            victoryOrb.userData.ring3.rotation.y += deltaTime * 1.8;
            victoryOrb.userData.ring3.rotation.z -= deltaTime * 0.5;
        }
        
        // Pulsing glow on orb
        const pulse = 0.6 + Math.sin(currentTime * 0.005) * 0.4;
        if (victoryOrb.userData.orb && victoryOrb.userData.orb.material) {
            victoryOrb.userData.orb.material.emissiveIntensity = pulse;
        }
        
        // Rotate sparkles
        if (victoryOrb.userData.sparkles) {
            victoryOrb.userData.sparkles.rotation.y += deltaTime * 0.5;
            victoryOrb.userData.sparkles.rotation.x += deltaTime * 0.3;
        }
        
        // Color cycling on main orb
        const hue = (currentTime * 0.0003) % 1;
        const color = new THREE.Color();
        color.setHSL(hue, 1, 0.6);
        if (victoryOrb.userData.orb && victoryOrb.userData.orb.material) {
            victoryOrb.userData.orb.material.color.copy(color);
            victoryOrb.userData.orb.material.emissive.copy(color);
        }
    }
    
    // Animate particles
    if (particleSystem) {
        particleSystem.rotation.y += deltaTime * 0.02;
    }
    
    // Slowly rotate star field for cosmic effect
    if (starField) {
        starField.rotation.y += deltaTime * 0.005;
        starField.rotation.x += deltaTime * 0.002;
    }
    
    // Rotate Earth slowly
    if (earth) {
        earth.rotation.y += deltaTime * 0.02;
    }
    
    // Rotate Saturn slowly
    if (saturn) {
        saturn.rotation.y += deltaTime * 0.015;
    }
    
    // Animate space glove rings in battle mode
    if (state.battleMode && player) {
        if (player.userData.leftGloveRing) {
            player.userData.leftGloveRing.rotation.z += deltaTime * 3;
        }
        if (player.userData.rightGloveRing) {
            player.userData.rightGloveRing.rotation.z -= deltaTime * 3;
        }
    }
    if (state.opponent) {
        if (state.opponent.userData.leftGloveRing) {
            state.opponent.userData.leftGloveRing.rotation.z += deltaTime * 3;
        }
        if (state.opponent.userData.rightGloveRing) {
            state.opponent.userData.rightGloveRing.rotation.z -= deltaTime * 3;
        }
    }
    
    // Orbit moon around Earth slightly
    if (moon) {
        moon.rotation.y += deltaTime * 0.05;
        // Subtle orbital movement
        const moonOrbit = currentTime * 0.0001;
        moon.position.x = -40 + Math.sin(moonOrbit) * 10;
        moon.position.z = -120 + Math.cos(moonOrbit) * 10;
    }
    
    // Animate player limbs (walking/jumping)
    animatePlayerLimbs(deltaTime);
    
    // Animate player color cycling (rainbow effect)
    if (player && player.userData.bodyMaterial) {
        const hue = (currentTime * 0.0005) % 1; // Cycle through hues
        const color = new THREE.Color();
        color.setHSL(hue, 0.8, 0.5);
        
        player.userData.bodyMaterial.color.copy(color);
        player.userData.bodyMaterial.emissive.copy(color);
        player.userData.bodyMaterial.emissiveIntensity = 0.3;
        
        // Limbs cycle with slightly darker color
        if (player.userData.limbMaterial) {
            const limbColor = new THREE.Color();
            limbColor.setHSL(hue, 0.8, 0.35);
            player.userData.limbMaterial.color.copy(limbColor);
        }
        
        // Eyes cycle with offset for cool effect
        if (player.userData.eyeMaterial) {
            const eyeHue = (hue + 0.5) % 1; // Opposite color
            const eyeColor = new THREE.Color();
            eyeColor.setHSL(eyeHue, 1, 0.6);
            player.userData.eyeMaterial.emissive.copy(eyeColor);
        }
    }
    
    renderer.render(scene, camera);
}

// Start game functions
// Show difficulty selection
function showDifficultySelect() {
    document.querySelector('.main-buttons').classList.add('hidden');
    document.querySelector('.controls-hint').classList.add('hidden');
    document.querySelector('.difficulty-select').classList.remove('hidden');
}

// Hide difficulty selection
function hideDifficultySelect() {
    document.querySelector('.main-buttons').classList.remove('hidden');
    document.querySelector('.controls-hint').classList.remove('hidden');
    document.querySelector('.difficulty-select').classList.add('hidden');
}

function startGame(difficulty = 'normal') {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    // Reset HUD labels
    document.querySelector('#hud .hud-item:first-child .label').textContent = 'ALTITUDE';
    document.querySelector('#hud .hud-item:nth-child(2) .label').textContent = 'COINS';
    
    // Store difficulty for restart
    state.difficulty = difficulty;
    
    initJourneyMode(difficulty);
    state.started = true;
    state.gameOver = false;
    resetMouseControl();
    
    // Start background music
    startBackgroundMusic();
    
    // Reset difficulty select for next time
    hideDifficultySelect();
}

function startBattle() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    initBattleMode();
    state.started = true;
    state.gameOver = false;
    resetMouseControl();
    
    // Start background music
    startBackgroundMusic();
}

// Shop functions
let shopUpdateInterval = null;

function openShop() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    updateShopDisplay();
    
    // Update shop timer every second
    if (shopUpdateInterval) clearInterval(shopUpdateInterval);
    shopUpdateInterval = setInterval(updateShopDisplay, 1000);
}

function closeShop() {
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
    
    // Stop updating shop timer
    if (shopUpdateInterval) {
        clearInterval(shopUpdateInterval);
        shopUpdateInterval = null;
    }
}

// Mini Games menu
function openMiniGames() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('minigames-screen').classList.remove('hidden');
}

function closeMiniGames() {
    document.getElementById('minigames-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
}

// Sports menu
function openSports() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('sports-screen').classList.remove('hidden');
}

function closeSports() {
    document.getElementById('sports-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
}

// Career menu
function openCareer() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('career-screen').classList.remove('hidden');
    updateCareerDisplay();
}

function closeCareer() {
    document.getElementById('career-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
}

// ==========================================
// BOX FIGHTS MODE
// ==========================================

function startBoxFights() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    initBoxFightsMode();
    state.started = true;
    state.gameOver = false;
    resetMouseControl();
    
    startBackgroundMusic();
}

function initBoxFightsMode() {
    clearScene();
    
    state.boxFightsMode = true;
    state.battleMode = false;
    state.playerHealth = 3;  // 3 hits to kill
    state.opponentHealth = 3;  // 3 hits to kill
    state.playerKills = 0;  // First to 5 kills wins
    state.opponentKills = 0;
    state.punchCooldown = 0;
    state.headbuttCooldown = 0;
    
    // Create the box platform (EVEN BIGGER square floor)
    const platformSize = 40;  // Super big arena!
    const platformGeo = new THREE.BoxGeometry(platformSize, 1, platformSize);
    const platformMat = new THREE.MeshStandardMaterial({
        color: 0x4a5568,
        roughness: 0.8
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -0.5, 0);
    platform.receiveShadow = true;
    scene.add(platform);
    
    // Store platform bounds for collision
    platform.userData.bounds = {
        minX: -platformSize/2,
        maxX: platformSize/2,
        minZ: -platformSize/2,
        maxZ: platformSize/2,
        minY: 0,
        maxY: 1
    };
    state.platforms.push(platform);
    
    // Create raised sideways platform in the middle
    const raisedPlatformGeo = new THREE.BoxGeometry(20, 1, 8);
    const raisedPlatformMat = new THREE.MeshStandardMaterial({
        color: 0x5a6578,
        roughness: 0.7
    });
    const raisedPlatform = new THREE.Mesh(raisedPlatformGeo, raisedPlatformMat);
    raisedPlatform.position.set(0, 3, 0);  // Raised up
    raisedPlatform.receiveShadow = true;
    raisedPlatform.castShadow = true;
    scene.add(raisedPlatform);
    
    // Store raised platform bounds
    raisedPlatform.userData.bounds = {
        minX: -10,
        maxX: 10,
        minZ: -4,
        maxZ: 4,
        minY: 3,
        maxY: 4
    };
    state.platforms.push(raisedPlatform);
    
    // Add ramps to get up
    const rampGeo = new THREE.BoxGeometry(6, 0.5, 5);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x6a7588 });
    const leftRamp = new THREE.Mesh(rampGeo, rampMat);
    leftRamp.position.set(-10, 1.5, 0);
    leftRamp.rotation.z = -Math.PI / 8;
    scene.add(leftRamp);
    
    const rightRamp = new THREE.Mesh(rampGeo, rampMat);
    rightRamp.position.set(10, 1.5, 0);
    rightRamp.rotation.z = Math.PI / 8;
    scene.add(rightRamp);
    
    // Walls
    const wallHeight = 8;
    const wallThickness = 0.5;
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x2d3748,
        roughness: 0.6
    });
    
    // Back wall (negative Z) - SLANTED!
    const slantedWallGeo = new THREE.BoxGeometry(platformSize, wallHeight * 1.5, wallThickness);
    const slantedWall = new THREE.Mesh(slantedWallGeo, wallMat);
    slantedWall.position.set(0, wallHeight * 0.6, -platformSize/2 + 2);
    slantedWall.rotation.x = -Math.PI / 6;  // Slant the wall!
    slantedWall.castShadow = true;
    slantedWall.receiveShadow = true;
    scene.add(slantedWall);
    
    // Left wall (negative X) - normal
    const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, platformSize);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-platformSize/2 + wallThickness/2, wallHeight/2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    // Right wall (positive X) - normal
    const rightWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, platformSize);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(platformSize/2 - wallThickness/2, wallHeight/2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    
    // Add edge highlights
    const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xe94560,
        emissive: 0xe94560,
        emissiveIntensity: 0.5
    });
    
    const sideEdgeGeo = new THREE.BoxGeometry(0.3, 0.3, platformSize + 0.2);
    const leftEdge = new THREE.Mesh(sideEdgeGeo, edgeMat);
    leftEdge.position.set(-platformSize/2 + wallThickness/2, wallHeight, 0);
    scene.add(leftEdge);
    
    const rightEdge = new THREE.Mesh(sideEdgeGeo, edgeMat);
    rightEdge.position.set(platformSize/2 - wallThickness/2, wallHeight, 0);
    scene.add(rightEdge);
    
    // Edge highlight for raised platform
    const raisedEdgeGeo = new THREE.BoxGeometry(20.2, 0.2, 0.2);
    const raisedEdgeMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5
    });
    const raisedEdgeFront = new THREE.Mesh(raisedEdgeGeo, raisedEdgeMat);
    raisedEdgeFront.position.set(0, 3.5, 4);
    scene.add(raisedEdgeFront);
    const raisedEdgeBack = new THREE.Mesh(raisedEdgeGeo, raisedEdgeMat);
    raisedEdgeBack.position.set(0, 3.5, -4);
    scene.add(raisedEdgeBack);
    
    // Reset player position
    player.position.set(15, 2, 15);
    state.playerVelocity.set(0, 0, 0);
    
    // Show arms and remove any gloves
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.userData.leftGlove = null;
    }
    if (player.userData.rightGlove) {
        player.remove(player.userData.rightGlove);
        player.userData.rightGlove = null;
    }
    
    // Add pistol to player
    addBoxFightsPistol(player, 0x0066ff);
    
    // Create opponent in the box
    createBoxFightsOpponent();
    
    // Initialize shooting state
    state.boxFightsShootCooldown = 0;
    state.boxFightsBullets = [];
    
    // Update HUD - First to 5 kills wins
    document.querySelector('#hud .hud-item:first-child .label').textContent = 'YOU';
    document.querySelector('#hud .hud-item:nth-child(2) .label').textContent = 'KADE';
    updateBoxFightsHUD();
}

function updateBoxFightsHUD() {
    const playerHearts = '❤️'.repeat(Math.max(0, state.playerHealth));
    const opponentHearts = '❤️'.repeat(Math.max(0, state.opponentHealth));
    document.getElementById('altitude-value').textContent = `${state.playerKills}/5 | ${playerHearts}`;
    document.getElementById('coins-value').textContent = `${state.opponentKills}/5 | ${opponentHearts}`;
}

function createBoxFightsOpponent() {
    // Create opponent similar to battle mode
    state.opponent = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe94560 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    state.opponent.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe94560 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    state.opponent.add(head);
    state.opponent.userData.head = head;
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 1.9, 0.28);
    state.opponent.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 1.9, 0.28);
    state.opponent.add(rightEye);
    
    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.12, 1.9, 0.34);
    state.opponent.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.12, 1.9, 0.34);
    state.opponent.add(rightPupil);
    
    // Name tag
    const nameTag = createNameTag("Kade");
    nameTag.position.y = 2.5;
    state.opponent.add(nameTag);
    
    // Add arms
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe94560 });
    const armGeo = new THREE.CapsuleGeometry(0.12, 0.4, 4, 8);
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.5, 1, 0);
    leftArm.rotation.z = Math.PI / 6;
    state.opponent.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.5, 1, 0);
    rightArm.rotation.z = -Math.PI / 6;
    state.opponent.add(rightArm);
    
    // Add pistol to opponent
    addBoxFightsPistol(state.opponent, 0xe94560);
    
    state.opponent.position.set(-15, 1, -15);  // Spawn on opposite side of even bigger arena
    state.opponent.userData.shootCooldown = 2;  // Start with a delay so player can aim first
    scene.add(state.opponent);
}

// Add pistol to character for box fights
function addBoxFightsPistol(character, color) {
    const pistolGroup = new THREE.Group();
    
    // Gun body - horizontal orientation
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.15, 0.35);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    pistolGroup.add(body);
    
    // Barrel - points forward (positive Z = forward in player space)
    const barrelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.25, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        metalness: 0.9,
        roughness: 0.2
    });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.25;  // Forward (positive Z)
    pistolGroup.add(barrel);
    
    // Handle - points down
    const handleGeo = new THREE.BoxGeometry(0.1, 0.2, 0.12);
    const handleMat = new THREE.MeshStandardMaterial({ color: color });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.15;
    handle.position.z = -0.08;
    pistolGroup.add(handle);
    
    // Muzzle flash (hidden by default)
    const flashGeo = new THREE.ConeGeometry(0.08, 0.15, 8);
    const flashMat = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0
    });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.rotation.x = -Math.PI / 2;  // Point forward
    flash.position.z = 0.45;  // In front of barrel
    pistolGroup.add(flash);
    pistolGroup.userData.muzzleFlash = flash;
    
    // Position pistol in right hand
    pistolGroup.position.set(0.5, 1, 0.3);
    
    character.add(pistolGroup);
    character.userData.pistol = pistolGroup;
}

// Box fights shooting
function boxFightsShoot() {
    if (!state.boxFightsMode || state.boxFightsShootCooldown > 0 || state.gameOver) return;
    
    state.boxFightsShootCooldown = 0.2;  // Faster shooting!
    
    // Play shoot sound
    playPunchSound();
    
    // Muzzle flash
    if (player.userData.pistol && player.userData.pistol.userData.muzzleFlash) {
        const flash = player.userData.pistol.userData.muzzleFlash;
        flash.material.opacity = 1;
        setTimeout(() => { flash.material.opacity = 0; }, 50);
    }
    
    // Create bigger bullet for easier hits
    const bulletGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    
    // Bullet starts from in front of player
    bullet.position.copy(player.position);
    bullet.position.y += 1;
    // Start bullet in front of player (forward direction)
    bullet.position.x += Math.sin(player.rotation.y) * 1;
    bullet.position.z += Math.cos(player.rotation.y) * 1;
    
    // Bullet direction - FORWARD (where player is facing)
    bullet.userData.velocity = new THREE.Vector3(
        Math.sin(player.rotation.y) * 60,
        0,
        Math.cos(player.rotation.y) * 60
    );
    bullet.userData.life = 3; // seconds
    
    scene.add(bullet);
    state.boxFightsBullets.push(bullet);
}

// Update box fights bullets
function updateBoxFightsBullets(deltaTime) {
    if (!state.boxFightsMode || !state.boxFightsBullets || !player) return;
    
    for (let i = state.boxFightsBullets.length - 1; i >= 0; i--) {
        const bullet = state.boxFightsBullets[i];
        if (!bullet || !bullet.userData || !bullet.userData.velocity) continue;
        
        // Move bullet
        bullet.position.x += bullet.userData.velocity.x * deltaTime;
        bullet.position.y += (bullet.userData.velocity.y || 0) * deltaTime;
        bullet.position.z += bullet.userData.velocity.z * deltaTime;
        
        // Check if opponent bullet hits player (bigger hit radius for easier hits)
        if (bullet.userData.isOpponentBullet && player.position && bullet.position.distanceTo(player.position) < 1.8) {
            // Player hit! -1 life
            state.playerHealth -= 1;
            
            // Remove bullet
            scene.remove(bullet);
            state.boxFightsBullets.splice(i, 1);
            
            // Check if player killed (0 lives)
            if (state.playerHealth <= 0) {
                state.opponentKills++;
                
                // Check if opponent won (5 kills)
                if (state.opponentKills >= 5) {
                    endBoxFights(false);
                } else {
                    // Respawn player
                    respawnBoxFightsPlayer();
                }
            }
            
            updateBoxFightsHUD();
            continue;
        }
        
        // Check if player bullet hits opponent (bigger hit radius for easier hits)
        if (!bullet.userData.isOpponentBullet && state.opponent && bullet.position.distanceTo(state.opponent.position) < 2) {
            // Hit opponent! -1 life
            state.opponentHealth -= 1;
            
            // Remove bullet
            scene.remove(bullet);
            state.boxFightsBullets.splice(i, 1);
            
            // Check if opponent killed (0 lives)
            if (state.opponentHealth <= 0) {
                state.playerKills++;
                
                // Check if player won (5 kills)
                if (state.playerKills >= 5) {
                    endBoxFights(true);
                } else {
                    // Respawn opponent
                    respawnBoxFightsOpponent();
                }
            }
            
            updateBoxFightsHUD();
            continue;
        }
        
        // Reduce life
        bullet.userData.life -= deltaTime;
        if (bullet.userData.life <= 0) {
            scene.remove(bullet);
            state.boxFightsBullets.splice(i, 1);
        }
    }
}

// End box fights
// Update box fights opponent AI
function updateBoxFightsOpponent(deltaTime) {
    if (!state.opponent || state.gameOver) return;
    
    const opponent = state.opponent;
    
    // Face player (slowly)
    const dx = player.position.x - opponent.position.x;
    const dz = player.position.z - opponent.position.z;
    opponent.rotation.y = Math.atan2(dx, dz);
    
    // Move toward player but keep some distance - SLOWER movement for easier target
    const dist = player.position.distanceTo(opponent.position);
    const targetDist = 12; // Stay at shooting range (even bigger arena)
    
    if (dist > targetDist + 3) {
        // Move closer - SLOW
        const moveSpeed = 2 * deltaTime;
        opponent.position.x += (dx / dist) * moveSpeed;
        opponent.position.z += (dz / dist) * moveSpeed;
    } else if (dist < targetDist - 3) {
        // Back away - SLOW
        const moveSpeed = 1.5 * deltaTime;
        opponent.position.x -= (dx / dist) * moveSpeed;
        opponent.position.z -= (dz / dist) * moveSpeed;
    }
    
    // Strafe sideways rarely - easier to hit
    if (Math.random() < 0.01) {
        const strafeDir = Math.random() > 0.5 ? 1 : -1;
        opponent.position.x += strafeDir * 0.5;
    }
    
    // Keep opponent in bounds (even bigger arena)
    opponent.position.x = Math.max(-18, Math.min(18, opponent.position.x));
    opponent.position.z = Math.max(-18, Math.min(18, opponent.position.z));
    
    // Opponent shoots at player - SLOWER and less accurate
    if (opponent.userData.shootCooldown <= 0 && dist < 25) {
        opponent.userData.shootCooldown = 2.5 + Math.random() * 2; // Much slower shooting
        
        // Create opponent bullet
        const bulletGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const bullet = new THREE.Mesh(bulletGeo, bulletMat);
        
        bullet.position.copy(opponent.position);
        bullet.position.y += 1;
        
        // Aim at player with MORE inaccuracy (easier to dodge)
        const accuracy = 0.6;  // Less accurate!
        const targetX = player.position.x + (Math.random() - 0.5) * (1 - accuracy) * 12;
        const targetZ = player.position.z + (Math.random() - 0.5) * (1 - accuracy) * 12;
        
        const dirX = targetX - bullet.position.x;
        const dirZ = targetZ - bullet.position.z;
        const dirLen = Math.sqrt(dirX * dirX + dirZ * dirZ);
        
        bullet.userData.velocity = new THREE.Vector3(
            (dirX / dirLen) * 20,
            0,
            (dirZ / dirLen) * 20
        );
        bullet.userData.life = 2;
        bullet.userData.isOpponentBullet = true;
        
        scene.add(bullet);
        state.boxFightsBullets.push(bullet);
        
        // Muzzle flash
        if (opponent.userData.pistol && opponent.userData.pistol.userData.muzzleFlash) {
            const flash = opponent.userData.pistol.userData.muzzleFlash;
            flash.material.opacity = 1;
            setTimeout(() => { flash.material.opacity = 0; }, 50);
        }
    }
    
    opponent.userData.shootCooldown -= deltaTime;
}

function respawnBoxFightsPlayer() {
    // Reset player health
    state.playerHealth = 3;
    
    // Move player to spawn point
    player.position.set(8, 2, 8);
    state.playerVelocity.set(0, 0, 0);
}

function respawnBoxFightsOpponent() {
    // Reset opponent health
    state.opponentHealth = 3;
    
    // Move opponent to spawn point
    if (state.opponent) {
        state.opponent.position.set(-8, 1, -8);
    }
}

function endBoxFights(playerWon) {
    if (playerWon) {
        state.careerStats.boxFightsWins = (state.careerStats.boxFightsWins || 0) + 1;
    }
    // Track total kills
    state.careerStats.boxFightsKills = (state.careerStats.boxFightsKills || 0) + state.playerKills;
    saveData();
    
    // Clean up bullets
    if (state.boxFightsBullets) {
        state.boxFightsBullets.forEach(b => scene.remove(b));
        state.boxFightsBullets = [];
    }
    
    // Show game over with final score
    state.lastGameMode = 'boxFights';  // Track for restart
    state.boxFightsMode = false;
    state.gameOver = true;
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (playerWon) {
        document.getElementById('game-over-title').textContent = '🏆 YOU WIN!';
        document.getElementById('game-over-message').textContent = `You got 5 kills first! Final: ${state.playerKills} - ${state.opponentKills}`;
        gameOverEl.classList.add('victory');
    } else {
        document.getElementById('game-over-title').textContent = '💀 YOU LOST!';
        document.getElementById('game-over-message').textContent = `Rex got 5 kills first! Final: ${state.playerKills} - ${state.opponentKills}`;
    }
    
    document.getElementById('final-score').textContent = state.playerKills;
    document.getElementById('final-height').textContent = state.opponentKills;
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'YOUR KILLS';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'REX KILLS';
}

function updateCareerDisplay() {
    // Get saved high scores from localStorage
    const golfBest = localStorage.getItem('golfBestScore') || '--';
    const racingBest = localStorage.getItem('racingBestTime') || '--';
    const speedRaceBest = localStorage.getItem('speedRaceBestTime') || '--';
    
    // Update all the stat displays (use || 0 to prevent NaN)
    document.getElementById('career-total-coins').textContent = state.totalCoins || 0;
    document.getElementById('career-coins-earned').textContent = state.careerStats.coinsEarned || 0;
    document.getElementById('career-battles-won').textContent = state.careerStats.battlesWon || 0;
    document.getElementById('career-knockouts').textContent = state.careerStats.knockouts || 0;
    document.getElementById('career-boxfights-wins').textContent = state.careerStats.boxFightsWins || 0;
    document.getElementById('career-boxfights-kills').textContent = state.careerStats.boxFightsKills || 0;
    document.getElementById('career-journeys').textContent = state.careerStats.journeysCompleted || 0;
    document.getElementById('career-max-height').textContent = state.careerStats.maxHeightEver || 0;
    document.getElementById('career-baskets').textContent = state.careerStats.totalBaskets || 0;
    document.getElementById('career-basketball-best').textContent = state.careerStats.basketballBest || 0;
    document.getElementById('career-basketball-wins').textContent = state.careerStats.basketballWins || 0;
    document.getElementById('career-goals').textContent = state.careerStats.goalsScored || 0;
    document.getElementById('career-soccer-wins').textContent = state.careerStats.soccerWins || 0;
    document.getElementById('career-golf-best').textContent = golfBest;
    document.getElementById('career-golf-holes').textContent = state.careerStats.golfHolesCompleted || 0;
    document.getElementById('career-races-won').textContent = state.careerStats.racesWon || 0;
    document.getElementById('career-racing-laps').textContent = state.careerStats.racingTotalLaps || 0;
    document.getElementById('career-survival-wave').textContent = state.careerStats.survivalBestWave || 0;
    document.getElementById('career-target-best').textContent = state.careerStats.targetBestHits || 0;
    document.getElementById('career-speedrace-best').textContent = speedRaceBest !== '--' ? speedRaceBest + 's' : '--';
}

// ==========================================
// BASKETBALL SPORT
// ==========================================

let basketball = null;
let basketballHoop = null;
let basketballOpponent = null;

// Soccer variables
let soccerBall = null;
let soccerGoalPlayer = null;
let soccerGoalOpponent = null;
let soccerOpponent = null;

// Golf variables
let golfBall = null;
let golfHole = null;
let golfFlag = null;

// Coin Collector variables
let coinCollectorCoins = [];
let coinCollectorTed = null;

// Survival Mode variables
let survivalTrees = [];
let survivalEnemies = [];
let survivalForestGround = null;
let survivalSword = null;
let swordSwinging = false;

// Target Practice variables
let targetDummy = null;
let targetPracticeGround = null;
let targetHitCount = 0;
let targetPistol = null;
let bullets = [];

// Speed Race variables
let speedRaceTrack = null;
let speedRaceOpponent = null;
let speedRaceFinishLine = null;

function startBasketball() {
    document.getElementById('sports-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    clearScene();
    state.started = true;
    state.gameOver = false;
    state.battleMode = false;
    state.basketballMode = true;
    resetMouseControl();
    state.basketballScore = 0;
    state.basketballTime = 60;
    state.holdingBall = false;
    
    // Create half basketball court
    createBasketballCourt();
    
    // Create ONE hoop at the back, facing the player
    basketballHoop = createBasketballHoop(0, 5, -9);
    // No rotation needed - hoop faces forward by default
    
    // Create ball near player start
    createBasketball(0, 3, 5);
    
    // Create Rex as goalie in front of hoop
    createBasketballOpponent();
    
    // Reset player position at front of court
    player.position.set(0, 2, 7);
    state.playerVelocity.set(0, 0, 0);
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Start timer
    state.basketballInterval = setInterval(() => {
        state.basketballTime--;
        updateBasketballHUD();
        if (state.basketballTime <= 0) {
            endBasketball();
        }
    }, 1000);
    
    updateBasketballHUD();
    startBackgroundMusic();
}

function createBasketballCourt() {
    // Create HALF court texture with canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Hardwood floor background
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(0, 0, 512, 512);
    
    // Wood grain lines (simple)
    ctx.strokeStyle = '#B8732A';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
    }
    
    // Court lines - white
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    
    // Boundary (half court)
    ctx.strokeRect(20, 20, 472, 472);
    
    // Half court arc at bottom
    ctx.beginPath();
    ctx.arc(256, 492, 80, Math.PI, 0);
    ctx.stroke();
    
    // Three point arc
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 40, 150, 0.3, Math.PI - 0.3);
    ctx.stroke();
    
    // Three point line sides
    ctx.beginPath();
    ctx.moveTo(106, 20);
    ctx.lineTo(106, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(406, 20);
    ctx.lineTo(406, 60);
    ctx.stroke();
    
    // Key/paint area
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.fillRect(176, 20, 160, 150);
    ctx.strokeRect(176, 20, 160, 150);
    
    // Free throw circle
    ctx.beginPath();
    ctx.arc(256, 170, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Half court - square shape
    const courtGeo = new THREE.BoxGeometry(20, 1, 20);
    const courtMat = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.3
    });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.position.set(0, 0.5, 0);
    court.receiveShadow = true;
    scene.add(court);
    
    court.userData.bounds = {
        minX: -10, maxX: 10,
        minY: 0, maxY: 1,
        minZ: -10, maxZ: 10
    };
    court.userData.revealed = true;
    state.platforms.push(court);
}

function createBasketball(x, y, z) {
    const ballGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ 
        color: 0xff6600,
        roughness: 0.5
    });
    basketball = new THREE.Mesh(ballGeo, ballMat);
    basketball.position.set(x, y, z);
    basketball.userData.velocity = new THREE.Vector3(0, 0, 0);
    
    // Add black lines on ball
    const lineGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const line1 = new THREE.Mesh(lineGeo, blackMat);
    basketball.add(line1);
    const line2 = new THREE.Mesh(lineGeo, blackMat);
    line2.rotation.y = Math.PI / 2;
    basketball.add(line2);
    
    scene.add(basketball);
}

function createBasketballHoop(x, y, z) {
    const hoopGroup = new THREE.Group();
    
    // Backboard
    const boardGeo = new THREE.BoxGeometry(4, 3, 0.2);
    const boardMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.9 
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 1.5, -0.5);
    hoopGroup.add(board);
    
    // Backboard frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 0.25), frameMat);
    frameTop.position.set(0, 3.1, -0.5);
    hoopGroup.add(frameTop);
    
    // Target square on backboard
    const targetMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const targetGeo = new THREE.BoxGeometry(1.5, 1, 0.05);
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.position.set(0, 1.2, -0.35);
    hoopGroup.add(target);
    
    // Rim
    const rimGeo = new THREE.TorusGeometry(0.7, 0.05, 8, 24);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xff4400 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 0, 0.8);
    hoopGroup.add(rim);
    
    // Net (simple cylinder)
    const netGeo = new THREE.CylinderGeometry(0.7, 0.4, 1, 8, 1, true);
    const netMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.5,
        side: THREE.DoubleSide,
        wireframe: true
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, -0.5, 0.8);
    hoopGroup.add(net);
    
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, y);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, -y/2, -1);
    hoopGroup.add(pole);
    
    hoopGroup.position.set(x, y, z);
    scene.add(hoopGroup);
    basketballHoop = hoopGroup;
    
    // Hoop detection zone
    basketballHoop.userData.hoopPos = new THREE.Vector3(x, y, z + 0.8);
    basketballHoop.userData.hoopRadius = 0.7;
    
    return hoopGroup;
}

function createBasketballOpponent() {
    const group = new THREE.Group();
    
    // Rex is same size as player
    const rexHeight = PLAYER_HEIGHT;
    
    // Body - red like before but same size as player
    const oppMat = new THREE.MeshStandardMaterial({
        color: 0xe94560,
        roughness: 0.4
    });
    
    const bodyGeo = new THREE.CapsuleGeometry(PLAYER_RADIUS, rexHeight - PLAYER_RADIUS * 2, 8, 16);
    const body = new THREE.Mesh(bodyGeo, oppMat);
    body.position.y = rexHeight / 2;
    group.add(body);
    
    // === JOE'S FACE ===
    
    // Eyes - white with pupils
    const eyeWhiteGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.18, rexHeight - 0.35, 0.38);
    group.add(leftEyeWhite);
    
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.18, rexHeight - 0.35, 0.38);
    group.add(rightEyeWhite);
    
    // Pupils - black
    const pupilGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.18, rexHeight - 0.35, 0.52);
    group.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.18, rexHeight - 0.35, 0.52);
    group.add(rightPupil);
    
    // Eyebrows - determined look
    const eyebrowMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const eyebrowGeo = new THREE.BoxGeometry(0.2, 0.05, 0.05);
    
    const leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
    leftEyebrow.position.set(-0.18, rexHeight - 0.15, 0.45);
    leftEyebrow.rotation.z = 0.3; // Angled for determined look
    group.add(leftEyebrow);
    
    const rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
    rightEyebrow.position.set(0.18, rexHeight - 0.15, 0.45);
    rightEyebrow.rotation.z = -0.3;
    group.add(rightEyebrow);
    
    // Nose
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xd63850 });
    const noseGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, rexHeight - 0.5, 0.48);
    nose.scale.set(1, 1.2, 0.8);
    group.add(nose);
    
    // Mouth - slight smile
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const mouthGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 12, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, rexHeight - 0.7, 0.4);
    mouth.rotation.x = Math.PI;
    mouth.rotation.z = Math.PI;
    group.add(mouth);
    
    // Arms for blocking
    const armMat = new THREE.MeshStandardMaterial({ color: 0xcc3050 });
    const armGeo = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8);
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.5, rexHeight - 0.2, 0);
    leftArm.rotation.z = 0.5;
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.5, rexHeight - 0.2, 0);
    rightArm.rotation.z = -0.5;
    group.add(rightArm);
    group.userData.rightArm = rightArm;
    
    // Hands
    const handGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const handMat = new THREE.MeshStandardMaterial({ color: 0xff6666 });
    
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-0.7, rexHeight + 0.2, 0);
    group.add(leftHand);
    group.userData.leftHand = leftHand;
    
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0.7, rexHeight + 0.2, 0);
    group.add(rightHand);
    group.userData.rightHand = rightHand;
    
    // Name tag
    const nameTag = createNameTag("Joe");
    nameTag.position.set(0, rexHeight + 0.5, 0);
    group.add(nameTag);
    
    group.userData.rexHeight = rexHeight;
    group.position.set(0, 1.5, -6); // Position in front of hoop
    scene.add(group);
    basketballOpponent = group;
}

function updateBasketball(deltaTime) {
    if (!basketball || !state.basketballMode) return;
    
    // If holding ball, attach to player
    if (state.holdingBall) {
        basketball.position.copy(player.position);
        basketball.position.y += 2.2;
        basketball.position.z -= 0.5;
        basketball.userData.velocity.set(0, 0, 0);
    } else {
        // Apply gravity
        basketball.userData.velocity.y -= 20 * deltaTime;
        
        // Apply velocity
        basketball.position.add(basketball.userData.velocity.clone().multiplyScalar(deltaTime));
        
        // Ground collision
        if (basketball.position.y < 1.5) {
            basketball.position.y = 1.5;
            basketball.userData.velocity.y *= -0.6;
            basketball.userData.velocity.x *= 0.85;
            basketball.userData.velocity.z *= 0.85;
        }
        
        // Player pickup handled by N key in keydown event
        
        // Spin the ball
        basketball.rotation.x += basketball.userData.velocity.z * deltaTime * 2;
        basketball.rotation.z -= basketball.userData.velocity.x * deltaTime * 2;
    }
    
    // Keep ball in bounds (half court)
    basketball.position.x = Math.max(-9, Math.min(9, basketball.position.x));
    basketball.position.z = Math.max(-9, Math.min(9, basketball.position.z));
    
    // Check if ball goes through hoop
    if (basketballHoop && !state.holdingBall) {
        const hoopPos = basketballHoop.userData.hoopPos;
        const dx = basketball.position.x - hoopPos.x;
        const dz = basketball.position.z - hoopPos.z;
        const dist2D = Math.sqrt(dx * dx + dz * dz);
        
        // Forgiving detection - ball near hoop area and falling
        if (dist2D < 2 && 
            basketball.position.y > 3 && basketball.position.y < 8 && 
            basketball.userData.velocity.y < 0 &&
            basketball.position.z < -6) {
            // SCORE! Give 5 coins
            state.basketballScore += 1;
            state.totalCoins += 5;
            state.careerStats.totalBaskets += 1;
            state.careerStats.coinsEarned += 5;
            saveData();
            playCoinSound();
            updateBasketballHUD();
            
            // Flash effect - brief color change
            if (basketballHoop.children[0]) {
                const originalColor = basketballHoop.children[0].material.color.getHex();
                basketballHoop.children[0].material.color.setHex(0x00ff00);
                setTimeout(() => {
                    if (basketballHoop.children[0]) {
                        basketballHoop.children[0].material.color.setHex(originalColor);
                    }
                }, 300);
            }
            
            // Reset ball to player
            basketball.position.set(0, 3, 5);
            basketball.userData.velocity.set(0, 0, 0);
            state.holdingBall = false;
        }
    }
    
    // Rex blocks - if ball hits Rex directly, knock it away
    if (basketballOpponent && !state.holdingBall) {
        const distToRex = basketball.position.distanceTo(basketballOpponent.position);
        // Smaller block radius so it's possible to score
        if (distToRex < 1.5) {
            // Rex blocks the ball!
            const knockDir = new THREE.Vector3()
                .subVectors(basketball.position, basketballOpponent.position)
                .normalize();
            basketball.userData.velocity.x += knockDir.x * 10;
            basketball.userData.velocity.z += knockDir.z * 10;
            basketball.userData.velocity.y = 2;
            playPunchSound();
        }
    }
}

function updateBasketballOpponent(deltaTime) {
    if (!basketballOpponent || !state.basketballMode || !basketball) return;
    
    // Rex stays in front of the hoop as a goalie
    const rexHeight = basketballOpponent.userData.rexHeight || PLAYER_HEIGHT;
    
    // Stay in front of hoop
    basketballOpponent.position.z = -6;
    
    // Track the ball's x position - not too aggressive so player can score
    const targetX = basketball.position.x * 0.4; // Only move 40% toward ball
    const dx = targetX - basketballOpponent.position.x;
    basketballOpponent.position.x += dx * deltaTime * 2; // Slower movement
    
    // Keep within hoop area
    basketballOpponent.position.x = Math.max(-3, Math.min(3, basketballOpponent.position.x));
    
    // Face toward the player (positive Z direction)
    basketballOpponent.rotation.y = 0;
    
    // Jump to block when ball is coming toward hoop
    if (!basketballOpponent.userData.jumpVel) basketballOpponent.userData.jumpVel = 0;
    
    const ballComingToHoop = basketball.userData.velocity.z < -3 && basketball.position.z < -2;
    const ballNearHoop = basketball.position.z < -4 && basketball.position.z > -8;
    const ballHighEnough = basketball.position.y > 4;
    
    // Jump when ball is heading toward hoop - but with delay so player can score
    if (ballComingToHoop && ballNearHoop && ballHighEnough && basketballOpponent.position.y <= 1.6 && Math.random() < 0.5) {
        basketballOpponent.userData.jumpVel = 15; // Higher jump than player
    }
    
    // Random jumps less frequent
    if (Math.random() < 0.008 && basketballOpponent.position.y <= 1.6) {
        basketballOpponent.userData.jumpVel = 12;
    }
    
    // Apply jump physics
    basketballOpponent.userData.jumpVel -= 25 * deltaTime;
    basketballOpponent.position.y += basketballOpponent.userData.jumpVel * deltaTime;
    if (basketballOpponent.position.y < 1.5) {
        basketballOpponent.position.y = 1.5;
        basketballOpponent.userData.jumpVel = 0;
    }
    
    // Animate arms when jumping
    const isJumping = basketballOpponent.position.y > 2;
    
    if (basketballOpponent.userData.leftArm && basketballOpponent.userData.rightArm) {
        if (isJumping) {
            // Arms up when jumping
            basketballOpponent.userData.leftArm.rotation.z = 1.2;
            basketballOpponent.userData.rightArm.rotation.z = -1.2;
            basketballOpponent.userData.leftArm.position.y = rexHeight;
            basketballOpponent.userData.rightArm.position.y = rexHeight;
            if (basketballOpponent.userData.leftHand) {
                basketballOpponent.userData.leftHand.position.y = rexHeight + 0.6;
                basketballOpponent.userData.rightHand.position.y = rexHeight + 0.6;
            }
        } else {
            // Normal pose
            basketballOpponent.userData.leftArm.rotation.z = 0.5;
            basketballOpponent.userData.rightArm.rotation.z = -0.5;
            basketballOpponent.userData.leftArm.position.y = rexHeight - 0.2;
            basketballOpponent.userData.rightArm.position.y = rexHeight - 0.2;
            if (basketballOpponent.userData.leftHand) {
                basketballOpponent.userData.leftHand.position.y = rexHeight + 0.2;
                basketballOpponent.userData.rightHand.position.y = rexHeight + 0.2;
            }
        }
    }
}

function shootBasketball() {
    if (!state.holdingBall || !basketball) return;
    
    state.holdingBall = false;
    
    // Throw in the direction the player is facing
    const throwDir = new THREE.Vector3(
        Math.sin(player.rotation.y),
        0.5, // Arc upward
        Math.cos(player.rotation.y)
    );
    throwDir.normalize();
    
    // Throw power
    const power = 15;
    
    basketball.userData.velocity.copy(throwDir.multiplyScalar(power));
    playPunchSound();
}

function updateBasketballHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) {
        altitudeLabel.textContent = 'TIME';
    }
    if (altitudeValue) {
        altitudeValue.textContent = state.basketballTime + 's';
    }
    if (coinsValue) {
        coinsValue.textContent = state.basketballScore + ' pts | ' + state.totalCoins + ' 🪙';
    }
}

function endBasketball() {
    if (state.basketballInterval) {
        clearInterval(state.basketballInterval);
        state.basketballInterval = null;
    }
    
    state.gameOver = true;
    state.basketballMode = false;
    
    // Reset HUD label back to ALTITUDE
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    // Award coins
    const coinsEarned = state.basketballScore;
    state.totalCoins += coinsEarned;
    
    // Update career stats
    state.careerStats.coinsEarned += coinsEarned;
    if (state.basketballScore > 0) {
        state.careerStats.basketballWins += 1;
    }
    if (state.basketballScore > state.careerStats.basketballBest) {
        state.careerStats.basketballBest = state.basketballScore;
    }
    saveData();
    
    // Show result
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    document.getElementById('game-over-title').textContent = '🏀 GOOD JOB!';
    document.getElementById('game-over-message').textContent = `You did a good job! You scored ${state.basketballScore} points and earned ${coinsEarned} coins!`;
    document.getElementById('final-score').textContent = state.basketballScore;
    document.getElementById('final-height').textContent = coinsEarned + ' 🪙';
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'POINTS';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'EARNED';
    
    // Cleanup
    basketball = null;
    basketballHoop = null;
    basketballOpponent = null;
}

// ============ SOCCER GAME ============

function startSoccer() {
    document.getElementById('sports-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    clearScene();
    state.started = true;
    state.gameOver = false;
    state.battleMode = false;
    state.basketballMode = false;
    state.soccerMode = true;
    resetMouseControl();
    state.soccerScore = 0;
    state.soccerOpponentScore = 0;
    state.soccerTime = 90;
    
    // Create soccer field
    createSoccerField();
    
    // Create goals with name tags
    soccerGoalPlayer = createSoccerGoal(0, 0, -18, "DRIFT'S GOAL"); // Shoot here to score!
    soccerGoalOpponent = createSoccerGoal(0, 0, 18, "BOB'S GOAL"); // Defend this!
    soccerGoalOpponent.rotation.y = Math.PI;
    
    // Create ball at center
    createSoccerBall(0, 1.5, 0);
    
    // Create opponent (goalie)
    createSoccerOpponent();
    
    // Reset player position
    player.position.set(0, 2, 10);
    state.playerVelocity.set(0, 0, 0);
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Start timer
    state.soccerInterval = setInterval(() => {
        state.soccerTime--;
        updateSoccerHUD();
        if (state.soccerTime <= 0) {
            endSoccer();
        }
    }, 1000);
    
    updateSoccerHUD();
    startBackgroundMusic();
}

function createSoccerField() {
    // Create field texture with canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Green grass
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, 512, 512);
    
    // Grass stripes
    ctx.fillStyle = '#367d2e';
    for (let i = 0; i < 512; i += 40) {
        ctx.fillRect(0, i, 512, 20);
    }
    
    // Field lines - white
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    
    // Boundary
    ctx.strokeRect(20, 20, 472, 472);
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(20, 256);
    ctx.lineTo(492, 256);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(256, 256, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 256, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Goal boxes
    ctx.strokeRect(156, 20, 200, 80);
    ctx.strokeRect(156, 412, 200, 80);
    
    // Penalty boxes
    ctx.strokeRect(106, 20, 300, 120);
    ctx.strokeRect(106, 372, 300, 120);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Soccer field
    const fieldGeo = new THREE.BoxGeometry(40, 1, 40);
    const fieldMat = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.8
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.position.set(0, 0.5, 0);
    field.receiveShadow = true;
    scene.add(field);
    
    field.userData.bounds = {
        minX: -20, maxX: 20,
        minY: 0, maxY: 1,
        minZ: -20, maxZ: 20
    };
    field.userData.revealed = true;
    state.platforms.push(field);
}

function createGoalNameTag(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(10, 10, 492, 108, 15);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.roundRect(10, 10, 492, 108, 15);
    ctx.stroke();
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 2, 1);
    
    return sprite;
}

function createSoccerGoal(x, y, z, ownerName) {
    const goalGroup = new THREE.Group();
    
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const netMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    // Big name tag above goal
    if (ownerName) {
        const nameTag = createGoalNameTag(ownerName);
        nameTag.position.set(0, 6, 0);
        goalGroup.add(nameTag);
    }
    
    // Goal posts
    const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 4);
    
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-4, 2, 0);
    goalGroup.add(leftPost);
    
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(4, 2, 0);
    goalGroup.add(rightPost);
    
    // Crossbar
    const crossbarGeo = new THREE.CylinderGeometry(0.15, 0.15, 8.3);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 4, 0);
    goalGroup.add(crossbar);
    
    // Net (back)
    const netBackGeo = new THREE.PlaneGeometry(8, 4);
    const netBack = new THREE.Mesh(netBackGeo, netMat);
    netBack.position.set(0, 2, -2);
    goalGroup.add(netBack);
    
    // Net (sides)
    const netSideGeo = new THREE.PlaneGeometry(2, 4);
    const netLeft = new THREE.Mesh(netSideGeo, netMat);
    netLeft.rotation.y = Math.PI / 2;
    netLeft.position.set(-4, 2, -1);
    goalGroup.add(netLeft);
    
    const netRight = new THREE.Mesh(netSideGeo, netMat);
    netRight.rotation.y = -Math.PI / 2;
    netRight.position.set(4, 2, -1);
    goalGroup.add(netRight);
    
    // Net (top)
    const netTopGeo = new THREE.PlaneGeometry(8, 2);
    const netTop = new THREE.Mesh(netTopGeo, netMat);
    netTop.rotation.x = Math.PI / 2;
    netTop.position.set(0, 4, -1);
    goalGroup.add(netTop);
    
    goalGroup.position.set(x, y, z);
    goalGroup.userData.goalPos = new THREE.Vector3(x, y + 2, z);
    scene.add(goalGroup);
    
    return goalGroup;
}

function createSoccerBall(x, y, z) {
    // Create soccer ball texture with canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw black pentagons pattern
    ctx.fillStyle = '#000000';
    
    // Center pentagon
    drawPentagon(ctx, 128, 128, 40);
    
    // Surrounding pentagons
    drawPentagon(ctx, 128, 40, 30);
    drawPentagon(ctx, 128, 216, 30);
    drawPentagon(ctx, 40, 90, 30);
    drawPentagon(ctx, 216, 90, 30);
    drawPentagon(ctx, 40, 166, 30);
    drawPentagon(ctx, 216, 166, 30);
    
    // Edge pentagons
    drawPentagon(ctx, 70, 30, 20);
    drawPentagon(ctx, 186, 30, 20);
    drawPentagon(ctx, 70, 226, 20);
    drawPentagon(ctx, 186, 226, 20);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const ballGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.4
    });
    soccerBall = new THREE.Mesh(ballGeo, ballMat);
    soccerBall.position.set(x, y, z);
    soccerBall.userData.velocity = new THREE.Vector3(0, 0, 0);
    scene.add(soccerBall);
}

function drawPentagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function createSoccerOpponent() {
    const group = new THREE.Group();
    
    // Blue jersey for Drift
    const oppMat = new THREE.MeshStandardMaterial({
        color: 0x0066ff,
        roughness: 0.4
    });
    
    const bodyGeo = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 8, 16);
    const body = new THREE.Mesh(bodyGeo, oppMat);
    body.position.y = PLAYER_HEIGHT / 2;
    group.add(body);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00, emissiveIntensity: 0.5 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, PLAYER_HEIGHT - 0.4, 0.35);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, PLAYER_HEIGHT - 0.4, 0.35);
    group.add(rightEye);
    
    // Arms for Drift
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0055dd });
    const armGeo = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8);
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.5, PLAYER_HEIGHT - 0.3, 0);
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.5, PLAYER_HEIGHT - 0.3, 0);
    group.add(rightArm);
    group.userData.rightArm = rightArm;
    
    // Legs for running animation
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0044bb });
    const legGeo = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8);
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.4, 0);
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.4, 0);
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
    
    // Name tag
    const nameTag = createNameTag("Drift");
    nameTag.position.set(0, PLAYER_HEIGHT + 0.5, 0);
    group.add(nameTag);
    
    group.userData.velocity = new THREE.Vector3(0, 0, 0);
    group.userData.targetPos = new THREE.Vector3(0, 1.5, -16);
    group.position.set(0, 1.5, -16);
    scene.add(group);
    soccerOpponent = group;
}

function updateSoccer(deltaTime) {
    if (!soccerBall || !state.soccerMode) return;
    
    // Apply gravity to ball
    soccerBall.userData.velocity.y -= 20 * deltaTime;
    
    // Apply velocity
    soccerBall.position.add(soccerBall.userData.velocity.clone().multiplyScalar(deltaTime));
    
    // Ground collision - ball radius is 0.5, field top is at y=1
    if (soccerBall.position.y < 1.5) {
        soccerBall.position.y = 1.5;
        soccerBall.userData.velocity.y *= -0.5;
        // Friction
        soccerBall.userData.velocity.x *= 0.95;
        soccerBall.userData.velocity.z *= 0.95;
    }
    
    // Keep ball in bounds
    soccerBall.position.x = Math.max(-19, Math.min(19, soccerBall.position.x));
    
    // Spin the ball
    soccerBall.rotation.x += soccerBall.userData.velocity.z * deltaTime * 2;
    soccerBall.rotation.z -= soccerBall.userData.velocity.x * deltaTime * 2;
    
    // Player kicks ball when near
    const distToBall = player.position.distanceTo(soccerBall.position);
    if (distToBall < 1.5 && soccerBall.position.y < 2) {
        // Kick in player's facing direction
        const kickDir = new THREE.Vector3(
            Math.sin(player.rotation.y),
            0.3,
            Math.cos(player.rotation.y)
        );
        soccerBall.userData.velocity.copy(kickDir.multiplyScalar(15));
    }
    
    // Check for goal (player scores)
    if (soccerBall.position.z < -17 && 
        Math.abs(soccerBall.position.x) < 4 &&
        soccerBall.position.y < 4) {
        // GOAL!
        state.soccerScore++;
        state.totalCoins += 10;
        state.careerStats.goalsScored += 1;
        state.careerStats.coinsEarned += 10;
        saveData();
        playCoinSound();
        updateSoccerHUD();
        
        // Reset ball
        soccerBall.position.set(0, 1.5, 0);
        soccerBall.userData.velocity.set(0, 0, 0);
    }
    
    // Ball out of bounds - reset
    if (soccerBall.position.z > 20 || soccerBall.position.z < -20) {
        soccerBall.position.set(0, 1.5, 0);
        soccerBall.userData.velocity.set(0, 0, 0);
    }
}

function updateSoccerOpponent(deltaTime) {
    if (!soccerOpponent || !state.soccerMode || !soccerBall) return;
    
    const drift = soccerOpponent;
    const distToBall = drift.position.distanceTo(soccerBall.position);
    
    // Drift roams the whole field
    if (distToBall > 5) {
        // Chase the ball
        const dir = new THREE.Vector3()
            .subVectors(soccerBall.position, drift.position)
            .normalize();
        
        // Medium speed
        drift.position.x += dir.x * 5 * deltaTime;
        drift.position.z += dir.z * 5 * deltaTime;
        
        // Face movement direction
        drift.rotation.y = Math.atan2(dir.x, dir.z);
    } else {
        // Near ball, a bit slower
        const dir = new THREE.Vector3()
            .subVectors(soccerBall.position, drift.position)
            .normalize();
        
        drift.position.x += dir.x * 3 * deltaTime;
        drift.position.z += dir.z * 3 * deltaTime;
        drift.rotation.y = Math.atan2(dir.x, dir.z);
    }
    
    // Kick the ball if very close (but weak kick)
    if (distToBall < 1.2 && soccerBall.position.y < 2 && Math.random() < 0.3) {
        // Weak kick in a random direction
        const kickDir = new THREE.Vector3(
            (Math.random() - 0.5),
            0.15,
            (Math.random() - 0.5)
        ).normalize();
        soccerBall.userData.velocity.copy(kickDir.multiplyScalar(6));
    }
    
    // Drift can go anywhere on the field
    drift.position.x = Math.max(-17, Math.min(17, drift.position.x));
    drift.position.z = Math.max(-17, Math.min(17, drift.position.z));
    drift.position.y = 1.5;
    
    // Animate legs when moving
    if (drift.userData.leftLeg && drift.userData.rightLeg) {
        const runCycle = Date.now() * 0.008;
        drift.userData.leftLeg.rotation.x = Math.sin(runCycle) * 0.4;
        drift.userData.rightLeg.rotation.x = Math.sin(runCycle + Math.PI) * 0.4;
    }
    
    // Animate arms
    if (drift.userData.leftArm && drift.userData.rightArm) {
        const runCycle = Date.now() * 0.008;
        drift.userData.leftArm.rotation.x = Math.sin(runCycle + Math.PI) * 0.25;
        drift.userData.rightArm.rotation.x = Math.sin(runCycle) * 0.25;
    }
}

function updateSoccerHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'TIME';
    if (altitudeValue) altitudeValue.textContent = state.soccerTime + 's';
    if (coinsValue) coinsValue.textContent = state.soccerScore + ' - ' + state.soccerOpponentScore;
}

function endSoccer() {
    if (state.soccerInterval) {
        clearInterval(state.soccerInterval);
        state.soccerInterval = null;
    }
    
    state.gameOver = true;
    state.lastGameMode = 'soccer'; // Track for restart
    state.soccerMode = false;
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    const coinsEarned = state.soccerScore * 10;
    const playerWon = state.soccerScore > state.soccerOpponentScore;
    const isTie = state.soccerScore === state.soccerOpponentScore;
    
    // Update career stats
    if (playerWon) {
        state.careerStats.soccerWins += 1;
    }
    state.careerStats.coinsEarned += coinsEarned;
    saveData();
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    // Show win/lose/tie message
    if (playerWon) {
        document.getElementById('game-over-title').textContent = '🏆 YOU WIN!';
        document.getElementById('game-over-message').textContent = `Final Score: ${state.soccerScore} - ${state.soccerOpponentScore}. Great job! You earned ${coinsEarned} coins!`;
        gameOverEl.classList.add('victory');
    } else if (isTie) {
        document.getElementById('game-over-title').textContent = '🤝 IT\'S A TIE!';
        document.getElementById('game-over-message').textContent = `Final Score: ${state.soccerScore} - ${state.soccerOpponentScore}. So close! You earned ${coinsEarned} coins!`;
    } else {
        document.getElementById('game-over-title').textContent = '😢 YOU LOST!';
        document.getElementById('game-over-message').textContent = `Final Score: ${state.soccerScore} - ${state.soccerOpponentScore}. Better luck next time! You earned ${coinsEarned} coins.`;
    }
    
    document.getElementById('final-score').textContent = state.soccerScore;
    document.getElementById('final-height').textContent = coinsEarned + ' 🪙';
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'GOALS';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'EARNED';
    
    soccerBall = null;
    soccerGoalPlayer = null;
    soccerGoalOpponent = null;
    soccerOpponent = null;
}

// ============ GOLF GAME ============

function startGolf() {
    document.getElementById('sports-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    clearScene();
    state.started = true;
    state.gameOver = false;
    state.battleMode = false;
    state.basketballMode = false;
    state.soccerMode = false;
    state.golfMode = true;
    resetMouseControl();
    state.golfStrokes = 0;
    state.golfHole = 1;
    
    // Create golf course
    createGolfCourse();
    
    // Create hole and flag
    createGolfHole(0, 0.5, -25);
    
    // Create golf ball
    createGolfBall(0, 1.5, 10);
    
    // Reset player position
    player.position.set(0, 2, 15);
    state.playerVelocity.set(0, 0, 0);
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Add golf club to Bob
    addGolfClub();
    
    updateGolfHUD();
    startBackgroundMusic();
}

let golfClub = null;
let isSwinging = false;
let swingProgress = 0;

function swingGolfClub(onHit) {
    if (!golfClub) return;
    
    isSwinging = true;
    swingProgress = 0;
    
    // Backswing
    const backswingDuration = 300;
    const downswingDuration = 150;
    const followDuration = 200;
    
    const startRotation = -0.3;
    const backswingRotation = -2.5; // Club goes back
    const hitRotation = 0.5; // Club swings through
    const followRotation = 1.5; // Follow through
    
    // Backswing animation
    const backswingStart = Date.now();
    
    function animateBackswing() {
        const elapsed = Date.now() - backswingStart;
        const t = Math.min(elapsed / backswingDuration, 1);
        
        golfClub.rotation.x = startRotation + (backswingRotation - startRotation) * t;
        
        if (t < 1) {
            requestAnimationFrame(animateBackswing);
        } else {
            // Start downswing
            animateDownswing();
        }
    }
    
    function animateDownswing() {
        const downswingStart = Date.now();
        
        function animate() {
            const elapsed = Date.now() - downswingStart;
            const t = Math.min(elapsed / downswingDuration, 1);
            
            golfClub.rotation.x = backswingRotation + (hitRotation - backswingRotation) * t;
            
            // Hit the ball at the right moment
            if (t >= 0.7 && onHit) {
                onHit();
                onHit = null; // Only call once
            }
            
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Follow through
                animateFollow();
            }
        }
        animate();
    }
    
    function animateFollow() {
        const followStart = Date.now();
        
        function animate() {
            const elapsed = Date.now() - followStart;
            const t = Math.min(elapsed / followDuration, 1);
            
            golfClub.rotation.x = hitRotation + (followRotation - hitRotation) * (1 - Math.pow(1 - t, 2));
            
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Return to ready position
                animateReturn();
            }
        }
        animate();
    }
    
    function animateReturn() {
        const returnStart = Date.now();
        const returnDuration = 400;
        
        function animate() {
            const elapsed = Date.now() - returnStart;
            const t = Math.min(elapsed / returnDuration, 1);
            
            golfClub.rotation.x = followRotation + (startRotation - followRotation) * t;
            
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                isSwinging = false;
            }
        }
        animate();
    }
    
    animateBackswing();
}

function addGolfClub() {
    // Remove old club if exists
    if (golfClub) {
        player.remove(golfClub);
        golfClub = null;
    }
    
    const clubGroup = new THREE.Group();
    
    // Club shaft
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2),
        shaftMat
    );
    shaft.position.y = 1;
    clubGroup.add(shaft);
    
    // Club grip
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const grip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.04, 0.4),
        gripMat
    );
    grip.position.y = 2;
    clubGroup.add(grip);
    
    // Club head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.3, 0.5),
        headMat
    );
    head.position.y = 0;
    head.position.z = 0.15;
    clubGroup.add(head);
    
    // Position club in Bob's hands
    clubGroup.position.set(0.5, PLAYER_HEIGHT / 2, 0.3);
    clubGroup.rotation.x = -0.3; // Slight angle
    
    player.add(clubGroup);
    golfClub = clubGroup;
    player.userData.golfClub = clubGroup;
}

function createGolfCourse() {
    // Create golf course texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fairway green
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 512, 512);
    
    // Lighter grass stripes
    ctx.fillStyle = '#2E8B2E';
    for (let i = 0; i < 512; i += 30) {
        ctx.fillRect(0, i, 512, 15);
    }
    
    // Darker rough edges
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(0, 0, 50, 512);
    ctx.fillRect(462, 0, 50, 512);
    
    // Putting green at the end (lighter)
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(256, 50, 80, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tee box at start
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(206, 440, 100, 50);
    
    // Sand bunker
    ctx.fillStyle = '#F4D03F';
    ctx.beginPath();
    ctx.ellipse(150, 200, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(380, 280, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Golf course ground
    const courseGeo = new THREE.BoxGeometry(30, 1, 50);
    const courseMat = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.9
    });
    const course = new THREE.Mesh(courseGeo, courseMat);
    course.position.set(0, 0.5, -5);
    course.receiveShadow = true;
    scene.add(course);
    
    course.userData.bounds = {
        minX: -15, maxX: 15,
        minY: 0, maxY: 1,
        minZ: -30, maxZ: 20
    };
    course.userData.revealed = true;
    state.platforms.push(course);
    
    // Add some trees/obstacles
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const treePositions = [[-12, -10], [12, -15], [-10, 5], [11, -5]];
    treePositions.forEach(([x, z]) => {
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 2),
            trunkMat
        );
        trunk.position.set(x, 2, z);
        scene.add(trunk);
        
        // Foliage
        const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 8, 8),
            treeMat
        );
        foliage.position.set(x, 4, z);
        scene.add(foliage);
    });
    
    // Create a water hazard
    const waterGeo = new THREE.BoxGeometry(12, 0.3, 6);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x1E90FF,
        transparent: true,
        opacity: 0.7
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0.7, -5);
    scene.add(water);
    
    // Bridge over water
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    // Bridge deck
    const bridgeDeck = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.3, 8),
        bridgeMat
    );
    bridgeDeck.position.set(0, 1.3, -5);
    scene.add(bridgeDeck);
    
    // Bridge railings
    const railMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const leftRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1, 8),
        railMat
    );
    leftRail.position.set(-1.8, 1.8, -5);
    scene.add(leftRail);
    
    const rightRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1, 8),
        railMat
    );
    rightRail.position.set(1.8, 1.8, -5);
    scene.add(rightRail);
    
    // WINDMILL!
    createWindmill(8, -15);
    
    // Second bridge near the hole
    const bridge2Deck = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.3, 5),
        bridgeMat
    );
    bridge2Deck.position.set(-5, 1.3, -20);
    scene.add(bridge2Deck);
    
    // Small pond near hole
    const pond = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 0.3, 16),
        waterMat
    );
    pond.position.set(-5, 0.7, -20);
    scene.add(pond);
    
    // Rocks/obstacles
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x696969 });
    const rockPositions = [[5, -12], [-8, 0], [10, -22]];
    rockPositions.forEach(([x, z]) => {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.8, 0),
            rockMat
        );
        rock.position.set(x, 1.3, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        scene.add(rock);
    });
}

// Create a spinning windmill obstacle
let windmillBlades = null;

function createWindmill(x, z) {
    const windmillGroup = new THREE.Group();
    
    // Base/tower
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xD2691E });
    const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1.5, 6, 8),
        towerMat
    );
    tower.position.set(0, 3, 0);
    windmillGroup.add(tower);
    
    // Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 2, 8),
        roofMat
    );
    roof.position.set(0, 7, 0);
    windmillGroup.add(roof);
    
    // Blade hub
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
        hubMat
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, 5, 1.2);
    windmillGroup.add(hub);
    
    // Blades group (will spin)
    const bladesGroup = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 4, 0.1),
            bladeMat
        );
        blade.position.y = 2;
        blade.rotation.z = (i * Math.PI) / 2;
        
        const bladeContainer = new THREE.Group();
        bladeContainer.add(blade);
        bladeContainer.rotation.z = (i * Math.PI) / 2;
        bladesGroup.add(bladeContainer);
    }
    
    bladesGroup.position.set(0, 5, 1.5);
    windmillGroup.add(bladesGroup);
    windmillBlades = bladesGroup;
    
    // Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.5, 0.1),
        doorMat
    );
    door.position.set(0, 1, 1.5);
    windmillGroup.add(door);
    
    windmillGroup.position.set(x, 0, z);
    scene.add(windmillGroup);
}

function createGolfHole(x, y, z) {
    const holeGroup = new THREE.Group();
    
    // Hole (dark circle)
    const holeGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(0, 0, 0);
    holeGroup.add(hole);
    
    // Flag pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 4);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0.3, 2, 0);
    holeGroup.add(pole);
    
    // Flag
    const flagGeo = new THREE.PlaneGeometry(1.2, 0.8);
    const flagMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        side: THREE.DoubleSide 
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.9, 3.5, 0);
    holeGroup.add(flag);
    golfFlag = flag;
    
    // Hole number on flag
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 64;
    numCanvas.height = 64;
    const numCtx = numCanvas.getContext('2d');
    numCtx.fillStyle = '#ffffff';
    numCtx.font = 'bold 48px Arial';
    numCtx.textAlign = 'center';
    numCtx.textBaseline = 'middle';
    numCtx.fillText('1', 32, 32);
    
    holeGroup.position.set(x, y, z);
    holeGroup.userData.holePos = new THREE.Vector3(x, y, z);
    scene.add(holeGroup);
    golfHole = holeGroup;
}

function createGolfBall(x, y, z) {
    const ballGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3
    });
    golfBall = new THREE.Mesh(ballGeo, ballMat);
    golfBall.position.set(x, y, z);
    golfBall.userData.velocity = new THREE.Vector3(0, 0, 0);
    golfBall.userData.isMoving = false;
    scene.add(golfBall);
}

function updateGolf(deltaTime) {
    if (!golfBall || !state.golfMode) return;
    
    // Apply physics to ball if moving
    if (golfBall.userData.isMoving) {
        // Gravity
        golfBall.userData.velocity.y -= 15 * deltaTime;
        
        // Apply velocity
        golfBall.position.add(golfBall.userData.velocity.clone().multiplyScalar(deltaTime));
        
        // Ground collision
        if (golfBall.position.y < 1.2) {
            golfBall.position.y = 1.2;
            golfBall.userData.velocity.y = 0;
            // Rolling friction
            golfBall.userData.velocity.x *= 0.98;
            golfBall.userData.velocity.z *= 0.98;
        }
        
        // Spin the ball
        golfBall.rotation.x += golfBall.userData.velocity.z * deltaTime * 5;
        golfBall.rotation.z -= golfBall.userData.velocity.x * deltaTime * 5;
        
        // Stop if very slow
        if (golfBall.userData.velocity.length() < 0.1) {
            golfBall.userData.velocity.set(0, 0, 0);
            golfBall.userData.isMoving = false;
        }
        
        // Keep in bounds
        if (golfBall.position.x < -14 || golfBall.position.x > 14) {
            golfBall.userData.velocity.x *= -0.5;
            golfBall.position.x = Math.max(-14, Math.min(14, golfBall.position.x));
        }
        if (golfBall.position.z < -29 || golfBall.position.z > 19) {
            golfBall.userData.velocity.z *= -0.5;
            golfBall.position.z = Math.max(-29, Math.min(19, golfBall.position.z));
        }
    }
    
    // Check if ball in hole
    if (golfHole && !golfBall.userData.isMoving) {
        const holePos = golfHole.userData.holePos;
        const dist = Math.sqrt(
            Math.pow(golfBall.position.x - holePos.x, 2) +
            Math.pow(golfBall.position.z - holePos.z, 2)
        );
        
        if (dist < 0.6) {
            // Ball in hole!
            playCoinSound();
            state.totalCoins += 20;
            saveData();
            endGolf(true);
        }
    }
    
    // Player hits ball when close and pressing space - POWER METER!
    const distToBall = player.position.distanceTo(golfBall.position);
    
    // Charge power while holding space near ball
    if (distToBall < 2.5 && state.keys['Space'] && !golfBall.userData.isMoving && !isSwinging) {
        if (!state.golfCharging) {
            state.golfCharging = true;
            state.golfPower = 5; // Start power
        } else {
            // Increase power while holding (spam to charge faster!)
            state.golfPower = Math.min(state.golfPower + 0.5, 35); // Max power 35
        }
        updateGolfHUD();
    }
    
    // Release to swing!
    if (state.golfCharging && !state.keys['Space'] && !isSwinging) {
        const power = state.golfPower || 15;
        state.golfCharging = false;
        
        // Start swing animation
        isSwinging = true;
        swingGolfClub(() => {
            // Hit the ball after swing with charged power!
            const hitDir = new THREE.Vector3(
                Math.sin(player.rotation.y),
                0.15 + (power / 100), // More power = higher arc
                Math.cos(player.rotation.y)
            );
            golfBall.userData.velocity.copy(hitDir.multiplyScalar(power));
            golfBall.userData.isMoving = true;
            state.golfStrokes++;
            state.golfPower = 0;
            updateGolfHUD();
            playPunchSound();
        });
    }
    
    // Check if ball goes near the flag - WIN!
    if (golfBall && golfHole) {
        // The hole is at z = -25
        const ballZ = golfBall.position.z;
        const ballX = golfBall.position.x;
        
        // Win if ball gets to z < -22 and is near center (x between -5 and 5)
        if (ballZ < -22 && Math.abs(ballX) < 5) {
            // Ball near the flag - WIN!
            playCoinSound();
            state.totalCoins += 20;
            saveData();
            endGolf(true);
        }
    }
    
    // Animate flag waving
    if (golfFlag) {
        golfFlag.rotation.y = Math.sin(Date.now() * 0.003) * 0.2;
    }
    
    // Animate windmill spinning
    if (windmillBlades) {
        windmillBlades.rotation.z += deltaTime * 1.5;
    }
}

function updateGolfHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'HOLE';
    if (altitudeValue) altitudeValue.textContent = state.golfHole;
    
    // Show power meter while charging, otherwise show strokes
    if (state.golfCharging && state.golfPower > 0) {
        const powerBars = Math.floor(state.golfPower / 5);
        const powerDisplay = '⚡'.repeat(powerBars) + ' ' + Math.floor(state.golfPower);
        if (coinsValue) coinsValue.textContent = 'POWER: ' + powerDisplay;
    } else {
        if (coinsValue) coinsValue.textContent = 'Strokes: ' + state.golfStrokes;
    }
}

function endGolf(won) {
    state.gameOver = true;
    state.lastGameMode = 'golf';
    state.golfMode = false;
    state.golfCharging = false;
    state.golfPower = 0;
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    const coinsEarned = won ? 20 : 0;
    
    // Update career stats
    if (won) {
        state.careerStats.golfHolesCompleted += 1;
        state.careerStats.coinsEarned += coinsEarned;
        state.totalCoins += coinsEarned;
    }
    saveData();
    
    // Track high score (lowest strokes wins!)
    let isNewRecord = false;
    if (won) {
        const savedBest = localStorage.getItem('golfBestScore');
        const bestScore = savedBest ? parseInt(savedBest) : 999;
        
        if (state.golfStrokes < bestScore) {
            localStorage.setItem('golfBestScore', state.golfStrokes.toString());
            isNewRecord = true;
        }
    }
    
    const bestScore = localStorage.getItem('golfBestScore') || '--';
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (won) {
        if (isNewRecord) {
            document.getElementById('game-over-title').textContent = '🏆 NEW RECORD!';
            document.getElementById('game-over-message').textContent = `HOLE IN ${state.golfStrokes}! Best score: ${state.golfStrokes} strokes! You earned ${coinsEarned} coins!`;
        } else {
            document.getElementById('game-over-title').textContent = '⛳ HOLE IN ' + state.golfStrokes + '!';
            document.getElementById('game-over-message').textContent = `Great shot! Best score: ${bestScore} strokes. You earned ${coinsEarned} coins!`;
        }
        gameOverEl.classList.add('victory');
        playVictorySound();
    } else {
        document.getElementById('game-over-title').textContent = '⛳ GAME OVER';
        document.getElementById('game-over-message').textContent = `Better luck next time! Best score: ${bestScore} strokes.`;
    }
    
    document.getElementById('final-score').textContent = state.golfStrokes;
    document.getElementById('final-height').textContent = 'Best: ' + bestScore;
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'STROKES';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'HIGH SCORE';
    
    golfBall = null;
    golfHole = null;
    golfFlag = null;
}

// ============ ASTEROID RACING ============
let racingTrack = null;
let racingCheckpoints = [];
let racingAsteroids = [];
let racingOpponent = null;

function startRacing() {
    clearScene();
    document.getElementById('sports-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    state.started = true;
    state.gameOver = false;
    state.racingMode = true;
    state.racingLap = 0;
    state.racingCheckpoint = 0;
    state.racingSpeed = 0;
    state.racingMaxSpeed = 25;
    state.lastPlayerAngle = 0;
    state.racingPosition = 0; // Track progress
    state.opponentProgress = 0;
    state.racingFinished = false;
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Create space racing track
    createRacingTrack();
    createRacingCheckpoints();
    createRacingAsteroids();
    createRacingOpponent();
    createPlayerCar();
    
    // Position player at start (on the track at angle 0)
    const centerRadius = 20;
    player.position.set(centerRadius, 1.5, 0);
    player.rotation.y = Math.PI / 2; // Face counter-clockwise
    state.playerVelocity.set(0, 0, 0);
    
    // Hide player body, show car
    if (player.userData.body) player.userData.body.visible = false;
    if (player.userData.head) player.userData.head.visible = false;
    if (player.userData.leftArm) player.userData.leftArm.visible = false;
    if (player.userData.rightArm) player.userData.rightArm.visible = false;
    if (player.userData.leftLeg) player.userData.leftLeg.visible = false;
    if (player.userData.rightLeg) player.userData.rightLeg.visible = false;
    if (player.userData.nameTag) player.userData.nameTag.visible = false;
    
    // Start race timer
    state.racingInterval = setInterval(() => {
        if (!state.gameOver && state.racingMode) {
            state.racingTime--;
            updateRacingHUD();
            if (state.racingTime <= 0) {
                endRacing(false);
            }
        }
    }, 1000);
    
    updateRacingHUD();
}

function createRacingTrack() {
    racingTrack = new THREE.Group();
    
    // Simple oval track - continuous loop
    const trackWidth = 10;
    
    // Create a simple flat oval track using a ring shape
    const outerRadius = 25;
    const innerRadius = outerRadius - trackWidth;
    
    // Track surface (bright for visibility)
    const trackMaterial = new THREE.MeshBasicMaterial({
        color: 0x333366,
        side: THREE.DoubleSide
    });
    
    // Create track using a ring geometry
    const trackGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const track = new THREE.Mesh(trackGeo, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0;
    racingTrack.add(track);
    
    // Glowing edge strips
    const innerEdgeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const outerEdgeMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    
    // Inner edge
    const innerEdgeGeo = new THREE.TorusGeometry(innerRadius + 0.3, 0.3, 8, 64);
    const innerEdge = new THREE.Mesh(innerEdgeGeo, innerEdgeMat);
    innerEdge.rotation.x = Math.PI / 2;
    innerEdge.position.y = 0.2;
    racingTrack.add(innerEdge);
    
    // Outer edge
    const outerEdgeGeo = new THREE.TorusGeometry(outerRadius - 0.3, 0.3, 8, 64);
    const outerEdge = new THREE.Mesh(outerEdgeGeo, outerEdgeMat);
    outerEdge.rotation.x = Math.PI / 2;
    outerEdge.position.y = 0.2;
    racingTrack.add(outerEdge);
    
    // Center line (dashed)
    const centerRadius = (innerRadius + outerRadius) / 2;
    for (let i = 0; i < 32; i += 2) {
        const angle = (i / 32) * Math.PI * 2;
        const nextAngle = ((i + 1) / 32) * Math.PI * 2;
        
        const dashGeo = new THREE.BoxGeometry(0.5, 0.3, 2);
        const dash = new THREE.Mesh(dashGeo, new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        dash.position.set(
            Math.cos(angle) * centerRadius,
            0.2,
            Math.sin(angle) * centerRadius
        );
        dash.rotation.y = -angle + Math.PI / 2;
        racingTrack.add(dash);
    }
    
    // Start/Finish line (on the track at angle 0)
    const startX = centerRadius;
    const startZ = 0;
    
    const startLineGeo = new THREE.BoxGeometry(trackWidth, 0.4, 2);
    const startLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const startLine = new THREE.Mesh(startLineGeo, startLineMat);
    startLine.position.set(startX, 0.1, startZ);
    racingTrack.add(startLine);
    
    // Checkered pattern
    for (let x = -trackWidth/2 + 0.5; x < trackWidth/2; x += 1) {
        const isBlack = Math.floor((x + trackWidth/2)) % 2 === 0;
        const checker = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.5, 1),
            new THREE.MeshBasicMaterial({ color: isBlack ? 0x000000 : 0xffffff })
        );
        checker.position.set(startX + x, 0.2, startZ);
        racingTrack.add(checker);
    }
    
    // Floating asteroid barriers around the outside
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const barrierGeo = new THREE.DodecahedronGeometry(1 + Math.random() * 1.5);
        const barrierMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.6, 0.4)
        });
        const barrier = new THREE.Mesh(barrierGeo, barrierMat);
        barrier.position.set(
            Math.cos(angle) * (outerRadius + 5 + Math.random() * 3),
            1 + Math.random() * 2,
            Math.sin(angle) * (outerRadius + 5 + Math.random() * 3)
        );
        barrier.rotation.set(Math.random(), Math.random(), Math.random());
        racingTrack.add(barrier);
    }
    
    // Add ground plane underneath for reference
    const groundGeo = new THREE.CircleGeometry(outerRadius + 15, 64);
    const groundMat = new THREE.MeshBasicMaterial({ 
        color: 0x111122,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    racingTrack.add(ground);
    
    scene.add(racingTrack);
}

function createRacingCheckpoints() {
    racingCheckpoints = [];
    
    // Checkpoints around the oval track (center radius = 20)
    const centerRadius = 20;
    const numCheckpoints = 8;
    
    for (let i = 0; i < numCheckpoints; i++) {
        const angle = (i / numCheckpoints) * Math.PI * 2;
        const x = Math.cos(angle) * centerRadius;
        const z = Math.sin(angle) * centerRadius;
        
        const checkpoint = {
            x: x,
            z: z,
            radius: 8,
            index: i
        };
        racingCheckpoints.push(checkpoint);
        
        // Visual gate (holographic ring)
        const gateMat = new THREE.MeshBasicMaterial({
            color: i === 0 ? 0xffff00 : 0x00ff88,
            transparent: true,
            opacity: 0.5
        });
        const gateGeo = new THREE.TorusGeometry(5, 0.3, 8, 16);
        const gate = new THREE.Mesh(gateGeo, gateMat);
        gate.position.set(x, 3, z);
        gate.rotation.y = angle;
        gate.userData.checkpointIndex = i;
        scene.add(gate);
    }
}

function createRacingAsteroids() {
    racingAsteroids = [];
    
    // Floating asteroid obstacles ON the track
    const centerRadius = 20;
    const numAsteroids = 6;
    
    for (let i = 0; i < numAsteroids; i++) {
        // Place asteroids at various points around the track
        const angle = (i / numAsteroids) * Math.PI * 2 + 0.3; // Offset from checkpoints
        const radiusOffset = (Math.random() - 0.5) * 6; // Random position across track width
        
        const asteroidGeo = new THREE.DodecahedronGeometry(1.5 + Math.random());
        const asteroidMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.08, 0.7, 0.5)
        });
        const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
        asteroid.position.set(
            Math.cos(angle) * (centerRadius + radiusOffset),
            1.5,
            Math.sin(angle) * (centerRadius + radiusOffset)
        );
        asteroid.userData.originalY = 1.5;
        asteroid.userData.floatOffset = Math.random() * Math.PI * 2;
        scene.add(asteroid);
        racingAsteroids.push(asteroid);
    }
}

let playerCar = null;

function createPlayerCar() {
    playerCar = new THREE.Group();
    
    // === MAIN BODY - Sleek futuristic shape ===
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-1.5, 0);
    bodyShape.lineTo(-1.2, 0.4);
    bodyShape.lineTo(1.5, 0.4);
    bodyShape.lineTo(1.8, 0);
    bodyShape.lineTo(-1.5, 0);
    
    // Main body (elongated wedge shape)
    const bodyGeo = new THREE.BoxGeometry(3.5, 0.6, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x00ccff,
        metalness: 0.9,
        roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    playerCar.add(body);
    
    // Front wedge (pointed nose)
    const noseGeo = new THREE.ConeGeometry(0.9, 1.5, 4);
    const noseMat = new THREE.MeshStandardMaterial({
        color: 0x00ccff,
        metalness: 0.9,
        roughness: 0.1
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = -Math.PI / 2;
    nose.rotation.z = Math.PI / 4;
    nose.position.set(2.5, 0, 0);
    playerCar.add(nose);
    
    // === COCKPIT - Glass canopy ===
    const cockpitGeo = new THREE.SphereGeometry(0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x88ffff,
        transparent: true,
        opacity: 0.4,
        metalness: 0.9,
        roughness: 0
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0.3, 0.5, 0);
    cockpit.scale.set(1.2, 0.8, 1);
    playerCar.add(cockpit);
    
    // === SIDE FINS ===
    const finGeo = new THREE.BoxGeometry(1.5, 0.8, 0.1);
    const finMat = new THREE.MeshStandardMaterial({
        color: 0x0088ff,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const leftFin = new THREE.Mesh(finGeo, finMat);
    leftFin.position.set(-0.5, 0.4, -1);
    leftFin.rotation.z = Math.PI / 6;
    playerCar.add(leftFin);
    
    const rightFin = new THREE.Mesh(finGeo, finMat);
    rightFin.position.set(-0.5, 0.4, 1);
    rightFin.rotation.z = Math.PI / 6;
    playerCar.add(rightFin);
    
    // === REAR SPOILER ===
    const spoilerGeo = new THREE.BoxGeometry(0.2, 0.3, 2.2);
    const spoilerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(-1.8, 0.6, 0);
    playerCar.add(spoiler);
    
    // Spoiler supports
    const supportGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const leftSupport = new THREE.Mesh(supportGeo, spoilerMat);
    leftSupport.position.set(-1.8, 0.4, -0.8);
    playerCar.add(leftSupport);
    
    const rightSupport = new THREE.Mesh(supportGeo, spoilerMat);
    rightSupport.position.set(-1.8, 0.4, 0.8);
    playerCar.add(rightSupport);
    
    // === ENGINE THRUSTERS ===
    const thrusterGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.6, 8);
    const thrusterMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9
    });
    
    // Left thruster
    const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    leftThruster.rotation.x = Math.PI / 2;
    leftThruster.position.set(-1.9, 0, -0.5);
    playerCar.add(leftThruster);
    
    // Right thruster
    const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    rightThruster.rotation.x = Math.PI / 2;
    rightThruster.position.set(-1.9, 0, 0.5);
    playerCar.add(rightThruster);
    
    // === THRUSTER FLAMES (animated glow) ===
    const flameGeo = new THREE.ConeGeometry(0.2, 1, 8);
    const flameMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    
    const leftFlame = new THREE.Mesh(flameGeo, flameMat);
    leftFlame.rotation.x = -Math.PI / 2;
    leftFlame.position.set(-2.4, 0, -0.5);
    playerCar.add(leftFlame);
    playerCar.userData.leftFlame = leftFlame;
    
    const rightFlame = new THREE.Mesh(flameGeo, flameMat);
    rightFlame.rotation.x = -Math.PI / 2;
    rightFlame.position.set(-2.4, 0, 0.5);
    playerCar.add(rightFlame);
    playerCar.userData.rightFlame = rightFlame;
    
    // === HEADLIGHTS ===
    const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.position.set(1.7, 0.1, -0.6);
    playerCar.add(leftLight);
    
    const rightLight = new THREE.Mesh(lightGeo, lightMat);
    rightLight.position.set(1.7, 0.1, 0.6);
    playerCar.add(rightLight);
    
    // === NEON UNDERGLOW ===
    const underglowGeo = new THREE.BoxGeometry(3, 0.05, 1.5);
    const underglowMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
    });
    const underglow = new THREE.Mesh(underglowGeo, underglowMat);
    underglow.position.y = -0.35;
    playerCar.add(underglow);
    playerCar.userData.underglow = underglow;
    
    // === RACING STRIPES ===
    const stripeGeo = new THREE.BoxGeometry(3.6, 0.62, 0.15);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    
    const leftStripe = new THREE.Mesh(stripeGeo, stripeMat);
    leftStripe.position.set(0, 0, -0.5);
    playerCar.add(leftStripe);
    
    const rightStripe = new THREE.Mesh(stripeGeo, stripeMat);
    rightStripe.position.set(0, 0, 0.5);
    playerCar.add(rightStripe);
    
    // === NAME TAG ===
    const nameTag = createNameTag('BOB');
    nameTag.position.y = 1.5;
    playerCar.add(nameTag);
    
    // Position car relative to player - rotate so front faces forward
    playerCar.position.y = -0.5;
    playerCar.rotation.y = -Math.PI / 2; // Rotate car to face forward
    player.add(playerCar);
}

function createRacingOpponent() {
    racingOpponent = new THREE.Group();
    
    // === MAX'S CAR - Green aggressive style ===
    const carColor = 0x00cc44;
    const accentColor = 0x00ff66;
    
    // Main body
    const bodyGeo = new THREE.BoxGeometry(3.5, 0.6, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: carColor,
        metalness: 0.9,
        roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    racingOpponent.add(body);
    
    // Front wedge (pointed nose)
    const noseGeo = new THREE.ConeGeometry(0.9, 1.5, 4);
    const noseMat = new THREE.MeshStandardMaterial({
        color: carColor,
        metalness: 0.9,
        roughness: 0.1
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = -Math.PI / 2;
    nose.rotation.z = Math.PI / 4;
    nose.position.set(2.5, 0, 0);
    racingOpponent.add(nose);
    
    // Cockpit (glass dome)
    const cockpitGeo = new THREE.SphereGeometry(0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x88ff88,
        transparent: true,
        opacity: 0.4,
        metalness: 0.9
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0.3, 0.5, 0);
    cockpit.scale.set(1.2, 0.8, 1);
    racingOpponent.add(cockpit);
    
    // === MAX - THE DRIVER ===
    const driverGroup = new THREE.Group();
    
    // Max's head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xff9966 }); // Skin tone
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.3, 0.7, 0);
    driverGroup.add(head);
    
    // Racing helmet
    const helmetGeo = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const helmetMat = new THREE.MeshStandardMaterial({ color: carColor, metalness: 0.8 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0.3, 0.75, 0);
    driverGroup.add(helmet);
    
    // Visor
    const visorGeo = new THREE.BoxGeometry(0.3, 0.15, 0.4);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0.55, 0.7, 0);
    driverGroup.add(visor);
    
    // Body/suit
    const suitGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
    const suitMat = new THREE.MeshStandardMaterial({ color: carColor });
    const suit = new THREE.Mesh(suitGeo, suitMat);
    suit.position.set(0.3, 0.35, 0);
    driverGroup.add(suit);
    
    racingOpponent.add(driverGroup);
    
    // Side fins
    const finGeo = new THREE.BoxGeometry(1.5, 0.8, 0.1);
    const finMat = new THREE.MeshStandardMaterial({
        color: 0x008833,
        metalness: 0.8
    });
    const leftFin = new THREE.Mesh(finGeo, finMat);
    leftFin.position.set(-0.5, 0.4, -1);
    leftFin.rotation.z = Math.PI / 6;
    racingOpponent.add(leftFin);
    const rightFin = new THREE.Mesh(finGeo, finMat);
    rightFin.position.set(-0.5, 0.4, 1);
    rightFin.rotation.z = Math.PI / 6;
    racingOpponent.add(rightFin);
    
    // Spoiler
    const spoilerGeo = new THREE.BoxGeometry(0.2, 0.3, 2.2);
    const spoilerMat = new THREE.MeshBasicMaterial({ color: accentColor });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(-1.8, 0.6, 0);
    racingOpponent.add(spoiler);
    
    // Spoiler supports
    const supportGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const leftSupport = new THREE.Mesh(supportGeo, spoilerMat);
    leftSupport.position.set(-1.8, 0.4, -0.8);
    racingOpponent.add(leftSupport);
    const rightSupport = new THREE.Mesh(supportGeo, spoilerMat);
    rightSupport.position.set(-1.8, 0.4, 0.8);
    racingOpponent.add(rightSupport);
    
    // Thrusters with flames
    const thrusterGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.6, 8);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
    const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    leftThruster.rotation.x = Math.PI / 2;
    leftThruster.position.set(-1.9, 0, -0.5);
    racingOpponent.add(leftThruster);
    const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    rightThruster.rotation.x = Math.PI / 2;
    rightThruster.position.set(-1.9, 0, 0.5);
    racingOpponent.add(rightThruster);
    
    // Flames (green tinted)
    const flameGeo = new THREE.ConeGeometry(0.2, 1, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 });
    const leftFlame = new THREE.Mesh(flameGeo, flameMat);
    leftFlame.rotation.x = -Math.PI / 2;
    leftFlame.position.set(-2.4, 0, -0.5);
    racingOpponent.add(leftFlame);
    racingOpponent.userData.leftFlame = leftFlame;
    const rightFlame = new THREE.Mesh(flameGeo, flameMat);
    rightFlame.rotation.x = -Math.PI / 2;
    rightFlame.position.set(-2.4, 0, 0.5);
    racingOpponent.add(rightFlame);
    racingOpponent.userData.rightFlame = rightFlame;
    
    // Headlights
    const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.position.set(1.7, 0.1, -0.6);
    racingOpponent.add(leftLight);
    const rightLight = new THREE.Mesh(lightGeo, lightMat);
    rightLight.position.set(1.7, 0.1, 0.6);
    racingOpponent.add(rightLight);
    
    // Underglow (green)
    const underglowGeo = new THREE.BoxGeometry(3, 0.05, 1.5);
    const underglowMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.6 });
    const underglow = new THREE.Mesh(underglowGeo, underglowMat);
    underglow.position.y = -0.35;
    racingOpponent.add(underglow);
    
    // Racing stripes (white)
    const stripeGeo = new THREE.BoxGeometry(3.6, 0.62, 0.15);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftStripe = new THREE.Mesh(stripeGeo, stripeMat);
    leftStripe.position.set(0, 0, -0.5);
    racingOpponent.add(leftStripe);
    const rightStripe = new THREE.Mesh(stripeGeo, stripeMat);
    rightStripe.position.set(0, 0, 0.5);
    racingOpponent.add(rightStripe);
    
    // Name tag - MAX
    const nameTag = createNameTag('MAX');
    nameTag.position.y = 1.8;
    racingOpponent.add(nameTag);
    
    // Start opponent next to player
    const centerRadius = 20;
    racingOpponent.position.set(centerRadius + 2, 1, 2);
    racingOpponent.rotation.y = Math.PI / 2;
    racingOpponent.userData.progress = 0;
    racingOpponent.userData.speed = 0;
    racingOpponent.userData.checkpoint = 0;
    racingOpponent.userData.lap = 0;
    
    scene.add(racingOpponent);
}

function updateRacing(deltaTime) {
    if (!state.racingMode || state.racingFinished) return;
    
    // Standard WASD controls - move around the track
    const moveSpeed = 18;
    let moveX = 0;
    let moveZ = 0;
    
    if (state.keys['KeyW'] || state.keys['ArrowUp']) {
        moveZ = -moveSpeed * deltaTime;
    }
    if (state.keys['KeyS'] || state.keys['ArrowDown']) {
        moveZ = moveSpeed * deltaTime;
    }
    if (state.keys['KeyA'] || state.keys['ArrowLeft']) {
        moveX = -moveSpeed * deltaTime;
    }
    if (state.keys['KeyD'] || state.keys['ArrowRight']) {
        moveX = moveSpeed * deltaTime;
    }
    
    // Apply movement
    player.position.x += moveX;
    player.position.z += moveZ;
    player.position.y = 1.5;
    
    // Face movement direction
    if (moveX !== 0 || moveZ !== 0) {
        player.rotation.y = Math.atan2(moveX, moveZ);
        state.racingSpeed = moveSpeed;
    } else {
        state.racingSpeed = 0;
    }
    
    // Tilt car when turning left/right with A/D
    if (playerCar) {
        // Tilt the car sideways when pressing A or D
        let targetTilt = 0;
        if (state.keys['KeyA'] || state.keys['ArrowLeft']) {
            targetTilt = 0.3; // Tilt right when turning left
        }
        if (state.keys['KeyD'] || state.keys['ArrowRight']) {
            targetTilt = -0.3; // Tilt left when turning right
        }
        
        // Smooth tilt animation
        if (!playerCar.userData.currentTilt) playerCar.userData.currentTilt = 0;
        playerCar.userData.currentTilt += (targetTilt - playerCar.userData.currentTilt) * 0.15;
        playerCar.rotation.z = playerCar.userData.currentTilt;
    }
    
    // Keep player on/near track (circular track with radius ~20)
    const distFromCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
    const trackCenter = 20;
    const trackWidth = 6;
    
    // Soft boundary - push back if too far from track
    if (distFromCenter < trackCenter - trackWidth) {
        const angle = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(angle) * (trackCenter - trackWidth);
        player.position.z = Math.sin(angle) * (trackCenter - trackWidth);
    }
    if (distFromCenter > trackCenter + trackWidth) {
        const angle = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(angle) * (trackCenter + trackWidth);
        player.position.z = Math.sin(angle) * (trackCenter + trackWidth);
    }
    
    // Animate car flames based on speed
    if (playerCar) {
        const flameScale = state.racingSpeed > 0 ? 1.5 : 0.5;
        if (playerCar.userData.leftFlame) {
            playerCar.userData.leftFlame.scale.y = flameScale + Math.random() * 0.3;
            playerCar.userData.rightFlame.scale.y = flameScale + Math.random() * 0.3;
        }
        if (playerCar.userData.underglow) {
            playerCar.userData.underglow.material.opacity = 0.4 + Math.sin(Date.now() * 0.01) * 0.2;
        }
    }
    
    // Animate opponent flames
    if (racingOpponent && racingOpponent.userData.leftFlame) {
        const oppFlameScale = 0.5 + (racingOpponent.userData.speed / 15) * 1.5;
        racingOpponent.userData.leftFlame.scale.y = oppFlameScale + Math.random() * 0.3;
        racingOpponent.userData.rightFlame.scale.y = oppFlameScale + Math.random() * 0.3;
    }
    
    // Check checkpoints for player - simple lap counting
    const playerAngle = Math.atan2(player.position.z, player.position.x);
    const playerAngleNormalized = (playerAngle + Math.PI * 2) % (Math.PI * 2);
    
    // Detect when player crosses the start line (angle ~0)
    if (!state.lastPlayerAngle) state.lastPlayerAngle = playerAngleNormalized;
    
    // Crossed from high angle to low angle (completed a lap going counter-clockwise)
    if (state.lastPlayerAngle > Math.PI * 1.5 && playerAngleNormalized < Math.PI * 0.5) {
        state.racingLap++;
        state.careerStats.racingTotalLaps++;
        saveData();
        playJumpSound();
        
        if (state.racingLap >= 5) {
            endRacing(true);
            return;
        }
        updateRacingHUD();
    }
    
    state.lastPlayerAngle = playerAngleNormalized;
    
    // Asteroid collisions - slow down
    racingAsteroids.forEach(asteroid => {
        const dist = player.position.distanceTo(asteroid.position);
        if (dist < 2) {
            state.racingSpeed = -3; // Bounce back
            playPunchSound();
        }
        
        // Float animation
        asteroid.position.y = asteroid.userData.originalY + 
            Math.sin(Date.now() * 0.002 + asteroid.userData.floatOffset) * 0.3;
        asteroid.rotation.y += deltaTime * 0.5;
    });
    
    // Update opponent AI
    updateRacingOpponent(deltaTime);
    
    // Track progress
    state.racingPosition = state.racingLap * 100 + state.racingCheckpoint * 10;
}

function updateRacingOpponent(deltaTime) {
    if (!racingOpponent) return;
    
    const opp = racingOpponent;
    
    // Max races around the circular track
    // Speed varies slightly to make it interesting
    const baseSpeed = 14; // Competitive but beatable
    const speedVariation = Math.sin(Date.now() * 0.0005) * 2;
    opp.userData.speed = baseSpeed + speedVariation;
    
    // Move counter-clockwise around the track (increasing angle)
    if (!opp.userData.trackAngle) opp.userData.trackAngle = 0;
    
    const angularSpeed = opp.userData.speed / 20; // Convert to angular velocity (track radius ~20)
    opp.userData.trackAngle += angularSpeed * deltaTime;
    
    // Position on circular track
    const trackRadius = 20;
    opp.position.x = Math.cos(opp.userData.trackAngle) * trackRadius;
    opp.position.z = Math.sin(opp.userData.trackAngle) * trackRadius;
    opp.position.y = 1.5;
    
    // Face direction of travel (tangent to circle)
    opp.rotation.y = -opp.userData.trackAngle + Math.PI / 2;
    
    // Track laps - every 2*PI is one lap
    const currentLap = Math.floor(opp.userData.trackAngle / (Math.PI * 2));
    if (currentLap > opp.userData.lap) {
        opp.userData.lap = currentLap;
        
        if (opp.userData.lap >= 5 && !state.racingFinished) {
            // Max won - first to 5 laps!
            endRacing(false);
        }
        updateRacingHUD();
    }
}

function updateRacingHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'YOUR LAP';
    if (altitudeValue) altitudeValue.textContent = `${state.racingLap}/5`;
    
    // Show Max's lap progress
    const maxLap = racingOpponent ? racingOpponent.userData.lap : 0;
    const winning = state.racingLap > maxLap ? '🥇' : (state.racingLap < maxLap ? '🥈' : '🏁');
    if (coinsValue) coinsValue.textContent = `${winning} MAX: ${maxLap}/5 laps | First to 5 wins!`;
}

function endRacing(won) {
    state.gameOver = true;
    state.lastGameMode = 'racing';
    state.racingMode = false;
    state.racingFinished = true;
    
    if (state.racingInterval) {
        clearInterval(state.racingInterval);
        state.racingInterval = null;
    }
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    const coinsEarned = won ? 25 : 5;
    state.totalCoins += coinsEarned;
    state.careerStats.coinsEarned += coinsEarned;
    if (won) {
        state.careerStats.racesWon += 1;
    }
    saveData();
    
    // Track best time
    let isNewRecord = false;
    if (won) {
        const raceTime = 60 - state.racingTime;
        const savedBest = localStorage.getItem('racingBestTime');
        const bestTime = savedBest ? parseInt(savedBest) : 999;
        
        if (raceTime < bestTime) {
            localStorage.setItem('racingBestTime', raceTime.toString());
            isNewRecord = true;
        }
    }
    
    const bestTime = localStorage.getItem('racingBestTime') || '--';
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (won) {
        if (isNewRecord) {
            document.getElementById('game-over-title').textContent = '🏆 NEW RECORD!';
            document.getElementById('game-over-message').textContent = `Race completed in ${60 - state.racingTime}s! You earned ${coinsEarned} coins!`;
        } else {
            document.getElementById('game-over-title').textContent = '🏎️ YOU WON!';
            document.getElementById('game-over-message').textContent = `Great race! Best time: ${bestTime}s. You earned ${coinsEarned} coins!`;
        }
        gameOverEl.classList.add('victory');
        playVictorySound();
    } else {
        document.getElementById('game-over-title').textContent = '🏎️ YOU LOST';
        document.getElementById('game-over-message').textContent = `Nova beat you! Best time: ${bestTime}s. You earned ${coinsEarned} coins.`;
    }
    
    document.getElementById('final-score').textContent = `${state.racingLap}/3 laps`;
    document.getElementById('final-height').textContent = 'Best: ' + bestTime + 's';
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'PROGRESS';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'BEST TIME';
    
    // Cleanup
    racingTrack = null;
    racingCheckpoints = [];
    racingAsteroids = [];
    racingOpponent = null;
    
    // Remove player car and show player body again
    if (playerCar) {
        player.remove(playerCar);
        playerCar = null;
    }
    if (player.userData.body) player.userData.body.visible = true;
    if (player.userData.head) player.userData.head.visible = true;
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    if (player.userData.leftLeg) player.userData.leftLeg.visible = true;
    if (player.userData.rightLeg) player.userData.rightLeg.visible = true;
    if (player.userData.nameTag) player.userData.nameTag.visible = true;
}

// ============ COIN COLLECTOR MINI-GAME ============
function startCoinCollector() {
    clearScene();
    document.getElementById('minigames-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    state.started = true;
    state.gameOver = false;
    state.coinCollectorMode = true;
    state.coinCollectorScore = 0;
    state.coinCollectorTedScore = 0;
    state.coinCollectorTime = 45; // 45 seconds
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Create colorful map
    createCoinCollectorMap();
    
    // Create lots of coins
    createCoinCollectorCoins();
    
    // Create Ted (AI opponent)
    createTed();
    
    // Position player
    player.position.set(-8, 2, -8);
    state.playerVelocity.set(0, 0, 0);
    
    // Start timer
    state.coinCollectorInterval = setInterval(() => {
        if (!state.gameOver && state.coinCollectorMode) {
            state.coinCollectorTime--;
            updateCoinCollectorHUD();
            if (state.coinCollectorTime <= 0) {
                endCoinCollector();
            }
        }
    }, 1000);
    
    // Spawn new coins every 3 seconds
    state.coinSpawnInterval = setInterval(() => {
        if (!state.gameOver && state.coinCollectorMode) {
            spawnCoinCollectorCoin();
        }
    }, 3000);
    
    updateCoinCollectorHUD();
}

function createCoinCollectorMap() {
    // Colorful ground with rainbow sections
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0x9b59b6, 0xff9f43];
    
    // Main floor - colorful tiles
    for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
            const tileGeo = new THREE.BoxGeometry(5, 0.5, 5);
            const colorIndex = (Math.abs(x) + Math.abs(z)) % colors.length;
            const tileMat = new THREE.MeshStandardMaterial({
                color: colors[colorIndex],
                roughness: 0.4,
                metalness: 0.1
            });
            const tile = new THREE.Mesh(tileGeo, tileMat);
            tile.position.set(x * 5, 0, z * 5);
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }
    
    // Raised platforms for variety
    const platformPositions = [
        { x: -10, z: -10, color: 0xff6b6b },
        { x: 10, z: -10, color: 0xffd93d },
        { x: -10, z: 10, color: 0x6bcb77 },
        { x: 10, z: 10, color: 0x4d96ff },
        { x: 0, z: 0, color: 0x9b59b6 }
    ];
    
    platformPositions.forEach(pos => {
        const platGeo = new THREE.CylinderGeometry(3, 3.5, 2, 8);
        const platMat = new THREE.MeshStandardMaterial({
            color: pos.color,
            roughness: 0.3
        });
        const platform = new THREE.Mesh(platGeo, platMat);
        platform.position.set(pos.x, 1, pos.z);
        scene.add(platform);
    });
    
    // Decorative pillars with lights
    const pillarPositions = [
        { x: -15, z: -15 }, { x: 15, z: -15 },
        { x: -15, z: 15 }, { x: 15, z: 15 }
    ];
    
    pillarPositions.forEach((pos, i) => {
        const pillarGeo = new THREE.CylinderGeometry(0.5, 0.7, 6, 8);
        const pillarMat = new THREE.MeshStandardMaterial({
            color: colors[i],
            metalness: 0.5
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(pos.x, 3, pos.z);
        scene.add(pillar);
        
        // Glowing orb on top
        const orbGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const orbMat = new THREE.MeshBasicMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.set(pos.x, 6.5, pos.z);
        scene.add(orb);
    });
    
    // Bouncy mushrooms (decorative)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 12;
        
        const stemGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0xffeaa7 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(Math.cos(angle) * radius, 0.75, Math.sin(angle) * radius);
        scene.add(stem);
        
        const capGeo = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMat = new THREE.MeshStandardMaterial({ 
            color: colors[i % colors.length],
            roughness: 0.2
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
        scene.add(cap);
    }
    
    // Rainbow arch
    const archColors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0077ff, 0x8800ff];
    archColors.forEach((color, i) => {
        const archGeo = new THREE.TorusGeometry(8 - i * 0.5, 0.3, 8, 32, Math.PI);
        const archMat = new THREE.MeshBasicMaterial({ color: color });
        const arch = new THREE.Mesh(archGeo, archMat);
        arch.position.set(0, 1, -12);
        arch.rotation.x = Math.PI / 2;
        arch.rotation.z = Math.PI / 2;
        scene.add(arch);
    });
}

function createCoinCollectorCoins() {
    coinCollectorCoins = [];
    
    // Create 40 coins spread around the map
    const coinPositions = [];
    
    // Coins on main floor
    for (let i = 0; i < 25; i++) {
        coinPositions.push({
            x: (Math.random() - 0.5) * 30,
            y: 1.5,
            z: (Math.random() - 0.5) * 30
        });
    }
    
    // Coins on platforms
    const platformCenters = [
        { x: -10, z: -10 }, { x: 10, z: -10 },
        { x: -10, z: 10 }, { x: 10, z: 10 }, { x: 0, z: 0 }
    ];
    platformCenters.forEach(pos => {
        for (let i = 0; i < 3; i++) {
            coinPositions.push({
                x: pos.x + (Math.random() - 0.5) * 4,
                y: 3.5,
                z: pos.z + (Math.random() - 0.5) * 4
            });
        }
    });
    
    // Create the coins
    coinPositions.forEach(pos => {
        const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffa500,
            emissiveIntensity: 0.3
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(pos.x, pos.y, pos.z);
        coin.rotation.x = Math.PI / 2;
        coin.userData.collected = false;
        coin.userData.floatOffset = Math.random() * Math.PI * 2;
        scene.add(coin);
        coinCollectorCoins.push(coin);
    });
}

function spawnCoinCollectorCoin() {
    // Random position - either on floor or on a platform
    let x, y, z;
    
    if (Math.random() < 0.7) {
        // Spawn on main floor
        x = (Math.random() - 0.5) * 30;
        y = 1.5;
        z = (Math.random() - 0.5) * 30;
    } else {
        // Spawn on a random platform
        const platforms = [
            { x: -10, z: -10 }, { x: 10, z: -10 },
            { x: -10, z: 10 }, { x: 10, z: 10 }, { x: 0, z: 0 }
        ];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        x = platform.x + (Math.random() - 0.5) * 4;
        y = 3.5;
        z = platform.z + (Math.random() - 0.5) * 4;
    }
    
    const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
    const coinMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xffa500,
        emissiveIntensity: 0.3
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.position.set(x, y, z);
    coin.rotation.x = Math.PI / 2;
    coin.userData.collected = false;
    coin.userData.floatOffset = Math.random() * Math.PI * 2;
    coin.userData.isNew = true; // Mark as newly spawned
    
    // Spawn animation - start small and grow
    coin.scale.set(0.1, 0.1, 0.1);
    
    scene.add(coin);
    coinCollectorCoins.push(coin);
}

function createTed() {
    coinCollectorTed = new THREE.Group();
    
    // Ted's body (orange/red theme)
    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff6b35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    coinCollectorTed.add(body);
    
    // Ted's head
    const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xff6b35 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2;
    coinCollectorTed.add(head);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 2.05, 0.3);
    coinCollectorTed.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 2.05, 0.3);
    coinCollectorTed.add(rightEye);
    
    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.15, 2.05, 0.38);
    coinCollectorTed.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.15, 2.05, 0.38);
    coinCollectorTed.add(rightPupil);
    
    // Happy smile
    const smileGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 1.9, 0.35);
    smile.rotation.x = Math.PI;
    coinCollectorTed.add(smile);
    
    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.12, 0.5, 4, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xff6b35 });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.6, 1.2, 0);
    leftArm.rotation.z = 0.3;
    coinCollectorTed.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.6, 1.2, 0);
    rightArm.rotation.z = -0.3;
    coinCollectorTed.add(rightArm);
    
    // Legs
    const legGeo = new THREE.CapsuleGeometry(0.15, 0.4, 4, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xff6b35 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, 0.3, 0);
    coinCollectorTed.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, 0.3, 0);
    coinCollectorTed.add(rightLeg);
    
    // Name tag
    const nameTag = createNameTag('TED');
    nameTag.position.y = 3;
    coinCollectorTed.add(nameTag);
    
    // Position Ted
    coinCollectorTed.position.set(8, 0, 8);
    coinCollectorTed.userData.targetCoin = null;
    coinCollectorTed.userData.speed = 8;
    
    scene.add(coinCollectorTed);
}

function updateCoinCollector(deltaTime) {
    if (!state.coinCollectorMode) return;
    
    // Check if player fell off the map
    if (player.position.y < -10) {
        playDeathSound();
        endCoinCollector();
        return;
    }
    
    // Ground collision for coin collector map
    const px = player.position.x;
    const pz = player.position.z;
    
    // Check if on main floor (tiles from -17.5 to 17.5)
    const onMainFloor = px >= -17.5 && px <= 17.5 && pz >= -17.5 && pz <= 17.5;
    
    // Check if on raised platforms (cylinders at corners and center)
    const platformPositions = [
        { x: -10, z: -10 }, { x: 10, z: -10 },
        { x: -10, z: 10 }, { x: 10, z: 10 }, { x: 0, z: 0 }
    ];
    
    let onPlatform = false;
    let platformHeight = 0;
    platformPositions.forEach(pos => {
        const dist = Math.sqrt(Math.pow(px - pos.x, 2) + Math.pow(pz - pos.z, 2));
        if (dist < 3) {
            onPlatform = true;
            platformHeight = 2; // Platform is 2 units tall
        }
    });
    
    // Apply ground collision
    if (onPlatform) {
        // On a raised platform
        if (player.position.y < platformHeight + 1) {
            player.position.y = platformHeight + 1;
            state.playerVelocity.y = 0;
            state.playerOnGround = true;
        }
    } else if (onMainFloor) {
        // On the main floor
        if (player.position.y < 1) {
            player.position.y = 1;
            state.playerVelocity.y = 0;
            state.playerOnGround = true;
        }
    } else {
        // Off the map - apply gravity
        state.playerOnGround = false;
    }
    
    // Animate coins (spin and float)
    coinCollectorCoins.forEach(coin => {
        if (!coin.userData.collected) {
            coin.rotation.y += deltaTime * 3;
            coin.position.y += Math.sin(Date.now() * 0.003 + coin.userData.floatOffset) * 0.01;
            
            // Spawn animation for new coins
            if (coin.userData.isNew && coin.scale.x < 1) {
                coin.scale.x += deltaTime * 3;
                coin.scale.y += deltaTime * 3;
                coin.scale.z += deltaTime * 3;
                if (coin.scale.x >= 1) {
                    coin.scale.set(1, 1, 1);
                    coin.userData.isNew = false;
                }
            }
        }
    });
    
    // Check player collecting coins
    coinCollectorCoins.forEach(coin => {
        if (!coin.userData.collected) {
            const dist = player.position.distanceTo(coin.position);
            if (dist < 1.5) {
                coin.userData.collected = true;
                scene.remove(coin);
                state.coinCollectorScore++;
                playCoinSound();
                updateCoinCollectorHUD();
            }
        }
    });
    
    // Update Ted AI
    updateTedAI(deltaTime);
    
    // Check Ted collecting coins
    if (coinCollectorTed) {
        coinCollectorCoins.forEach(coin => {
            if (!coin.userData.collected) {
                const dist = coinCollectorTed.position.distanceTo(coin.position);
                if (dist < 1.5) {
                    coin.userData.collected = true;
                    scene.remove(coin);
                    state.coinCollectorTedScore++;
                    updateCoinCollectorHUD();
                }
            }
        });
    }
    
    // Check if all coins collected
    const remaining = coinCollectorCoins.filter(c => !c.userData.collected).length;
    if (remaining === 0) {
        endCoinCollector();
    }
}

function updateTedAI(deltaTime) {
    if (!coinCollectorTed) return;
    
    // Find nearest uncollected coin
    let nearestCoin = null;
    let nearestDist = Infinity;
    
    coinCollectorCoins.forEach(coin => {
        if (!coin.userData.collected) {
            const dist = coinCollectorTed.position.distanceTo(coin.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestCoin = coin;
            }
        }
    });
    
    if (nearestCoin) {
        // Move toward nearest coin
        const dir = new THREE.Vector3()
            .subVectors(nearestCoin.position, coinCollectorTed.position)
            .normalize();
        
        // Slower speed, gives player a chance
        const speed = 6;
        coinCollectorTed.position.x += dir.x * speed * deltaTime;
        coinCollectorTed.position.z += dir.z * speed * deltaTime;
        coinCollectorTed.position.y = 0; // Stay on ground
        
        // Face movement direction
        coinCollectorTed.rotation.y = Math.atan2(dir.x, dir.z);
        
        // Bobbing animation when moving
        coinCollectorTed.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.2;
    }
}

function updateCoinCollectorHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'TIME';
    if (altitudeValue) altitudeValue.textContent = state.coinCollectorTime + 's';
    
    const remaining = coinCollectorCoins.filter(c => !c.userData.collected).length;
    const winning = state.coinCollectorScore > state.coinCollectorTedScore ? '🥇' : 
                   (state.coinCollectorScore < state.coinCollectorTedScore ? '🥈' : '🏁');
    if (coinsValue) coinsValue.textContent = `${winning} BOB: ${state.coinCollectorScore} | TED: ${state.coinCollectorTedScore} | Left: ${remaining}`;
}

function endCoinCollector() {
    state.gameOver = true;
    state.lastGameMode = 'coinCollector';
    state.coinCollectorMode = false;
    
    if (state.coinCollectorInterval) {
        clearInterval(state.coinCollectorInterval);
        state.coinCollectorInterval = null;
    }
    if (state.coinSpawnInterval) {
        clearInterval(state.coinSpawnInterval);
        state.coinSpawnInterval = null;
    }
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    const playerWon = state.coinCollectorScore > state.coinCollectorTedScore;
    const tied = state.coinCollectorScore === state.coinCollectorTedScore;
    const coinsEarned = playerWon ? 15 : (tied ? 5 : 2);
    
    state.totalCoins += coinsEarned;
    saveData();
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (playerWon) {
        document.getElementById('game-over-title').textContent = '⭐ YOU WON!';
        document.getElementById('game-over-message').textContent = `You collected ${state.coinCollectorScore} coins! Ted got ${state.coinCollectorTedScore}. Earned ${coinsEarned} coins!`;
        gameOverEl.classList.add('victory');
        playVictorySound();
    } else if (tied) {
        document.getElementById('game-over-title').textContent = "🏁 IT'S A TIE!";
        document.getElementById('game-over-message').textContent = `Both collected ${state.coinCollectorScore} coins! Earned ${coinsEarned} coins.`;
    } else {
        document.getElementById('game-over-title').textContent = '😢 TED WINS!';
        document.getElementById('game-over-message').textContent = `Ted collected ${state.coinCollectorTedScore} coins, you got ${state.coinCollectorScore}. Earned ${coinsEarned} coins.`;
    }
    
    document.getElementById('final-score').textContent = state.coinCollectorScore;
    document.getElementById('final-height').textContent = state.coinCollectorTedScore;
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'YOUR COINS';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'TED\'S COINS';
    
    // Cleanup
    coinCollectorCoins = [];
    coinCollectorTed = null;
}

// ============ SURVIVAL MODE ============
function startSurvival() {
    clearScene();
    document.getElementById('minigames-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    state.started = true;
    state.gameOver = false;
    state.survivalMode = true;
    state.survivalTime = 0;
    state.survivalWave = 1;
    state.survivalHealth = 100;
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Give Bob a sword!
    createSurvivalSword();
    
    // Create forest map
    createForestMap();
    
    // Create trees
    createForestTrees();
    
    // Spawn initial enemies
    spawnSurvivalEnemies(3);
    
    // Position player
    player.position.set(0, 2, 0);
    state.playerVelocity.set(0, 0, 0);
    
    // Start survival timer
    state.survivalInterval = setInterval(() => {
        if (!state.gameOver && state.survivalMode) {
            state.survivalTime++;
            
            // Spawn more enemies every 10 seconds
            if (state.survivalTime % 10 === 0) {
                state.survivalWave++;
                spawnSurvivalEnemies(state.survivalWave + 2);
            }
            
            updateSurvivalHUD();
        }
    }, 1000);
    
    updateSurvivalHUD();
}

function createSurvivalSword() {
    survivalSword = new THREE.Group();
    
    // Sword handle (brown wood)
    const handleGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8);
    const handleMat = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8 
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0;
    survivalSword.add(handle);
    
    // Sword guard (gold cross piece)
    const guardGeo = new THREE.BoxGeometry(0.4, 0.08, 0.12);
    const guardMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
    });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.y = 0.2;
    survivalSword.add(guard);
    
    // Sword blade (shiny silver)
    const bladeGeo = new THREE.BoxGeometry(0.08, 1.2, 0.03);
    const bladeMat = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.85;
    survivalSword.add(blade);
    
    // Blade tip (pointed)
    const tipGeo = new THREE.ConeGeometry(0.06, 0.2, 4);
    const tip = new THREE.Mesh(tipGeo, bladeMat);
    tip.position.y = 1.55;
    tip.rotation.z = Math.PI;
    survivalSword.add(tip);
    
    // Blade glow effect
    const glowGeo = new THREE.BoxGeometry(0.12, 1.3, 0.06);
    const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.85;
    survivalSword.add(glow);
    
    // Position sword in Bob's right hand
    survivalSword.position.set(0.5, 1.2, 0.3);
    survivalSword.rotation.z = -0.3;
    
    player.add(survivalSword);
    swordSwinging = false;
}

function swingSword() {
    if (swordSwinging || !survivalSword) return;
    
    swordSwinging = true;
    const startRotation = survivalSword.rotation.x;
    const swingAngle = -Math.PI * 0.8; // Swing forward
    
    // Play swing sound
    playPunchSound();
    
    // Animate swing
    let progress = 0;
    const swingSpeed = 0.15;
    
    function animateSwing() {
        if (!survivalSword) return;
        
        progress += swingSpeed;
        
        if (progress < 0.5) {
            // Swing forward
            survivalSword.rotation.x = startRotation + swingAngle * (progress * 2);
        } else if (progress < 1) {
            // Swing back
            survivalSword.rotation.x = startRotation + swingAngle * (1 - (progress - 0.5) * 2);
        } else {
            // Done
            survivalSword.rotation.x = startRotation;
            swordSwinging = false;
            return;
        }
        
        // Check for hits during the swing (first half)
        if (progress < 0.5) {
            checkSwordHits();
        }
        
        requestAnimationFrame(animateSwing);
    }
    
    animateSwing();
}

function checkSwordHits() {
    if (!state.survivalMode) return;
    
    const swordRange = 2.5; // How far the sword can reach
    
    survivalEnemies.forEach(enemy => {
        if (enemy.userData.dead) return;
        
        const dist = player.position.distanceTo(enemy.position);
        if (dist < swordRange) {
            // Check if enemy is in front of player (within ~120 degree arc)
            const toEnemy = new THREE.Vector3()
                .subVectors(enemy.position, player.position)
                .normalize();
            const playerForward = new THREE.Vector3(
                Math.sin(player.rotation.y),
                0,
                Math.cos(player.rotation.y)
            );
            const dot = toEnemy.dot(playerForward);
            
            if (dot > 0.3) { // Enemy is roughly in front
                // Kill enemy!
                enemy.userData.dead = true;
                
                // Death effect - enemy flies back and fades
                const knockbackDir = toEnemy.clone();
                enemy.position.x += knockbackDir.x * 2;
                enemy.position.z += knockbackDir.z * 2;
                enemy.position.y += 1;
                
                // Remove after short delay
                setTimeout(() => {
                    scene.remove(enemy);
                }, 100);
                
                playCoinSound();
            }
        }
    });
}

function createForestMap() {
    // Main grass platform
    const groundGeo = new THREE.CylinderGeometry(25, 27, 2, 32);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4a7c23,
        roughness: 0.9
    });
    survivalForestGround = new THREE.Mesh(groundGeo, groundMat);
    survivalForestGround.position.set(0, -1, 0);
    survivalForestGround.receiveShadow = true;
    scene.add(survivalForestGround);
    
    // Grass texture layer on top
    const grassTopGeo = new THREE.CylinderGeometry(25, 25, 0.3, 32);
    const grassTopMat = new THREE.MeshStandardMaterial({
        color: 0x5d9c2a,
        roughness: 1
    });
    const grassTop = new THREE.Mesh(grassTopGeo, grassTopMat);
    grassTop.position.set(0, 0.15, 0);
    scene.add(grassTop);
    
    // Add grass tufts
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 23;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const tuftGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
        const tuftMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.7, 0.35 + Math.random() * 0.15)
        });
        const tuft = new THREE.Mesh(tuftGeo, tuftMat);
        tuft.position.set(x, 0.4, z);
        tuft.rotation.y = Math.random() * Math.PI;
        scene.add(tuft);
    }
    
    // Add flowers
    const flowerColors = [0xff6b6b, 0xffd93d, 0xff9ff3, 0x54a0ff, 0xffffff];
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 22;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 4);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(x, 0.45, z);
        scene.add(stem);
        
        // Flower
        const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const flowerMat = new THREE.MeshStandardMaterial({
            color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
        });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(x, 0.65, z);
        scene.add(flower);
    }
    
    // Add rocks
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 18;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const rockGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5);
        const rockMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.2),
            roughness: 1
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, 0.3, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        scene.add(rock);
    }
}

function createForestTrees() {
    survivalTrees = [];
    
    // Create trees around the platform
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.3;
        const radius = 15 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const tree = createTree(x, z);
        survivalTrees.push(tree);
    }
    
    // Some trees in the middle area too
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const tree = createTree(x, z);
        survivalTrees.push(tree);
    }
}

function createTree(x, z) {
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkHeight = 2 + Math.random() * 2;
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 8);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.08, 0.5, 0.25 + Math.random() * 0.1),
        roughness: 1
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2 + 0.3;
    treeGroup.add(trunk);
    
    // Foliage layers
    const foliageColor = new THREE.Color().setHSL(0.28 + Math.random() * 0.1, 0.6, 0.3 + Math.random() * 0.15);
    
    for (let j = 0; j < 3; j++) {
        const foliageSize = 1.8 - j * 0.4;
        const foliageGeo = new THREE.ConeGeometry(foliageSize, 2, 8);
        const foliageMat = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = trunkHeight + 0.5 + j * 1.2;
        treeGroup.add(foliage);
    }
    
    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
    
    return treeGroup;
}

function spawnSurvivalEnemies(count) {
    for (let i = 0; i < count; i++) {
        const enemy = createSurvivalEnemy();
        survivalEnemies.push(enemy);
    }
}

function createSurvivalEnemy() {
    const enemy = new THREE.Group();
    
    // Slime-like enemy (green blob)
    const bodyGeo = new THREE.SphereGeometry(0.6, 16, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.3,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1, 0.7, 1);
    body.position.y = 0.5;
    enemy.add(body);
    
    // Angry eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.6, 0.4);
    enemy.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.6, 0.4);
    enemy.add(rightEye);
    
    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.2, 0.6, 0.52);
    enemy.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.2, 0.6, 0.52);
    enemy.add(rightPupil);
    
    // Spawn at edge of platform
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 5;
    enemy.position.set(
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
    );
    
    enemy.userData.speed = 2 + Math.random() * 2;
    enemy.userData.health = 1;
    
    scene.add(enemy);
    return enemy;
}

function updateSurvival(deltaTime) {
    if (!state.survivalMode) return;
    
    // Ground collision for forest platform
    const distFromCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
    
    if (distFromCenter < 25) {
        // On the platform
        if (player.position.y < 1) {
            player.position.y = 1;
            state.playerVelocity.y = 0;
            state.playerOnGround = true;
        }
    } else {
        // Falling off
        if (player.position.y < -10) {
            endSurvival();
            return;
        }
    }
    
    // Update enemies
    survivalEnemies.forEach((enemy, index) => {
        if (!enemy.userData.dead) {
            // Move toward player
            const dir = new THREE.Vector3()
                .subVectors(player.position, enemy.position)
                .normalize();
            
            enemy.position.x += dir.x * enemy.userData.speed * deltaTime;
            enemy.position.z += dir.z * enemy.userData.speed * deltaTime;
            enemy.position.y = 0.5 + Math.sin(Date.now() * 0.01 + index) * 0.1; // Bounce
            
            // Face player
            enemy.rotation.y = Math.atan2(dir.x, dir.z);
            
            // Check collision with player
            const dist = enemy.position.distanceTo(player.position);
            if (dist < 1.2) {
                state.survivalHealth -= 10;
                
                // Knockback enemy
                enemy.position.x -= dir.x * 3;
                enemy.position.z -= dir.z * 3;
                
                playPunchSound();
                updateSurvivalHUD();
                
                if (state.survivalHealth <= 0) {
                    endSurvival();
                    return;
                }
            }
            
        }
    });
    
    // Swing sword with E
    if (state.keys['KeyE'] && !swordSwinging) {
        swingSword();
    }
    
    // Remove dead enemies
    survivalEnemies = survivalEnemies.filter(e => !e.userData.dead);
}

function updateSurvivalHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'TIME';
    if (altitudeValue) altitudeValue.textContent = state.survivalTime + 's';
    
    const healthBar = '❤️'.repeat(Math.ceil(state.survivalHealth / 20)) + '🖤'.repeat(5 - Math.ceil(state.survivalHealth / 20));
    if (coinsValue) coinsValue.textContent = `${healthBar} | Wave ${state.survivalWave} | Enemies: ${survivalEnemies.filter(e => !e.userData.dead).length}`;
}

function endSurvival() {
    state.gameOver = true;
    state.lastGameMode = 'survival';
    state.survivalMode = false;
    
    if (state.survivalInterval) {
        clearInterval(state.survivalInterval);
        state.survivalInterval = null;
    }
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    // Coins based on survival time
    const coinsEarned = Math.floor(state.survivalTime / 5) + state.survivalWave;
    state.totalCoins += coinsEarned;
    
    // Update career stats
    state.careerStats.coinsEarned += coinsEarned;
    if (state.survivalWave > state.careerStats.survivalBestWave) {
        state.careerStats.survivalBestWave = state.survivalWave;
    }
    saveData();
    
    // Track best time
    const savedBest = localStorage.getItem('survivalBestTime');
    const bestTime = savedBest ? parseInt(savedBest) : 0;
    let isNewRecord = false;
    
    if (state.survivalTime > bestTime) {
        localStorage.setItem('survivalBestTime', state.survivalTime.toString());
        isNewRecord = true;
    }
    
    const displayBest = Math.max(bestTime, state.survivalTime);
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (isNewRecord && state.survivalTime > 10) {
        document.getElementById('game-over-title').textContent = '🏆 NEW RECORD!';
        document.getElementById('game-over-message').textContent = `Survived ${state.survivalTime}s! Reached wave ${state.survivalWave}! Earned ${coinsEarned} coins!`;
        gameOverEl.classList.add('victory');
        playVictorySound();
    } else {
        document.getElementById('game-over-title').textContent = '💀 GAME OVER';
        document.getElementById('game-over-message').textContent = `Survived ${state.survivalTime}s, wave ${state.survivalWave}. Best: ${displayBest}s. Earned ${coinsEarned} coins.`;
        playDeathSound();
    }
    
    document.getElementById('final-score').textContent = state.survivalTime + 's';
    document.getElementById('final-height').textContent = 'Best: ' + displayBest + 's';
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'SURVIVED';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'RECORD';
    
    // Cleanup
    survivalTrees = [];
    survivalEnemies.forEach(e => scene.remove(e));
    survivalEnemies = [];
    survivalForestGround = null;
    
    // Remove sword
    if (survivalSword) {
        player.remove(survivalSword);
        survivalSword = null;
    }
    swordSwinging = false;
}

// ============ TARGET PRACTICE ============
function startTargetPractice() {
    clearScene();
    document.getElementById('minigames-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    state.started = true;
    state.gameOver = false;
    state.targetPracticeMode = true;
    state.targetPracticeTime = 60;
    targetHitCount = 0;
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Give Bob a pistol!
    createTargetPistol();
    bullets = [];
    
    // Create training arena
    createTargetArena();
    
    // Create training dummy
    createTrainingDummy();
    
    // Position player
    player.position.set(0, 2, 5);
    state.playerVelocity.set(0, 0, 0);
    
    // Start timer
    state.targetPracticeInterval = setInterval(() => {
        if (!state.gameOver && state.targetPracticeMode) {
            state.targetPracticeTime--;
            updateTargetPracticeHUD();
            if (state.targetPracticeTime <= 0) {
                endTargetPractice();
            }
        }
    }, 1000);
    
    updateTargetPracticeHUD();
}

function createTargetPistol() {
    targetPistol = new THREE.Group();
    
    // Gun body (dark metal)
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.2, 0.5);
    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, metalMat);
    body.position.z = 0.15;
    targetPistol.add(body);
    
    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, 0.55);
    targetPistol.add(barrel);
    
    // Handle/Grip
    const gripGeo = new THREE.BoxGeometry(0.1, 0.25, 0.12);
    const gripMat = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.8
    });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.15, 0.05);
    grip.rotation.x = 0.3;
    targetPistol.add(grip);
    
    // Trigger guard
    const guardGeo = new THREE.TorusGeometry(0.05, 0.015, 8, 8, Math.PI);
    const guard = new THREE.Mesh(guardGeo, metalMat);
    guard.position.set(0, -0.05, 0.15);
    guard.rotation.y = Math.PI / 2;
    targetPistol.add(guard);
    
    // Sight on top
    const sightGeo = new THREE.BoxGeometry(0.03, 0.05, 0.03);
    const sight = new THREE.Mesh(sightGeo, metalMat);
    sight.position.set(0, 0.15, 0.35);
    targetPistol.add(sight);
    
    // Muzzle flash holder (will glow when shooting)
    const flashGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0
    });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.set(0, 0.05, 0.75);
    targetPistol.add(flash);
    targetPistol.userData.muzzleFlash = flash;
    
    // Position pistol in Bob's right hand
    targetPistol.position.set(0.5, 1, 0.3);
    targetPistol.rotation.y = 0;
    
    player.add(targetPistol);
}

function shootPistol() {
    if (!targetPistol || !state.targetPracticeMode) return;
    
    // Play gun sound
    playGunSound();
    
    // Muzzle flash
    const flash = targetPistol.userData.muzzleFlash;
    if (flash) {
        flash.material.opacity = 1;
        setTimeout(() => { flash.material.opacity = 0; }, 50);
    }
    
    // Recoil animation
    targetPistol.rotation.x = -0.3;
    setTimeout(() => { 
        if (targetPistol) targetPistol.rotation.x = 0; 
    }, 100);
    
    // Create bullet
    const bulletGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    
    // Get world position of gun barrel
    const gunWorldPos = new THREE.Vector3();
    targetPistol.getWorldPosition(gunWorldPos);
    
    // Bullet starts at gun position
    bullet.position.copy(gunWorldPos);
    bullet.position.y += 0.1;
    
    // Bullet direction (forward from player)
    const direction = new THREE.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y)
    );
    
    bullet.userData.velocity = direction.multiplyScalar(50);
    bullet.userData.life = 2; // Seconds before despawn
    
    scene.add(bullet);
    bullets.push(bullet);
}

function playGunSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Sharp attack
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
    
    // Add noise burst for "crack" sound
    const noise = audioCtx.createBufferSource();
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    
    const noiseGain = audioCtx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    noise.start(audioCtx.currentTime);
}

function updateBullets(deltaTime) {
    bullets.forEach((bullet, index) => {
        // Move bullet
        bullet.position.x += bullet.userData.velocity.x * deltaTime;
        bullet.position.y += bullet.userData.velocity.y * deltaTime;
        bullet.position.z += bullet.userData.velocity.z * deltaTime;
        
        // Decrease life
        bullet.userData.life -= deltaTime;
        
        // Check collision with dummy
        if (targetDummy) {
            const dist = bullet.position.distanceTo(targetDummy.position);
            if (dist < 1.5 && bullet.position.y > 0.5 && bullet.position.y < 3.5) {
                // Hit the dummy!
                targetHitCount++;
                state.totalCoins += 1; // Get 1 coin per hit!
                saveData();
                targetDummy.userData.hitCooldown = 0.3;
                targetDummy.rotation.z = 0.2;
                playCoinSound();
                updateTargetPracticeHUD();
                
                // Remove bullet
                scene.remove(bullet);
                bullets.splice(index, 1);
                return;
            }
        }
        
        // Remove if too old or too far
        if (bullet.userData.life <= 0 || bullet.position.length() > 50) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });
}

function createTargetArena() {
    // Main wooden floor platform
    const floorGeo = new THREE.BoxGeometry(20, 1, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    targetPracticeGround = new THREE.Mesh(floorGeo, floorMat);
    targetPracticeGround.position.set(0, -0.5, 0);
    targetPracticeGround.receiveShadow = true;
    scene.add(targetPracticeGround);
    
    // Wood plank lines on floor
    for (let i = -9; i <= 9; i += 2) {
        const lineGeo = new THREE.BoxGeometry(20, 1.01, 0.1);
        const lineMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(0, -0.5, i);
        scene.add(line);
    }
    
    // Training area fence posts
    const postPositions = [
        { x: -10, z: -10 }, { x: 10, z: -10 },
        { x: -10, z: 10 }, { x: 10, z: 10 },
        { x: 0, z: -10 }, { x: 0, z: 10 },
        { x: -10, z: 0 }, { x: 10, z: 0 }
    ];
    
    postPositions.forEach(pos => {
        const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 3, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(pos.x, 1.5, pos.z);
        scene.add(post);
        
        // Torch on top
        const torchGeo = new THREE.ConeGeometry(0.15, 0.4, 8);
        const torchMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const torch = new THREE.Mesh(torchGeo, torchMat);
        torch.position.set(pos.x, 3.2, pos.z);
        scene.add(torch);
    });
    
    // Target boards on the sides
    for (let i = 0; i < 3; i++) {
        const targetGeo = new THREE.CircleGeometry(1.5, 32);
        const targetMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide 
        });
        const target = new THREE.Mesh(targetGeo, targetMat);
        target.position.set(-9.5, 2, -6 + i * 6);
        target.rotation.y = Math.PI / 2;
        scene.add(target);
        
        // Red rings
        const ring1Geo = new THREE.RingGeometry(0.9, 1.2, 32);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.position.set(-9.4, 2, -6 + i * 6);
        ring1.rotation.y = Math.PI / 2;
        scene.add(ring1);
        
        const ring2Geo = new THREE.RingGeometry(0.3, 0.6, 32);
        const ring2 = new THREE.Mesh(ring2Geo, ring1Mat);
        ring2.position.set(-9.4, 2, -6 + i * 6);
        ring2.rotation.y = Math.PI / 2;
        scene.add(ring2);
        
        // Bullseye
        const bullseyeGeo = new THREE.CircleGeometry(0.2, 16);
        const bullseyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const bullseye = new THREE.Mesh(bullseyeGeo, bullseyeMat);
        bullseye.position.set(-9.3, 2, -6 + i * 6);
        bullseye.rotation.y = Math.PI / 2;
        scene.add(bullseye);
    }
    
    // Weapon rack (decorative)
    const rackGeo = new THREE.BoxGeometry(0.2, 2, 3);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(9, 1, 0);
    scene.add(rack);
    
    // "TRAINING AREA" sign
    const signGeo = new THREE.BoxGeometry(4, 1, 0.1);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 4, -9.9);
    scene.add(sign);
}

function createTrainingDummy() {
    targetDummy = new THREE.Group();
    
    // Wooden post base
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.25;
    targetDummy.add(base);
    
    // Main post
    const postGeo = new THREE.CylinderGeometry(0.15, 0.2, 2, 8);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.y = 1.5;
    targetDummy.add(post);
    
    // Dummy body (straw-stuffed sack)
    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4a76a, roughness: 1 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2;
    targetDummy.add(body);
    
    // Dummy head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a76a, roughness: 1 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3;
    targetDummy.add(head);
    
    // X marks for eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Left X
    const leftX1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), eyeMat);
    leftX1.position.set(-0.12, 3.05, 0.3);
    leftX1.rotation.z = Math.PI / 4;
    targetDummy.add(leftX1);
    const leftX2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), eyeMat);
    leftX2.position.set(-0.12, 3.05, 0.3);
    leftX2.rotation.z = -Math.PI / 4;
    targetDummy.add(leftX2);
    
    // Right X
    const rightX1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), eyeMat);
    rightX1.position.set(0.12, 3.05, 0.3);
    rightX1.rotation.z = Math.PI / 4;
    targetDummy.add(rightX1);
    const rightX2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), eyeMat);
    rightX2.position.set(0.12, 3.05, 0.3);
    rightX2.rotation.z = -Math.PI / 4;
    targetDummy.add(rightX2);
    
    // Arms (horizontal wooden bars)
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
    const leftArm = new THREE.Mesh(armGeo, woodMat);
    leftArm.position.set(-0.8, 2.2, 0);
    leftArm.rotation.z = Math.PI / 2;
    targetDummy.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, woodMat);
    rightArm.position.set(0.8, 2.2, 0);
    rightArm.rotation.z = Math.PI / 2;
    targetDummy.add(rightArm);
    
    // Target on chest
    const targetGeo = new THREE.CircleGeometry(0.3, 16);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.position.set(0, 2, 0.52);
    targetDummy.add(target);
    
    // Name tag
    const nameTag = createNameTag('DUMMY');
    nameTag.position.y = 3.8;
    targetDummy.add(nameTag);
    
    targetDummy.position.set(0, 0, -3);
    targetDummy.userData.hitCooldown = 0;
    
    scene.add(targetDummy);
}

function updateTargetPractice(deltaTime) {
    if (!state.targetPracticeMode) return;
    
    // Ground collision
    const px = player.position.x;
    const pz = player.position.z;
    
    if (px >= -10 && px <= 10 && pz >= -10 && pz <= 10) {
        if (player.position.y < 1) {
            player.position.y = 1;
            state.playerVelocity.y = 0;
            state.playerOnGround = true;
        }
    } else {
        if (player.position.y < -10) {
            // Reset player position if they fall off
            player.position.set(0, 2, 5);
            state.playerVelocity.set(0, 0, 0);
        }
    }
    
    // Update bullets
    updateBullets(deltaTime);
    
    // Shoot with Space (with cooldown)
    if (!state.shootCooldown) state.shootCooldown = 0;
    state.shootCooldown -= deltaTime;
    
    if (state.keys['Space'] && state.shootCooldown <= 0) {
        shootPistol();
        state.shootCooldown = 0.3; // Fire rate limit
    }
    
    // Update dummy hit cooldown
    if (targetDummy && targetDummy.userData.hitCooldown > 0) {
        targetDummy.userData.hitCooldown -= deltaTime;
        
        // Wobble animation when hit
        if (targetDummy.userData.hitCooldown > 0.3) {
            targetDummy.rotation.z = Math.sin(Date.now() * 0.05) * 0.2;
        } else {
            targetDummy.rotation.z *= 0.9; // Return to normal
        }
    }
    
    // Check for melee punch (Q or E key to hit dummy)
    if (state.keys['KeyQ'] || state.keys['KeyE']) {
        if (targetDummy && targetDummy.userData.hitCooldown <= 0) {
            const dist = player.position.distanceTo(targetDummy.position);
            if (dist < 2.5) {
                // Hit the dummy!
                targetHitCount++;
                state.totalCoins += 1; // Get 1 coin per hit!
                saveData();
                targetDummy.userData.hitCooldown = 0.5; // Cooldown between hits
                playPunchSound();
                updateTargetPracticeHUD();
                
                // Visual feedback - dummy shakes
                targetDummy.rotation.z = 0.3;
            }
        }
    }
}

function updateTargetPracticeHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'TIME';
    if (altitudeValue) altitudeValue.textContent = state.targetPracticeTime + 's';
    if (coinsValue) coinsValue.textContent = `🔫 Hits: ${targetHitCount} (+${targetHitCount} 🪙) | SPACE shoot, Q/E punch`;
}

function endTargetPractice() {
    state.gameOver = true;
    state.lastGameMode = 'targetPractice';
    state.targetPracticeMode = false;
    
    if (state.targetPracticeInterval) {
        clearInterval(state.targetPracticeInterval);
        state.targetPracticeInterval = null;
    }
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    const coinsEarned = Math.floor(targetHitCount / 2);
    state.totalCoins += coinsEarned;
    
    // Update career stats
    state.careerStats.coinsEarned += coinsEarned;
    if (targetHitCount > state.careerStats.targetBestHits) {
        state.careerStats.targetBestHits = targetHitCount;
    }
    saveData();
    
    // Track best score
    const savedBest = localStorage.getItem('targetPracticeBest');
    const bestScore = savedBest ? parseInt(savedBest) : 0;
    let isNewRecord = false;
    
    if (targetHitCount > bestScore) {
        localStorage.setItem('targetPracticeBest', targetHitCount.toString());
        isNewRecord = true;
    }
    
    const displayBest = Math.max(bestScore, targetHitCount);
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (isNewRecord && targetHitCount > 10) {
        document.getElementById('game-over-title').textContent = '🏆 NEW RECORD!';
        document.getElementById('game-over-message').textContent = `${targetHitCount} hits! Great training! Earned ${coinsEarned} coins!`;
        gameOverEl.classList.add('victory');
        playVictorySound();
    } else {
        document.getElementById('game-over-title').textContent = '🎯 TIME UP!';
        document.getElementById('game-over-message').textContent = `${targetHitCount} hits. Best: ${displayBest}. Earned ${coinsEarned} coins.`;
    }
    
    document.getElementById('final-score').textContent = targetHitCount;
    document.getElementById('final-height').textContent = 'Best: ' + displayBest;
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'HITS';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'RECORD';
    
    // Cleanup
    targetDummy = null;
    targetPracticeGround = null;
    
    // Remove pistol
    if (targetPistol) {
        player.remove(targetPistol);
        targetPistol = null;
    }
    
    // Remove bullets
    bullets.forEach(b => scene.remove(b));
    bullets = [];
}

// ============ SPEED RACE ============
function startSpeedRace() {
    clearScene();
    document.getElementById('minigames-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    state.started = true;
    state.gameOver = false;
    state.speedRaceMode = true;
    state.speedRaceTime = 0;
    state.speedRaceDistance = 0;
    state.speedRaceFinished = false;
    state.opponentDistance = 0;
    
    // Remove gloves and show arms
    if (player.userData.leftGlove) {
        player.remove(player.userData.leftGlove);
        player.remove(player.userData.rightGlove);
        player.userData.leftGlove = null;
        player.userData.rightGlove = null;
    }
    if (player.userData.leftArm) player.userData.leftArm.visible = true;
    if (player.userData.rightArm) player.userData.rightArm.visible = true;
    
    // Create running track
    createRunningTrack();
    
    // Create opponent runner
    createSpeedRaceOpponent();
    
    // Position player at start
    player.position.set(-2, 1, 90);
    player.rotation.y = Math.PI; // Face forward (down the track)
    state.playerVelocity.set(0, 0, 0);
    
    // Start race timer
    state.speedRaceInterval = setInterval(() => {
        if (!state.gameOver && state.speedRaceMode) {
            state.speedRaceTime += 0.1;
            updateSpeedRaceHUD();
        }
    }, 100);
    
    updateSpeedRaceHUD();
}

function createRunningTrack() {
    speedRaceTrack = new THREE.Group();
    
    // Main track surface (red/orange running track)
    const trackLength = 200; // Longer track!
    const trackWidth = 12;
    
    const trackGeo = new THREE.BoxGeometry(trackWidth, 0.5, trackLength);
    const trackMat = new THREE.MeshStandardMaterial({
        color: 0xcc4422,
        roughness: 0.8
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, -0.25, 0);
    track.receiveShadow = true;
    speedRaceTrack.add(track);
    
    // Lane lines (white)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Create 4 lanes
    for (let i = -2; i <= 2; i++) {
        const lineGeo = new THREE.BoxGeometry(0.1, 0.52, trackLength);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(i * 3, -0.24, 0);
        speedRaceTrack.add(line);
    }
    
    // Distance markers every 20 units
    for (let z = 80; z >= -90; z -= 20) {
        const markerGeo = new THREE.BoxGeometry(trackWidth, 0.53, 0.3);
        const marker = new THREE.Mesh(markerGeo, lineMat);
        marker.position.set(0, -0.23, z);
        speedRaceTrack.add(marker);
        
        // Distance number (simple box representation)
        const dist = 90 - z;
        if (dist > 0) {
            const numGeo = new THREE.BoxGeometry(1, 0.1, 1);
            const numMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const num = new THREE.Mesh(numGeo, numMat);
            num.position.set(-5.5, 0.1, z);
            speedRaceTrack.add(num);
        }
    }
    
    // Start line
    const startGeo = new THREE.BoxGeometry(trackWidth, 0.54, 1);
    const startMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const startLine = new THREE.Mesh(startGeo, startMat);
    startLine.position.set(0, -0.22, 90);
    speedRaceTrack.add(startLine);
    
    // Finish line
    const finishGeo = new THREE.BoxGeometry(trackWidth, 0.55, 1);
    const finishMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    speedRaceFinishLine = new THREE.Mesh(finishGeo, finishMat);
    speedRaceFinishLine.position.set(0, -0.21, -90);
    speedRaceTrack.add(speedRaceFinishLine);
    
    // Checkered finish pattern
    for (let x = -5; x <= 5; x++) {
        for (let i = 0; i < 4; i++) {
            const checkerGeo = new THREE.BoxGeometry(1, 0.56, 0.25);
            const checkerMat = new THREE.MeshBasicMaterial({ 
                color: (x + i) % 2 === 0 ? 0x000000 : 0xffffff 
            });
            const checker = new THREE.Mesh(checkerGeo, checkerMat);
            checker.position.set(x, -0.2, -90 + i * 0.25);
            speedRaceTrack.add(checker);
        }
    }
    
    // Side barriers/grass
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x228822 });
    
    const leftGrass = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, trackLength), grassMat);
    leftGrass.position.set(-11, -0.35, 0);
    speedRaceTrack.add(leftGrass);
    
    const rightGrass = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, trackLength), grassMat);
    rightGrass.position.set(11, -0.35, 0);
    speedRaceTrack.add(rightGrass);
    
    // Spectator stands (simple bleachers)
    const standMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    for (let i = 0; i < 3; i++) {
        const standGeo = new THREE.BoxGeometry(5, 1 + i * 0.5, 30);
        const leftStand = new THREE.Mesh(standGeo, standMat);
        leftStand.position.set(-18 - i * 2, 0.5 + i * 0.5, 0);
        speedRaceTrack.add(leftStand);
        
        const rightStand = new THREE.Mesh(standGeo, standMat);
        rightStand.position.set(18 + i * 2, 0.5 + i * 0.5, 0);
        speedRaceTrack.add(rightStand);
    }
    
    scene.add(speedRaceTrack);
}

function createSpeedRaceOpponent() {
    speedRaceOpponent = new THREE.Group();
    
    // Runner body (blue)
    const bodyGeo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2266cc });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    speedRaceOpponent.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x2266cc });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    speedRaceOpponent.add(head);
    
    // Eyes (white)
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 1.85, 0.25);
    speedRaceOpponent.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 1.85, 0.25);
    speedRaceOpponent.add(rightEye);
    
    // Pupils (black)
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.1, 1.85, 0.32);
    speedRaceOpponent.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.1, 1.85, 0.32);
    speedRaceOpponent.add(rightPupil);
    
    // Eyebrows (determined look)
    const browGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.1, 1.95, 0.28);
    leftBrow.rotation.z = -0.3; // Angled for determined look
    speedRaceOpponent.add(leftBrow);
    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.1, 1.95, 0.28);
    rightBrow.rotation.z = 0.3;
    speedRaceOpponent.add(rightBrow);
    
    // Nose
    const noseGeo = new THREE.ConeGeometry(0.03, 0.08, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x1a4a99 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.78, 0.28);
    nose.rotation.x = -Math.PI / 2;
    speedRaceOpponent.add(nose);
    
    // Confident smile
    const smileGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 1.7, 0.27);
    smile.rotation.x = Math.PI;
    speedRaceOpponent.add(smile);
    
    // Name tag
    const nameTag = createNameTag('FLASH');
    nameTag.position.y = 2.5;
    speedRaceOpponent.add(nameTag);
    
    // Position opponent in adjacent lane
    speedRaceOpponent.position.set(2, 0, 90);
    speedRaceOpponent.rotation.y = Math.PI;
    speedRaceOpponent.userData.speed = 0;
    speedRaceOpponent.userData.distance = 0;
    
    scene.add(speedRaceOpponent);
}

function updateSpeedRace(deltaTime) {
    if (!state.speedRaceMode || state.speedRaceFinished) return;
    
    // Ground collision - stay on track
    if (player.position.y < 1) {
        player.position.y = 1;
        state.playerVelocity.y = 0;
        state.playerOnGround = true;
    }
    
    // Keep player in lane bounds
    player.position.x = Math.max(-5, Math.min(5, player.position.x));
    
    // Track player distance (how far down the track)
    state.speedRaceDistance = 90 - player.position.z;
    
    // Mash keys to run faster! W or Up or Space
    if (state.keys['KeyW'] || state.keys['ArrowUp'] || state.keys['Space']) {
        // Move forward
        player.position.z -= 12 * deltaTime;
        
        // Running animation - bob up and down
        player.position.y = 1 + Math.abs(Math.sin(Date.now() * 0.02)) * 0.15;
    }
    
    // Update opponent AI (runs at steady pace with some variation)
    if (speedRaceOpponent) {
        const targetSpeed = 10 + Math.sin(Date.now() * 0.001) * 2; // 8-12 speed (faster!)
        speedRaceOpponent.userData.speed = targetSpeed;
        speedRaceOpponent.position.z -= speedRaceOpponent.userData.speed * deltaTime;
        speedRaceOpponent.userData.distance = 90 - speedRaceOpponent.position.z;
        state.opponentDistance = speedRaceOpponent.userData.distance;
        
        // Running animation for opponent
        speedRaceOpponent.position.y = Math.abs(Math.sin(Date.now() * 0.015)) * 0.15;
    }
    
    // Check if player finished
    if (player.position.z <= -90 && !state.speedRaceFinished) {
        state.speedRaceFinished = true;
        const playerWon = state.speedRaceDistance >= state.opponentDistance;
        endSpeedRace(playerWon);
        return;
    }
    
    // Check if opponent finished
    if (speedRaceOpponent && speedRaceOpponent.position.z <= -90 && !state.speedRaceFinished) {
        state.speedRaceFinished = true;
        endSpeedRace(false);
        return;
    }
    
    updateSpeedRaceHUD();
}

function updateSpeedRaceHUD() {
    const altitudeLabel = document.getElementById('altitude-label');
    const altitudeValue = document.getElementById('altitude-value');
    const coinsValue = document.getElementById('coins-value');
    
    if (altitudeLabel) altitudeLabel.textContent = 'DISTANCE';
    if (altitudeValue) altitudeValue.textContent = Math.floor(state.speedRaceDistance) + 'm';
    
    const leading = state.speedRaceDistance > state.opponentDistance ? '🥇 Leading!' : '🥈 Behind!';
    if (coinsValue) coinsValue.textContent = `${leading} | FLASH: ${Math.floor(state.opponentDistance)}m | Mash W/SPACE to run!`;
}

function endSpeedRace(won) {
    state.gameOver = true;
    state.lastGameMode = 'speedRace';
    state.speedRaceMode = false;
    
    if (state.speedRaceInterval) {
        clearInterval(state.speedRaceInterval);
        state.speedRaceInterval = null;
    }
    
    const altitudeLabel = document.getElementById('altitude-label');
    if (altitudeLabel) altitudeLabel.textContent = 'ALTITUDE';
    
    const coinsEarned = won ? 20 : 5;
    state.totalCoins += coinsEarned;
    saveData();
    
    // Track best time
    const raceTime = state.speedRaceTime.toFixed(1);
    const savedBest = localStorage.getItem('speedRaceBest');
    const bestTime = savedBest ? parseFloat(savedBest) : 999;
    let isNewRecord = false;
    
    if (won && state.speedRaceTime < bestTime) {
        localStorage.setItem('speedRaceBest', state.speedRaceTime.toString());
        isNewRecord = true;
    }
    
    const displayBest = won ? Math.min(bestTime, state.speedRaceTime).toFixed(1) : bestTime.toFixed(1);
    
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('victory', 'hidden');
    document.getElementById('hud').classList.add('hidden');
    
    if (won) {
        if (isNewRecord) {
            document.getElementById('game-over-title').textContent = '🏆 NEW RECORD!';
            document.getElementById('game-over-message').textContent = `Finished in ${raceTime}s! You earned ${coinsEarned} coins!`;
        } else {
            document.getElementById('game-over-title').textContent = '🏃 YOU WON!';
            document.getElementById('game-over-message').textContent = `Finished in ${raceTime}s! Best: ${displayBest}s. Earned ${coinsEarned} coins!`;
        }
        gameOverEl.classList.add('victory');
        playVictorySound();
    } else {
        document.getElementById('game-over-title').textContent = '🏃 FLASH WINS!';
        document.getElementById('game-over-message').textContent = `Flash beat you! Best time: ${displayBest === '999.0' ? '--' : displayBest}s. Earned ${coinsEarned} coins.`;
    }
    
    document.getElementById('final-score').textContent = raceTime + 's';
    document.getElementById('final-height').textContent = 'Best: ' + (displayBest === '999.0' ? '--' : displayBest) + 's';
    document.querySelector('.stat:nth-child(1) .stat-label').textContent = 'YOUR TIME';
    document.querySelector('.stat:nth-child(2) .stat-label').textContent = 'RECORD';
    
    // Cleanup
    speedRaceTrack = null;
    speedRaceOpponent = null;
    speedRaceFinishLine = null;
}

function updateShopDisplay() {
    document.getElementById('shop-coins').textContent = state.totalCoins;
    
    // Update each item's button
    document.querySelectorAll('.shop-item').forEach(item => {
        const itemId = item.dataset.item;
        const btn = item.querySelector('.buy-btn');
        const price = parseInt(btn.dataset.price);
        
        const expirationTime = state.ownedItems[itemId];
        const isOwned = expirationTime && (typeof expirationTime !== 'number' || Date.now() < expirationTime);
        
        if (isOwned) {
            // Calculate remaining time
            let timeText = '';
            if (typeof expirationTime === 'number') {
                const remaining = Math.max(0, expirationTime - Date.now());
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                timeText = ` (${minutes}:${seconds.toString().padStart(2, '0')})`;
            }
            
            // Item is owned - show ON/OFF toggle with time remaining
            if (state.activeItems[itemId]) {
                btn.textContent = '✅ ON' + timeText;
                btn.classList.add('owned-btn', 'item-on');
                btn.classList.remove('item-off');
            } else {
                btn.textContent = '❌ OFF' + timeText;
                btn.classList.add('owned-btn', 'item-off');
                btn.classList.remove('item-on');
            }
            btn.disabled = false; // Can click to toggle
            item.classList.add('owned');
        } else {
            // Item expired or not owned - can buy again
            delete state.ownedItems[itemId];
            delete state.activeItems[itemId];
            
            if (state.totalCoins < price) {
                btn.textContent = `${price} 🪙`;
                btn.disabled = true;
            } else {
                btn.textContent = `${price} 🪙`;
                btn.disabled = false;
            }
            btn.classList.remove('owned-btn', 'item-on', 'item-off');
            item.classList.remove('owned');
        }
    });
}

function buyItem(itemId, price) {
    // Can only buy if not already owned/active
    if (state.totalCoins >= price && !state.ownedItems[itemId]) {
        state.totalCoins -= price;
        
        // Item expires in 5 minutes (300000 ms)
        const expirationTime = Date.now() + 5 * 60 * 1000;
        state.ownedItems[itemId] = expirationTime;
        state.activeItems[itemId] = true; // Turn ON by default when purchased
        
        saveData();
        updateShopDisplay();
    }
}

// Fire particles for fire mode
let fireParticles = null;

function applyFireMode() {
    if (!player || fireParticles) return;
    
    // Create fire particle system on player's head
    const fireGeometry = new THREE.BufferGeometry();
    const fireCount = 50;
    const positions = new Float32Array(fireCount * 3);
    const colors = new Float32Array(fireCount * 3);
    const sizes = new Float32Array(fireCount);
    
    for (let i = 0; i < fireCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 1] = Math.random() * 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        
        // Fire colors: yellow to orange to red
        const t = Math.random();
        if (t < 0.33) {
            colors[i * 3] = 1;     // R
            colors[i * 3 + 1] = 1; // G (yellow)
            colors[i * 3 + 2] = 0; // B
        } else if (t < 0.66) {
            colors[i * 3] = 1;        // R
            colors[i * 3 + 1] = 0.5;  // G (orange)
            colors[i * 3 + 2] = 0;    // B
        } else {
            colors[i * 3] = 1;     // R (red)
            colors[i * 3 + 1] = 0; // G
            colors[i * 3 + 2] = 0; // B
        }
        
        sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fireGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    fireGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const fireMaterial = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    
    fireParticles = new THREE.Points(fireGeometry, fireMaterial);
    fireParticles.position.set(0, PLAYER_HEIGHT + 0.1, 0);
    player.add(fireParticles);
    
    // Store reference for animation
    player.userData.fireParticles = fireParticles;
}

// Animate fire particles
function updateFireParticles() {
    if (!fireParticles) return;
    
    const positions = fireParticles.geometry.attributes.position.array;
    const colors = fireParticles.geometry.attributes.color.array;
    
    for (let i = 0; i < positions.length / 3; i++) {
        // Move particles up
        positions[i * 3 + 1] += 0.02 + Math.random() * 0.02;
        
        // Add some horizontal wobble
        positions[i * 3] += (Math.random() - 0.5) * 0.02;
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
        
        // Reset particles that go too high
        if (positions[i * 3 + 1] > 0.8) {
            positions[i * 3] = (Math.random() - 0.5) * 0.4;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
            
            // Randomize color on reset
            const t = Math.random();
            if (t < 0.33) {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 0;
            } else if (t < 0.66) {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.5;
                colors[i * 3 + 2] = 0;
            } else {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0;
                colors[i * 3 + 2] = 0;
            }
        }
    }
    
    fireParticles.geometry.attributes.position.needsUpdate = true;
    fireParticles.geometry.attributes.color.needsUpdate = true;
}

// Get speed multiplier based on owned items
// Check if an item is currently turned ON
function isItemActive(itemId) {
    // Check if item is owned, not expired, and turned on
    if (!state.ownedItems[itemId]) return false;
    if (state.activeItems[itemId] !== true) return false;
    
    // Check expiration
    const expirationTime = state.ownedItems[itemId];
    if (typeof expirationTime === 'number' && Date.now() > expirationTime) {
        // Item has expired!
        delete state.ownedItems[itemId];
        delete state.activeItems[itemId];
        saveData();
        return false;
    }
    
    return true;
}

// Toggle an item ON/OFF
function toggleItem(itemId) {
    if (state.ownedItems[itemId]) {
        state.activeItems[itemId] = !state.activeItems[itemId];
        saveData();
        updateShopDisplay();
        
        // Apply or remove effects based on item
        if (state.activeItems[itemId]) {
            // Turning ON
            switch(itemId) {
                case 'glow-mode': applyGlowMode(); break;
                case 'big-mode': applyBigMode(); break;
                case 'shield': applyShield(); break;
                case 'trail-mode': /* Trail handled in game loop */ break;
                case 'tiny-mode': applyTinyMode(); break;
                case 'ghost-mode': applyGhostMode(); break;
            }
        } else {
            // Turning OFF
            switch(itemId) {
                case 'glow-mode': removeGlowMode(); break;
                case 'big-mode': removeBigMode(); break;
                case 'shield': removeShield(); break;
                case 'trail-mode': clearTrail(); break;
                case 'tiny-mode': removeTinyMode(); break;
                case 'ghost-mode': removeGhostMode(); break;
            }
        }
    }
}

// Remove fire mode effect
function removeFireMode() {
    if (fireParticles && player) {
        player.remove(fireParticles);
        fireParticles = null;
        player.userData.fireParticles = null;
    }
}

function getSpeedMultiplier() {
    let mult = 1;
    if (isItemActive('speed')) mult *= 1.5;
    if (isItemActive('super-speed')) mult *= 2;
    return mult;
}

// Get jump multiplier based on owned items
function getJumpMultiplier() {
    let mult = 1;
    if (isItemActive('jump')) mult *= 1.5;
    if (isItemActive('moon-jump')) mult *= 2;
    return mult;
}

// Get punch damage based on owned items
function getPunchDamage() {
    return isItemActive('power') ? 30 : 15;
}

// Get coin multiplier
function getCoinMultiplier() {
    return isItemActive('double-coins') ? 2 : 1;
}

// Get gravity multiplier (lower = floatier)
function getGravityMultiplier() {
    return isItemActive('low-gravity') ? 0.5 : 1;
}

// Get player scale
function getPlayerScale() {
    return isItemActive('big-mode') ? 1.5 : 1;
}

// Apply glow mode effect
function applyGlowMode() {
    if (!player) return;
    
    // Add point light to player
    if (!player.userData.glowLight) {
        const light = new THREE.PointLight(0x00ffff, 2, 10);
        light.position.set(0, 1, 0);
        player.add(light);
        player.userData.glowLight = light;
    }
}

function removeGlowMode() {
    if (player && player.userData.glowLight) {
        player.remove(player.userData.glowLight);
        player.userData.glowLight = null;
    }
}

// Apply big mode
function applyBigMode() {
    if (player) {
        player.scale.set(1.5, 1.5, 1.5);
    }
}

function removeBigMode() {
    if (player) {
        player.scale.set(1, 1, 1);
    }
}

// Shield - blocks one hit
function useShield() {
    if (isItemActive('shield') && state.shieldActive) {
        state.shieldActive = false;
        // Visual feedback
        if (player.userData.shieldMesh) {
            player.remove(player.userData.shieldMesh);
            player.userData.shieldMesh = null;
        }
        return true; // Hit was blocked
    }
    return false;
}

function applyShield() {
    if (!player) return;
    state.shieldActive = true;
    
    // Create shield visual
    if (!player.userData.shieldMesh) {
        const shieldGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const shieldMat = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shield.position.y = 1;
        player.add(shield);
        player.userData.shieldMesh = shield;
    }
}

function removeShield() {
    state.shieldActive = false;
    if (player && player.userData.shieldMesh) {
        player.remove(player.userData.shieldMesh);
        player.userData.shieldMesh = null;
    }
}

// Rainbow trail
function updateTrail() {
    if (!isItemActive('trail-mode') || !player) return;
    
    // Add trail particle at player position
    const trailGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const hue = (Date.now() * 0.001) % 1;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    const trailMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.copy(player.position);
    trail.position.y -= 0.5;
    trail.userData.life = 1;
    scene.add(trail);
    state.trailParticles.push(trail);
    
    // Limit trail length
    if (state.trailParticles.length > 50) {
        const old = state.trailParticles.shift();
        scene.remove(old);
    }
}

function updateTrailParticles(deltaTime) {
    state.trailParticles.forEach((p, i) => {
        p.userData.life -= deltaTime * 2;
        p.material.opacity = p.userData.life * 0.8;
        p.scale.multiplyScalar(0.98);
        
        if (p.userData.life <= 0) {
            scene.remove(p);
            state.trailParticles.splice(i, 1);
        }
    });
}

function clearTrail() {
    state.trailParticles.forEach(p => scene.remove(p));
    state.trailParticles = [];
}

// Tiny mode
function applyTinyMode() {
    if (player) {
        player.scale.set(0.5, 0.5, 0.5);
    }
}

function removeTinyMode() {
    if (player && !isItemActive('big-mode')) {
        player.scale.set(1, 1, 1);
    }
}

// Ghost mode - make player transparent
function applyGhostMode() {
    if (player && player.userData.bodyMaterial) {
        player.userData.bodyMaterial.transparent = true;
        player.userData.bodyMaterial.opacity = 0.4;
    }
    if (player && player.userData.limbMaterial) {
        player.userData.limbMaterial.transparent = true;
        player.userData.limbMaterial.opacity = 0.4;
    }
}

function removeGhostMode() {
    if (player && player.userData.bodyMaterial) {
        player.userData.bodyMaterial.transparent = false;
        player.userData.bodyMaterial.opacity = 1;
    }
    if (player && player.userData.limbMaterial) {
        player.userData.limbMaterial.transparent = false;
        player.userData.limbMaterial.opacity = 1;
    }
}

// Coin magnet - attract nearby coins
function updateCoinMagnet() {
    if (!isItemActive('magnet') || !player) return;
    
    state.collectibles.forEach(coin => {
        if (!coin.userData.collected && coin.visible) {
            const dist = player.position.distanceTo(coin.position);
            if (dist < 8 && dist > 1) {
                // Move coin toward player
                const dir = new THREE.Vector3().subVectors(player.position, coin.position).normalize();
                coin.position.x += dir.x * 0.15;
                coin.position.y += dir.y * 0.15;
                coin.position.z += dir.z * 0.15;
            }
        }
    });
}

// Spin attack
let isSpinning = false;
function doSpinAttack() {
    if (!isItemActive('spin-attack') || isSpinning || !state.battleMode) return;
    
    isSpinning = true;
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        if (player) {
            player.rotation.y += 0.5;
        }
        spinCount++;
        
        // Check for hits during spin
        if (state.opponent) {
            const dist = player.position.distanceTo(state.opponent.position);
            if (dist < 2.5) {
                state.opponentHealth -= 10;
                document.getElementById('coins-value').textContent = Math.max(0, state.opponentHealth);
            }
        }
        
        if (spinCount >= 12) {
            clearInterval(spinInterval);
            isSpinning = false;
            if (player) player.rotation.y = 0;
        }
    }, 50);
}

// Rocket boots - double jump
function tryDoubleJump() {
    if (isItemActive('rocket-boots') && !state.playerOnGround && !state.hasDoubleJumped) {
        state.playerVelocity.y = JUMP_FORCE * getJumpMultiplier() * 0.8;
        state.hasDoubleJumped = true;
        playJumpSound();
        return true;
    }
    return false;
}

// Reset double jump when landing
function resetDoubleJump() {
    state.hasDoubleJumped = false;
}

// Event listeners

// Start button shows difficulty selection
document.getElementById('start-btn').addEventListener('click', showDifficultySelect);

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const difficulty = e.currentTarget.dataset.difficulty;
        startGame(difficulty);
    });
});

// Back button in difficulty select
document.getElementById('diff-back-btn').addEventListener('click', hideDifficultySelect);

// Restart uses the same difficulty
document.getElementById('restart-btn').addEventListener('click', () => {
    if (state.battleMode || state.lastGameMode === 'battle') {
        startBattle();
    } else if (state.boxFightsMode || state.lastGameMode === 'boxFights') {
        startBoxFights();
    } else if (state.basketballMode || state.lastGameMode === 'basketball') {
        startBasketball();
    } else if (state.soccerMode || state.lastGameMode === 'soccer') {
        startSoccer();
    } else if (state.golfMode || state.lastGameMode === 'golf') {
        startGolf();
    } else if (state.racingMode || state.lastGameMode === 'racing') {
        startRacing();
    } else if (state.coinCollectorMode || state.lastGameMode === 'coinCollector') {
        startCoinCollector();
    } else if (state.survivalMode || state.lastGameMode === 'survival') {
        startSurvival();
    } else if (state.targetPracticeMode || state.lastGameMode === 'targetPractice') {
        startTargetPractice();
    } else if (state.speedRaceMode || state.lastGameMode === 'speedRace') {
        startSpeedRace();
    } else {
        startGame(state.difficulty || 'normal');
    }
});

// Go back to title screen
document.getElementById('goback-btn').addEventListener('click', returnToTitle);

document.getElementById('battle-btn').addEventListener('click', startBattle);
document.getElementById('shop-btn').addEventListener('click', openShop);
document.getElementById('minigames-btn').addEventListener('click', openMiniGames);
document.getElementById('sports-btn').addEventListener('click', openSports);
document.getElementById('career-btn').addEventListener('click', openCareer);
document.getElementById('boxfights-btn').addEventListener('click', startBoxFights);
document.getElementById('shop-close-btn').addEventListener('click', closeShop);
document.getElementById('career-close-btn').addEventListener('click', closeCareer);
document.getElementById('minigames-close-btn').addEventListener('click', closeMiniGames);
document.getElementById('sports-close-btn').addEventListener('click', closeSports);

// Mini game and sports item clicks
document.getElementById('sport-basketball').addEventListener('click', startBasketball);

// Speed Race
document.getElementById('minigame-race').addEventListener('click', startSpeedRace);

// Target Practice
document.getElementById('minigame-target').addEventListener('click', startTargetPractice);

// Survival Mode
document.getElementById('minigame-survival').addEventListener('click', startSurvival);

// Coin Collector mini-game
document.getElementById('minigame-collect').addEventListener('click', startCoinCollector);

// Racing game
document.getElementById('sport-racing').addEventListener('click', startRacing);

// Golf game
document.getElementById('sport-golf').addEventListener('click', startGolf);

// Soccer game
document.getElementById('sport-soccer').addEventListener('click', startSoccer);
document.getElementById('victory-btn').addEventListener('click', returnToTitle);
document.getElementById('music-btn').addEventListener('click', toggleMusic);

// Shop item purchase/toggle listeners
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const item = e.target.closest('.shop-item');
        const itemId = item.dataset.item;
        const price = parseInt(e.target.dataset.price);
        
        // If already owned, toggle ON/OFF
        if (state.ownedItems[itemId]) {
            toggleItem(itemId);
        } else {
            // Otherwise try to buy
            buyItem(itemId, price);
        }
    });
});

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize
camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);
createPlatform(0, 0, 0, 12, 2, 12); // Title screen platform

// Start loop
gameLoop(0);
