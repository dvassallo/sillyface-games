// Game Configuration
const config = {
    canvasColor: '#2d3436', // Darker forest floor
    worldSize: { width: 4000, height: 4000 },
    initialPlants: 80,
    initialTrees: 40,
    plantSpawnRate: 0.03,
    predatorSpawnRate: 0.005,
    maxPredators: 5,
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');

// UI Elements
const healthDisplay = document.getElementById('health-display');
const hungerDisplay = document.getElementById('hunger-display');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over');
const daysSurvivedDisplay = document.getElementById('days-survived');

// Assets
const assets = {
    bunny: new Image(),
    predator: new Image(),
    plant: new Image(),
    carrot: new Image(),
    grass: new Image(),
    tree: new Image(),
    burrow: new Image(),
    water: new Image(),
    rock: new Image()
};

assets.bunny.src = 'assets/bunny.svg';
assets.predator.src = 'assets/predator.svg';
assets.plant.src = 'assets/plant.svg';
assets.carrot.src = 'assets/carrot.svg';
assets.grass.src = 'assets/grass.svg';
assets.tree.src = 'assets/tree.svg';
assets.burrow.src = 'assets/burrow.svg';
assets.water.src = 'assets/water.svg';
assets.rock.src = 'assets/rock.svg';

// Game State
let gameState = {
    running: true,
    score: 0,
    startTime: Date.now(),
    camera: { x: 0, y: 0 },
    keys: {}
};

// Terrain Features
const lake = {
    x: 3000,
    y: 1000,
    radius: 600,
    pattern: null
};

const mountain = {
    x: 800,
    y: 3000,
    radius: 500,
    pattern: null
};

// Entities
class Entity {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.markedForDeletion = false;
        this.angle = 0;
    }

    draw(ctx, camera) {
        // Default circle if no image, but we override
    }
}

class Tree extends Entity {
    constructor(x, y) {
        super(x, y, 40); // Large collision radius
    }

    draw(ctx, camera) {
        if (!assets.tree.complete) return;
        // Draw centered
        ctx.drawImage(assets.tree, this.x - camera.x - 64, this.y - camera.y - 64, 128, 128);
    }
}

class Bunny extends Entity {
    constructor(x, y) {
        super(x, y, 25);
        this.speed = 4;
        this.sprintSpeed = 7;
        this.health = 100;
        this.hunger = 0;
        this.stamina = 100;
        this.maxStamina = 100;
        this.angle = 0;
        
        this.isBurrowed = false;
        this.burrowCooldown = 0;
        this.isSwimming = false;
        this.isClimbing = false;
    }

    update(keys, trees) {
        // Check Terrain
        const distToLake = Math.hypot(this.x - lake.x, this.y - lake.y);
        this.isSwimming = distToLake < lake.radius;
        
        const distToMountain = Math.hypot(this.x - mountain.x, this.y - mountain.y);
        this.isClimbing = distToMountain < mountain.radius;

        // Burrowing Toggle
        if (keys['b']) {
            if (this.burrowCooldown <= 0 && !this.isSwimming) { // Can't burrow in water
                this.isBurrowed = !this.isBurrowed;
                this.burrowCooldown = 20; // Debounce frames
            }
        }
        if (this.burrowCooldown > 0) this.burrowCooldown--;

        if (this.isBurrowed) {
            this.stamina = Math.min(this.maxStamina, this.stamina + 0.5);
            return;
        }

        let currentSpeed = this.speed;

        // Terrain modifiers
        if (this.isSwimming) {
            currentSpeed *= 0.5; // Slow in water
            this.stamina = Math.max(0, this.stamina - 0.1); // Swimming tires you
        }
        if (this.isClimbing) {
            currentSpeed *= 0.7; // Uphill is slower
        }

        if (keys['Shift'] && this.stamina > 0) {
            currentSpeed = this.isSwimming ? currentSpeed * 1.5 : this.sprintSpeed; // Sprint slower in water
            this.stamina -= 0.5;
        } else if (this.stamina < this.maxStamina) {
            this.stamina += 0.2;
        }

        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            let nextX = this.x + dx * currentSpeed;
            let nextY = this.y + dy * currentSpeed;

            // Tree Collision
            let collided = false;
            for (const tree of trees) {
                const dist = Math.hypot(nextX - tree.x, nextY - tree.y);
                if (dist < this.radius + tree.radius * 0.5) { 
                    collided = true;
                    break;
                }
            }

            if (!collided) {
                this.x = nextX;
                this.y = nextY;
            }
            
            const targetAngle = Math.atan2(dy, dx);
            this.angle = targetAngle;
        }

