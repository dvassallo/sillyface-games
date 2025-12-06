// Stick Fight Arena - Game Logic

const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Game state
let gameState = 'menu';
let selectedColor = null;
let selectedName = null;
let player = null;
let enemy = null;
let keys = {};
let lastTime = 0;
let groundY = 0;
let platforms = [];
let waterArea = null;
let waterTime = 0;
let cameraY = 0;
let targetCameraY = 0;
let currentLevel = 1;
const MAX_LEVEL = 10;
let lasers = [];

// Laser class
class Laser {
    constructor(x1, y1, x2, y2, color = '#FF0000') {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.isActive = true;
        this.timer = Math.random() * 3000; // Random start offset
        this.onDuration = 2000 + Math.random() * 1500; // How long it stays on
        this.offDuration = 1000 + Math.random() * 1000; // How long it stays off
        this.warningTime = 500; // Warning flash before turning on
        this.isWarning = false;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.thickness = 6;
    }

    update(dt) {
        this.timer += dt * 1000;
        
        if (this.isActive) {
            if (this.timer >= this.onDuration) {
                this.isActive = false;
                this.timer = 0;
            }
        } else {
            // Check if warning should start
            if (this.timer >= this.offDuration - this.warningTime) {
                this.isWarning = true;
            }
            
            if (this.timer >= this.offDuration) {
                this.isActive = true;
                this.isWarning = false;
                this.timer = 0;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        const pulse = Math.sin(Date.now() * 0.01 + this.pulseOffset) * 0.3 + 0.7;
        
        if (this.isActive) {
            // Main laser beam
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.thickness;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20 * pulse;
            ctx.globalAlpha = 0.9;
            
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();
            
            // Inner bright core
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.8 * pulse;
            
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();
            
            // Glow particles along the beam
            const length = Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
            const particleCount = Math.floor(length / 40);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.globalAlpha = 0.6;
            
            for (let i = 0; i < particleCount; i++) {
                const t = (i / particleCount + (Date.now() * 0.001) % 1) % 1;
                const px = this.x1 + (this.x2 - this.x1) * t;
                const py = this.y1 + (this.y2 - this.y1) * t;
                const size = 3 + Math.sin(t * 10 + Date.now() * 0.005) * 2;
                
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (this.isWarning) {
            // Warning state - flashing dim beam
            const flash = Math.sin(Date.now() * 0.02) > 0;
            if (flash) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.3;
                ctx.setLineDash([10, 10]);
                
                ctx.beginPath();
                ctx.moveTo(this.x1, this.y1);
                ctx.lineTo(this.x2, this.y2);
                ctx.stroke();
            }
        }
        
        // Draw emitter points
        this.drawEmitter(ctx, this.x1, this.y1);
        this.drawEmitter(ctx, this.x2, this.y2);
        
        ctx.restore();
    }

    drawEmitter(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.strokeStyle = this.isActive ? this.color : '#666';
        ctx.lineWidth = 2;
        ctx.shadowColor = this.isActive ? this.color : 'transparent';
        ctx.shadowBlur = this.isActive ? 10 : 0;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner light
        if (this.isActive || this.isWarning) {
            ctx.fillStyle = this.isActive ? this.color : 'rgba(255, 100, 100, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    checkCollision(figure) {
        if (!this.isActive) return false;
        
        // Get figure center
        const fx = figure.x + figure.width / 2;
        const fy = figure.y + figure.height / 2;
        
        // Calculate distance from point to line segment
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const lengthSq = dx * dx + dy * dy;
        
        let t = Math.max(0, Math.min(1, ((fx - this.x1) * dx + (fy - this.y1) * dy) / lengthSq));
        
        const nearestX = this.x1 + t * dx;
        const nearestY = this.y1 + t * dy;
        
        const distSq = (fx - nearestX) ** 2 + (fy - nearestY) ** 2;
        const hitRadius = 25; // How close to get hit
        
        return distSq < hitRadius * hitRadius;
    }
}

// Level difficulty settings
function getLevelSettings(level) {
    return {
        enemyHealth: 5 + Math.floor(level / 2), // 5, 5, 6, 6, 7, 7, 8, 8, 9, 9
        enemySpeed: 1 + (level - 1) * 0.12, // Gets faster each level
        enemyAggression: 0.5 + (level - 1) * 0.05, // More aggressive
        enemyReaction: Math.max(100, 250 - (level - 1) * 15), // Faster reactions
        enemyJumpChance: 0.1 + (level - 1) * 0.02, // Jumps more
        enemyDodgeChance: 0.3 + (level - 1) * 0.05, // Dodges more
        levelName: getLevelName(level)
    };
}

function getLevelName(level) {
    const names = [
        "Training Grounds",
        "The Pit",
        "Sky Arena",
        "Neon District",
        "Thunder Dome",
        "Shadow Realm",
        "Inferno Ring",
        "Frost Peak",
        "Void Chamber",
        "FINAL BOSS"
    ];
    return names[level - 1] || `Level ${level}`;
}

// Constants
const GRAVITY = 0.7;
const JUMP_FORCE = -22;
const MOVE_SPEED = 7;
const PUNCH_DURATION = 300;
const PUNCH_COOLDOWN = 500;
const PUNCH_RANGE = 80;
const KNOCKBACK = 15;
const WATER_SLOW = 0.5;
const WATER_DAMAGE_INTERVAL = 2000;

// Enemy colors (will exclude player's choice)
const ALL_COLORS = [
    { color: '#FF3366', name: 'Crimson' },
    { color: '#00D4FF', name: 'Azure' },
    { color: '#39FF14', name: 'Neon' },
    { color: '#FFD700', name: 'Gold' },
    { color: '#FF00FF', name: 'Magenta' }
];

// Platform class
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal', 'high', 'floating'
    }

    draw(ctx) {
        ctx.save();
        
        // Platform base color based on type
        let baseColor, topColor, glowColor;
        switch(this.type) {
            case 'high':
                baseColor = '#2a1a3a';
                topColor = '#8B5CF6';
                glowColor = 'rgba(139, 92, 246, 0.3)';
                break;
            case 'floating':
                baseColor = '#1a2a3a';
                topColor = '#06B6D4';
                glowColor = 'rgba(6, 182, 212, 0.3)';
                break;
            default:
                baseColor = '#252535';
                topColor = '#4a4a5a';
                glowColor = 'rgba(100, 100, 120, 0.2)';
        }
        
        // Glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        
        // Platform body
        ctx.fillStyle = baseColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Platform top edge (glowing line)
        ctx.shadowBlur = 10;
        ctx.strokeStyle = topColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.stroke();
        
        // Side edges
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.moveTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.stroke();
        
        // Surface detail lines
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = topColor;
        ctx.lineWidth = 1;
        for (let i = 10; i < this.width - 10; i += 30) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y + 8);
            ctx.lineTo(this.x + i + 15, this.y + 8);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Water area class
class Water {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.waveOffset = 0;
        this.bubbles = [];
        
        // Create initial bubbles
        for (let i = 0; i < 8; i++) {
            this.bubbles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                size: 3 + Math.random() * 5,
                speed: 0.5 + Math.random() * 1
            });
        }
    }

