// ============================================
// CUBE RUN - A Block Platformer Game
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// BLOCK EDITOR
// ============================================

const pixelCanvas = document.getElementById('pixelCanvas');
const pixelCtx = pixelCanvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const previewCanvasLarge = document.getElementById('previewCanvasLarge');
const previewCtxLarge = previewCanvasLarge.getContext('2d');

const GRID_SIZE = 12; // 12x12 pixels per block
const PIXEL_SIZE = 32; // Display size of each pixel in editor

// Editor state
let currentColor = '#ff6b6b';
let currentTool = 'pencil';
let isDrawing = false;
let pixelData = createEmptyPixelData();
let customBlocks = loadCustomBlocks();
let editingBlockId = null; // Track which block is being edited

// Color palette
const PALETTE_COLORS = [
    // Row 1 - Reds/Pinks
    '#ff6b6b', '#ee5a5a', '#d63031', '#b71c1c', '#e84393', '#fd79a8', '#fab1a0', '#ffeaa7',
    // Row 2 - Oranges/Yellows
    '#f39c12', '#e67e22', '#d35400', '#fdcb6e', '#ffd93d', '#f1c40f', '#fff3a0', '#ffeaa7',
    // Row 3 - Greens
    '#00b894', '#2ecc71', '#27ae60', '#1abc9c', '#58d68d', '#82e0aa', '#abebc6', '#d5f5e3',
    // Row 4 - Blues/Cyans
    '#74b9ff', '#0984e3', '#2980b9', '#3498db', '#81ecec', '#00cec9', '#48dbfb', '#a29bfe',
    // Row 5 - Purples
    '#6c5ce7', '#a29bfe', '#9b59b6', '#8e44ad', '#e056fd', '#be2edd', '#fd79a8', '#f8a5c2',
    // Row 6 - Browns/Neutrals
    '#8B4513', '#a0522d', '#d68910', '#b7950b', '#7d5a50', '#9c640c', '#6b3510', '#4a3728',
    // Row 7 - Grays
    '#2d3436', '#636e72', '#7f8c8d', '#95a5a6', '#b2bec3', '#dfe6e9', '#f8f8f2', '#ffffff',
    // Row 8 - Dark
    '#1a1a2e', '#0a0a0f', '#2c3e50', '#34495e', '#4a5568', '#1e3799', '#0c2461', '#000000'
];

function createEmptyPixelData() {
    const data = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        data[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            data[y][x] = null; // null = transparent
        }
    }
    return data;
}

function loadCustomBlocks() {
    try {
        const saved = localStorage.getItem('cuberun_custom_blocks');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveCustomBlocks() {
    localStorage.setItem('cuberun_custom_blocks', JSON.stringify(customBlocks));
    updateBlockCount();
    renderSavedBlocks();
}

function updateBlockCount() {
    document.getElementById('blockCount').textContent = `(${customBlocks.length})`;
}

// Initialize color palette
function initColorPalette() {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';
    
    PALETTE_COLORS.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.background = color;
        colorDiv.addEventListener('click', () => selectColor(color));
        palette.appendChild(colorDiv);
    });
}

function selectColor(color) {
    currentColor = color;
    document.getElementById('colorPreview').style.background = color;
    document.getElementById('colorInput').value = color;
    
    // Update palette selection
    document.querySelectorAll('.palette-color').forEach(el => {
        el.classList.toggle('selected', el.style.background === color || rgbToHex(el.style.background) === color.toLowerCase());
    });
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb.toLowerCase();
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    const hex = (x) => ('0' + parseInt(x).toString(16)).slice(-2);
    return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

// Draw the pixel grid
function drawPixelGrid() {
    pixelCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    
    // Draw checkerboard background for transparency
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const isLight = (x + y) % 2 === 0;
            pixelCtx.fillStyle = isLight ? '#2a2a3a' : '#1a1a2a';
            pixelCtx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
    }
    
    // Draw pixels
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (pixelData[y][x]) {
                pixelCtx.fillStyle = pixelData[y][x];
                pixelCtx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }
    
    // Draw grid lines
    pixelCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    pixelCtx.lineWidth = 1;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
        pixelCtx.beginPath();
        pixelCtx.moveTo(i * PIXEL_SIZE, 0);
        pixelCtx.lineTo(i * PIXEL_SIZE, pixelCanvas.height);
        pixelCtx.stroke();
        
        pixelCtx.beginPath();
        pixelCtx.moveTo(0, i * PIXEL_SIZE);
        pixelCtx.lineTo(pixelCanvas.width, i * PIXEL_SIZE);
        pixelCtx.stroke();
    }
    
    updatePreviews();
}

// Update preview canvases
function updatePreviews() {
    // Small preview (actual game size)
    previewCtx.clearRect(0, 0, 48, 48);
    const smallPixelSize = 48 / GRID_SIZE;
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (pixelData[y][x]) {
                previewCtx.fillStyle = pixelData[y][x];
                previewCtx.fillRect(x * smallPixelSize, y * smallPixelSize, smallPixelSize, smallPixelSize);
            }
        }
    }
    
    // Large preview (2x)
    previewCtxLarge.clearRect(0, 0, 96, 96);
    const largePixelSize = 96 / GRID_SIZE;
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (pixelData[y][x]) {
                previewCtxLarge.fillStyle = pixelData[y][x];
                previewCtxLarge.fillRect(x * largePixelSize, y * largePixelSize, largePixelSize, largePixelSize);
            }
        }
    }
}

// Get pixel coordinates from mouse event
function getPixelCoords(e) {
    const rect = pixelCanvas.getBoundingClientRect();
    const scaleX = pixelCanvas.width / rect.width;
    const scaleY = pixelCanvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / PIXEL_SIZE);
    
    return { x: Math.max(0, Math.min(GRID_SIZE - 1, x)), y: Math.max(0, Math.min(GRID_SIZE - 1, y)) };
}