        this.x = Math.max(this.radius, Math.min(config.worldSize.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(config.worldSize.height - this.radius, this.y));

        this.hunger += 0.08; // Hunger increases faster
        if (this.hunger >= 100) {
            this.hunger = 100;
            this.health -= 0.2; // Starvation hurts more
        } else if (this.hunger > 75) {
            this.health -= 0.05; // You start feeling weak before max hunger
        }

        if (this.hunger < 20 && this.health < 100) {
            this.health += 0.05;
        }

        if (this.health <= 0) {
            endGame();
        }
    }
    
    eat() {
        if (this.isBurrowed) return;
        this.hunger = Math.max(0, this.hunger - 20);
        this.health = Math.min(100, this.health + 5);
        gameState.score += 10;
    }

    draw(ctx, camera) {
        if (this.isBurrowed) {
             if (assets.burrow.complete) {
                ctx.drawImage(assets.burrow, this.x - camera.x - 32, this.y - camera.y - 32, 64, 64);
             }
             return;
        }

        if (!assets.bunny.complete) return;
        
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.rotate(this.angle + Math.PI / 2);
        
        if (this.isSwimming) {
             // Bobbing effect in water
             const bob = Math.sin(Date.now() / 200) * 2;
             ctx.drawImage(assets.bunny, -32, -32 + bob, 64, 64);
        } else {
             ctx.drawImage(assets.bunny, -32, -32, 64, 64);
        }
        ctx.restore();
    }
}

class Plant extends Entity {
    constructor(x, y) {
        super(x, y, 15);
    }
    
    draw(ctx, camera) {
        // Draw carrot instead of generic plant
        if (assets.carrot.complete) {
            ctx.drawImage(assets.carrot, this.x - camera.x - 16, this.y - camera.y - 16, 32, 32);
        } else if (assets.plant.complete) {
            ctx.drawImage(assets.plant, this.x - camera.x - 16, this.y - camera.y - 16, 32, 32);
        }
    }
}

class Predator extends Entity {
    constructor(x, y) {
        super(x, y, 30);
        this.speed = 4.2;
        this.detectionRange = 400;
        this.angle = 0;
    }

    update(bunny, trees) {
        if (bunny.isBurrowed) {
             this.wander(trees);
             return;
        }
        
        // Check terrain for predator speed too?
        // For simplicity, let's say they move normally for now, or slow down in water
        const distToLake = Math.hypot(this.x - lake.x, this.y - lake.y);
        const inWater = distToLake < lake.radius;
        let currentSpeed = this.speed;
        if (inWater) currentSpeed *= 0.6;

        const dx = bunny.x - this.x;
        const dy = bunny.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.detectionRange) {
            let moveX = (dx / dist) * currentSpeed;
            let moveY = (dy / dist) * currentSpeed;
            
            this.moveWithCollision(moveX, moveY, trees);
            this.angle = Math.atan2(dy, dx);
        } else {
            this.wander(trees);
        }

        if (dist < this.radius + bunny.radius) {
            bunny.health -= 10; 
        }
        
        this.x = Math.max(this.radius, Math.min(config.worldSize.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(config.worldSize.height - this.radius, this.y));
    }

    wander(trees) {
        if (Math.random() < 0.05) {
                this.wanderAngle = Math.random() * Math.PI * 2;
        }
        if (this.wanderAngle === undefined) this.wanderAngle = 0;
        
        let moveX = Math.cos(this.wanderAngle) * 1;
        let moveY = Math.sin(this.wanderAngle) * 1;

        this.moveWithCollision(moveX, moveY, trees);
        this.angle = this.wanderAngle;
    }

    moveWithCollision(moveX, moveY, trees) {
         let nextX = this.x + moveX;
         let nextY = this.y + moveY;
         
         let collided = false;
         for (const tree of trees) {
             const dist = Math.hypot(nextX - tree.x, nextY - tree.y);
             if (dist < this.radius + tree.radius * 0.5) {
                 collided = true;
                 this.wanderAngle = Math.random() * Math.PI * 2;
                 break;
             }
         }

         if (!collided) {
             this.x = nextX;
             this.y = nextY;
         }
    }

