const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33F6', '#FFFF33', '#33FFFF', '#FF8C33'];
const AIRPORT_NAMES = ['New York', 'London', 'Tokyo', 'Dubai', 'Los Angeles', 'Paris', 'Amsterdam', 'Frankfurt', 'Singapore', 'Seoul'];
const SPAWN_RATE = 5000; // ms
const PLANE_SPEED = 0.8; // Base speed
const PLANE_SIZE = 15;

// Utility functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

class Runway {
    constructor(x, y, angle, color, airportName) {
        this.x = x;
        this.y = y;
        this.angle = angle; // in radians
        this.color = color;
        this.width = 18;
        this.length = 80;
        this.airportName = airportName;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Runway strip
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width / 2, -this.length / 2, this.width, this.length);
        
        // Colored landing zone/markings
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2 + 5, -this.length / 2 + 5, this.width - 10, 20); // Threshold
        ctx.fillRect(-2, -this.length / 2 + 30, 4, this.length - 40); // Center line
        
        ctx.restore();
    }

    getBounds() {
        // Simple bounding box for touch detection roughly
        return {
            x: this.x - this.length/2, // Rough approx
            y: this.y - this.length/2,
            w: this.length,
            h: this.length
        };
    }
}

class Airport {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.runways = [];
        this.landBlobs = [];
        this.generateLand();
        this.generateRunways();
    }

    getRunway(color) {
        return this.runways.find(r => r.color === color);
    }

    generateLand() {
        const numBlobs = randomInt(4, 7);
        for (let i = 0; i < numBlobs; i++) {
            this.landBlobs.push({
                x: randomInt(-100, 100),
                y: randomInt(-100, 100),
                r: randomInt(150, 250)
            });
        }
    }

    generateRunways() {
        // Predefined runways per airport? Or still random? 
        // User said "levels instead of random maps", but didn't specify runway details.
        // Let's stick to randomization for runway count/orientation for variety, 
        // or make it fixed if we wanted full determinism.
        // For now, keeping random runways but ensuring they fit nicely.
        
        const numRunways = randomInt(2, 4); // Reduced slightly to fit crowded map
        const usedColors = new Set();
        
        for (let i = 0; i < numRunways; i++) {
            let color;
            do {
                color = COLORS[randomInt(0, COLORS.length - 1)];
            } while (usedColors.has(color) && usedColors.size < COLORS.length);
            usedColors.add(color);

            // Keep runways closer to city center since cities are fixed
            const offsetX = randomInt(-80, 80);
            const offsetY = randomInt(-80, 80);
            const angle = Math.random() * Math.PI * 2;
            
            this.runways.push(new Runway(this.x + offsetX, this.y + offsetY, angle, color, this.name));
        }
    }

    draw() {
        this.runways.forEach(r => {
            // Highlight runway if it matches active plane
            if (window.game && window.game.activePlane && 
                window.game.activePlane.targetAirportName === this.name && 
                window.game.activePlane.targetColor === r.color) {
                
                // Pulsing glow
                ctx.save();
                ctx.translate(r.x, r.y);
                ctx.rotate(r.angle);
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#fff';
                ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
                ctx.fillStyle = r.color;
                ctx.fillRect(-r.width/2 - 5, -r.length/2 - 5, r.width + 10, r.length + 10);
                ctx.restore();
            }
            r.draw();
        });

        // Red City Dot (as per map image)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px "Comic Sans MS"';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeText(this.name, this.x, this.y - 15);
        ctx.fillText(this.name, this.x, this.y - 15);
    }
}

class Plane {
    constructor(x, y, targetAirportName, targetColor) {
        this.x = x;
        this.y = y;
        this.targetAirportName = targetAirportName;
        this.targetColor = targetColor;
        this.path = []; // Array of {x, y}
        this.angle = Math.random() * Math.PI * 2;
        this.speed = PLANE_SPEED;
        this.state = 'flying'; // flying, landing, landed, crashed
        this.landedTime = 0;
        this.isSelected = false;
    }