// Tool actions
function applyTool(x, y) {
    switch (currentTool) {
        case 'pencil':
            pixelData[y][x] = currentColor;
            break;
        case 'eraser':
            pixelData[y][x] = null;
            break;
        case 'fill':
            floodFill(x, y, pixelData[y][x], currentColor);
            break;
        case 'picker':
            if (pixelData[y][x]) {
                selectColor(pixelData[y][x]);
            }
            break;
    }
    drawPixelGrid();
}

// Flood fill algorithm
function floodFill(x, y, targetColor, fillColor) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    if (pixelData[y][x] !== targetColor) return;
    if (targetColor === fillColor) return;
    
    const stack = [[x, y]];
    const visited = new Set();
    
    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const key = `${cx},${cy}`;
        
        if (visited.has(key)) continue;
        if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) continue;
        if (pixelData[cy][cx] !== targetColor) continue;
        
        visited.add(key);
        pixelData[cy][cx] = fillColor;
        
        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
    }
}

// Canvas event listeners
pixelCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { x, y } = getPixelCoords(e);
    applyTool(x, y);
});

pixelCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    if (currentTool === 'fill' || currentTool === 'picker') return; // Don't drag with fill/picker
    
    const { x, y } = getPixelCoords(e);
    applyTool(x, y);
});

pixelCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

pixelCanvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Touch support for pixel canvas
pixelCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    const { x, y } = getPixelCoords(touch);
    applyTool(x, y);
});

pixelCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    if (currentTool === 'fill' || currentTool === 'picker') return;
    
    const touch = e.touches[0];
    const { x, y } = getPixelCoords(touch);
    applyTool(x, y);
});

pixelCanvas.addEventListener('touchend', () => {
    isDrawing = false;
});

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

// Color input
document.getElementById('colorInput').addEventListener('input', (e) => {
    selectColor(e.target.value);
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    clearEditor();
});

// Save block
document.getElementById('saveBlockBtn').addEventListener('click', () => {
    const name = document.getElementById('blockName').value.trim() || `Block ${customBlocks.length + 1}`;
    const behavior = document.getElementById('blockBehavior').value;
    const key = document.getElementById('blockKey').value.trim().toUpperCase() || String.fromCharCode(65 + customBlocks.length % 26);
    
    // Check if key is already used by a different block
    const existingIndex = customBlocks.findIndex(b => b.key === key && b.id !== editingBlockId);
    if (existingIndex !== -1) {
        if (!confirm(`Block key "${key}" is already used by "${customBlocks[existingIndex].name}". Replace it?`)) {
            return;
        }
        customBlocks.splice(existingIndex, 1);
    }
    
    // If editing existing block, update it
    if (editingBlockId) {
        const editIndex = customBlocks.findIndex(b => b.id === editingBlockId);
        if (editIndex !== -1) {
            customBlocks[editIndex] = {
                id: editingBlockId,
                name: name,
                key: key,
                behavior: behavior,
                pixels: JSON.parse(JSON.stringify(pixelData))
            };
            saveCustomBlocks();
            showToast(`Block "${name}" updated!`);
            return;
        }
    }
    
    // Create new block
    const block = {
        id: Date.now(),
        name: name,
        key: key,
        behavior: behavior,
        pixels: JSON.parse(JSON.stringify(pixelData))
    };
    
    customBlocks.push(block);
    saveCustomBlocks();
    
    // Clear for new block
    clearEditor();
    
    // Show feedback
    showToast(`Block "${name}" saved!`);
});

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-mint);
        color: var(--bg-dark);
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Render saved blocks
function renderSavedBlocks() {
    const container = document.getElementById('savedBlocks');
    container.innerHTML = '';
    
    if (customBlocks.length === 0) {
        container.innerHTML = '<div class="empty-state">No blocks saved yet.<br>Draw one and click Save!</div>';
        return;
    }
    
    customBlocks.forEach((block, index) => {
        const blockEl = document.createElement('div');
        blockEl.className = 'saved-block';
        
        // Highlight if currently editing this block
        if (editingBlockId === block.id) {
            blockEl.classList.add('selected');
        }
        
        blockEl.innerHTML = `
            <canvas width="48" height="48"></canvas>
            <div class="block-label">${block.name}</div>
            <div class="block-key">${block.key}</div>
            <button class="delete-btn">×</button>
        `;
        
        // Draw block preview
        const blockCanvas = blockEl.querySelector('canvas');
        const blockCtx = blockCanvas.getContext('2d');
        const pixelSize = 48 / GRID_SIZE;
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (block.pixels[y] && block.pixels[y][x]) {
                    blockCtx.fillStyle = block.pixels[y][x];
                    blockCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        
        // Click to edit
        blockEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;
            loadBlockForEditing(block);
        });
        
        // Delete button
        blockEl.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${block.name}"?`)) {
                customBlocks.splice(index, 1);
                // If we deleted the block we're editing, clear editor
                if (editingBlockId === block.id) {
                    clearEditor();
                }
                saveCustomBlocks();
            }
        });
        
        container.appendChild(blockEl);
    });
}

function loadBlockForEditing(block) {
    pixelData = JSON.parse(JSON.stringify(block.pixels));
    document.getElementById('blockName').value = block.name;
    document.getElementById('blockBehavior').value = block.behavior;
    document.getElementById('blockKey').value = block.key;
    editingBlockId = block.id;
    updateEditingIndicator(block.name);
    drawPixelGrid();
    renderSavedBlocks(); // Re-render to show selection
}

function updateEditingIndicator(blockName = null) {
    const indicator = document.getElementById('editingIndicator');
    const textEl = indicator.querySelector('.editing-text');
    
    if (blockName) {
        indicator.classList.remove('new-block');
        textEl.textContent = `Editing: ${blockName}`;
    } else {
        indicator.classList.add('new-block');
        textEl.textContent = 'New Block';
    }
}