    update(dt) {
        this.waveOffset += dt * 2;
        
        // Update bubbles
        this.bubbles.forEach(bubble => {
            bubble.y -= bubble.speed;
            bubble.x += Math.sin(bubble.y * 0.05) * 0.5;
            
            // Reset bubble when it reaches the top
            if (bubble.y < this.y) {
                bubble.y = this.y + this.height;
                bubble.x = this.x + Math.random() * this.width;
            }
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Water body gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(0, 150, 200, 0.6)');
        gradient.addColorStop(0.5, 'rgba(0, 100, 180, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 50, 120, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Wavy surface
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for (let x = 0; x <= this.width; x += 10) {
            const waveY = Math.sin((x + this.waveOffset * 50) * 0.05) * 4;
            ctx.lineTo(this.x + x, this.y + waveY);
        }
        ctx.stroke();
        
        // Lighter wave
        ctx.strokeStyle = 'rgba(200, 240, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 5);
        for (let x = 0; x <= this.width; x += 10) {
            const waveY = Math.sin((x + this.waveOffset * 50 + 50) * 0.05) * 3;
            ctx.lineTo(this.x + x, this.y + 5 + waveY);
        }
        ctx.stroke();
        
        // Draw bubbles
        ctx.fillStyle = 'rgba(200, 240, 255, 0.4)';
        this.bubbles.forEach(bubble => {
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Caustic light effect at bottom
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 5; i++) {
            const x = this.x + (i * this.width / 5) + Math.sin(this.waveOffset + i) * 20;
            ctx.fillStyle = 'rgba(150, 220, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x, this.y + this.height - 10, 30, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Danger indicator
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 12px Russo One, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ DANGER', this.x + this.width / 2, this.y - 8);
        
        ctx.restore();
    }

    contains(x, y, width, height) {
        return x + width > this.x && x < this.x + this.width &&
               y + height > this.y && y < this.y + this.height;
    }
}

// Stick Figure class
class StickFigure {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;
        this.vx = 0;
        this.vy = 0;
        this.width = 60;
        this.height = 100;
        this.health = 5;
        this.isJumping = false;
        this.isPunching = false;
        this.punchTime = 0;
        this.lastPunchTime = 0;
        this.facingRight = isPlayer ? true : false;
        this.hitCooldown = 0;
        this.walkCycle = 0;
        this.isHit = false;
        this.hitTime = 0;
        this.inWater = false;
        this.waterDamageTimer = 0;
    }

    punch() {
        const now = Date.now();
        if (now - this.lastPunchTime > PUNCH_COOLDOWN) {
            this.isPunching = true;
            this.punchTime = now;
            this.lastPunchTime = now;
            // Trigger punch flash
            triggerPunchFlash(this.color);
        }
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.inWater ? JUMP_FORCE * 0.7 : JUMP_FORCE;
            this.isJumping = true;
        }
    }

    takeDamage(fromRight) {
        if (this.hitCooldown <= 0) {
            this.health--;
            this.hitCooldown = 500;
            this.isHit = true;
            this.hitTime = Date.now();
            // Knockback
            this.vx = fromRight ? -KNOCKBACK : KNOCKBACK;
            this.vy = -8;
            this.isJumping = true;
            updateHearts();
            // Trigger hit flash
            triggerHitFlash();
        }
    }

    update(dt) {
        const now = Date.now();
        
        // Update punch state
        if (this.isPunching && now - this.punchTime > PUNCH_DURATION) {
            this.isPunching = false;
        }
        
        // Update hit state
        if (this.isHit && now - this.hitTime > 200) {
            this.isHit = false;
        }
        
        // Decrease hit cooldown
        if (this.hitCooldown > 0) {
            this.hitCooldown -= dt * 1000;
        }
        
        // Check if in water
        this.inWater = waterArea && waterArea.contains(this.x, this.y, this.width, this.height);
        
        // Water effects
        if (this.inWater) {
            // Slow movement in water
            this.vx *= WATER_SLOW;
            this.vy *= 0.8; // Slower falling in water
            
            // Water damage over time
            this.waterDamageTimer += dt * 1000;
            if (this.waterDamageTimer >= WATER_DAMAGE_INTERVAL) {
                this.waterDamageTimer = 0;
                if (this.hitCooldown <= 0) {
                    this.health--;
                    this.isHit = true;
                    this.hitTime = Date.now();
                    this.hitCooldown = 200;
                    updateHearts();
                }
            }
        } else {
            this.waterDamageTimer = 0;
        }
        
        // Apply gravity (reduced in water)
        this.vy += this.inWater ? GRAVITY * 0.3 : GRAVITY;
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Friction
        this.vx *= this.inWater ? 0.9 : 0.85;
        
        // Platform collision
        let onPlatform = false;
        for (const platform of platforms) {
            // Only check collision if falling
            if (this.vy >= 0) {
                const feetY = this.y + this.height;
                const prevFeetY = feetY - this.vy;
                
                // Check if feet are crossing the platform top
                if (prevFeetY <= platform.y && feetY >= platform.y) {
                    // Check horizontal overlap
                    if (this.x + this.width > platform.x + 10 && this.x < platform.x + platform.width - 10) {
                        this.y = platform.y - this.height;
                        this.vy = 0;
                        this.isJumping = false;
                        onPlatform = true;
                        break;
                    }
                }
            }
        }
        
        // Ground collision
        if (this.y >= groundY - this.height) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.isJumping = false;
        }
        
        // Wall collision
        if (this.x < 30) {
            this.x = 30;
            this.vx = 0;
        }
        if (this.x > canvas.width - 30 - this.width) {
            this.x = canvas.width - 30 - this.width;
            this.vx = 0;
        }
        
        // Update walk cycle
        if (Math.abs(this.vx) > 0.5 && !this.isJumping) {
            this.walkCycle += dt * 10;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y);
        
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }
        
        const lineWidth = 6;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Flash white when hit, blue tint in water
        let drawColor = this.color;
        if (this.isHit) {
            drawColor = '#FFFFFF';
        } else if (this.inWater) {
            drawColor = this.blendWithWater(this.color);
        }
        
        ctx.strokeStyle = drawColor;
        ctx.fillStyle = drawColor;
        
        // Walking animation
        const walkOffset = Math.sin(this.walkCycle) * 5;
        const legOffset = this.isJumping ? 10 : walkOffset;
        
        // Head
        ctx.beginPath();
        ctx.arc(0, 15, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 65);
        ctx.stroke();
        
        // Arms
        if (this.isPunching) {
            // Punching arm extended
            ctx.beginPath();
            ctx.moveTo(0, 40);
            ctx.lineTo(35, 35);
            ctx.stroke();
            
            // Draw fist
            ctx.beginPath();
            ctx.arc(40, 35, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Other arm back
            ctx.beginPath();
            ctx.moveTo(0, 40);
            ctx.lineTo(-20, 55);
            ctx.stroke();
        } else {
            // Normal arms
            ctx.beginPath();
            ctx.moveTo(0, 40);
            ctx.lineTo(-20, 55 + legOffset * 0.3);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, 40);
            ctx.lineTo(20, 55 - legOffset * 0.3);
            ctx.stroke();
        }
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(0, 65);
        ctx.lineTo(-15 - legOffset, 95);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 65);
        ctx.lineTo(15 + legOffset, 95);
        ctx.stroke();
        
        ctx.restore();
        
        // Draw punch effect
        if (this.isPunching) {
            const punchProgress = (Date.now() - this.punchTime) / PUNCH_DURATION;
            if (punchProgress < 0.5) {
                ctx.save();
                const effectX = this.facingRight ? this.x + this.width + 20 : this.x - 40;
                ctx.globalAlpha = 1 - punchProgress * 2;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                
                // Impact lines
                for (let i = 0; i < 5; i++) {
                    const angle = (this.facingRight ? 0 : Math.PI) + (Math.random() - 0.5) * 0.8;
                    const len = 15 + Math.random() * 20;
                    ctx.beginPath();
                    ctx.moveTo(effectX, this.y + 35);
                    ctx.lineTo(effectX + Math.cos(angle) * len, this.y + 35 + Math.sin(angle) * len);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
        
        // Water splash effect when in water
        if (this.inWater && Math.abs(this.vx) > 1) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'rgba(150, 220, 255, 0.6)';
            for (let i = 0; i < 3; i++) {
                const splashX = this.x + this.width / 2 + (Math.random() - 0.5) * 30;
                const splashY = waterArea.y + Math.random() * 10;
                ctx.beginPath();
                ctx.arc(splashX, splashY, 3 + Math.random() * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    blendWithWater(color) {
        // Simple color blending with blue for water effect
        return color; // Keep original but the water will overlay
    }

    getPunchHitbox() {
        if (!this.isPunching) return null;
        const centerX = this.x + this.width / 2;
        return {
            x: this.facingRight ? centerX : centerX - PUNCH_RANGE,
            y: this.y + 25,
            width: PUNCH_RANGE,
            height: 30
        };
    }
}

// AI Controller
class AIController {
    constructor(figure, level = 1) {
        this.figure = figure;
        this.decisionTimer = 0;
        this.currentAction = 'idle';
        this.actionDuration = 0;
        this.targetPlatform = null;
        this.jumpCooldown = 0;
        this.level = level;
        this.settings = getLevelSettings(level);
    }

    findNearestPlatformAbove() {
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const platform of platforms) {
            // Platform must be above current position
            if (platform.y < this.figure.y) {
                const dx = (platform.x + platform.width / 2) - (this.figure.x + this.figure.width / 2);
                const dy = this.figure.y - platform.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Check if reachable (within jump range)
                if (dy < 200 && Math.abs(dx) < 200 && dist < nearestDist) {
                    nearest = platform;
                    nearestDist = dist;
                }
            }
        }
        return nearest;
    }

    update(dt, target) {
        this.decisionTimer -= dt * 1000;
        this.actionDuration -= dt * 1000;
        this.jumpCooldown -= dt * 1000;
        
        const dx = target.x - this.figure.x;
        const dy = target.y - this.figure.y;
        const distance = Math.abs(dx);
        const speedMult = this.settings.enemySpeed;
        
        // Face the player
        this.figure.facingRight = dx > 0;
        
        // Avoid water
        if (waterArea && waterArea.contains(this.figure.x, this.figure.y + 50, this.figure.width, this.figure.height)) {
            this.figure.jump();
            this.figure.vx += dx > 0 ? MOVE_SPEED * 0.5 * speedMult : -MOVE_SPEED * 0.5 * speedMult;
            return;
        }
        
        // Make decisions (faster reactions at higher levels)
        if (this.decisionTimer <= 0) {
            this.decisionTimer = this.settings.enemyReaction + Math.random() * 150;
            
            if (distance < PUNCH_RANGE + 30 && Math.abs(dy) < 60) {
                // In range - attack or dodge
                if (Math.random() < this.settings.enemyAggression + 0.15) {
                    this.currentAction = 'attack';
                } else if (target.isPunching && Math.random() < this.settings.enemyDodgeChance + 0.3) {
                    this.currentAction = 'dodge';
                    this.actionDuration = 300;
                }
            } else if (dy < -80) {
                // Player is above - try to get to them
                this.currentAction = 'chase_up';
            } else if (distance < 250) {
                // Approach horizontally
                this.currentAction = Math.random() < 0.75 ? 'approach' : 'idle';
            } else {
                // Far away - approach
                this.currentAction = 'approach';
            }
        }
        
        // Execute action
        switch (this.currentAction) {
            case 'approach':
                if (dx > 0) {
                    this.figure.vx += MOVE_SPEED * 0.45 * speedMult;
                } else {
                    this.figure.vx -= MOVE_SPEED * 0.45 * speedMult;
                }
                // Random jumping while approaching (more at higher levels)
                if (Math.random() < this.settings.enemyJumpChance * 0.3 && this.jumpCooldown <= 0) {
                    this.figure.jump();
                    this.jumpCooldown = 500;
                }
                break;
                
            case 'chase_up':
                // Move toward player horizontally
                if (dx > 0) {
                    this.figure.vx += MOVE_SPEED * 0.4 * speedMult;
                } else {
                    this.figure.vx -= MOVE_SPEED * 0.4 * speedMult;
                }
                // Jump frequently to reach higher platforms
                if (this.jumpCooldown <= 0 && Math.random() < this.settings.enemyJumpChance + 0.05) {
                    this.figure.jump();
                    this.jumpCooldown = 400;
                }
                // Find platform to jump to
                if (!this.figure.isJumping && this.jumpCooldown <= 0) {
                    const platform = this.findNearestPlatformAbove();
                    if (platform) {
                        // Move toward platform
                        const platformCenterX = platform.x + platform.width / 2;
                        const figCenterX = this.figure.x + this.figure.width / 2;
                        if (Math.abs(platformCenterX - figCenterX) < 80) {
                            this.figure.jump();
                            this.jumpCooldown = 300;
                        }
                    }
                }
                break;
                
            case 'attack':
                this.figure.punch();
                this.currentAction = 'idle';
                break;
                
            case 'dodge':
                if (this.actionDuration > 0) {
                    // Jump away
                    if (!this.figure.isJumping && this.jumpCooldown <= 0) {
                        this.figure.jump();
                        this.jumpCooldown = 400;
                    }
                    this.figure.vx += dx > 0 ? -MOVE_SPEED * 0.5 * speedMult : MOVE_SPEED * 0.5 * speedMult;
                } else {
                    this.currentAction = 'idle';
                }
                break;
        }
    }
}

// Create platforms based on canvas size
function createPlatforms() {
    platforms = [];
    
    const w = canvas.width;
    const h = canvas.height;
    
    // === LEVEL 1 - Ground level platforms ===
    platforms.push(new Platform(50, groundY - 100, 130, 18, 'normal'));
    platforms.push(new Platform(w - 180, groundY - 100, 130, 18, 'normal'));
    
    // === LEVEL 2 - Low platforms ===
    platforms.push(new Platform(220, groundY - 180, 120, 18, 'normal'));
    platforms.push(new Platform(w - 340, groundY - 180, 120, 18, 'normal'));
    platforms.push(new Platform(w / 2 - 70, groundY - 160, 140, 18, 'floating'));
    
    // === LEVEL 3 - Mid platforms ===
    platforms.push(new Platform(60, groundY - 280, 140, 18, 'floating'));
    platforms.push(new Platform(w - 200, groundY - 280, 140, 18, 'floating'));
    platforms.push(new Platform(w / 2 - 180, groundY - 260, 100, 18, 'normal'));
    platforms.push(new Platform(w / 2 + 80, groundY - 260, 100, 18, 'normal'));
    
    // === LEVEL 4 - Upper mid platforms ===
    platforms.push(new Platform(180, groundY - 360, 110, 18, 'floating'));
    platforms.push(new Platform(w - 290, groundY - 360, 110, 18, 'floating'));
    platforms.push(new Platform(w / 2 - 60, groundY - 340, 120, 18, 'high'));
    
    // === LEVEL 5 - High platforms ===
    platforms.push(new Platform(50, groundY - 450, 130, 18, 'high'));
    platforms.push(new Platform(w - 180, groundY - 450, 130, 18, 'high'));
    platforms.push(new Platform(w / 2 - 150, groundY - 430, 90, 18, 'floating'));
    platforms.push(new Platform(w / 2 + 60, groundY - 430, 90, 18, 'floating'));
    
    // === LEVEL 6 - Very high platforms ===
    platforms.push(new Platform(200, groundY - 530, 100, 18, 'high'));
    platforms.push(new Platform(w - 300, groundY - 530, 100, 18, 'high'));
    platforms.push(new Platform(w / 2 - 55, groundY - 510, 110, 18, 'high'));
    
    // === LEVEL 7 - Sky platforms ===
    platforms.push(new Platform(80, groundY - 610, 120, 18, 'high'));
    platforms.push(new Platform(w - 200, groundY - 610, 120, 18, 'high'));
    platforms.push(new Platform(w / 2 - 130, groundY - 590, 80, 18, 'floating'));
    platforms.push(new Platform(w / 2 + 50, groundY - 590, 80, 18, 'floating'));
    
    // === LEVEL 8 - Top tier platforms ===
    platforms.push(new Platform(180, groundY - 680, 100, 18, 'high'));
    platforms.push(new Platform(w - 280, groundY - 680, 100, 18, 'high'));
    platforms.push(new Platform(w / 2 - 50, groundY - 700, 100, 18, 'high'));
    
    // === THE PEAK - Ultimate platform ===
    platforms.push(new Platform(w / 2 - 60, groundY - 780, 120, 20, 'high'));
    
    // Small stepping stone platforms connecting levels
    platforms.push(new Platform(350, groundY - 220, 70, 15, 'normal'));
    platforms.push(new Platform(w - 420, groundY - 220, 70, 15, 'normal'));
    platforms.push(new Platform(320, groundY - 400, 70, 15, 'floating'));
    platforms.push(new Platform(w - 390, groundY - 400, 70, 15, 'floating'));
    platforms.push(new Platform(350, groundY - 560, 70, 15, 'high'));
    platforms.push(new Platform(w - 420, groundY - 560, 70, 15, 'high'));
    
    // Create water area in the middle-bottom
    const waterWidth = 180;
    const waterHeight = 50;
    waterArea = new Water(w / 2 - waterWidth / 2, groundY - waterHeight, waterWidth, waterHeight);
    
    // Create lasers around the arena
    createLasers();
}

// Create lasers based on canvas size and level
function createLasers() {
    lasers = [];
    
    const w = canvas.width;
    
    // Laser colors
    const laserColors = ['#FF0000', '#FF00FF', '#00FFFF', '#FF6600', '#FFFF00'];
    
    // Ground level horizontal lasers (on the sides)
    lasers.push(new Laser(30, groundY - 60, 180, groundY - 60, laserColors[0]));
    lasers.push(new Laser(w - 180, groundY - 60, w - 30, groundY - 60, laserColors[0]));
    
    // Vertical lasers on platforms
    lasers.push(new Laser(w / 2 - 250, groundY - 150, w / 2 - 250, groundY - 350, laserColors[1]));
    lasers.push(new Laser(w / 2 + 250, groundY - 150, w / 2 + 250, groundY - 350, laserColors[1]));
    
    // Mid-height horizontal lasers
    lasers.push(new Laser(100, groundY - 400, 300, groundY - 400, laserColors[2]));
    lasers.push(new Laser(w - 300, groundY - 400, w - 100, groundY - 400, laserColors[2]));
    
    // Diagonal lasers in upper area
    lasers.push(new Laser(50, groundY - 500, 200, groundY - 600, laserColors[3]));
    lasers.push(new Laser(w - 200, groundY - 600, w - 50, groundY - 500, laserColors[3]));
    
    // High horizontal lasers
    lasers.push(new Laser(w / 2 - 150, groundY - 550, w / 2 + 150, groundY - 550, laserColors[4]));
    
    // Very high crisscross lasers
    lasers.push(new Laser(150, groundY - 650, 350, groundY - 750, laserColors[0]));
    lasers.push(new Laser(w - 350, groundY - 750, w - 150, groundY - 650, laserColors[0]));
    
    // Top area horizontal laser
    lasers.push(new Laser(w / 2 - 200, groundY - 720, w / 2 + 200, groundY - 720, laserColors[2]));
    
    // More lasers at higher levels
    if (currentLevel >= 3) {
        lasers.push(new Laser(w / 2, groundY - 200, w / 2, groundY - 320, laserColors[1]));
    }
    
    if (currentLevel >= 5) {
        lasers.push(new Laser(250, groundY - 300, 250, groundY - 450, laserColors[3]));
        lasers.push(new Laser(w - 250, groundY - 300, w - 250, groundY - 450, laserColors[3]));
    }
    
    if (currentLevel >= 7) {
        lasers.push(new Laser(w / 2 - 100, groundY - 650, w / 2 + 100, groundY - 650, laserColors[4]));
    }
    
    // Stagger the laser timings so they're not all in sync
    lasers.forEach((laser, i) => {
        laser.timer = (i * 500) % (laser.onDuration + laser.offDuration);
        laser.isActive = laser.timer < laser.onDuration;
    });
}

// Initialize character previews
function initCharacterPreviews() {
    const characters = document.querySelectorAll('.character');
    
    characters.forEach(char => {
        const canvas = char.querySelector('.char-preview');
        const ctx = canvas.getContext('2d');
        const color = char.dataset.color;
        
        // Draw preview stick figure
        drawPreviewFigure(ctx, color);
        
        // Click handler
        char.addEventListener('click', () => {
            characters.forEach(c => c.classList.remove('selected'));
            char.classList.add('selected');
            selectedColor = color;
            selectedName = char.dataset.name;
            
            const startBtn = document.getElementById('start-btn');
            startBtn.disabled = false;
            startBtn.textContent = 'FIGHT!';
        });
    });
}

function drawPreviewFigure(ctx, color) {
    ctx.clearRect(0, 0, 80, 120);
    ctx.save();
    ctx.translate(40, 10);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Head
    ctx.beginPath();
    ctx.arc(0, 12, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(0, 55);
    ctx.stroke();
    
    // Arms
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(-18, 48);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(18, 48);
    ctx.stroke();
    
    // Legs
    ctx.beginPath();
    ctx.moveTo(0, 55);
    ctx.lineTo(-15, 85);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 55);
    ctx.lineTo(15, 85);
    ctx.stroke();
    
    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Update hearts display
function updateHearts() {
    const playerHearts = document.getElementById('player-hearts');
    const enemyHearts = document.getElementById('enemy-hearts');
    
    if (!playerHearts || !enemyHearts || !player || !enemy) return;
    
    const enemyMaxHealth = enemy.maxHealth || 5;
    
    // Player hearts (always 5)
    playerHearts.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart' + (i >= player.health ? ' lost' : '');
        playerHearts.appendChild(heart);
    }
    
    // Enemy hearts (variable based on level)
    enemyHearts.innerHTML = '';
    for (let i = 0; i < enemyMaxHealth; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart' + (i >= enemy.health ? ' lost' : '');
        enemyHearts.appendChild(heart);
    }
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Start game
function startGame(resetLevel = true) {
    gameState = 'playing';
    showScreen('game-screen');
    
    // Reset level if coming from menu
    if (resetLevel) {
        currentLevel = 1;
    }
    
    const levelSettings = getLevelSettings(currentLevel);
    
    // Setup canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    groundY = canvas.height - 50;
    
    // Reset camera
    cameraY = 0;
    targetCameraY = 0;
    
    // Create platforms and water
    createPlatforms();
    
    // Create player (full health each level)
    player = new StickFigure(150, groundY - 100, selectedColor, true);
    
    // Choose random enemy color (different from player)
    const enemyColors = ALL_COLORS.filter(c => c.color !== selectedColor);
    const enemyData = enemyColors[Math.floor(Math.random() * enemyColors.length)];
    
    // Create enemy with level-based health
    enemy = new StickFigure(canvas.width - 250, groundY - 100, enemyData.color, false);
    enemy.facingRight = false;
    enemy.health = levelSettings.enemyHealth;
    enemy.maxHealth = levelSettings.enemyHealth;
    
    // Create AI with level difficulty
    enemy.ai = new AIController(enemy, currentLevel);
    
    // Initialize hearts
    updateHearts();
    
    // Update level display
    updateLevelDisplay();
    
    // Start game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Start next level
function startNextLevel() {
    currentLevel++;
    startGame(false);
}

// Update level display in HUD
function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
        const settings = getLevelSettings(currentLevel);
        levelDisplay.innerHTML = `<span class="level-num">LVL ${currentLevel}</span><span class="level-name">${settings.levelName}</span>`;
    }
}

// Game loop
function gameLoop(timestamp) {
    if (gameState !== 'playing') return;
    
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(dt) {
    // Player input
    if (keys['ArrowLeft']) {
        player.vx -= MOVE_SPEED * 0.5;
        player.facingRight = false;
    }
    if (keys['ArrowRight']) {
        player.vx += MOVE_SPEED * 0.5;
        player.facingRight = true;
    }
    
    // Update water animation
    if (waterArea) {
        waterArea.update(dt);
    }
    
    // Update player
    player.update(dt);
    
    // Update enemy AI
    enemy.ai.update(dt, player);
    enemy.update(dt);
    
    // Update camera to follow players (focus on the higher one or average)
    const highestY = Math.min(player.y, enemy.y);
    const avgY = (player.y + enemy.y) / 2;
    const focusY = Math.min(highestY, avgY);
    
    // Camera target - keep action in view
    const screenCenter = canvas.height / 2;
    targetCameraY = Math.min(0, screenCenter - focusY - 150);
    targetCameraY = Math.max(targetCameraY, -(groundY - canvas.height + 100));
    
    // Smooth camera movement
    cameraY += (targetCameraY - cameraY) * 0.08;
    
    // Update lasers and check collisions
    for (const laser of lasers) {
        laser.update(dt);
        
        // Check laser collision with player
        if (laser.checkCollision(player)) {
            if (player.hitCooldown <= 0) {
                player.health--;
                player.hitCooldown = 800;
                player.isHit = true;
                player.hitTime = Date.now();
                updateHearts();
                triggerFlash(laser.color + '80', 150);
            }
        }
        
        // Check laser collision with enemy
        if (laser.checkCollision(enemy)) {
            if (enemy.hitCooldown <= 0) {
                enemy.health--;
                enemy.hitCooldown = 800;
                enemy.isHit = true;
                enemy.hitTime = Date.now();
                updateHearts();
                triggerFlash(laser.color + '80', 150);
            }
        }
    }
    
    // Check punch collisions
    checkPunchCollision(player, enemy);
    checkPunchCollision(enemy, player);
    
    // Random ambient flashes
    triggerRandomFlash();
    
    // Check for game over
    if (player.health <= 0) {
        endGame(false);
    } else if (enemy.health <= 0) {
        endGame(true);
    }
}

// Check punch collision
function checkPunchCollision(attacker, target) {
    const hitbox = attacker.getPunchHitbox();
    if (!hitbox) return;
    
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;
    
    if (targetCenterX > hitbox.x && targetCenterX < hitbox.x + hitbox.width &&
        targetCenterY > hitbox.y && targetCenterY < hitbox.y + hitbox.height) {
        target.takeDamage(attacker.x < target.x);
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (fixed)
    drawBackground();
    
    // Apply camera transform
    ctx.save();
    ctx.translate(0, cameraY);
    
    // Draw platforms
    for (const platform of platforms) {
        platform.draw(ctx);
    }
    
    // Draw lasers (behind fighters)
    for (const laser of lasers) {
        laser.draw(ctx);
    }
    
    // Draw water (behind fighters)
    if (waterArea) {
        waterArea.draw(ctx);
    }
    
    // Draw ground
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY + Math.abs(cameraY) + 100);
    
    // Ground line
    ctx.strokeStyle = '#333345';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    
    // Draw fighters
    player.draw(ctx);
    enemy.draw(ctx);
    
    // Draw height indicator on the side
    drawHeightIndicator();
    
    // Restore camera transform
    ctx.restore();
    
    // Draw fixed UI elements (height meter on screen)
    drawHeightMeter();
}

// Draw arena background
function drawBackground() {
    // Gradient atmosphere - extends for tall arena
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0510');
    gradient.addColorStop(0.3, '#0f0a1a');
    gradient.addColorStop(0.7, '#151025');
    gradient.addColorStop(1, '#0a0a15');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars in the background (for high areas)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 53) % (canvas.height * 0.7);
        const size = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    
    // Arena lights
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    // Left spotlight
    const leftGrad = ctx.createRadialGradient(100, canvas.height / 2, 0, 100, canvas.height / 2, 400);
    leftGrad.addColorStop(0, player.color);
    leftGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 500, canvas.height);
    
    // Right spotlight
    const rightGrad = ctx.createRadialGradient(canvas.width - 100, canvas.height / 2, 0, canvas.width - 100, canvas.height / 2, 400);
    rightGrad.addColorStop(0, enemy.color);
    rightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(canvas.width - 500, 0, 500, canvas.height);
    
    ctx.restore();
}

// Draw height indicator lines in the arena
function drawHeightIndicator() {
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 10]);
    
    // Horizontal guide lines every 150 pixels
    for (let y = groundY - 150; y > groundY - 900; y -= 150) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width - 30, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw height meter on screen (fixed position)
function drawHeightMeter() {
    const meterX = 25;
    const meterY = 100;
    const meterHeight = canvas.height - 200;
    const maxHeight = 800; // Max arena height
    
    ctx.save();
    
    // Meter background
    ctx.fillStyle = 'rgba(30, 30, 50, 0.7)';
    ctx.fillRect(meterX - 5, meterY - 10, 20, meterHeight + 20);
    
    // Meter border
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX - 5, meterY - 10, 20, meterHeight + 20);
    
    // Calculate positions
    const playerHeight = Math.max(0, groundY - player.y - player.height);
    const enemyHeight = Math.max(0, groundY - enemy.y - enemy.height);
    
    const playerMeterY = meterY + meterHeight - (playerHeight / maxHeight) * meterHeight;
    const enemyMeterY = meterY + meterHeight - (enemyHeight / maxHeight) * meterHeight;
    
    // Draw ground level
    ctx.fillStyle = '#333';
    ctx.fillRect(meterX - 3, meterY + meterHeight - 5, 16, 5);
    
    // Draw level markers
    ctx.fillStyle = 'rgba(150, 150, 180, 0.5)';
    ctx.font = '8px sans-serif';
    for (let i = 0; i <= 8; i++) {
        const y = meterY + meterHeight - (i * meterHeight / 8);
        ctx.fillRect(meterX + 8, y, 5, 1);
    }
    
    // Player indicator
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(meterX + 5, Math.max(meterY, Math.min(meterY + meterHeight, playerMeterY)), 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy indicator
    ctx.fillStyle = enemy.color;
    ctx.shadowColor = enemy.color;
    ctx.beginPath();
    ctx.arc(meterX + 5, Math.max(meterY, Math.min(meterY + meterHeight, enemyMeterY)), 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(150, 150, 180, 0.8)';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEIGHT', meterX + 5, meterY - 20);
    
    ctx.restore();
}

// End game
function endGame(playerWon) {
    gameState = 'gameover';
    
    const title = document.getElementById('gameover-title');
    const message = document.getElementById('gameover-message');
    const restartBtn = document.getElementById('restart-btn');
    const nextLevelBtn = document.getElementById('next-level-btn');
    
    if (playerWon) {
        if (currentLevel >= MAX_LEVEL) {
            // Beat the game!
            title.textContent = '🏆 CHAMPION! 🏆';
            title.className = 'victory champion';
            message.textContent = 'You defeated all 10 levels! You are the ultimate stick fighter!';
            if (nextLevelBtn) nextLevelBtn.style.display = 'none';
            if (restartBtn) restartBtn.textContent = 'PLAY AGAIN';
        } else {
            title.textContent = 'VICTORY!';
            title.className = 'victory';
            message.textContent = `Level ${currentLevel} complete! Get ready for Level ${currentLevel + 1}!`;
            if (nextLevelBtn) nextLevelBtn.style.display = 'block';
            if (restartBtn) restartBtn.textContent = 'RESTART LEVEL';
        }
    } else {
        title.textContent = 'GAME OVER';
        title.className = 'defeat';
        message.textContent = `Defeated on Level ${currentLevel}: ${getLevelSettings(currentLevel).levelName}`;
        if (nextLevelBtn) nextLevelBtn.style.display = 'none';
        if (restartBtn) restartBtn.textContent = 'TRY AGAIN';
    }
    
    showScreen('gameover-screen');
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (gameState === 'playing') {
        if (e.code === 'Space') {
            e.preventDefault();
            player.jump();
        }
        if (e.code === 'KeyM') {
            player.punch();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Button handlers
document.getElementById('accept-warning-btn')?.addEventListener('click', () => {
    showScreen('menu-screen');
});

document.getElementById('start-btn')?.addEventListener('click', () => startGame(true));

document.getElementById('restart-btn')?.addEventListener('click', () => {
    startGame(false); // Restart same level
});

document.getElementById('next-level-btn')?.addEventListener('click', () => {
    startNextLevel();
});

document.getElementById('menu-btn')?.addEventListener('click', () => {
    gameState = 'menu';
    currentLevel = 1;
    showScreen('menu-screen');
});

// Flash effect system
let flashTimeout = null;
let lastFlashTime = 0;
const FLASH_COLORS = [
    'rgba(255, 51, 102, 0.4)',
    'rgba(0, 212, 255, 0.4)',
    'rgba(57, 255, 20, 0.4)',
    'rgba(255, 215, 0, 0.4)',
    'rgba(255, 0, 255, 0.4)',
    'rgba(255, 255, 255, 0.5)'
];

function triggerFlash(color = null, duration = 100) {
    const overlay = document.getElementById('flash-overlay');
    if (!overlay) return;
    
    const flashColor = color || FLASH_COLORS[Math.floor(Math.random() * FLASH_COLORS.length)];
    overlay.style.background = flashColor;
    overlay.style.opacity = '1';
    
    if (flashTimeout) clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => {
        overlay.style.opacity = '0';
    }, duration);
}

function triggerPunchFlash(attackerColor) {
    triggerFlash(attackerColor.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('#', 'rgba('), 80);
}

function triggerHitFlash() {
    triggerFlash('rgba(255, 255, 255, 0.6)', 120);
}

function triggerRandomFlash() {
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    // Random flashes every 2-5 seconds
    if (now - lastFlashTime > 2000 + Math.random() * 3000) {
        lastFlashTime = now;
        
        // Random corner flash
        const overlay = document.getElementById('flash-overlay');
        if (overlay) {
            const side = Math.random();
            let gradient;
            const color = FLASH_COLORS[Math.floor(Math.random() * FLASH_COLORS.length)];
            
            if (side < 0.25) {
                gradient = `radial-gradient(circle at 0% 0%, ${color} 0%, transparent 50%)`;
            } else if (side < 0.5) {
                gradient = `radial-gradient(circle at 100% 0%, ${color} 0%, transparent 50%)`;
            } else if (side < 0.75) {
                gradient = `radial-gradient(circle at 0% 100%, ${color} 0%, transparent 50%)`;
            } else {
                gradient = `radial-gradient(circle at 100% 100%, ${color} 0%, transparent 50%)`;
            }
            
            overlay.style.background = gradient;
            overlay.style.opacity = '1';
            
            setTimeout(() => {
                overlay.style.opacity = '0';
            }, 150);
        }
    }
}

// Window resize
window.addEventListener('resize', () => {
    if (gameState === 'playing') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        groundY = canvas.height - 50;
        createPlatforms(); // Recreate platforms for new size
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCharacterPreviews();
});