    update() {
        if (this.state === 'crashed' || this.state === 'landed') return;

        if (this.path.length > 0) {
            // Follow path
            const target = this.path[0];
            const dist = getDistance(this, target);
            
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.angle = Math.atan2(dy, dx);
            
            if (dist < this.speed) {
                this.path.shift(); // Reached this point
            }
        } else {
            // Keep flying straight if no path
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Screen bounds check - if far off screen, maybe remove or turn back?
        // For now, let them fly off and get garbage collected if too far (handled in game loop)
    }

    draw() {
        if (this.state === 'landed') return;

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.state === 'landing') {
             const scale = Math.max(0.1, this.speed / PLANE_SPEED); 
             ctx.scale(scale, scale);
        }

        ctx.rotate(this.angle);

        // Plane body
        ctx.fillStyle = this.targetColor;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        // Fuselage
        ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wings
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-5, 20);
        ctx.lineTo(5, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-5, -20);
        ctx.lineTo(5, -20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.fillStyle = this.targetColor;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-18, 6);
        ctx.lineTo(-18, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit
        ctx.fillStyle = '#ccffff';
        ctx.beginPath();
        ctx.arc(8, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.rotate(-this.angle); // Reset rotation for text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px "Comic Sans MS"';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeText(this.targetAirportName, 0, -25);
        ctx.fillText(this.targetAirportName, 0, -25);
        
        ctx.restore();

        // Draw path
        if (this.path.length > 0) {
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            this.path.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

class Level {
    constructor(config) {
        this.airports = config.airports; // Array of {name, x, y} (0-1 scale)
        this.landShape = config.landShape; // Array of points/polygons
        this.secondaryShapes = config.secondaryShapes || []; // Extra islands
        this.backgroundColor = config.backgroundColor || '#FFFFFF'; // Water
        this.landColor = config.landColor || '#FFFF00'; // Yellow
    }
}

// Define Level 1: Australia
const LEVEL_1 = new Level({
    backgroundColor: '#FFFFFF', // Water
    landColor: '#FFD700', // Gold/Yellow
    airports: [
        { name: 'Darwin', x: 0.48, y: 0.18 },
        { name: 'Perth', x: 0.15, y: 0.65 },
        { name: 'Adelaide', x: 0.60, y: 0.72 },
        { name: 'Melbourne', x: 0.72, y: 0.82 },
        { name: 'Hobart', x: 0.74, y: 0.92 },
        { name: 'Canberra', x: 0.79, y: 0.78 },
        { name: 'Sydney', x: 0.85, y: 0.72 },
        { name: 'Brisbane', x: 0.90, y: 0.50 }
    ],
    landShape: [
        // Hyper Detailed Australia Polygon (Traced)
        { x: 0.450, y: 0.150 }, // Darwin
        { x: 0.458, y: 0.148 }, 
        { x: 0.465, y: 0.145 }, // Cobourg
        { x: 0.475, y: 0.142 },
        { x: 0.485, y: 0.140 }, 
        { x: 0.492, y: 0.135 },
        { x: 0.500, y: 0.130 }, // Arnhem Land tip
        { x: 0.510, y: 0.132 }, 
        { x: 0.520, y: 0.135 }, 
        { x: 0.530, y: 0.140 }, // Gove
        { x: 0.540, y: 0.148 },
        { x: 0.550, y: 0.155 }, // Blue Mud Bay
        { x: 0.560, y: 0.180 }, // Groote Eylandt
        { x: 0.565, y: 0.200 }, 
        { x: 0.575, y: 0.220 }, // Roper River
        { x: 0.590, y: 0.240 },
        { x: 0.600, y: 0.250 }, // Gulf of Carpentaria (bottom)
        { x: 0.610, y: 0.240 }, 
        { x: 0.620, y: 0.225 }, // Karumba
        { x: 0.630, y: 0.210 }, 
        { x: 0.640, y: 0.200 }, // Weipa
        { x: 0.650, y: 0.180 }, 
        { x: 0.660, y: 0.150 }, 
        { x: 0.670, y: 0.120 }, 
        { x: 0.680, y: 0.100 }, // Cape York Tip
        { x: 0.690, y: 0.120 }, 
        { x: 0.700, y: 0.150 }, 
        { x: 0.710, y: 0.180 }, // Lockhart
        { x: 0.720, y: 0.200 }, // Princess Charlotte Bay
        { x: 0.730, y: 0.220 }, // Cape Melville
        { x: 0.735, y: 0.250 }, // Cooktown
        { x: 0.740, y: 0.280 }, // Port Douglas
        { x: 0.750, y: 0.300 }, // Cairns
        { x: 0.760, y: 0.320 }, // Innisfail
        { x: 0.765, y: 0.330 }, // Hinchinbrook
        { x: 0.775, y: 0.345 }, // Proserpine
        { x: 0.780, y: 0.350 }, // Whitsunday
        { x: 0.790, y: 0.370 }, 
        { x: 0.800, y: 0.400 }, // Mackay
        { x: 0.810, y: 0.420 }, // St Lawrence
        { x: 0.820, y: 0.450 }, // Rockhampton
        { x: 0.825, y: 0.470 }, // Gladstone
        { x: 0.830, y: 0.480 }, // Bundaberg
        { x: 0.840, y: 0.490 }, // Hervey Bay
        { x: 0.850, y: 0.500 }, // Brisbane
        { x: 0.855, y: 0.520 }, // Stradbroke
        { x: 0.850, y: 0.550 }, // Gold Coast
        { x: 0.845, y: 0.580 }, // Grafton
        { x: 0.840, y: 0.600 }, // Port Macquarie
        { x: 0.835, y: 0.620 }, // Taree
        { x: 0.830, y: 0.650 }, // Newcastle
        { x: 0.825, y: 0.670 }, // Central Coast
        { x: 0.820, y: 0.700 }, // Sydney
        { x: 0.815, y: 0.720 }, 
        { x: 0.810, y: 0.730 }, // Wollongong
        { x: 0.800, y: 0.750 }, // Jervis Bay
        { x: 0.790, y: 0.770 }, // Batemans Bay
        { x: 0.780, y: 0.780 }, // Eden
        { x: 0.770, y: 0.790 }, // Mallacoota
        { x: 0.760, y: 0.800 }, // Gippsland
        { x: 0.755, y: 0.815 }, // Wilsons Prom
        { x: 0.750, y: 0.820 }, // Western Port
        { x: 0.740, y: 0.815 }, 
        { x: 0.735, y: 0.810 }, // Port Phillip
        { x: 0.730, y: 0.805 }, 
        { x: 0.720, y: 0.800 }, // Geelong
        { x: 0.710, y: 0.810 }, // Apollo Bay
        { x: 0.700, y: 0.820 }, // Cape Otway
        { x: 0.690, y: 0.800 }, // Warrnambool
        { x: 0.680, y: 0.780 }, // Portland
        { x: 0.665, y: 0.770 }, // Kingston SE
        { x: 0.660, y: 0.760 }, // Murray Mouth
        { x: 0.650, y: 0.750 }, // Adelaide
        { x: 0.645, y: 0.760 }, // Fleurieu tip
        { x: 0.640, y: 0.750 }, 
        { x: 0.635, y: 0.740 }, // St Vincent Gulf
        { x: 0.630, y: 0.720 }, // Yorke tip
        { x: 0.625, y: 0.710 }, 
        { x: 0.620, y: 0.730 }, // Spencer Gulf
        { x: 0.615, y: 0.730 }, 
        { x: 0.610, y: 0.720 }, // Port Lincoln
        { x: 0.600, y: 0.700 }, // Eyre Peninsula
        { x: 0.590, y: 0.690 }, // Streaky Bay
        { x: 0.580, y: 0.680 }, // Ceduna
        { x: 0.550, y: 0.680 }, // Head of Bight
        { x: 0.500, y: 0.675 }, 
        { x: 0.450, y: 0.670 }, // Eucla
        { x: 0.400, y: 0.675 },
        { x: 0.350, y: 0.680 }, // Twilight Cove
        { x: 0.325, y: 0.690 }, 
        { x: 0.300, y: 0.700 }, // Esperance
        { x: 0.275, y: 0.720 }, // Hopetoun
        { x: 0.250, y: 0.750 }, // Albany
        { x: 0.225, y: 0.745 }, // Denmark
        { x: 0.200, y: 0.740 }, // Walpole
        { x: 0.180, y: 0.720 }, // Cape Leeuwin
        { x: 0.150, y: 0.710 }, // Margaret River
        { x: 0.130, y: 0.705 }, // Busselton
        { x: 0.120, y: 0.700 }, // Bunbury
        { x: 0.120, y: 0.675 }, // Mandurah
        { x: 0.120, y: 0.650 }, // Rockingham
        { x: 0.120, y: 0.625 }, // Fremantle
        { x: 0.120, y: 0.600 }, // Perth
        { x: 0.115, y: 0.580 }, // Lancelin
        { x: 0.110, y: 0.550 }, // Jurien Bay
        { x: 0.105, y: 0.525 }, // Kalbarri
        { x: 0.100, y: 0.500 }, // Shark Bay
        { x: 0.105, y: 0.480 }, // Denham
        { x: 0.108, y: 0.465 }, // Carnarvon
        { x: 0.110, y: 0.450 }, 
        { x: 0.115, y: 0.420 }, // Coral Bay
        { x: 0.120, y: 0.400 }, // North West Cape
        { x: 0.125, y: 0.390 }, // Exmouth
        { x: 0.130, y: 0.380 }, // Exmouth Gulf
        { x: 0.135, y: 0.365 }, 
        { x: 0.140, y: 0.350 }, // Onslow
        { x: 0.145, y: 0.325 }, // Barrow Island
        { x: 0.150, y: 0.300 }, // Karratha
        { x: 0.165, y: 0.290 }, 
        { x: 0.180, y: 0.280 }, // Roebourne
        { x: 0.190, y: 0.265 }, 
        { x: 0.200, y: 0.250 }, // Port Hedland
        { x: 0.210, y: 0.240 }, 
        { x: 0.220, y: 0.230 }, // Pardoo
        { x: 0.230, y: 0.225 }, 
        { x: 0.240, y: 0.220 }, // Eighty Mile Beach
        { x: 0.250, y: 0.210 }, // Broome
        { x: 0.265, y: 0.205 }, // Dampier Peninsula
        { x: 0.280, y: 0.200 }, // Derby
        { x: 0.290, y: 0.195 }, // King Sound
        { x: 0.300, y: 0.190 }, // Buccaneer Archipelago
        { x: 0.310, y: 0.190 }, // Camden Sound
        { x: 0.320, y: 0.190 }, // Prince Regent
        { x: 0.335, y: 0.185 }, // Kalumburu
        { x: 0.350, y: 0.180 }, // Joseph Bonaparte Gulf
        { x: 0.365, y: 0.185 }, 
        { x: 0.380, y: 0.190 }, // Wyndham
        { x: 0.390, y: 0.195 }, 
        { x: 0.400, y: 0.200 }, // Daly River mouth
        { x: 0.410, y: 0.190 }, 
        { x: 0.420, y: 0.180 }, // Port Keats
        { x: 0.435, y: 0.165 }  // Anson Bay
    ],
    // Add island as separate shape
    secondaryShapes: [
        [ // Tasmania
            { x: 0.70, y: 0.88 },
            { x: 0.74, y: 0.88 },
            { x: 0.75, y: 0.95 },
            { x: 0.71, y: 0.95 }
        ]
    ]
});

const LEVELS = [LEVEL_1];

class Game {
    constructor() {
        this.airports = [];
        this.planes = [];
        this.trees = []; // Not used in level 1 map style but kept for compatibility
        this.score = 0;
        this.currentLevelIndex = 0;
        this.isGameOver = false;
        this.lastSpawnTime = 0;
        this.isRunning = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Input handling
        this.activePlane = null;
        this.setupInputs();
        
        // UI
        this.scoreEl = document.getElementById('score');
        this.gameOverEl = document.getElementById('gameOver');
        this.finalScoreEl = document.getElementById('finalScore');
        this.mainMenuEl = document.getElementById('mainMenu');
        this.gameCanvasEl = document.getElementById('gameCanvas');
        this.uiEl = document.getElementById('ui');
        
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
    }

    resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    showMenu() {
        this.isRunning = false;
        this.mainMenuEl.classList.remove('hidden');
        this.gameCanvasEl.classList.add('hidden');
        this.uiEl.classList.add('hidden');
        this.gameOverEl.classList.add('hidden');
        cancelAnimationFrame(this.gameLoop);
    }

    startGame() {
        this.isRunning = true;
        this.mainMenuEl.classList.add('hidden');
        this.gameCanvasEl.classList.remove('hidden');
        this.uiEl.classList.remove('hidden');
        this.restart();
    }

    start() {
        // Initial setup only, wait for button press
    }

    restart() {
        this.planes = [];
        this.score = 0;
        this.isGameOver = false;
        this.gameOverEl.classList.add('hidden');
        this.updateScore();
        this.generateMap(); 
        window.game = this; // Ensure global reference
        cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame((t) => this.loop(t));
    }

    generateTrees() {
        const numTrees = randomInt(50, 100);
        for(let i=0; i<numTrees; i++) {
            this.trees.push({
                x: randomInt(0, canvas.width),
                y: randomInt(0, canvas.height),
                size: randomInt(10, 20),
                color: Math.random() > 0.5 ? '#1a6b1a' : '#228B22' // Varied darker greens
            });
        }
    }

    generateMap() {
        this.airports = [];
        this.trees = [];
        
        const level = LEVELS[this.currentLevelIndex];
        
        // Create airports from level data
        // Map 0-1 coordinates to screen space with padding
        const padding = 50;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;

        level.airports.forEach(data => {
            const x = padding + data.x * w;
            const y = padding + data.y * h;
            this.airports.push(new Airport(data.name, x, y));
        });
    }

    spawnPlane() {
        // Spawn at edge of screen
        let x, y, angle;
        const side = randomInt(0, 3); // 0: top, 1: right, 2: bottom, 3: left
        
        switch(side) {
            case 0: x = Math.random() * canvas.width; y = -30; break;
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = canvas.height + 30; break;
            case 3: x = -30; y = Math.random() * canvas.height; break;
        }

        // Pick a random target airport and runway
        if (this.airports.length === 0) return; // Should not happen
        const targetAirport = this.airports[randomInt(0, this.airports.length - 1)];
        // Ensure airport has runways
        if (targetAirport.runways.length === 0) return;
        
        const targetRunway = targetAirport.runways[randomInt(0, targetAirport.runways.length - 1)];

        const plane = new Plane(x, y, targetAirport.name, targetRunway.color);
        
        // Point initially towards center or target
        plane.angle = Math.atan2(targetAirport.y - y, targetAirport.x - x);
        
        this.planes.push(plane);
    }

    setupInputs() {
        const startPath = (e) => {
            e.preventDefault();
            const pos = this.getEventPos(e);
            
            // Find clicked plane
            // Check top-most (last drawn) or check all and pick closest?
            // Let's pick closest within range
            let closest = null;
            let minD = 50; // Touch radius

            this.planes.forEach(p => {
                if (p.state !== 'flying') return;
                const d = getDistance(pos, p);
                if (d < minD) {
                    minD = d;
                    closest = p;
                }
            });

            if (closest) {
                this.activePlane = closest;
                this.activePlane.isSelected = true;
                this.activePlane.path = []; // Clear old path
            }
        };

        const drawPath = (e) => {
            e.preventDefault();
            if (!this.activePlane) return;
            
            const pos = this.getEventPos(e);
            
            // Check for snapping to correct runway
            let snapPoint = null;
            this.airports.forEach(a => {
                if (a.name === this.activePlane.targetAirportName) {
                    const r = a.getRunway(this.activePlane.targetColor);
                    if (r) {
                        // Check distance to runway ends
                        // Runway center is r.x, r.y
                        // Ends are offset by length/2 along angle
                        const dx = Math.cos(r.angle) * r.length / 2;
                        const dy = Math.sin(r.angle) * r.length / 2;
                        
                        const end1 = {x: r.x + dx, y: r.y + dy};
                        const end2 = {x: r.x - dx, y: r.y - dy};
                        
                        if (getDistance(pos, end1) < 40) snapPoint = end1;
                        if (getDistance(pos, end2) < 40) snapPoint = end2;
                    }
                }
            });

            if (snapPoint) {
                 // If we haven't already snapped to it (prevent spamming points)
                 const lastPoint = this.activePlane.path[this.activePlane.path.length - 1];
                 if (!lastPoint || getDistance(lastPoint, snapPoint) > 1) {
                     this.activePlane.path.push(snapPoint);
                     // Force end of interaction
                     this.activePlane.isSelected = false;
                     this.activePlane = null;
                     return;
                 }
            }

            // Add point if distance from last point is sufficient (smoothness)
            const lastPoint = this.activePlane.path[this.activePlane.path.length - 1] || this.activePlane;
            if (getDistance(lastPoint, pos) > 10) {
                this.activePlane.path.push({x: pos.x, y: pos.y});
            }
        };

        const endPath = (e) => {
            e.preventDefault();
            if (this.activePlane) {
                this.activePlane.isSelected = false;
                this.activePlane = null;
            }
        };

        canvas.addEventListener('mousedown', startPath);
        canvas.addEventListener('mousemove', drawPath);
        canvas.addEventListener('mouseup', endPath);
        
        canvas.addEventListener('touchstart', startPath, {passive: false});
        canvas.addEventListener('touchmove', drawPath, {passive: false});
        canvas.addEventListener('touchend', endPath, {passive: false});
    }

    getEventPos(e) {
        if (e.touches && e.touches.length > 0) {
            return {x: e.touches[0].clientX, y: e.touches[0].clientY};
        }
        return {x: e.clientX, y: e.clientY};
    }

    updateScore() {
        this.scoreEl.textContent = `Score: ${this.score}`;
    }

    checkCollisions() {
        // Plane vs Plane
        for (let i = 0; i < this.planes.length; i++) {
            for (let j = i + 1; j < this.planes.length; j++) {
                const p1 = this.planes[i];
                const p2 = this.planes[j];
                if (p1.state !== 'flying' || p2.state !== 'flying') continue;

                if (getDistance(p1, p2) < PLANE_SIZE) {
                    // Crash!
                    this.gameOver();
                }
            }
        }

        // Plane vs Runway (Landing)
        this.planes.forEach(p => {
            if (p.state !== 'flying') return;

            // Check if near any airport
            this.airports.forEach(a => {
                if (a.name !== p.targetAirportName) return;

                a.runways.forEach(r => {
                    if (r.color !== p.targetColor) return;

                    // Check if aligned and close to start of runway
                    // Simple check: distance to runway center < length/2 AND angle matches
                    // Better check: Transform plane pos to runway local space
                    
                    const dx = p.x - r.x;
                    const dy = p.y - r.y;
                    
                    // Rotate point by -runwayAngle
                    const localX = dx * Math.cos(-r.angle) - dy * Math.sin(-r.angle);
                    const localY = dx * Math.sin(-r.angle) + dy * Math.cos(-r.angle);
                    
                    // Runway is aligned along Y axis in local space if we drew it that way?
                    // In draw(): fillRect(-width/2, -length/2, width, length) -> It's vertical in local space
                    // Actually, we rotate context by r.angle. So local Y is along the length.
                    
                    // Acceptance zone: near 0 x (width) and within length
                    // And plane angle must match runway angle (within tolerance)
                    
                    let angleDiff = Math.abs(p.angle - r.angle);
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    angleDiff = Math.abs(angleDiff);
                    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff; // Normalize
                    
                    // Also check 180 flip (landing from other side?)
                    // If angleDiff is close to PI (180 deg), it's also valid
                    let isAligned = angleDiff < 0.8;
                    if (Math.abs(angleDiff - Math.PI) < 0.8) isAligned = true;

                    if (Math.abs(localX) < r.width && Math.abs(localY) < r.length && isAligned) {
                        // Landed!
                        this.score++;
                        this.updateScore();
                        p.state = 'landing'; // Transition state
                        p.path = [];
                    }
                });
            });
        });
    }

    loop(timestamp) {
        if (this.isGameOver) return;

        const dt = timestamp - (this.lastFrameTime || timestamp);
        this.lastFrameTime = timestamp;

        // Clear
        const level = LEVELS[this.currentLevelIndex];
        ctx.fillStyle = level.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Land Shape
        const padding = 50;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;
        
        ctx.fillStyle = level.landColor;
        ctx.strokeStyle = '#DAA520'; // Goldenrod outline
        ctx.lineWidth = 5;
        ctx.beginPath();
        
        if (level.landShape.length > 0) {
            const start = level.landShape[0];
            ctx.moveTo(padding + start.x * w, padding + start.y * h);
            for (let i = 1; i < level.landShape.length; i++) {
                const p = level.landShape[i];
                ctx.lineTo(padding + p.x * w, padding + p.y * h);
            }
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        // Draw Secondary Shapes (Islands)
        if (level.secondaryShapes) {
            level.secondaryShapes.forEach(shape => {
                ctx.beginPath();
                if (shape.length > 0) {
                    const start = shape[0];
                    ctx.moveTo(padding + start.x * w, padding + start.y * h);
                    for (let i = 1; i < shape.length; i++) {
                        const p = shape[i];
                        ctx.lineTo(padding + p.x * w, padding + p.y * h);
                    }
                    ctx.closePath();
                }
                ctx.fill();
                ctx.stroke();
            });
        }

        // Spawn
        if (timestamp - this.lastSpawnTime > SPAWN_RATE) {
            this.spawnPlane();
            this.lastSpawnTime = timestamp;
        }

        // Update
        this.planes.forEach(p => {
             if (p.state === 'landing') {
                 // Shrink or fade out
                 p.speed *= 0.95;
                 if (p.speed < 0.1) p.state = 'landed';
             } else {
                 p.update();
             }
        });
        
        // Remove landed planes or far away planes
        this.planes = this.planes.filter(p => {
            if (p.state === 'landed') return false;
            if (p.x < -100 || p.x > canvas.width + 100 || p.y < -100 || p.y > canvas.height + 100) return false;
            return true;
        });

        this.checkCollisions();

        // Draw
        this.airports.forEach(a => a.draw());
        this.planes.forEach(p => p.draw());

        this.gameLoop = requestAnimationFrame((t) => this.loop(t));
    }

    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        this.finalScoreEl.textContent = this.score;
        this.gameOverEl.classList.remove('hidden');
    }
}

// Start game
const game = new Game();