function clearEditor() {
    pixelData = createEmptyPixelData();
    document.getElementById('blockName').value = '';
    document.getElementById('blockKey').value = '';
    editingBlockId = null;
    updateEditingIndicator(null);
    drawPixelGrid();
    renderSavedBlocks();
}

// New block button
document.getElementById('newBlockBtn').addEventListener('click', () => {
    clearEditor();
    showToast('Ready for a new block!');
});

// Editor navigation
document.getElementById('editorBtn').addEventListener('click', () => {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('editorScreen').classList.add('active');
    initColorPalette();
    selectColor(currentColor);
    updateEditingIndicator(null); // Initialize as "New Block"
    drawPixelGrid();
    renderSavedBlocks();
    updateBlockCount();
});

document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('editorScreen').classList.remove('active');
    document.getElementById('titleScreen').classList.remove('hidden');
});

// Game state
let gameRunning = false;
let currentLevel = 0;
let coins = 0;
let lives = 3;
let cameraX = 0;
let particles = [];
let floatingTexts = [];

// Block size
const BLOCK_SIZE = 48;

// Colors palette (matching CSS theme)
const COLORS = {
    bg: '#0a0a0f',
    bgGradientStart: '#1a1a2e',
    bgGradientEnd: '#0f0f1a',
    coral: '#ff6b6b',
    mint: '#4ecdc4',
    gold: '#ffd93d',
    lavender: '#a29bfe',
    sky: '#74b9ff',
    grass: '#00b894',
    dirt: '#e17055',
    stone: '#636e72',
    wood: '#fdcb6e',
    lava: '#d63031',
    ice: '#81ecec',
    purple: '#6c5ce7'
};

// Block types with custom designs
const BLOCK_TYPES = {
    EMPTY: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    BRICK: 4,
    QUESTION: 5,
    SPIKE: 6,
    COIN: 7,
    GOAL: 8,
    ICE: 9,
    WOOD: 10,
    LAVA: 11,
    BOUNCY: 12,
    CLOUD: 13,
    WATER: 14,
    CUSTOM: 100 // Custom blocks start at 100
};

// Player object
const player = {
    x: 100,
    y: 300,
    width: 36,
    height: 44,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: 14,
    gravity: 0.6,
    grounded: false,
    facing: 1,
    animFrame: 0,
    animTimer: 0,
    isJumping: false,
    squash: 1,
    stretch: 1,
    
    // Character colors
    bodyColor: COLORS.coral,
    eyeColor: '#fff',
    cheekColor: '#ff8a8a'
};

// Input handling
const keys = {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false
};

// Levels data
const levels = [
    // Level 1 - Introduction
    {
        name: "Brick City",
        bgColor1: '#1a1a2e',
        bgColor2: '#2d3436',
        data: [
            "                                                                              B",
            "                                                                              B",
            "                                                                              B",
            "                                        C C C                                 B",
            "                                       BBBBB                                  B",
            "            C                                           C C                   B",
            "           BBB        C C C                             BBB                   B",
            "                      BBBBB          C                                        B",
            "    C                               BBB    ^  ^                               B",
            "   BBB        ^                            BBBBB     BBBBB                    B",
            "P            BBBBB   BBBwwwwBB     BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            "BBBBBBBBBBBBBBBBBBBBBBBBwwwwBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        ]
    },
    // Level 2 - Bouncy Fun
    {
        name: "Bounce Valley",
        bgColor1: '#2d3436',
        bgColor2: '#1a1a2e',
        data: [
            "                                                                              B",
            "                                                          C C C              B",
            "                              C C C                       BBBBB              B",
            "                              BBBBB                                          B",
            "                                              C                              B",
            "         C C C                               RRR                             B",
            "         RRRRR           C                                     C C          B",
            "                        RRR        C C                         BBB          B",
            "    C                              BBB                    ^                  B",
            "   RRR       ^                                          BBB                 B",
            "P           BBB        BBwwwwwBB         BBwwwwBB     BBBBBBBBBBBBBBBBBBBBBBBBB",
            "BBBBBBBBBBBBBBBBBBBBBBBBBwwwwwBBBBBBBBBBBBBwwwwBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        ]
    },
    // Level 3 - Ice World
    {
        name: "Frozen Peaks",
        bgColor1: '#0c2461',
        bgColor2: '#1e3799',
        data: [
            "                                                                              B",
            "                                                                              B",
            "                                             C C C                           B",
            "                        C C                  IIIII                           B",
            "                        III                                                  B",
            "            C                      C                        C C              B",
            "           III                    III           C           BBB              B",
            "                       C                       III                           B",
            "    C                 III     ^        ^                 ^                   B",
            "   III       ^               III      III               III                  B",
            "P           III    IIIIIIIIIIIIIIIIIIIIIIIIIIIIII    IIIIIIIIIIIIIIIIIIIIIIIIBBB",
            "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIBBB",
        ]
    },
    // Level 4 - Lava Cavern
    {
        name: "Lava Cavern",
        bgColor1: '#2d1f1f',
        bgColor2: '#1a0f0f',
        data: [
            "                                                                              G",
            "                                                   C C C                      G",
            "                              C C                  SSSSS                      G",
            "                              SSS                                             G",
            "            C C                              C                                G",
            "            BBB         C                   SSS                   C           G",
            "                       SSS        C                              BBB          G",
            "    C                             SSS  LLLLLL   LLLLLL                        G",
            "   SSS       ^    ^                    LLLLLL   LLLLLL        ^               G",
            "            SSS  SSS   SSSSSSS        SSSSSSSSSSSSSSSSS      SSS              G",
            "P          SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSG",
            "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSG",
        ]
    }
];

// Parse level data
function parseLevel(levelIndex) {
    const level = levels[levelIndex];
    const blocks = [];
    const levelCoins = [];
    let playerStart = { x: 100, y: 300 };
    let goalPos = null;
    
    // Reload custom blocks for this level
    customBlocks = loadCustomBlocks();
    
    for (let y = 0; y < level.data.length; y++) {
        for (let x = 0; x < level.data[y].length; x++) {
            const char = level.data[y][x];
            const blockX = x * BLOCK_SIZE;
            const blockY = y * BLOCK_SIZE;
            
            // Check for custom blocks first
            const customBlock = customBlocks.find(b => b.key === char);
            if (customBlock) {
                blocks.push({ 
                    x: blockX, 
                    y: blockY, 
                    type: BLOCK_TYPES.CUSTOM,
                    customData: customBlock
                });
                continue;
            }
            
            switch(char) {
                case 'P': // Player start
                    playerStart = { x: blockX, y: blockY - player.height };
                    break;
                case 'G': // Grass block
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.GRASS });
                    break;
                case 'D': // Dirt
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.DIRT });
                    break;
                case 'S': // Stone
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.STONE });
                    break;
                case 'B': // Brick
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.BRICK });
                    break;
                case 'Q': // Question block
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.QUESTION });
                    break;
                case '^': // Spike
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.SPIKE });
                    break;
                case 'C': // Coin
                    levelCoins.push({ 
                        x: blockX + BLOCK_SIZE/2, 
                        y: blockY + BLOCK_SIZE/2, 
                        collected: false,
                        animOffset: Math.random() * Math.PI * 2
                    });
                    break;
                case 'I': // Ice
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.ICE });
                    break;
                case 'W': // Wood
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.WOOD });
                    break;
                case 'L': // Lava
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.LAVA });
                    break;
                case 'R': // Bouncy (rubber)
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.BOUNCY });
                    break;
                case '~': // Cloud
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.CLOUD });
                    break;
                case 'w': // Water
                    blocks.push({ x: blockX, y: blockY, type: BLOCK_TYPES.WATER });
                    break;
                case 'g': // Goal
                    goalPos = { x: blockX, y: blockY };
                    break;
            }
        }
    }
    
    return { blocks, coins: levelCoins, playerStart, goalPos, level };
}