    draw(ctx, camera) {
        if (!assets.predator.complete) return;
        
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.drawImage(assets.predator, -32, -32, 64, 64);
        ctx.restore();
    }
}

let bunny;
let plants = [];
let trees = [];
let predators = [];
let grassPattern = null;

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    bunny = new Bunny(config.worldSize.width / 2, config.worldSize.height / 2);
    
    // Spawn Trees first so they don't overlap bunny spawn too badly (simple check)
    for (let i = 0; i < config.initialTrees; i++) {
        spawnTree();
    }
    
    for (let i = 0; i < config.initialPlants; i++) {
        spawnPlant();
    }

    window.addEventListener('keydown', e => gameState.keys[e.key] = true);
    window.addEventListener('keyup', e => gameState.keys[e.key] = false);

    assets.grass.onload = () => {
        grassPattern = ctx.createPattern(assets.grass, 'repeat');
    };
    assets.water.onload = () => {
        lake.pattern = ctx.createPattern(assets.water, 'repeat');
    };
    assets.rock.onload = () => {
        mountain.pattern = ctx.createPattern(assets.rock, 'repeat');
    };

    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (assets.grass.complete) {
        grassPattern = ctx.createPattern(assets.grass, 'repeat');
    }
    if (assets.water.complete) {
        lake.pattern = ctx.createPattern(assets.water, 'repeat');
    }
    if (assets.rock.complete) {
        mountain.pattern = ctx.createPattern(assets.rock, 'repeat');
    }
}

function spawnTree() {
    let x, y, dist;
    do {
        x = Math.random() * config.worldSize.width;
        y = Math.random() * config.worldSize.height;
        
        // Don't spawn in lake (strictly)
        const distToLake = Math.hypot(x - lake.x, y - lake.y);
        if (distToLake < lake.radius + 40) continue; // 40 is tree radius

        const dx = x - bunny.x;
        const dy = y - bunny.y;
        dist = Math.sqrt(dx * dx + dy * dy);
    } while (dist < 100); 
    
    trees.push(new Tree(x, y));
}

function spawnPlant() {
    let x, y, distToLake;
    do {
        x = Math.random() * config.worldSize.width;
        y = Math.random() * config.worldSize.height;
        // Don't spawn in lake
        distToLake = Math.hypot(x - lake.x, y - lake.y);
    } while (distToLake < lake.radius + 15); // 15 is plant radius

    plants.push(new Plant(x, y));
}

function spawnPredator() {
    let x, y, dist;
    do {
        x = Math.random() * config.worldSize.width;
        y = Math.random() * config.worldSize.height;
        const dx = x - bunny.x;
        const dy = y - bunny.y;
        dist = Math.sqrt(dx * dx + dy * dy);
    } while (dist < 500);

    predators.push(new Predator(x, y));
}

function update() {
    if (!gameState.running) return;

    bunny.update(gameState.keys, trees);

    gameState.camera.x = bunny.x - canvas.width / 2;
    gameState.camera.y = bunny.y - canvas.height / 2;
    gameState.camera.x = Math.max(0, Math.min(gameState.camera.x, config.worldSize.width - canvas.width));
    gameState.camera.y = Math.max(0, Math.min(gameState.camera.y, config.worldSize.height - canvas.height));

    if (Math.random() < config.plantSpawnRate) {
        spawnPlant();
    }

    plants.forEach((plant, index) => {
        const dx = bunny.x - plant.x;
        const dy = bunny.y - plant.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < bunny.radius + plant.radius) {
            bunny.eat();
            plants.splice(index, 1);
        }
    });

    if (predators.length < config.maxPredators && Math.random() < config.predatorSpawnRate) {
        spawnPredator();
    }

    predators.forEach(predator => {
        predator.update(bunny, trees);
    });

    healthDisplay.innerText = Math.ceil(bunny.health);
    hungerDisplay.innerText = Math.floor(bunny.hunger);
    scoreDisplay.innerText = gameState.score;
}