// Current level data
let levelData = null;

// Initialize level
function initLevel(levelIndex) {
    currentLevel = levelIndex;
    levelData = parseLevel(levelIndex);
    
    player.x = levelData.playerStart.x;
    player.y = levelData.playerStart.y;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    
    cameraX = 0;
    particles = [];
    floatingTexts = [];
    
    document.getElementById('levelNum').textContent = levelIndex + 1;
    document.getElementById('levelComplete').classList.remove('show');
    document.getElementById('gameOver').classList.remove('show');
}

// Resize canvas
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight - 80; // Account for HUD
}

// Draw custom block designs
function drawBlock(block) {
    const x = block.x - cameraX;
    const y = block.y;
    const size = BLOCK_SIZE;
    
    // Skip if off screen
    if (x < -size || x > canvas.width + size) return;
    
    ctx.save();
    
    switch(block.type) {
        case BLOCK_TYPES.GRASS:
            drawGrassBlock(x, y, size);
            break;
        case BLOCK_TYPES.DIRT:
            drawDirtBlock(x, y, size);
            break;
        case BLOCK_TYPES.STONE:
            drawStoneBlock(x, y, size);
            break;
        case BLOCK_TYPES.BRICK:
            drawBrickBlock(x, y, size);
            break;
        case BLOCK_TYPES.QUESTION:
            drawQuestionBlock(x, y, size);
            break;
        case BLOCK_TYPES.SPIKE:
            drawSpikeBlock(x, y, size);
            break;
        case BLOCK_TYPES.ICE:
            drawIceBlock(x, y, size);
            break;
        case BLOCK_TYPES.WOOD:
            drawWoodBlock(x, y, size);
            break;
        case BLOCK_TYPES.LAVA:
            drawLavaBlock(x, y, size);
            break;
        case BLOCK_TYPES.BOUNCY:
            drawBouncyBlock(x, y, size);
            break;
        case BLOCK_TYPES.CLOUD:
            drawCloudBlock(x, y, size);
            break;
        case BLOCK_TYPES.WATER:
            drawWaterBlock(x, y, size);
            break;
        case BLOCK_TYPES.CUSTOM:
            drawCustomBlock(x, y, size, block.customData);
            break;
    }
    
    ctx.restore();
}

// Draw a custom user-designed block
function drawCustomBlock(x, y, size, customData) {
    if (!customData || !customData.pixels) return;
    
    const pixelSize = size / GRID_SIZE;
    
    for (let py = 0; py < GRID_SIZE; py++) {
        for (let px = 0; px < GRID_SIZE; px++) {
            if (customData.pixels[py] && customData.pixels[py][px]) {
                ctx.fillStyle = customData.pixels[py][px];
                ctx.fillRect(
                    x + px * pixelSize, 
                    y + py * pixelSize, 
                    pixelSize + 0.5, // Slight overlap to avoid gaps
                    pixelSize + 0.5
                );
            }
        }
    }
    
    // Add subtle 3D effect based on behavior
    if (customData.behavior === 'solid' || customData.behavior === 'slippery') {
        // Highlight on top
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, y, size, 3);
        // Shadow on bottom
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x, y + size - 3, size, 3);
    } else if (customData.behavior === 'bouncy') {
        // Bouncy glow effect
        const time = Date.now() / 300;
        const glow = Math.sin(time) * 0.1 + 0.1;
        ctx.fillStyle = `rgba(255,255,255,${glow})`;
        ctx.fillRect(x, y, size, size);
    } else if (customData.behavior === 'hazard') {
        // Danger pulse
        const time = Date.now() / 200;
        const pulse = Math.sin(time) * 0.1 + 0.1;
        ctx.fillStyle = `rgba(255,0,0,${pulse})`;
        ctx.fillRect(x, y, size, size);
    }
}

// Individual block drawing functions
function drawGrassBlock(x, y, size) {
    // Main dirt body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, size, size);
    
    // Dirt texture
    ctx.fillStyle = '#6B3510';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 8 + i * 14, y + size/2 + 5, 6, 4);
    }
    
    // Grass top
    const grassGrad = ctx.createLinearGradient(x, y, x, y + 14);
    grassGrad.addColorStop(0, '#2ECC71');
    grassGrad.addColorStop(1, '#27AE60');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(x, y, size, 14);
    
    // Grass blades
    ctx.fillStyle = '#58D68D';
    for (let i = 0; i < 5; i++) {
        const bladeX = x + 4 + i * 10;
        ctx.beginPath();
        ctx.moveTo(bladeX, y);
        ctx.lineTo(bladeX + 3, y - 6);
        ctx.lineTo(bladeX + 6, y);
        ctx.fill();
    }
    
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x, y, size, 4);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y + size - 4, size, 4);
}

function drawDirtBlock(x, y, size) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, size, size);
    
    // Texture dots
    ctx.fillStyle = '#6B3510';
    for (let i = 0; i < 5; i++) {
        const dotX = x + 5 + (i * 9) % size;
        const dotY = y + 5 + (i * 13) % size;
        ctx.fillRect(dotX, dotY, 4, 3);
    }
    
    // Highlight & shadow
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, size, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x, y + size - 3, size, 3);
}

function drawStoneBlock(x, y, size) {
    // Base
    const stoneGrad = ctx.createLinearGradient(x, y, x, y + size);
    stoneGrad.addColorStop(0, '#7f8c8d');
    stoneGrad.addColorStop(1, '#636e72');
    ctx.fillStyle = stoneGrad;
    ctx.fillRect(x, y, size, size);
    
    // Cracks
    ctx.strokeStyle = '#4a5455';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 15, y + 20);
    ctx.lineTo(x + 8, y + size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + size - 10, y + 10);
    ctx.lineTo(x + size - 18, y + 30);
    ctx.stroke();
    
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, y, size, 4);
    ctx.fillRect(x, y, 4, size);
}

function drawBrickBlock(x, y, size) {
    // Base
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x, y, size, size);
    
    // Brick pattern
    ctx.fillStyle = '#922B21';
    
    // Top row
    ctx.fillRect(x + 2, y + 2, size/2 - 4, size/2 - 4);
    ctx.fillRect(x + size/2 + 2, y + 2, size/2 - 4, size/2 - 4);
    
    // Bottom row (offset)
    ctx.fillRect(x - size/4 + 2, y + size/2 + 2, size/2 - 4, size/2 - 4);
    ctx.fillRect(x + size/4 + 2, y + size/2 + 2, size/2 - 4, size/2 - 4);
    ctx.fillRect(x + size*3/4 + 2, y + size/2 + 2, size/2 - 4, size/2 - 4);
    
    // Mortar lines
    ctx.fillStyle = '#7B241C';
    ctx.fillRect(x, y + size/2 - 1, size, 3);
    ctx.fillRect(x + size/2 - 1, y, 3, size/2);
    ctx.fillRect(x + size/4 - 1, y + size/2, 3, size/2);
    ctx.fillRect(x + size*3/4 - 1, y + size/2, 3, size/2);
    
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, size, 3);
}

function drawQuestionBlock(x, y, size) {
    // Base gold
    const goldGrad = ctx.createLinearGradient(x, y, x, y + size);
    goldGrad.addColorStop(0, '#f1c40f');
    goldGrad.addColorStop(1, '#f39c12');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(x, y, size, size);
    
    // Question mark
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + size/2, y + size/2);
    
    // Border
    ctx.strokeStyle = '#d68910';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 4, y + 4, 10, 10);
}

function drawSpikeBlock(x, y, size) {
    // Spikes
    ctx.fillStyle = '#2c3e50';
    const spikeCount = 3;
    const spikeWidth = size / spikeCount;
    
    for (let i = 0; i < spikeCount; i++) {
        const spikeX = x + i * spikeWidth;
        
        ctx.beginPath();
        ctx.moveTo(spikeX, y + size);
        ctx.lineTo(spikeX + spikeWidth/2, y + 8);
        ctx.lineTo(spikeX + spikeWidth, y + size);
        ctx.closePath();
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(spikeX + 2, y + size);
        ctx.lineTo(spikeX + spikeWidth/2, y + 12);
        ctx.lineTo(spikeX + spikeWidth/2 + 4, y + size);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#2c3e50';
    }
}

function drawIceBlock(x, y, size) {
    // Base ice blue
    const iceGrad = ctx.createLinearGradient(x, y, x + size, y + size);
    iceGrad.addColorStop(0, '#74b9ff');
    iceGrad.addColorStop(0.5, '#81ecec');
    iceGrad.addColorStop(1, '#74b9ff');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(x, y, size, size);
    
    // Crystal patterns
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 10);
    ctx.lineTo(x + 20, y + 25);
    ctx.lineTo(x + 10, y + 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + size - 10, y + 5);
    ctx.lineTo(x + size - 20, y + 20);
    ctx.stroke();
    
    // Shine spots
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x + 8, y + 8, 8, 8);
    ctx.fillRect(x + size - 16, y + size - 20, 6, 6);
    
    // Edge highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, size, 4);
    ctx.fillRect(x, y, 4, size);
}