function drawMinimap() {
    // 1. Clear minimap
    minimapCtx.fillStyle = '#2d3436';
    minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    
    const scale = minimapCanvas.width / config.worldSize.width; // Should be 200 / 4000 = 0.05
    
    // 2. Draw Terrain
    // Lake
    minimapCtx.fillStyle = '#2980b9';
    minimapCtx.beginPath();
    minimapCtx.arc(lake.x * scale, lake.y * scale, lake.radius * scale, 0, Math.PI * 2);
    minimapCtx.fill();
    
    // Mountain
    minimapCtx.fillStyle = '#636e72';
    minimapCtx.beginPath();
    minimapCtx.arc(mountain.x * scale, mountain.y * scale, mountain.radius * scale, 0, Math.PI * 2);
    minimapCtx.fill();

    // 3. Draw Bunny (Dot)
    minimapCtx.fillStyle = '#ffffff';
    minimapCtx.beginPath();
    minimapCtx.arc(bunny.x * scale, bunny.y * scale, 3, 0, Math.PI * 2);
    minimapCtx.fill();

    // 4. Draw Predators (Red Dots)
    minimapCtx.fillStyle = '#d63031';
    predators.forEach(p => {
        minimapCtx.beginPath();
        minimapCtx.arc(p.x * scale, p.y * scale, 2, 0, Math.PI * 2);
        minimapCtx.fill();
    });
    
    // 5. Draw Carrots (Optional, maybe small green dots?)
    minimapCtx.fillStyle = '#e67e22';
    plants.forEach(p => {
        minimapCtx.fillRect(p.x * scale, p.y * scale, 1, 1);
    });
}

function draw() {
    ctx.save();
    
    // 1. Draw Background (Grass)
    if (grassPattern) {
        ctx.fillStyle = grassPattern;
        ctx.translate(-gameState.camera.x, -gameState.camera.y);
        ctx.fillRect(gameState.camera.x, gameState.camera.y, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = config.canvasColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Draw Terrain Features (Lake, Mountain)
    // Mountain
    if (mountain.pattern) {
        ctx.fillStyle = mountain.pattern;
        ctx.beginPath();
        ctx.arc(mountain.x, mountain.y, mountain.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 20;
        ctx.stroke();
    }
    
    // Lake
    if (lake.pattern) {
        ctx.fillStyle = lake.pattern;
        ctx.beginPath();
        ctx.arc(lake.x, lake.y, lake.radius, 0, Math.PI * 2);
        ctx.fill();
        // Shoreline
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 10;
        ctx.stroke();
    }
    
    ctx.restore();
    
    // 3. Draw Entities
    plants.forEach(plant => plant.draw(ctx, gameState.camera));

    bunny.draw(ctx, gameState.camera);

    predators.forEach(predator => predator.draw(ctx, gameState.camera));
    
    trees.forEach(tree => tree.draw(ctx, gameState.camera));
    
    // 4. UI Elements
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 50, 104, 14);
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(12, 52, bunny.stamina, 10);

    // Safe Zone Overlay
    if (bunny.isBurrowed) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 100,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.95)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 30px Segoe UI';
        ctx.fillStyle = '#4cd137';
        ctx.textAlign = 'center';
        ctx.fillText('SAFE ZONE', canvas.width / 2, canvas.height / 2 + 150);
        ctx.font = '16px Segoe UI';
        ctx.fillStyle = '#dfe6e9';
        ctx.fillText('Recovering Health & Stamina...', canvas.width / 2, canvas.height / 2 + 180);
    }
    
    // Status Text for Terrain
    if (bunny.isSwimming) {
        ctx.font = 'bold 20px Segoe UI';
        ctx.fillStyle = '#74b9ff';
        ctx.textAlign = 'center';
        ctx.fillText('Swimming...', canvas.width / 2, canvas.height - 50);
    }
    if (bunny.isClimbing) {
        ctx.font = 'bold 20px Segoe UI';
        ctx.fillStyle = '#b2bec3';
        ctx.textAlign = 'center';
        ctx.fillText('Climbing...', canvas.width / 2, canvas.height - 50);
    }
    
    // 5. Draw Minimap
    drawMinimap();
}

function endGame() {
    gameState.running = false;
    gameOverScreen.classList.remove('hidden');
    const timeSurvived = (Date.now() - gameState.startTime) / 1000;
    daysSurvivedDisplay.innerText = (timeSurvived / 60).toFixed(1) + " minutes";
}

function gameLoop() {
    update();
    draw();
    if (gameState.running) {
        requestAnimationFrame(gameLoop);
    }
}

init();