function drawWoodBlock(x, y, size) {
    // Base wood
    ctx.fillStyle = '#d68910';
    ctx.fillRect(x, y, size, size);
    
    // Wood grain
    ctx.strokeStyle = '#9c640c';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const grainY = y + 8 + i * 12;
        ctx.beginPath();
        ctx.moveTo(x, grainY);
        ctx.bezierCurveTo(x + size/3, grainY - 3, x + size*2/3, grainY + 3, x + size, grainY);
        ctx.stroke();
    }
    
    // Knot
    ctx.fillStyle = '#7d4e0c';
    ctx.beginPath();
    ctx.ellipse(x + size - 14, y + size/2, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawLavaBlock(x, y, size) {
    const time = Date.now() / 200;
    
    // Base lava
    const lavaGrad = ctx.createLinearGradient(x, y, x, y + size);
    lavaGrad.addColorStop(0, '#e74c3c');
    lavaGrad.addColorStop(0.5, '#c0392b');
    lavaGrad.addColorStop(1, '#922B21');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(x, y, size, size);
    
    // Animated bubbles/glow
    ctx.fillStyle = '#f39c12';
    for (let i = 0; i < 3; i++) {
        const bubbleX = x + 10 + ((i * 15 + Math.sin(time + i) * 5) % (size - 10));
        const bubbleY = y + 10 + Math.sin(time * 2 + i * 2) * 5;
        const bubbleSize = 4 + Math.sin(time + i) * 2;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Glow effect on top
    ctx.fillStyle = 'rgba(243, 156, 18, 0.4)';
    ctx.fillRect(x, y, size, 8 + Math.sin(time) * 3);
}

function drawBouncyBlock(x, y, size) {
    const time = Date.now() / 300;
    const bounce = Math.sin(time) * 2;
    
    // Base pink/purple
    const bouncyGrad = ctx.createLinearGradient(x, y, x, y + size);
    bouncyGrad.addColorStop(0, '#e056fd');
    bouncyGrad.addColorStop(1, '#be2edd');
    ctx.fillStyle = bouncyGrad;
    
    // Slightly squished shape
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 4 + bounce, size - 4, size - 8 - bounce, 8);
    ctx.fill();
    
    // Spring lines
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + size/2 + bounce/2);
    ctx.lineTo(x + size - 10, y + size/2 + bounce/2);
    ctx.stroke();
    
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 14 + bounce, 6, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawCloudBlock(x, y, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Cloud puffs
    ctx.beginPath();
    ctx.arc(x + size/4, y + size/2, size/4, 0, Math.PI * 2);
    ctx.arc(x + size/2, y + size/3, size/3, 0, Math.PI * 2);
    ctx.arc(x + size*3/4, y + size/2, size/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawWaterBlock(x, y, size) {
    const time = Date.now() / 400;
    
    // Base water color
    const waterGrad = ctx.createLinearGradient(x, y, x, y + size);
    waterGrad.addColorStop(0, 'rgba(52, 152, 219, 0.85)');
    waterGrad.addColorStop(0.5, 'rgba(41, 128, 185, 0.9)');
    waterGrad.addColorStop(1, 'rgba(30, 100, 160, 0.95)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(x, y, size, size);
    
    // Animated waves on top
    ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
    for (let i = 0; i < 3; i++) {
        const waveX = x + (i * 16);
        const waveY = y + Math.sin(time + i * 1.5) * 3;
        ctx.beginPath();
        ctx.ellipse(waveX + 8, waveY + 6, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Surface shine/reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    const shineOffset = Math.sin(time * 0.8) * 4;
    ctx.fillRect(x + 4 + shineOffset, y + 2, 12, 4);
    ctx.fillRect(x + size - 18 + shineOffset, y + 4, 8, 3);
    
    // Bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 2; i++) {
        const bubbleX = x + 10 + i * 20;
        const bubbleY = y + size - 10 - ((time * 20 + i * 30) % (size - 15));
        const bubbleSize = 3 + Math.sin(time + i) * 1;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Darker bottom for depth
    ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
    ctx.fillRect(x, y + size - 8, size, 8);
}

// Draw coin
function drawCoin(coin) {
    if (coin.collected) return;
    
    const x = coin.x - cameraX;
    const y = coin.y;
    const time = Date.now() / 200 + coin.animOffset;
    const bobY = Math.sin(time) * 4;
    
    // Skip if off screen
    if (x < -20 || x > canvas.width + 20) return;
    
    // Glow
    ctx.fillStyle = 'rgba(255, 217, 61, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y + bobY, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin body
    const coinGrad = ctx.createRadialGradient(x - 4, y + bobY - 4, 0, x, y + bobY, 14);
    coinGrad.addColorStop(0, '#fff3a0');
    coinGrad.addColorStop(0.5, '#ffd93d');
    coinGrad.addColorStop(1, '#f39c12');
    ctx.fillStyle = coinGrad;
    ctx.beginPath();
    ctx.arc(x, y + bobY, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner circle
    ctx.strokeStyle = '#d68910';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + bobY, 9, 0, Math.PI * 2);
    ctx.stroke();
    
    // Star/shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y + bobY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw player character (cute cube character)
function drawPlayer() {
    const x = player.x - cameraX;
    const y = player.y;
    
    ctx.save();
    
    // Apply squash and stretch
    ctx.translate(x + player.width/2, y + player.height);
    ctx.scale(player.squash * player.facing, player.stretch);
    ctx.translate(-(x + player.width/2), -(y + player.height));
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + player.width/2, y + player.height + 4, player.width/2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    const bodyGrad = ctx.createLinearGradient(x, y, x, y + player.height);
    bodyGrad.addColorStop(0, '#ff7675');
    bodyGrad.addColorStop(1, '#d63031');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(x, y + 8, player.width, player.height - 8, 8);
    ctx.fill();
    
    // Face area (lighter)
    ctx.fillStyle = '#fab1a0';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 12, player.width - 8, 24, 6);
    ctx.fill();
    
    // Eyes
    const eyeY = y + 20;
    const blinkFrame = Math.floor(Date.now() / 100) % 50 === 0;
    
    // Left eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x + 10, eyeY, 6, blinkFrame ? 1 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(x + player.width - 10, eyeY, 6, blinkFrame ? 1 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    if (!blinkFrame) {
        // Pupils
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(x + 10 + player.facing * 2, eyeY + 1, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + player.width - 10 + player.facing * 2, eyeY + 1, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + 8, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + player.width - 12, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Cheeks
    ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + 4, eyeY + 10, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + player.width - 4, eyeY + 10, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    if (player.vy < -5) {
        // Excited mouth when jumping high
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(x + player.width/2, eyeY + 14, 4, 0, Math.PI);
        ctx.fill();
    } else {
        // Happy smile
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x + player.width/2, eyeY + 10, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }
    
    // Feet
    const walkOffset = player.grounded && Math.abs(player.vx) > 0.5 ? 
        Math.sin(Date.now() / 80) * 3 : 0;
    
    ctx.fillStyle = '#d63031';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + player.height - 6 + walkOffset, 12, 8, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + player.width - 14, y + player.height - 6 - walkOffset, 12, 8, 3);
    ctx.fill();
    
    ctx.restore();
}

// Draw particles
function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - cameraX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Draw floating texts
function drawFloatingTexts() {
    for (const t of floatingTexts) {
        ctx.globalAlpha = t.life;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 20px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x - cameraX, t.y);
    }
    ctx.globalAlpha = 1;
}

// Spawn particles
function spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            size: Math.random() * 4 + 2,
            color: color,
            life: 1
        });
    }
}

// Spawn floating text
function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1
    });
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life -= 0.03;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const t = floatingTexts[i];
        t.y -= 1.5;
        t.life -= 0.02;
        
        if (t.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

// Collision detection
function rectCollision(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

// Check if block is solid
function isSolidBlock(block) {
    const type = block.type;
    
    // Handle custom blocks
    if (type === BLOCK_TYPES.CUSTOM && block.customData) {
        const behavior = block.customData.behavior;
        return behavior === 'solid' || behavior === 'slippery' || behavior === 'bouncy';
    }
    
    return type !== BLOCK_TYPES.SPIKE && 
           type !== BLOCK_TYPES.COIN && 
           type !== BLOCK_TYPES.LAVA &&
           type !== BLOCK_TYPES.CLOUD;
}

// Check if custom block is a hazard
function isHazardBlock(block) {
    if (block.type === BLOCK_TYPES.CUSTOM && block.customData) {
        return block.customData.behavior === 'hazard';
    }
    return block.type === BLOCK_TYPES.SPIKE || block.type === BLOCK_TYPES.LAVA || block.type === BLOCK_TYPES.WATER;
}

// Check if custom block is bouncy
function isBouncyBlock(block) {
    if (block.type === BLOCK_TYPES.CUSTOM && block.customData) {
        return block.customData.behavior === 'bouncy';
    }
    return block.type === BLOCK_TYPES.BOUNCY;
}

// Check if custom block is slippery
function isSlipperyBlock(block) {
    if (block.type === BLOCK_TYPES.CUSTOM && block.customData) {
        return block.customData.behavior === 'slippery';
    }
    return block.type === BLOCK_TYPES.ICE;
}

// Update player
function updatePlayer() {
    // Horizontal movement
    let targetVx = 0;
    let friction = 0.85;
    let accel = 0.8;
    
    // Check if on ice or slippery custom block
    const feetY = player.y + player.height + 2;
    let onSlippery = false;
    for (const block of levelData.blocks) {
        if (isSlipperyBlock(block)) {
            if (player.x + player.width > block.x && player.x < block.x + BLOCK_SIZE &&
                feetY >= block.y && feetY <= block.y + 10) {
                onSlippery = true;
                break;
            }
        }
    }
    
    if (onSlippery) {
        friction = 0.98;
        accel = 0.3;
    }
    
    if (keys.left) {
        targetVx = -player.speed;
        player.facing = -1;
    }
    if (keys.right) {
        targetVx = player.speed;
        player.facing = 1;
    }
    
    player.vx += (targetVx - player.vx) * accel;
    player.vx *= friction;
    
    // Jumping
    if (keys.jump && !keys.jumpPressed && player.grounded) {
        player.vy = -player.jumpPower;
        player.grounded = false;
        player.isJumping = true;
        keys.jumpPressed = true;
        
        // Jump particles
        spawnParticles(player.x + player.width/2, player.y + player.height, '#fff', 5);
        
        // Squash and stretch
        player.squash = 0.7;
        player.stretch = 1.3;
    }
    
    // Variable jump height
    if (!keys.jump && player.vy < -4) {
        player.vy *= 0.85;
    }
    
    // Gravity
    player.vy += player.gravity;
    if (player.vy > 15) player.vy = 15;
    
    // Squash/stretch recovery
    player.squash += (1 - player.squash) * 0.2;
    player.stretch += (1 - player.stretch) * 0.2;
    
    // Movement and collision
    // Horizontal
    player.x += player.vx;
    
    for (const block of levelData.blocks) {
        if (!isSolidBlock(block)) continue;
        
        const blockRect = { x: block.x, y: block.y, width: BLOCK_SIZE, height: BLOCK_SIZE };
        const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
        
        if (rectCollision(playerRect, blockRect)) {
            if (player.vx > 0) {
                player.x = block.x - player.width;
            } else if (player.vx < 0) {
                player.x = block.x + BLOCK_SIZE;
            }
            player.vx = 0;
        }
    }
    
    // Vertical
    player.y += player.vy;
    player.grounded = false;
    
    for (const block of levelData.blocks) {
        const blockRect = { x: block.x, y: block.y, width: BLOCK_SIZE, height: BLOCK_SIZE };
        const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
        
        // Hazard collision (spikes, lava, custom hazards)
        if (isHazardBlock(block) && rectCollision(playerRect, blockRect)) {
            playerDie();
            return;
        }
        
        // Bouncy block (including custom bouncy blocks)
        if (isBouncyBlock(block) && rectCollision(playerRect, blockRect)) {
            if (player.vy > 0) {
                player.y = block.y - player.height;
                player.vy = -player.jumpPower * 1.5;
                player.grounded = false;
                // Get color from custom block if available
                const particleColor = block.customData ? 
                    (block.customData.pixels[6]?.[6] || '#e056fd') : '#e056fd';
                spawnParticles(player.x + player.width/2, player.y + player.height, particleColor, 8);
            }
            continue;
        }
        
        if (!isSolidBlock(block)) continue;
        
        if (rectCollision(playerRect, blockRect)) {
            if (player.vy > 0) {
                player.y = block.y - player.height;
                player.vy = 0;
                player.grounded = true;
                player.isJumping = false;
                
                // Landing squash
                if (player.stretch > 1.1) {
                    player.squash = 1.2;
                    player.stretch = 0.8;
                }
            } else if (player.vy < 0) {
                player.y = block.y + BLOCK_SIZE;
                player.vy = 0;
            }
        }
    }
    
    // Coin collection
    for (const coin of levelData.coins) {
        if (coin.collected) continue;
        
        const dx = (player.x + player.width/2) - coin.x;
        const dy = (player.y + player.height/2) - coin.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 30) {
            coin.collected = true;
            coins++;
            document.getElementById('coinCount').textContent = coins;
            spawnParticles(coin.x, coin.y, COLORS.gold, 10);
            spawnFloatingText(coin.x, coin.y, '+1', COLORS.gold);
        }
    }
    
    // Check if reached goal (right edge)
    if (player.x > (levels[currentLevel].data[0].length - 3) * BLOCK_SIZE) {
        levelComplete();
    }
    
    // Fall death
    if (player.y > canvas.height + 100) {
        playerDie();
    }
    
    // Camera follow
    const targetCameraX = player.x - canvas.width / 3;
    cameraX += (targetCameraX - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;
}

// Player death
function playerDie() {
    lives--;
    document.getElementById('livesCount').textContent = '❤️'.repeat(Math.max(0, lives));
    
    spawnParticles(player.x + player.width/2, player.y + player.height/2, COLORS.coral, 20);
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Respawn
        player.x = levelData.playerStart.x;
        player.y = levelData.playerStart.y;
        player.vx = 0;
        player.vy = 0;
        cameraX = 0;
    }
}

// Level complete
function levelComplete() {
    document.getElementById('levelComplete').classList.add('show');
    gameRunning = false;
}

// Game over
function gameOver() {
    document.getElementById('gameOver').classList.add('show');
    gameRunning = false;
}

// Draw background
function drawBackground() {
    const level = levels[currentLevel];
    
    // Gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, level.bgColor1);
    bgGrad.addColorStop(1, level.bgColor2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Parallax mountains/hills
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 5; i++) {
        const hillX = (i * 300 - cameraX * 0.2) % (canvas.width + 300) - 150;
        const hillHeight = 100 + Math.sin(i * 2) * 50;
        
        ctx.beginPath();
        ctx.moveTo(hillX, canvas.height);
        ctx.quadraticCurveTo(hillX + 150, canvas.height - hillHeight, hillX + 300, canvas.height);
        ctx.fill();
    }
    
    // Stars (for dark levels)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 30; i++) {
        const starX = (i * 73 + 20) % canvas.width;
        const starY = (i * 47 + 30) % (canvas.height / 2);
        const twinkle = Math.sin(Date.now() / 500 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.5;
        ctx.fillRect(starX, starY, 2, 2);
    }
    ctx.globalAlpha = 1;
}

// Main game loop
function gameLoop() {
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update
    updatePlayer();
    updateParticles();
    
    // Draw blocks
    for (const block of levelData.blocks) {
        drawBlock(block);
    }
    
    // Draw coins
    for (const coin of levelData.coins) {
        drawCoin(coin);
    }
    
    // Draw player
    drawPlayer();
    
    // Draw particles
    drawParticles();
    drawFloatingTexts();
    
    requestAnimationFrame(gameLoop);
}

// Input event listeners
document.addEventListener('keydown', (e) => {
    // Don't capture keys when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.jump = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    // Don't capture keys when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.jump = false;
        keys.jumpPressed = false;
    }
});

// Touch controls for mobile
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    keys.jump = true;
});

canvas.addEventListener('touchmove', (e) => {
    const touchX = e.touches[0].clientX;
    if (touchX < touchStartX - 30) {
        keys.left = true;
        keys.right = false;
    } else if (touchX > touchStartX + 30) {
        keys.right = true;
        keys.left = false;
    } else {
        keys.left = false;
        keys.right = false;
    }
});

canvas.addEventListener('touchend', () => {
    keys.left = false;
    keys.right = false;
    keys.jump = false;
    keys.jumpPressed = false;
});

// UI Event listeners
document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('active');
    resizeCanvas();
    initLevel(0);
    coins = 0;
    lives = 3;
    document.getElementById('coinCount').textContent = '0';
    document.getElementById('livesCount').textContent = '❤️❤️❤️';
    gameRunning = true;
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentLevel < levels.length - 1) {
        initLevel(currentLevel + 1);
        gameRunning = true;
    } else {
        // Game complete - restart
        document.getElementById('titleScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('levelComplete').classList.remove('show');
    }
});

document.getElementById('retryBtn').addEventListener('click', () => {
    lives = 3;
    coins = 0;
    document.getElementById('coinCount').textContent = '0';
    document.getElementById('livesCount').textContent = '❤️❤️❤️';
    initLevel(0);
    gameRunning = true;
});

// Resize handler
window.addEventListener('resize', () => {
    if (document.getElementById('gameScreen').classList.contains('active')) {
        resizeCanvas();
    }
});

// Start game loop
gameLoop();

