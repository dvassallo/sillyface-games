// Crafter: A New World - Game Engine

// ==================== CONSTANTS ====================
const BLOCK_SIZE = 32;
const WORLD_WIDTH = 240;
const WORLD_HEIGHT = 440;
const GRAVITY = 0.5;
const JUMP_FORCE = 6;  // Jump height ~1 block
const MOVE_SPEED = 5;
const GROUND_LEVEL = 300;  // Ground is at y=300, leaving lots of room above for mountains

// Block types
const BLOCK = {
    AIR: 0,
    DIRT: 1,
    GRASS: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    COAL: 6,
    IRON: 7,
    PLANKS: 8,
    CRAFTING_TABLE: 9,
    STICK: 10,
    WOODEN_PICKAXE: 11,
    STONE_PICKAXE: 12,
    FURNACE: 13,
    IRON_INGOT: 14,
    WOOL: 15,
    SHEARS: 16,
    MOSSY_COBBLESTONE: 17,
    SPAWNER: 18,
    BOW: 19,
    APPLE: 20,
    WATER: 21,
    VINE: 22,
    STRING: 23,
    SPIDER_EYE: 24,
    RAW_MEAT: 25,
    COOKED_MEAT: 26,
    GOLD_ORE: 27,
    COPPER_ORE: 28,
    IRON_PICKAXE: 29,
    COPPER_INGOT: 30,
    COPPER_BLOCK: 31,
    GOLD_INGOT: 32,
    GOLDEN_APPLE: 33,
    SNOW: 34,
    IRON_BLOCK: 35,
    GOLD_BLOCK: 36,
    COBBLESTONE: 37,
    BONE: 38,
    ARROW: 39,
    CHEST: 40,
    BIRCH_WOOD: 41,
    BIRCH_LEAVES: 42,
    BIRCH_PLANKS: 43,
    SAND: 44,
    GRAVEL: 45,
    GLASS: 46,
    FLINT: 47,
    FLINT_AND_STEEL: 48,
    WOODEN_SWORD: 49,
    STONE_SWORD: 50,
    IRON_SWORD: 51,
    WOODEN_SHOVEL: 52,
    STONE_SHOVEL: 53,
    IRON_SHOVEL: 54,
    SNOWBALL: 55,
    IRON_HELMET: 56,
    IRON_CHESTPLATE: 57,
    IRON_LEGGINGS: 58,
    IRON_BOOTS: 59,
    TORCH: 60
};

// Fuel values (how many items each fuel can smelt)
const FUEL_VALUES = {
    [BLOCK.WOOD]: 1.5,
    [BLOCK.PLANKS]: 1.5,
    [BLOCK.STICK]: 0.5,
    [BLOCK.WOODEN_PICKAXE]: 1,
    [BLOCK.COAL]: 8
};

// Block colors
const BLOCK_COLORS = {
    [BLOCK.DIRT]: { top: '#8b6b4a', bottom: '#6b5035', border: '#5a4025' },
    [BLOCK.GRASS]: { top: '#5a8f3e', middle: '#8b6b4a', bottom: '#6b5035', border: '#4a7a2e' },
    [BLOCK.STONE]: { top: '#8a8a8a', bottom: '#5a5a5a', border: '#4a4a4a' },
    [BLOCK.WOOD]: { top: '#9e7142', bottom: '#7a5530', border: '#5a4020' },
    [BLOCK.LEAVES]: { top: '#4a9a3e', bottom: '#3a7a2e', border: '#2a5a1e' },
    [BLOCK.COAL]: { top: '#4a4a4a', bottom: '#2a2a2a', border: '#1a1a1a', ore: '#1a1a1a' },
    [BLOCK.IRON]: { top: '#8a8a8a', bottom: '#5a5a5a', border: '#4a4a4a', ore: '#d4a574' },
    [BLOCK.PLANKS]: { top: '#c9a066', bottom: '#a67c42', border: '#8a5a2a' },
    [BLOCK.CRAFTING_TABLE]: { top: '#c9a066', bottom: '#8a5a2a', border: '#6a4a1a' },
    [BLOCK.STICK]: { top: '#b8956c', bottom: '#8a6a42', border: '#6a4a22' },
    [BLOCK.WOODEN_PICKAXE]: { top: '#c9a066', bottom: '#8a6a42', border: '#6a4a22' },
    [BLOCK.STONE_PICKAXE]: { top: '#8a8a8a', bottom: '#5a5a5a', border: '#4a4a4a' },
    [BLOCK.FURNACE]: { top: '#6a6a6a', bottom: '#4a4a4a', border: '#3a3a3a' },
    [BLOCK.IRON_INGOT]: { top: '#e8d8c8', bottom: '#c8b8a8', border: '#a89888' },
    [BLOCK.WOOL]: { top: '#f5f0e8', bottom: '#e8e0d8', border: '#d0c8c0' },  // Cream/off-white wool
    [BLOCK.SHEARS]: { top: '#c0c0c0', bottom: '#909090', border: '#707070' },
    [BLOCK.MOSSY_COBBLESTONE]: { top: '#5a6a5a', bottom: '#4a5a4a', border: '#3a4a3a' },
    [BLOCK.SPAWNER]: { top: '#2a2a3a', bottom: '#1a1a2a', border: '#0a0a1a' },
    [BLOCK.BOW]: { top: '#8a6a42', bottom: '#6a4a22', border: '#4a3a12' },
    [BLOCK.APPLE]: { top: '#e63946', bottom: '#9d0208', border: '#6a040f' },
    [BLOCK.WATER]: { top: '#3a7ca5', bottom: '#2a5c85', border: '#1a4c75' },
    [BLOCK.VINE]: { top: '#2a5a2a', bottom: '#1a4a1a', border: '#0a3a0a' },
    [BLOCK.STRING]: { top: '#e8e8e8', bottom: '#d0d0d0', border: '#b0b0b0' },
    [BLOCK.SPIDER_EYE]: { top: '#8b0000', bottom: '#5a0000', border: '#3a0000' },
    [BLOCK.RAW_MEAT]: { top: '#e85a5a', bottom: '#c44a4a', border: '#a43a3a' },
    [BLOCK.COOKED_MEAT]: { top: '#8b5a2b', bottom: '#6b4a1b', border: '#4b3a0b' },
    [BLOCK.GOLD_ORE]: { top: '#8a8a8a', bottom: '#6a6a6a', border: '#5a5a5a' },
    [BLOCK.COPPER_ORE]: { top: '#8a8a8a', bottom: '#6a6a6a', border: '#5a5a5a' },
    [BLOCK.IRON_PICKAXE]: { top: '#d0d0d0', bottom: '#a0a0a0', border: '#808080' },
    [BLOCK.COPPER_INGOT]: { top: '#e07840', bottom: '#c06030', border: '#a04020' },
    [BLOCK.COPPER_BLOCK]: { top: '#e07840', bottom: '#c06030', border: '#a04020' },
    [BLOCK.GOLD_INGOT]: { top: '#ffd700', bottom: '#daa520', border: '#b8860b' },
    [BLOCK.GOLDEN_APPLE]: { top: '#ffd700', bottom: '#daa520', border: '#b8860b' },
    [BLOCK.SNOW]: { top: '#ffffff', bottom: '#e8e8e8', border: '#d0d0d0' },
    [BLOCK.IRON_BLOCK]: { top: '#e8e0d8', bottom: '#c8c0b8', border: '#a8a098' },
    [BLOCK.GOLD_BLOCK]: { top: '#ffd700', bottom: '#daa520', border: '#b8860b' },
    [BLOCK.COBBLESTONE]: { top: '#7a7a7a', bottom: '#5a5a5a', border: '#4a4a4a' },
    [BLOCK.BONE]: { top: '#f5f5dc', bottom: '#e8e8d0', border: '#d0d0b8' },
    [BLOCK.ARROW]: { top: '#8b4513', bottom: '#654321', border: '#4a3520' },
    [BLOCK.CHEST]: { top: '#8b5a2b', bottom: '#6b4423', border: '#4a3020' },
    [BLOCK.BIRCH_WOOD]: { top: '#f5f5f0', bottom: '#e8e8e0', border: '#2a2a2a' },
    [BLOCK.BIRCH_LEAVES]: { top: '#2d5a2d', bottom: '#1a4a1a', border: '#0a3a0a' },
    [BLOCK.BIRCH_PLANKS]: { top: '#f0e8d8', bottom: '#e0d8c8', border: '#c8c0b0' },
    [BLOCK.SAND]: { top: '#e8d8a0', bottom: '#d8c890', border: '#c8b880' },
    [BLOCK.GRAVEL]: { top: '#8a8a8a', bottom: '#6a6a6a', border: '#5a5a5a' },
    [BLOCK.GLASS]: { top: '#a0d8f0', bottom: '#90c8e0', border: '#80b8d0' },
    [BLOCK.FLINT]: { top: '#3a3a3a', bottom: '#2a2a2a', border: '#1a1a1a' },
    [BLOCK.FLINT_AND_STEEL]: { top: '#5a5a5a', bottom: '#4a4a4a', border: '#3a3a3a' },
    [BLOCK.WOODEN_SWORD]: { top: '#c4a574', bottom: '#a08050', border: '#806040', blade: '#c4a574', handle: '#8a6a3a' },
    [BLOCK.STONE_SWORD]: { top: '#8a8a8a', bottom: '#6a6a6a', border: '#5a5a5a', blade: '#9a9a9a', handle: '#8a6a3a' },
    [BLOCK.IRON_SWORD]: { top: '#d8d8d8', bottom: '#b0b0b0', border: '#909090', blade: '#e0e0e0', handle: '#8a6a3a' },
    [BLOCK.WOODEN_SHOVEL]: { top: '#c4a574', bottom: '#a08050', border: '#806040', head: '#c4a574', handle: '#8a6a3a' },
    [BLOCK.STONE_SHOVEL]: { top: '#8a8a8a', bottom: '#6a6a6a', border: '#5a5a5a', head: '#9a9a9a', handle: '#8a6a3a' },
    [BLOCK.IRON_SHOVEL]: { top: '#d8d8d8', bottom: '#b0b0b0', border: '#909090', head: '#e0e0e0', handle: '#8a6a3a' },
    [BLOCK.SNOWBALL]: { top: '#ffffff', bottom: '#e8e8e8', border: '#d0d0d0' },
    [BLOCK.IRON_HELMET]: { top: '#d8d8d8', bottom: '#b0b0b0', border: '#909090' },
    [BLOCK.IRON_CHESTPLATE]: { top: '#d8d8d8', bottom: '#b0b0b0', border: '#909090' },
    [BLOCK.IRON_LEGGINGS]: { top: '#d8d8d8', bottom: '#b0b0b0', border: '#909090' },
    [BLOCK.IRON_BOOTS]: { top: '#d8d8d8', bottom: '#b0b0b0', border: '#909090' },
    [BLOCK.TORCH]: { top: '#ffcc00', bottom: '#8B4513', border: '#5a3a0a' }
};

// ==================== GAME STATE ====================
const game = {
    screens: {
        mainMenu: null,
        settingsMenu: null,
        gameScreen: null
    },
    canvas: null,
    ctx: null,
    world: [],
    biomes: [],  // Store biome type for each x position
    player: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 24,
        height: 48,
        onGround: false,
        selectedBlock: BLOCK.DIRT,
        health: 20,  // 10 hearts = 20 half-hearts
        maxHealth: 20,
        invincibleTimer: 0,  // Invincibility frames after being hit
        lastY: 0,  // For fall damage calculation
        absorptionHearts: 0,  // Golden apple bonus hearts
        absorptionTimer: 0,   // Time remaining for absorption
        isFlying: false,      // Creative mode flying
        lastSpacePress: 0     // For double-space detection
    },
    // Equipment slots
    equipment: {
        helmet: { block: BLOCK.AIR, count: 0 },
        backpack: { block: BLOCK.AIR, count: 0 },
        chestplate: { block: BLOCK.AIR, count: 0 },
        leggings: { block: BLOCK.AIR, count: 0 },
        boots: { block: BLOCK.AIR, count: 0 }
    },
    camera: {
        x: 0,
        y: 0
    },
    keys: {
        left: false,
        right: false,
        jump: false,
        down: false
    },
    mouse: {
        x: 0,
        y: 0,
        leftDown: false,
        rightDown: false
    },
    controls: {
        left: 'KeyA',
        right: 'KeyD',
        jump: 'Space',
        inventory: 'KeyE'
    },
    isRebinding: false,
    rebindingAction: null,
    isPaused: false,
    isPlaying: false,
    isGameOver: false,
    isInventoryOpen: false,
    gameMode: 'survival',  // 'survival' or 'creative'
    deathCause: '',  // Cause of death for game over message
    // Day/Night cycle (5 minute total cycle = 300 seconds)
    dayNightCycle: {
        time: 0,           // Current time in ticks (0 = dawn)
        dayLength: 9000,   // 2.5 minutes of day (150 sec * 60 fps)
        nightLength: 9000, // 2.5 minutes of night (150 sec * 60 fps)
        isNight: false
    },
    hasSavedWorld: false,
    spawnPoint: { x: 0, y: 0 },
    inventory: [],      // Main inventory (27 slots)
    hotbar: [],         // Hotbar (10 slots)
    selectedHotbarSlot: 0,
    craftingGrid: [],   // 2x2 crafting grid (4 slots)
    craftingGrid3x3: [], // 3x3 crafting grid (9 slots) for crafting table
    craftingResult: { block: BLOCK.AIR, count: 0 },
    heldItem: { block: BLOCK.AIR, count: 0 },  // Item being dragged/held
    usingCraftingTable: false,  // Whether using 3x3 crafting table
    furnaceOpen: false,
    furnacePos: null,  // Position of open furnace {x, y}
    furnaces: {},  // Store furnace data by position "x,y"
    currentFurnace: null,  // Reference to currently open furnace data
    entities: [],  // Store all entities (sheep, etc.)
    projectiles: [],  // Store arrows and other projectiles
    spawners: {},  // Store spawner data by position "x,y"
    chests: {},  // Store chest data by position "x,y"
    chestOpen: false,
    chestPos: null,  // Position of open chest {x, y}
    currentChest: null  // Reference to currently open chest data
};

// ==================== INITIALIZATION ====================
function init() {
    // Get DOM elements
    game.screens.mainMenu = document.getElementById('main-menu');
    game.screens.settingsMenu = document.getElementById('settings-menu');
    game.screens.gameScreen = document.getElementById('game-screen');
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');

    // Check for saved world
    checkSavedWorld();

    // Load saved controls
    loadControls();
    
    // Load custom block textures
    loadCustomBlockTextures();

    // Setup event listeners
    setupMenuListeners();
    setupGameListeners();
    setupControlsListeners();

    // Initialize inventory
    initInventory();

    // Initial canvas resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create animated background blocks
    createFloatingBlocks();
}

function checkSavedWorld() {
    const savedWorld = localStorage.getItem('crafterWorld');
    game.hasSavedWorld = savedWorld !== null;
    
    const joinBtn = document.getElementById('btn-join-world');
    if (game.hasSavedWorld) {
        joinBtn.disabled = false;
        joinBtn.querySelector('.btn-hint').textContent = '(Continue)';
    } else {
        joinBtn.disabled = true;
        joinBtn.querySelector('.btn-hint').textContent = '(No saved world)';
    }
}

function createFloatingBlocks() {
    const container = document.querySelector('.floating-blocks');
    const blockTypes = ['dirt', 'stone', 'grass', 'wood'];
    
    for (let i = 0; i < 6; i++) {
        const block = document.createElement('div');
        block.className = 'animated-block';
        block.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: ${getRandomBlockColor(blockTypes[i % blockTypes.length])};
            border: 3px solid rgba(0,0,0,0.3);
            left: ${10 + Math.random() * 80}%;
            top: ${10 + Math.random() * 50}%;
            animation: float ${4 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
            opacity: 0.7;
        `;
        container.appendChild(block);
    }
}

function getRandomBlockColor(type) {
    const colors = {
        dirt: '#8b6b4a',
        stone: '#7a7a7a',
        grass: '#5a8f3e',
        wood: '#9e7142'
    };
    return colors[type] || colors.dirt;
}

function resizeCanvas() {
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
}

// ==================== MENU LISTENERS ====================
function setupMenuListeners() {
    // New World Survival button
    document.getElementById('btn-new-world-survival').addEventListener('click', () => {
        game.gameMode = 'survival';
        generateWorld();
        startGame();
    });

    // New World Creative button
    document.getElementById('btn-new-world-creative').addEventListener('click', () => {
        game.gameMode = 'creative';
        generateWorld();
        initCreativeInventory();
        startGame();
    });

    // Join World button
    document.getElementById('btn-join-world').addEventListener('click', () => {
        if (loadWorld()) {
            startGame();
        }
    });

    // Settings button
    document.getElementById('btn-settings').addEventListener('click', () => {
        showScreen('settings');
    });

    // Settings back button
    document.getElementById('btn-settings-back').addEventListener('click', () => {
        showScreen('menu');
    });

    // Multiplayer button (coming soon)
    document.getElementById('btn-multiplayer').addEventListener('click', () => {
        alert('Multiplayer is coming soon! Stay tuned.');
    });

    // Speedrun button (coming soon)
    document.getElementById('btn-speedrun').addEventListener('click', () => {
        alert('Speedrun mode is coming soon! Stay tuned.');
    });

    // Pause button
    document.getElementById('btn-pause').addEventListener('click', togglePause);

    // Resume button
    document.getElementById('btn-resume').addEventListener('click', togglePause);

    // Save button
    document.getElementById('btn-save').addEventListener('click', () => {
        saveWorld();
        alert('World saved!');
    });

    // Quit button
    document.getElementById('btn-quit').addEventListener('click', () => {
        game.isPlaying = false;
        game.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        showScreen('menu');
        checkSavedWorld();
    });

    // Game Over - Respawn button
    document.getElementById('btn-respawn').addEventListener('click', () => {
        respawnPlayer();
    });

    // Game Over - Quit button
    document.getElementById('btn-gameover-quit').addEventListener('click', () => {
        game.isPlaying = false;
        game.isGameOver = false;
        document.getElementById('gameover-menu').classList.add('hidden');
        showScreen('menu');
        checkSavedWorld();
    });

    // Hotbar slots
    document.querySelectorAll('.hotbar-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            game.player.selectedBlock = BLOCK[slot.dataset.block.toUpperCase()];
        });
    });
}

// ==================== GAME LISTENERS ====================
function setupGameListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!game.isPlaying) return;

        if (e.code === 'Escape') {
            if (game.furnaceOpen) {
                closeFurnace();
            } else if (game.chestOpen) {
                closeChest();
            } else if (game.isInventoryOpen) {
                toggleInventory();
            } else {
                togglePause();
            }
            return;
        }
        
        // Debug: Skip to night/day with N key
        if (e.code === 'KeyN' && !game.isPaused && !game.isInventoryOpen) {
            if (game.dayNightCycle.isNight) {
                game.dayNightCycle.time = 0; // Skip to day
                console.log("Skipped to DAY");
            } else {
                game.dayNightCycle.time = game.dayNightCycle.dayLength; // Skip to night
                console.log("Skipped to NIGHT");
            }
            return;
        }

        // Toggle inventory with E key (or custom key)
        if (e.code === game.controls.inventory) {
            if (!game.isPaused && !game.isGameOver) {
                // If furnace is open, close it
                if (game.furnaceOpen) {
                    closeFurnace();
                    return;
                }
                // If chest is open, close it
                if (game.chestOpen) {
                    closeChest();
                    return;
                }
                // If inventory is open, close it
                if (game.isInventoryOpen) {
                    toggleInventory();
                    return;
                }
                
                // Check if looking at a crafting table or furnace
                const block = getBlockAtMouse();
                if (block.x >= 0 && block.x < WORLD_WIDTH && 
                    block.y >= 0 && block.y < WORLD_HEIGHT) {
                    
                    if (game.world[block.x][block.y] === BLOCK.CRAFTING_TABLE) {
                        // Open 3x3 crafting table
                        openCraftingTable();
                    } else if (game.world[block.x][block.y] === BLOCK.FURNACE) {
                        // Open furnace
                        openFurnace(block.x, block.y);
                    } else if (game.world[block.x][block.y] === BLOCK.CHEST) {
                        // Open chest
                        openChest(block.x, block.y);
                    } else {
                        toggleInventory();
                    }
                } else {
                    toggleInventory();
                }
            }
            return;
        }

        if (game.isPaused || game.isInventoryOpen) return;

        if (e.code === game.controls.left) game.keys.left = true;
        if (e.code === game.controls.right) game.keys.right = true;
        if (e.code === game.controls.jump) {
            game.keys.jump = true;
            
            // Double-space to toggle flying in creative mode
            if (game.gameMode === 'creative') {
                const now = Date.now();
                if (now - game.player.lastSpacePress < 300) {  // 300ms window for double-tap
                    game.player.isFlying = !game.player.isFlying;
                    game.player.vy = 0;  // Reset velocity when toggling
                }
                game.player.lastSpacePress = now;
            }
        }
        
        // Shift to descend while flying
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            game.keys.down = true;
        }

        // Hotbar number keys (1-9 for slots 0-8, 0 for slot 9)
        if (e.code >= 'Digit1' && e.code <= 'Digit9') {
            const slot = parseInt(e.code.replace('Digit', '')) - 1;
            selectHotbarSlot(slot);
        } else if (e.code === 'Digit0') {
            selectHotbarSlot(9);
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === game.controls.left) game.keys.left = false;
        if (e.code === game.controls.right) game.keys.right = false;
        if (e.code === game.controls.jump) game.keys.jump = false;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') game.keys.down = false;
    });

    // Mouse controls
    game.canvas.addEventListener('mousemove', (e) => {
        game.mouse.x = e.clientX;
        game.mouse.y = e.clientY;
    });

    game.canvas.addEventListener('mousedown', (e) => {
        if (!game.isPlaying || game.isPaused) return;
        
        if (e.button === 0) {
            game.mouse.leftDown = true;
            // Try to attack entity first, then break block
            if (!attackEntity()) {
                breakBlock();
            }
        } else if (e.button === 2) {
            game.mouse.rightDown = true;
            // Try to shear sheep first, then place block
            if (!shearSheep()) {
                placeBlock();
            }
        }
    });

    game.canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) game.mouse.leftDown = false;
        if (e.button === 2) game.mouse.rightDown = false;
    });

    // Prevent context menu
    game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

function selectHotbarSlot(index) {
    if (index >= 0 && index < 10) {
        game.selectedHotbarSlot = index;
        
        // Update selected block from hotbar
        const item = game.hotbar[index];
        if (item && item.block !== BLOCK.AIR) {
            game.player.selectedBlock = item.block;
        }
        
        // Update UI
        const slots = document.querySelectorAll('#game-ui .hotbar-slot');
        slots.forEach((s, i) => {
            s.classList.remove('selected');
            if (i === index) {
                s.classList.add('selected');
            }
        });
    }
}

// ==================== CONTROLS REBINDING ====================
function setupControlsListeners() {
    // Get all key bind buttons
    const keyBindButtons = document.querySelectorAll('.key-bind');
    
    keyBindButtons.forEach(button => {
        const action = button.dataset.action;
        
        // Skip mouse actions (break and place)
        if (action === 'break' || action === 'place') {
            button.style.cursor = 'default';
            button.style.opacity = '0.6';
            return;
        }
        
        button.addEventListener('click', () => {
            startRebinding(action, button);
        });
    });

    // Listen for key press during rebinding
    document.addEventListener('keydown', handleRebindKey);
}

function startRebinding(action, button) {
    // If already rebinding, cancel it
    if (game.isRebinding) {
        cancelRebinding();
    }
    
    game.isRebinding = true;
    game.rebindingAction = action;
    
    // Highlight the button
    button.classList.add('rebinding');
    button.textContent = 'Press a key...';
}

function handleRebindKey(e) {
    if (!game.isRebinding) return;
    
    e.preventDefault();
    
    // Cancel with Escape
    if (e.code === 'Escape') {
        cancelRebinding();
        return;
    }
    
    // Get the action being rebound
    const action = game.rebindingAction;
    
    // Check if key is already used by another action
    for (const [existingAction, existingKey] of Object.entries(game.controls)) {
        if (existingKey === e.code && existingAction !== action) {
            // Swap the keys
            game.controls[existingAction] = game.controls[action];
            updateKeyBindButton(existingAction);
            break;
        }
    }
    
    // Set the new key
    game.controls[action] = e.code;
    
    // Save controls
    saveControls();
    
    // Update the button display
    updateKeyBindButton(action);
    
    // End rebinding
    game.isRebinding = false;
    game.rebindingAction = null;
    
    // Remove rebinding class from all buttons
    document.querySelectorAll('.key-bind').forEach(btn => {
        btn.classList.remove('rebinding');
    });
}

function cancelRebinding() {
    if (!game.isRebinding) return;
    
    // Restore the button text
    updateKeyBindButton(game.rebindingAction);
    
    game.isRebinding = false;
    game.rebindingAction = null;
    
    // Remove rebinding class from all buttons
    document.querySelectorAll('.key-bind').forEach(btn => {
        btn.classList.remove('rebinding');
    });
}

function updateKeyBindButton(action) {
    const button = document.querySelector(`.key-bind[data-action="${action}"]`);
    if (button) {
        button.textContent = getKeyDisplayName(game.controls[action]);
        button.classList.remove('rebinding');
    }
}

function getKeyDisplayName(code) {
    // Convert key codes to readable names
    const keyNames = {
        'Space': 'SPACE',
        'ShiftLeft': 'L-SHIFT',
        'ShiftRight': 'R-SHIFT',
        'ControlLeft': 'L-CTRL',
        'ControlRight': 'R-CTRL',
        'AltLeft': 'L-ALT',
        'AltRight': 'R-ALT',
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'Enter': 'ENTER',
        'Tab': 'TAB',
        'Backspace': 'BACKSPACE'
    };
    
    if (keyNames[code]) {
        return keyNames[code];
    }
    
    // Handle letter keys (KeyA -> A)
    if (code.startsWith('Key')) {
        return code.replace('Key', '');
    }
    
    // Handle digit keys (Digit1 -> 1)
    if (code.startsWith('Digit')) {
        return code.replace('Digit', '');
    }
    
    // Handle numpad keys
    if (code.startsWith('Numpad')) {
        return 'NUM ' + code.replace('Numpad', '');
    }
    
    return code;
}

function saveControls() {
    localStorage.setItem('crafterControls', JSON.stringify(game.controls));
}

function loadControls() {
    const savedControls = localStorage.getItem('crafterControls');
    if (savedControls) {
        try {
            const controls = JSON.parse(savedControls);
            game.controls = { ...game.controls, ...controls };
        } catch (e) {
            console.error('Error loading controls:', e);
        }
    }
    
    // Update all key bind buttons to show current controls
    updateAllKeyBindButtons();
}

function updateAllKeyBindButtons() {
    const actions = ['left', 'right', 'jump', 'inventory'];
    actions.forEach(action => {
        updateKeyBindButton(action);
    });
}

// ==================== SCREEN MANAGEMENT ====================
function showScreen(screen) {
    game.screens.mainMenu.classList.remove('active');
    game.screens.settingsMenu.classList.remove('active');
    game.screens.gameScreen.classList.remove('active');

    switch (screen) {
        case 'menu':
            game.screens.mainMenu.classList.add('active');
            break;
        case 'settings':
            game.screens.settingsMenu.classList.add('active');
            break;
        case 'game':
            game.screens.gameScreen.classList.add('active');
            break;
    }
}

function togglePause() {
    if (game.isGameOver) return; // Can't pause during game over
    
    game.isPaused = !game.isPaused;
    const pauseMenu = document.getElementById('pause-menu');
    
    if (game.isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
    }
}

function triggerGameOver(cause) {
    game.isGameOver = true;
    game.isPaused = true;
    game.deathCause = cause || 'void';
    
    // Set death message based on cause
    const messageElement = document.querySelector('#gameover-menu .gameover-message');
    if (messageElement) {
        switch (game.deathCause) {
            case 'fall':
                messageElement.textContent = 'You fell...';
                break;
            case 'zombie':
                messageElement.textContent = 'You were killed by a Zombie!';
                break;
            case 'spider':
                messageElement.textContent = 'You were bitten!';
                break;
            case 'skeleton':
                messageElement.textContent = 'You were sniped!';
                break;
            case 'void':
            default:
                messageElement.textContent = 'You fell into the void...';
                break;
        }
    }
    
    document.getElementById('gameover-menu').classList.remove('hidden');
}

function respawnPlayer() {
    game.isGameOver = false;
    game.isPaused = false;
    document.getElementById('gameover-menu').classList.add('hidden');
    
    // Reset player to spawn point
    game.player.x = game.spawnPoint.x;
    game.player.y = game.spawnPoint.y;
    game.player.vx = 0;
    game.player.vy = 0;
    game.player.onGround = false;
    game.player.lastY = game.player.y;
    
    // Reset health
    resetPlayerHealth();
}

// ==================== INVENTORY ====================
function initInventory() {
    // Initialize inventory slots (27 slots = 3 rows of 9)
    game.inventory = [];
    for (let i = 0; i < 27; i++) {
        game.inventory.push({ block: BLOCK.AIR, count: 0 });
    }

    // Initialize hotbar (10 slots) - start empty
    game.hotbar = [];
    for (let i = 0; i < 10; i++) {
        game.hotbar.push({ block: BLOCK.AIR, count: 0 });
    }

    // Initialize crafting grid (2x2 = 4 slots)
    game.craftingGrid = [];
    for (let i = 0; i < 4; i++) {
        game.craftingGrid.push({ block: BLOCK.AIR, count: 0 });
    }
    
    // Initialize 3x3 crafting grid (9 slots)
    game.craftingGrid3x3 = [];
    for (let i = 0; i < 9; i++) {
        game.craftingGrid3x3.push({ block: BLOCK.AIR, count: 0 });
    }
    
    game.craftingResult = { block: BLOCK.AIR, count: 0 };
    game.usingCraftingTable = false;

    // Generate inventory UI
    generateInventoryUI();
}

function initCreativeInventory() {
    // Start with empty inventory in creative mode
    // Players can get items from the creative inventory menu (press E)
}

function generateInventoryUI() {
    const inventoryGrid = document.getElementById('inventory-grid');
    const inventoryHotbar = document.getElementById('inventory-hotbar');
    const craftingGrid = document.getElementById('crafting-grid');
    const craftingResult = document.getElementById('crafting-result');
    
    // Clear existing
    inventoryGrid.innerHTML = '';
    inventoryHotbar.innerHTML = '';
    craftingGrid.innerHTML = '';
    craftingResult.innerHTML = '';

    // Generate main inventory slots
    for (let i = 0; i < 27; i++) {
        const slot = createInventorySlot(i, 'inventory');
        inventoryGrid.appendChild(slot);
    }

    // Generate hotbar slots in inventory view
    for (let i = 0; i < 10; i++) {
        const slot = createInventorySlot(i, 'hotbar');
        if (i === game.selectedHotbarSlot) {
            slot.classList.add('selected');
        }
        inventoryHotbar.appendChild(slot);
    }

    // Generate crafting grid (2x2 or 3x3 depending on crafting table)
    const gridSize = game.usingCraftingTable ? 9 : 4;
    craftingGrid.className = game.usingCraftingTable ? 'crafting-grid grid-3x3' : 'crafting-grid';
    
    for (let i = 0; i < gridSize; i++) {
        const slot = createCraftingSlot(i);
        craftingGrid.appendChild(slot);
    }
    
    // Update crafting section title
    const craftingTitle = document.querySelector('.crafting-section h3');
    if (craftingTitle) {
        craftingTitle.textContent = game.usingCraftingTable ? 'Crafting Table' : 'Crafting';
    }

    // Generate crafting result slot
    const resultSlot = createResultSlot();
    craftingResult.appendChild(resultSlot);

    // Update equipment slots
    updateEquipmentSlots();

    // Check for crafting recipe
    checkCraftingRecipe();

    // Update held item cursor
    updateHeldItemCursor();
}

// Equipment slot types and what items can go in them
const EQUIPMENT_SLOTS = {
    helmet: [BLOCK.IRON_HELMET],
    backpack: [],    // Backpack items (to be added later)
    chestplate: [BLOCK.IRON_CHESTPLATE],
    leggings: [BLOCK.IRON_LEGGINGS],
    boots: [BLOCK.IRON_BOOTS]
};

// Armor defense values (how much damage is reduced)
const ARMOR_DEFENSE = {
    [BLOCK.IRON_HELMET]: 2,      // Reduces 2 damage (1 heart)
    [BLOCK.IRON_CHESTPLATE]: 6,  // Reduces 6 damage (3 hearts)
    [BLOCK.IRON_LEGGINGS]: 5,    // Reduces 5 damage (2.5 hearts)
    [BLOCK.IRON_BOOTS]: 2        // Reduces 2 damage (1 heart)
};
// Total iron armor: 15 defense points

function canEquipItem(slotType, blockType) {
    const allowedItems = EQUIPMENT_SLOTS[slotType];
    return allowedItems && allowedItems.includes(blockType);
}

function updateEquipmentSlots() {
    const slotTypes = ['helmet', 'backpack', 'chestplate', 'leggings', 'boots'];
    
    slotTypes.forEach(slotType => {
        const slotElement = document.getElementById(`slot-${slotType}`);
        if (!slotElement) return;
        
        const item = game.equipment[slotType];
        
        // Remove old item preview if exists
        const oldPreview = slotElement.querySelector('.block-preview');
        if (oldPreview) oldPreview.remove();
        
        if (item && item.block !== BLOCK.AIR && item.count > 0) {
            slotElement.classList.add('has-item');
            
            const preview = createBlockPreview(item.block);
            slotElement.appendChild(preview);
        } else {
            slotElement.classList.remove('has-item');
        }
        
        // Add click handler
        slotElement.onclick = () => handleEquipmentSlotClick(slotType);
    });
}

function handleEquipmentSlotClick(slotType) {
    const equipmentItem = game.equipment[slotType];
    
    if (game.heldItem && game.heldItem.block !== BLOCK.AIR) {
        // Trying to place held item in equipment slot
        if (canEquipItem(slotType, game.heldItem.block)) {
            // Swap items
            const temp = { ...equipmentItem };
            game.equipment[slotType] = { ...game.heldItem };
            game.heldItem = temp.block !== BLOCK.AIR ? temp : null;
            updateEquipmentSlots();
            updateCreativeEquipmentSlots();
            updateHeldItemCursor();
        }
        // If can't equip, do nothing (item stays held)
    } else if (equipmentItem && equipmentItem.block !== BLOCK.AIR) {
        // Pick up equipped item
        game.heldItem = { ...equipmentItem };
        game.equipment[slotType] = { block: BLOCK.AIR, count: 0 };
        updateEquipmentSlots();
        updateCreativeEquipmentSlots();
        updateHeldItemCursor();
    }
}

function updateCreativeEquipmentSlots() {
    const slotTypes = ['helmet', 'backpack', 'chestplate', 'leggings', 'boots'];
    
    slotTypes.forEach(slotType => {
        const slotElement = document.getElementById(`creative-slot-${slotType}`);
        if (!slotElement) return;
        
        const item = game.equipment[slotType];
        
        // Remove old item preview if exists
        const oldPreview = slotElement.querySelector('.block-preview');
        if (oldPreview) oldPreview.remove();
        
        if (item && item.block !== BLOCK.AIR && item.count > 0) {
            slotElement.classList.add('has-item');
            
            const preview = createBlockPreview(item.block);
            slotElement.appendChild(preview);
        } else {
            slotElement.classList.remove('has-item');
        }
        
        // Add click handler
        slotElement.onclick = () => handleEquipmentSlotClick(slotType);
    });
}

function createInventorySlot(index, type) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.index = index;
    slot.dataset.type = type;

    const items = type === 'hotbar' ? game.hotbar : game.inventory;
    const item = items[index];

    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        slot.classList.add('has-item');
        
        const blockDiv = createBlockPreview(item.block);
        blockDiv.classList.add('slot-block');
        slot.appendChild(blockDiv);

        if (item.count > 1) {
            const countSpan = document.createElement('span');
            countSpan.className = 'slot-count';
            countSpan.textContent = item.count;
            slot.appendChild(countSpan);
        }
        
        // Add tooltip with item name
        const itemName = getBlockDisplayName(item.block);
        if (itemName) {
            slot.addEventListener('mouseenter', (e) => showItemTooltip(e, itemName));
            slot.addEventListener('mouseleave', hideItemTooltip);
            slot.addEventListener('mousemove', moveItemTooltip);
        }
    }

    slot.addEventListener('click', () => handleInventoryClick(index, type));

    return slot;
}

function showItemTooltip(e, itemName) {
    let tooltip = document.getElementById('item-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'item-tooltip';
        tooltip.className = 'item-tooltip';
        document.body.appendChild(tooltip);
    }
    tooltip.textContent = itemName;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
}

function hideItemTooltip() {
    const tooltip = document.getElementById('item-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function moveItemTooltip(e) {
    const tooltip = document.getElementById('item-tooltip');
    if (tooltip) {
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
    }
}

function getBlockClassName(blockType) {
    switch (blockType) {
        case BLOCK.DIRT: return 'dirt';
        case BLOCK.GRASS: return 'grass';
        case BLOCK.STONE: return 'stone';
        case BLOCK.WOOD: return 'wood';
        case BLOCK.LEAVES: return 'leaves';
        case BLOCK.COAL: return 'coal';
        case BLOCK.IRON: return 'iron';
        case BLOCK.PLANKS: return 'planks';
        case BLOCK.CRAFTING_TABLE: return 'crafting-table';
        case BLOCK.STICK: return 'stick';
        case BLOCK.WOODEN_PICKAXE: return 'wooden-pickaxe';
        case BLOCK.STONE_PICKAXE: return 'stone-pickaxe';
        case BLOCK.FURNACE: return 'furnace';
        case BLOCK.IRON_INGOT: return 'iron-ingot';
        case BLOCK.WOOL: return 'wool';
        case BLOCK.SHEARS: return 'shears';
        case BLOCK.MOSSY_COBBLESTONE: return 'mossy-cobblestone';
        case BLOCK.SPAWNER: return 'spawner';
        case BLOCK.BOW: return 'bow';
        case BLOCK.APPLE: return 'apple';
        case BLOCK.WATER: return 'water';
        case BLOCK.VINE: return 'vine';
        case BLOCK.STRING: return 'string';
        case BLOCK.SPIDER_EYE: return 'spider-eye';
        case BLOCK.RAW_MEAT: return 'raw-meat';
        case BLOCK.COOKED_MEAT: return 'cooked-meat';
        case BLOCK.GOLD_ORE: return 'gold-ore';
        case BLOCK.COPPER_ORE: return 'copper-ore';
        case BLOCK.IRON_PICKAXE: return 'iron-pickaxe';
        case BLOCK.COPPER_INGOT: return 'copper-ingot';
        case BLOCK.COPPER_BLOCK: return 'copper-block';
        case BLOCK.GOLD_INGOT: return 'gold-ingot';
        case BLOCK.GOLDEN_APPLE: return 'golden-apple';
        case BLOCK.SNOW: return 'snow';
        case BLOCK.IRON_BLOCK: return 'iron-block';
        case BLOCK.GOLD_BLOCK: return 'gold-block';
        case BLOCK.COBBLESTONE: return 'cobblestone';
        case BLOCK.BONE: return 'bone';
        case BLOCK.ARROW: return 'arrow';
        case BLOCK.CHEST: return 'chest';
        case BLOCK.BIRCH_WOOD: return 'birch-wood';
        case BLOCK.BIRCH_LEAVES: return 'birch-leaves';
        case BLOCK.BIRCH_PLANKS: return 'birch-planks';
        case BLOCK.SAND: return 'sand';
        case BLOCK.GRAVEL: return 'gravel';
        case BLOCK.GLASS: return 'glass';
        case BLOCK.FLINT: return 'flint';
        case BLOCK.FLINT_AND_STEEL: return 'flint-and-steel';
        case BLOCK.WOODEN_SWORD: return 'wooden-sword';
        case BLOCK.STONE_SWORD: return 'stone-sword';
        case BLOCK.IRON_SWORD: return 'iron-sword';
        case BLOCK.WOODEN_SHOVEL: return 'wooden-shovel';
        case BLOCK.STONE_SHOVEL: return 'stone-shovel';
        case BLOCK.IRON_SHOVEL: return 'iron-shovel';
        case BLOCK.SNOWBALL: return 'snowball';
        case BLOCK.IRON_HELMET: return 'iron-helmet';
        case BLOCK.IRON_CHESTPLATE: return 'iron-chestplate';
        case BLOCK.IRON_LEGGINGS: return 'iron-leggings';
        case BLOCK.IRON_BOOTS: return 'iron-boots';
        case BLOCK.TORCH: return 'torch';
        default: return '';
    }
}

function getBlockDisplayName(blockType) {
    switch (blockType) {
        case BLOCK.AIR: return '';
        case BLOCK.DIRT: return 'Dirt';
        case BLOCK.GRASS: return 'Grass';
        case BLOCK.STONE: return 'Stone';
        case BLOCK.WOOD: return 'Oak Wood';
        case BLOCK.LEAVES: return 'Oak Leaves';
        case BLOCK.COAL: return 'Coal Ore';
        case BLOCK.IRON: return 'Iron Ore';
        case BLOCK.PLANKS: return 'Oak Planks';
        case BLOCK.CRAFTING_TABLE: return 'Crafting Table';
        case BLOCK.STICK: return 'Stick';
        case BLOCK.WOODEN_PICKAXE: return 'Wooden Pickaxe';
        case BLOCK.STONE_PICKAXE: return 'Stone Pickaxe';
        case BLOCK.FURNACE: return 'Furnace';
        case BLOCK.IRON_INGOT: return 'Iron Ingot';
        case BLOCK.WOOL: return 'Wool';
        case BLOCK.SHEARS: return 'Shears';
        case BLOCK.MOSSY_COBBLESTONE: return 'Mossy Cobblestone';
        case BLOCK.SPAWNER: return 'Spawner';
        case BLOCK.BOW: return 'Bow';
        case BLOCK.APPLE: return 'Apple';
        case BLOCK.WATER: return 'Water';
        case BLOCK.VINE: return 'Vine';
        case BLOCK.STRING: return 'String';
        case BLOCK.SPIDER_EYE: return 'Spider Eye';
        case BLOCK.RAW_MEAT: return 'Raw Meat';
        case BLOCK.COOKED_MEAT: return 'Cooked Meat';
        case BLOCK.GOLD_ORE: return 'Gold Ore';
        case BLOCK.COPPER_ORE: return 'Copper Ore';
        case BLOCK.IRON_PICKAXE: return 'Iron Pickaxe';
        case BLOCK.COPPER_INGOT: return 'Copper Ingot';
        case BLOCK.COPPER_BLOCK: return 'Copper Block';
        case BLOCK.GOLD_INGOT: return 'Gold Ingot';
        case BLOCK.GOLDEN_APPLE: return 'Golden Apple';
        case BLOCK.SNOW: return 'Snow';
        case BLOCK.IRON_BLOCK: return 'Iron Block';
        case BLOCK.GOLD_BLOCK: return 'Gold Block';
        case BLOCK.COBBLESTONE: return 'Cobblestone';
        case BLOCK.BONE: return 'Bone';
        case BLOCK.ARROW: return 'Arrow';
        case BLOCK.CHEST: return 'Chest';
        case BLOCK.BIRCH_WOOD: return 'Birch Wood';
        case BLOCK.BIRCH_LEAVES: return 'Birch Leaves';
        case BLOCK.BIRCH_PLANKS: return 'Birch Planks';
        case BLOCK.SAND: return 'Sand';
        case BLOCK.GRAVEL: return 'Gravel';
        case BLOCK.GLASS: return 'Glass';
        case BLOCK.FLINT: return 'Flint';
        case BLOCK.FLINT_AND_STEEL: return 'Flint and Steel';
        case BLOCK.WOODEN_SWORD: return 'Wooden Sword';
        case BLOCK.STONE_SWORD: return 'Stone Sword';
        case BLOCK.IRON_SWORD: return 'Iron Sword';
        case BLOCK.WOODEN_SHOVEL: return 'Wooden Shovel';
        case BLOCK.STONE_SHOVEL: return 'Stone Shovel';
        case BLOCK.IRON_SHOVEL: return 'Iron Shovel';
        case BLOCK.SNOWBALL: return 'Snowball';
        case BLOCK.IRON_HELMET: return 'Iron Helmet';
        case BLOCK.IRON_CHESTPLATE: return 'Iron Chestplate';
        case BLOCK.IRON_LEGGINGS: return 'Iron Leggings';
        case BLOCK.IRON_BOOTS: return 'Iron Boots';
        case BLOCK.TORCH: return 'Torch';
        default: return 'Unknown';
    }
}

function handleInventoryClick(index, type) {
    const items = type === 'hotbar' ? game.hotbar : game.inventory;
    const item = items[index];
    const held = game.heldItem;

    // If holding an item
    if (held.block !== BLOCK.AIR && held.count > 0) {
        // If slot is empty, place held item
        if (item.block === BLOCK.AIR || item.count === 0) {
            items[index] = { block: held.block, count: held.count };
            game.heldItem = { block: BLOCK.AIR, count: 0 };
        }
        // If slot has same item type, stack them
        else if (item.block === held.block && item.count < 64) {
            const canAdd = Math.min(held.count, 64 - item.count);
            item.count += canAdd;
            held.count -= canAdd;
            if (held.count <= 0) {
                game.heldItem = { block: BLOCK.AIR, count: 0 };
            }
        }
        // If slot has different item, swap
        else {
            game.heldItem = { block: item.block, count: item.count };
            items[index] = { block: held.block, count: held.count };
        }
    }
    // Not holding anything - pick up item
    else if (item.block !== BLOCK.AIR && item.count > 0) {
        game.heldItem = { block: item.block, count: item.count };
        items[index] = { block: BLOCK.AIR, count: 0 };
    }

    // If clicking on hotbar, also select it
    if (type === 'hotbar') {
        game.selectedHotbarSlot = index;
        const currentItem = items[index];
        if (currentItem.block !== BLOCK.AIR) {
            game.player.selectedBlock = currentItem.block;
        }
    }

    updateGameHotbar();
    generateInventoryUI();
}

// ==================== CRAFTING SYSTEM ====================
function createCraftingSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'crafting-slot';
    slot.dataset.index = index;

    const grid = game.usingCraftingTable ? game.craftingGrid3x3 : game.craftingGrid;
    const item = grid[index];

    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        slot.classList.add('has-item');
        
        const blockDiv = createBlockPreview(item.block);
        blockDiv.classList.add('slot-block');
        slot.appendChild(blockDiv);

        if (item.count > 1) {
            const countSpan = document.createElement('span');
            countSpan.className = 'slot-count';
            countSpan.textContent = item.count;
            slot.appendChild(countSpan);
        }
    }

    slot.addEventListener('click', () => handleCraftingClick(index));

    return slot;
}

function createResultSlot() {
    const slot = document.createElement('div');
    slot.className = 'result-slot';

    const result = game.craftingResult;

    if (result && result.block !== BLOCK.AIR && result.count > 0) {
        slot.classList.add('has-item');
        
        const blockDiv = createBlockPreview(result.block);
        blockDiv.classList.add('slot-block');
        slot.appendChild(blockDiv);

        if (result.count > 1) {
            const countSpan = document.createElement('span');
            countSpan.className = 'slot-count';
            countSpan.textContent = result.count;
            slot.appendChild(countSpan);
        }
    }

    slot.addEventListener('click', () => handleResultClick());

    return slot;
}

function handleCraftingClick(index) {
    const grid = game.usingCraftingTable ? game.craftingGrid3x3 : game.craftingGrid;
    const craftingItem = grid[index];
    const held = game.heldItem;

    // If holding an item
    if (held.block !== BLOCK.AIR && held.count > 0) {
        // If slot is empty, place one item
        if (craftingItem.block === BLOCK.AIR || craftingItem.count === 0) {
            grid[index] = { block: held.block, count: 1 };
            held.count--;
            if (held.count <= 0) {
                game.heldItem = { block: BLOCK.AIR, count: 0 };
            }
        }
        // If slot has same item type, add one more
        else if (craftingItem.block === held.block) {
            grid[index].count++;
            held.count--;
            if (held.count <= 0) {
                game.heldItem = { block: BLOCK.AIR, count: 0 };
            }
        }
        // If slot has different item, swap
        else {
            const oldItem = { block: craftingItem.block, count: craftingItem.count };
            grid[index] = { block: held.block, count: 1 };
            held.count--;
            game.heldItem = { block: oldItem.block, count: oldItem.count };
            if (held.count > 0) {
                // Add remaining to held
                // This is a bit complex - just add to inventory instead
                addToInventory(held.block, held.count);
            }
        }
    }
    // Not holding anything - pick up item from crafting slot
    else if (craftingItem.block !== BLOCK.AIR && craftingItem.count > 0) {
        game.heldItem = { block: craftingItem.block, count: craftingItem.count };
        grid[index] = { block: BLOCK.AIR, count: 0 };
    }

    generateInventoryUI();
}

function handleResultClick() {
    const result = game.craftingResult;

    // If there's a crafting result, add it to inventory
    if (result.block !== BLOCK.AIR && result.count > 0) {
        if (addToInventory(result.block, result.count)) {
            // Consume crafting ingredients
            consumeCraftingIngredients();
            game.craftingResult = { block: BLOCK.AIR, count: 0 };
            generateInventoryUI();
        }
    }
}

function checkCraftingRecipe() {
    // Get crafting grid contents
    const grid = game.usingCraftingTable ? game.craftingGrid3x3 : game.craftingGrid;
    const gridSize = game.usingCraftingTable ? 9 : 4;
    
    // Count items in grid
    let itemCount = 0;
    let woodCount = 0;
    let planksCount = 0;
    let stoneCount = 0;
    let coalCount = 0;
    let ironCount = 0;
    let stickCount = 0;
    let ironIngotCount = 0;
    
    for (let i = 0; i < gridSize; i++) {
        if (grid[i].block !== BLOCK.AIR && grid[i].count > 0) {
            itemCount++;
            if (grid[i].block === BLOCK.WOOD) woodCount++;
            if (grid[i].block === BLOCK.PLANKS || grid[i].block === BLOCK.BIRCH_PLANKS) planksCount++;
            if (grid[i].block === BLOCK.STONE) stoneCount++;
            if (grid[i].block === BLOCK.COAL) coalCount++;
            if (grid[i].block === BLOCK.IRON) ironCount++;
            if (grid[i].block === BLOCK.STICK) stickCount++;
            if (grid[i].block === BLOCK.IRON_INGOT) ironIngotCount++;
        }
    }
    
    // Helper function to check if a block is any type of planks
    const isPlanks = (block) => block === BLOCK.PLANKS || block === BLOCK.BIRCH_PLANKS;

    // Recipe: 1 Oak Wood anywhere = 4 Oak Planks (works in both 2x2 and 3x3)
    if (itemCount === 1 && woodCount === 1) {
        game.craftingResult = { block: BLOCK.PLANKS, count: 4 };
        return;
    }
    
    // Recipe: 1 Birch Wood anywhere = 4 Birch Planks
    let birchWoodCount = grid.filter(s => s.block === BLOCK.BIRCH_WOOD).length;
    if (itemCount === 1 && birchWoodCount === 1) {
        game.craftingResult = { block: BLOCK.BIRCH_PLANKS, count: 4 };
        return;
    }
    
    // Recipe: 1 Snow Block anywhere = 4 Snowballs
    let snowCount = grid.filter(s => s.block === BLOCK.SNOW).length;
    if (itemCount === 1 && snowCount === 1) {
        game.craftingResult = { block: BLOCK.SNOWBALL, count: 4 };
        return;
    }

    // Recipe: 2 Planks vertically = 4 Sticks
    if (itemCount === 2 && planksCount === 2) {
        // Check vertical patterns in 2x2 grid
        if (!game.usingCraftingTable) {
            // 2x2 grid: slots 0,2 or 1,3 are vertical
            if ((isPlanks(grid[0].block) && isPlanks(grid[2].block) && 
                 grid[1].block === BLOCK.AIR && grid[3].block === BLOCK.AIR) ||
                (isPlanks(grid[1].block) && isPlanks(grid[3].block) && 
                 grid[0].block === BLOCK.AIR && grid[2].block === BLOCK.AIR)) {
                game.craftingResult = { block: BLOCK.STICK, count: 4 };
                return;
            }
        } else {
            // 3x3 grid: check vertical pairs (columns: 0,3,6 | 1,4,7 | 2,5,8)
            const verticalPairs = [
                [0, 3], [3, 6], [0, 6], // left column
                [1, 4], [4, 7], [1, 7], // middle column
                [2, 5], [5, 8], [2, 8]  // right column
            ];
            for (const [a, b] of verticalPairs) {
                if (isPlanks(grid[a].block) && isPlanks(grid[b].block)) {
                    // Check all other slots are empty
                    let otherEmpty = true;
                    for (let i = 0; i < 9; i++) {
                        if (i !== a && i !== b && grid[i].block !== BLOCK.AIR) {
                            otherEmpty = false;
                            break;
                        }
                    }
                    if (otherEmpty) {
                        game.craftingResult = { block: BLOCK.STICK, count: 4 };
                        return;
                    }
                }
            }
        }
    }

    // Recipe: 4 Planks (2x2 full grid) = 1 Crafting Table
    if (!game.usingCraftingTable && itemCount === 4 && planksCount === 4) {
        game.craftingResult = { block: BLOCK.CRAFTING_TABLE, count: 1 };
        return;
    }
    
    // Recipe: 4 Snowballs (2x2 full grid) = 1 Snow Block
    let snowballCount2x2 = grid.filter(s => s.block === BLOCK.SNOWBALL).length;
    if (!game.usingCraftingTable && itemCount === 4 && snowballCount2x2 === 4) {
        game.craftingResult = { block: BLOCK.SNOW, count: 1 };
        return;
    }

    // Recipe: 2 Iron Ingots diagonally = 1 Shears (works in both 2x2 and 3x3)
    if (itemCount === 2 && ironIngotCount === 2) {
        // Check diagonal patterns
        if (!game.usingCraftingTable) {
            // 2x2 grid: check diagonals (0,3) or (1,2)
            if ((grid[0].block === BLOCK.IRON_INGOT && grid[3].block === BLOCK.IRON_INGOT) ||
                (grid[1].block === BLOCK.IRON_INGOT && grid[2].block === BLOCK.IRON_INGOT)) {
                game.craftingResult = { block: BLOCK.SHEARS, count: 1 };
                return;
            }
        } else {
            // 3x3 grid: check various diagonal patterns
            const diagonalPairs = [
                [0, 4], [4, 8], [0, 8],  // main diagonal
                [2, 4], [4, 6], [2, 6],  // anti-diagonal
                [1, 3], [1, 5], [3, 7], [5, 7]  // adjacent diagonals
            ];
            for (const [a, b] of diagonalPairs) {
                if (grid[a].block === BLOCK.IRON_INGOT && grid[b].block === BLOCK.IRON_INGOT) {
                    let otherEmpty = true;
                    for (let i = 0; i < 9; i++) {
                        if (i !== a && i !== b && grid[i].block !== BLOCK.AIR) {
                            otherEmpty = false;
                            break;
                        }
                    }
                    if (otherEmpty) {
                        game.craftingResult = { block: BLOCK.SHEARS, count: 1 };
                        return;
                    }
                }
            }
        }
    }

    // 3x3 Crafting Table recipes
    if (game.usingCraftingTable) {
        // Recipe: 4 Planks in corners of 3x3 = 1 Crafting Table
        if (itemCount === 4 && planksCount === 4) {
            // Check if in 2x2 pattern anywhere
            const patterns = [
                [0, 1, 3, 4], // top-left
                [1, 2, 4, 5], // top-right
                [3, 4, 6, 7], // bottom-left
                [4, 5, 7, 8]  // bottom-right
            ];
            for (const pattern of patterns) {
                let match = true;
                for (const idx of pattern) {
                    if (!isPlanks(grid[idx].block)) {
                        match = false;
                        break;
                    }
                }
                // Check other slots are empty
                if (match) {
                    for (let i = 0; i < 9; i++) {
                        if (!pattern.includes(i) && grid[i].block !== BLOCK.AIR) {
                            match = false;
                            break;
                        }
                    }
                }
                if (match) {
                    game.craftingResult = { block: BLOCK.CRAFTING_TABLE, count: 1 };
                    return;
                }
            }
        }

        // Recipe: Wooden Pickaxe (3 planks on top, 2 sticks below middle)
        // Pattern:  [P][P][P]
        //           [ ][S][ ]
        //           [ ][S][ ]
        if (itemCount === 5 && planksCount === 3 && stickCount === 2) {
            if (isPlanks(grid[0].block) && 
                isPlanks(grid[1].block) && 
                isPlanks(grid[2].block) &&
                grid[4].block === BLOCK.STICK &&
                grid[7].block === BLOCK.STICK &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.WOODEN_PICKAXE, count: 1 };
                return;
            }
        }

        // Recipe: Stone Pickaxe (3 stone/cobblestone on top, 2 sticks below middle)
        // Pattern:  [S][S][S]
        //           [ ][T][ ]
        //           [ ][T][ ]
        let cobbleCount = grid.filter(s => s.block === BLOCK.COBBLESTONE).length;
        const isStoneOrCobble = (block) => block === BLOCK.STONE || block === BLOCK.COBBLESTONE;
        
        if (itemCount === 5 && (stoneCount + cobbleCount) === 3 && stickCount === 2) {
            if (isStoneOrCobble(grid[0].block) && 
                isStoneOrCobble(grid[1].block) && 
                isStoneOrCobble(grid[2].block) &&
                grid[4].block === BLOCK.STICK &&
                grid[7].block === BLOCK.STICK &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.STONE_PICKAXE, count: 1 };
                return;
            }
        }

        // Recipe: Furnace (8 stone/cobblestone in hollow square)
        // Pattern:  [S][S][S]
        //           [S][ ][S]
        //           [S][S][S]
        if (itemCount === 8 && (stoneCount + cobbleCount) === 8) {
            if (isStoneOrCobble(grid[0].block) && 
                isStoneOrCobble(grid[1].block) && 
                isStoneOrCobble(grid[2].block) &&
                isStoneOrCobble(grid[3].block) &&
                grid[4].block === BLOCK.AIR &&
                isStoneOrCobble(grid[5].block) &&
                isStoneOrCobble(grid[6].block) &&
                isStoneOrCobble(grid[7].block) &&
                isStoneOrCobble(grid[8].block)) {
                game.craftingResult = { block: BLOCK.FURNACE, count: 1 };
                return;
            }
        }

        // Recipe: Chest (8 planks in hollow square)
        // Pattern:  [P][P][P]
        //           [P][ ][P]
        //           [P][P][P]
        if (itemCount === 8 && planksCount === 8) {
            if (isPlanks(grid[0].block) && 
                isPlanks(grid[1].block) && 
                isPlanks(grid[2].block) &&
                isPlanks(grid[3].block) &&
                grid[4].block === BLOCK.AIR &&
                isPlanks(grid[5].block) &&
                isPlanks(grid[6].block) &&
                isPlanks(grid[7].block) &&
                isPlanks(grid[8].block)) {
                game.craftingResult = { block: BLOCK.CHEST, count: 1 };
                return;
            }
        }

        // Recipe: Iron Pickaxe (3 iron ingots on top, 2 sticks below middle)
        // Pattern:  [I][I][I]
        //           [ ][T][ ]
        //           [ ][T][ ]
        let ironIngotCount = grid.filter(s => s.block === BLOCK.IRON_INGOT).length;
        if (itemCount === 5 && ironIngotCount === 3 && stickCount === 2) {
            if (grid[0].block === BLOCK.IRON_INGOT && 
                grid[1].block === BLOCK.IRON_INGOT && 
                grid[2].block === BLOCK.IRON_INGOT &&
                grid[4].block === BLOCK.STICK &&
                grid[7].block === BLOCK.STICK &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.IRON_PICKAXE, count: 1 };
                return;
            }
        }

        // Recipe: Bow (3 sticks and 3 string)
        // Pattern:  [ ][S][T]
        //           [S][ ][T]
        //           [ ][S][T]
        let stringCount = grid.filter(s => s.block === BLOCK.STRING).length;
        if (itemCount === 6 && stickCount === 3 && stringCount === 3) {
            if (grid[1].block === BLOCK.STICK && 
                grid[3].block === BLOCK.STICK && 
                grid[7].block === BLOCK.STICK &&
                grid[2].block === BLOCK.STRING &&
                grid[5].block === BLOCK.STRING &&
                grid[8].block === BLOCK.STRING &&
                grid[0].block === BLOCK.AIR &&
                grid[4].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.BOW, count: 1 };
                return;
            }
        }

        // Recipe: Wooden Sword (2 planks + 1 stick vertical)
        // Pattern:  [ ][P][ ]
        //           [ ][P][ ]
        //           [ ][S][ ]
        if (itemCount === 3 && planksCount === 2 && stickCount === 1) {
            if (isPlanks(grid[1].block) && 
                isPlanks(grid[4].block) && 
                grid[7].block === BLOCK.STICK &&
                grid[0].block === BLOCK.AIR &&
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.WOODEN_SWORD, count: 1 };
                return;
            }
        }

        // Recipe: Stone Sword (2 cobblestone + 1 stick vertical)
        // Pattern:  [ ][C][ ]
        //           [ ][C][ ]
        //           [ ][S][ ]
        if (itemCount === 3 && cobbleCount === 2 && stickCount === 1) {
            if (grid[1].block === BLOCK.COBBLESTONE && 
                grid[4].block === BLOCK.COBBLESTONE && 
                grid[7].block === BLOCK.STICK &&
                grid[0].block === BLOCK.AIR &&
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.STONE_SWORD, count: 1 };
                return;
            }
        }

        // Recipe: Iron Sword (2 iron ingots + 1 stick vertical)
        // Pattern:  [ ][I][ ]
        //           [ ][I][ ]
        //           [ ][S][ ]
        if (itemCount === 3 && ironIngotCount === 2 && stickCount === 1) {
            if (grid[1].block === BLOCK.IRON_INGOT && 
                grid[4].block === BLOCK.IRON_INGOT && 
                grid[7].block === BLOCK.STICK &&
                grid[0].block === BLOCK.AIR &&
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.IRON_SWORD, count: 1 };
                return;
            }
        }

        // Recipe: Wooden Shovel (1 plank + 2 sticks vertical)
        // Pattern:  [ ][P][ ]
        //           [ ][S][ ]
        //           [ ][S][ ]
        if (itemCount === 3 && planksCount === 1 && stickCount === 2) {
            if (isPlanks(grid[1].block) && 
                grid[4].block === BLOCK.STICK && 
                grid[7].block === BLOCK.STICK &&
                grid[0].block === BLOCK.AIR &&
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.WOODEN_SHOVEL, count: 1 };
                return;
            }
        }

        // Recipe: Stone Shovel (1 cobblestone + 2 sticks vertical)
        // Pattern:  [ ][C][ ]
        //           [ ][S][ ]
        //           [ ][S][ ]
        if (itemCount === 3 && cobbleCount === 1 && stickCount === 2) {
            if (grid[1].block === BLOCK.COBBLESTONE && 
                grid[4].block === BLOCK.STICK && 
                grid[7].block === BLOCK.STICK &&
                grid[0].block === BLOCK.AIR &&
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.STONE_SHOVEL, count: 1 };
                return;
            }
        }

        // Recipe: Iron Shovel (1 iron ingot + 2 sticks vertical)
        // Pattern:  [ ][I][ ]
        //           [ ][S][ ]
        //           [ ][S][ ]
        if (itemCount === 3 && ironIngotCount === 1 && stickCount === 2) {
            if (grid[1].block === BLOCK.IRON_INGOT && 
                grid[4].block === BLOCK.STICK && 
                grid[7].block === BLOCK.STICK &&
                grid[0].block === BLOCK.AIR &&
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.AIR &&
                grid[5].block === BLOCK.AIR &&
                grid[6].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.IRON_SHOVEL, count: 1 };
                return;
            }
        }

        // Recipe: 4 Snowballs (2x2) = 1 Snow Block
        let snowballCount = grid.filter(s => s.block === BLOCK.SNOWBALL).length;
        if (itemCount === 4 && snowballCount === 4) {
            // Check if in 2x2 pattern anywhere
            const patterns = [
                [0, 1, 3, 4], // top-left
                [1, 2, 4, 5], // top-right
                [3, 4, 6, 7], // bottom-left
                [4, 5, 7, 8]  // bottom-right
            ];
            for (const pattern of patterns) {
                let match = true;
                for (const idx of pattern) {
                    if (grid[idx].block !== BLOCK.SNOWBALL) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    for (let i = 0; i < 9; i++) {
                        if (!pattern.includes(i) && grid[i].block !== BLOCK.AIR) {
                            match = false;
                            break;
                        }
                    }
                }
                if (match) {
                    game.craftingResult = { block: BLOCK.SNOW, count: 1 };
                    return;
                }
            }
        }

        // Recipe: Copper Block (9 copper ingots)
        let copperIngotCount = grid.filter(s => s.block === BLOCK.COPPER_INGOT).length;
        if (itemCount === 9 && copperIngotCount === 9) {
            game.craftingResult = { block: BLOCK.COPPER_BLOCK, count: 1 };
            return;
        }

        // Recipe: Iron Block (9 iron ingots)
        // ironIngotCount already declared above
        if (itemCount === 9 && ironIngotCount === 9) {
            game.craftingResult = { block: BLOCK.IRON_BLOCK, count: 1 };
            return;
        }

        // Recipe: Gold Block (9 gold ingots)
        let goldIngotCount = grid.filter(s => s.block === BLOCK.GOLD_INGOT).length;
        if (itemCount === 9 && goldIngotCount === 9) {
            game.craftingResult = { block: BLOCK.GOLD_BLOCK, count: 1 };
            return;
        }

        // Recipe: Golden Apple (8 gold ingots around 1 apple)
        // Pattern:  [G][G][G]
        //           [G][A][G]
        //           [G][G][G]
        // goldIngotCount already declared above
        let appleCount = grid.filter(s => s.block === BLOCK.APPLE).length;
        if (itemCount === 9 && goldIngotCount === 8 && appleCount === 1) {
            if (grid[0].block === BLOCK.GOLD_INGOT && 
                grid[1].block === BLOCK.GOLD_INGOT && 
                grid[2].block === BLOCK.GOLD_INGOT &&
                grid[3].block === BLOCK.GOLD_INGOT &&
                grid[4].block === BLOCK.APPLE &&
                grid[5].block === BLOCK.GOLD_INGOT &&
                grid[6].block === BLOCK.GOLD_INGOT &&
                grid[7].block === BLOCK.GOLD_INGOT &&
                grid[8].block === BLOCK.GOLD_INGOT) {
                game.craftingResult = { block: BLOCK.GOLDEN_APPLE, count: 1 };
                return;
            }
        }
    }
    
    // Recipe: Flint and Steel (1 flint + 1 iron ingot - any diagonal in 2x2 or 3x3)
    let flintCount = grid.filter(s => s.block === BLOCK.FLINT).length;
    if (itemCount === 2 && flintCount === 1 && ironIngotCount === 1) {
        game.craftingResult = { block: BLOCK.FLINT_AND_STEEL, count: 1 };
        return;
    }

    // Recipe: Torch (1 coal on top of 1 stick = 4 torches)
    // Works in 2x2 or 3x3 grid (vertical pattern)
    if (itemCount === 2 && coalCount === 1 && stickCount === 1) {
        // Check for coal above stick pattern
        for (let i = 0; i < grid.length - (game.usingCraftingTable ? 3 : 2); i++) {
            const below = game.usingCraftingTable ? i + 3 : i + 2;
            if (grid[i].block === BLOCK.COAL && grid[below].block === BLOCK.STICK) {
                game.craftingResult = { block: BLOCK.TORCH, count: 4 };
                return;
            }
        }
    }

    // ==================== ARMOR RECIPES (3x3 only) ====================
    if (game.usingCraftingTable) {
        // Recipe: Iron Helmet (5 iron ingots)
        // Pattern:  [I][I][I]
        //           [I][ ][I]
        //           [ ][ ][ ]
        if (itemCount === 5 && ironIngotCount === 5) {
            if (grid[0].block === BLOCK.IRON_INGOT && 
                grid[1].block === BLOCK.IRON_INGOT && 
                grid[2].block === BLOCK.IRON_INGOT &&
                grid[3].block === BLOCK.IRON_INGOT &&
                grid[4].block === BLOCK.AIR &&
                grid[5].block === BLOCK.IRON_INGOT &&
                grid[6].block === BLOCK.AIR &&
                grid[7].block === BLOCK.AIR &&
                grid[8].block === BLOCK.AIR) {
                game.craftingResult = { block: BLOCK.IRON_HELMET, count: 1 };
                return;
            }
        }

        // Recipe: Iron Chestplate (8 iron ingots)
        // Pattern:  [I][ ][I]
        //           [I][I][I]
        //           [I][I][I]
        if (itemCount === 8 && ironIngotCount === 8) {
            if (grid[0].block === BLOCK.IRON_INGOT && 
                grid[1].block === BLOCK.AIR && 
                grid[2].block === BLOCK.IRON_INGOT &&
                grid[3].block === BLOCK.IRON_INGOT &&
                grid[4].block === BLOCK.IRON_INGOT &&
                grid[5].block === BLOCK.IRON_INGOT &&
                grid[6].block === BLOCK.IRON_INGOT &&
                grid[7].block === BLOCK.IRON_INGOT &&
                grid[8].block === BLOCK.IRON_INGOT) {
                game.craftingResult = { block: BLOCK.IRON_CHESTPLATE, count: 1 };
                return;
            }
        }

        // Recipe: Iron Leggings (7 iron ingots)
        // Pattern:  [I][I][I]
        //           [I][ ][I]
        //           [I][ ][I]
        if (itemCount === 7 && ironIngotCount === 7) {
            if (grid[0].block === BLOCK.IRON_INGOT && 
                grid[1].block === BLOCK.IRON_INGOT && 
                grid[2].block === BLOCK.IRON_INGOT &&
                grid[3].block === BLOCK.IRON_INGOT &&
                grid[4].block === BLOCK.AIR &&
                grid[5].block === BLOCK.IRON_INGOT &&
                grid[6].block === BLOCK.IRON_INGOT &&
                grid[7].block === BLOCK.AIR &&
                grid[8].block === BLOCK.IRON_INGOT) {
                game.craftingResult = { block: BLOCK.IRON_LEGGINGS, count: 1 };
                return;
            }
        }

        // Recipe: Iron Boots (4 iron ingots)
        // Pattern:  [ ][ ][ ]
        //           [I][ ][I]
        //           [I][ ][I]
        if (itemCount === 4 && ironIngotCount === 4) {
            if (grid[0].block === BLOCK.AIR && 
                grid[1].block === BLOCK.AIR && 
                grid[2].block === BLOCK.AIR &&
                grid[3].block === BLOCK.IRON_INGOT &&
                grid[4].block === BLOCK.AIR &&
                grid[5].block === BLOCK.IRON_INGOT &&
                grid[6].block === BLOCK.IRON_INGOT &&
                grid[7].block === BLOCK.AIR &&
                grid[8].block === BLOCK.IRON_INGOT) {
                game.craftingResult = { block: BLOCK.IRON_BOOTS, count: 1 };
                return;
            }
        }
    }

    // No valid recipe
    game.craftingResult = { block: BLOCK.AIR, count: 0 };
}

function consumeCraftingIngredients() {
    // Remove one of each item from crafting grid
    const grid = game.usingCraftingTable ? game.craftingGrid3x3 : game.craftingGrid;
    const gridSize = game.usingCraftingTable ? 9 : 4;
    
    for (let i = 0; i < gridSize; i++) {
        if (grid[i].block !== BLOCK.AIR && grid[i].count > 0) {
            grid[i].count--;
            if (grid[i].count <= 0) {
                grid[i] = { block: BLOCK.AIR, count: 0 };
            }
        }
    }
}

function toggleInventory() {
    game.isInventoryOpen = !game.isInventoryOpen;
    
    // Use creative inventory in creative mode
    if (game.gameMode === 'creative') {
        const creativeOverlay = document.getElementById('creative-overlay');
        if (game.isInventoryOpen) {
            generateCreativeInventoryUI();
            creativeOverlay.classList.remove('hidden');
            game.keys.left = false;
            game.keys.right = false;
            game.keys.jump = false;
        } else {
            creativeOverlay.classList.add('hidden');
        }
        return;
    }
    
    // Regular survival inventory
    const inventoryOverlay = document.getElementById('inventory-overlay');

    if (game.isInventoryOpen) {
        game.usingCraftingTable = false;
        generateInventoryUI();
        inventoryOverlay.classList.remove('hidden');
        // Stop player movement
        game.keys.left = false;
        game.keys.right = false;
        game.keys.jump = false;
    } else {
        // Return crafting grid items to inventory when closing
        returnCraftingItems();
        inventoryOverlay.classList.add('hidden');
        game.usingCraftingTable = false;
    }
}

// ==================== CREATIVE INVENTORY ====================
const CREATIVE_CATEGORIES = {
    stone: {
        name: 'Stone',
        items: [
            BLOCK.STONE,
            BLOCK.COBBLESTONE,
            BLOCK.MOSSY_COBBLESTONE,
            BLOCK.COAL,
            BLOCK.IRON,
            BLOCK.GOLD_ORE,
            BLOCK.COPPER_ORE,
            BLOCK.GRAVEL,
            BLOCK.SPAWNER
        ]
    },
    natural: {
        name: 'Natural',
        items: [
            BLOCK.DIRT,
            BLOCK.GRASS,
            BLOCK.SAND,
            BLOCK.WOOD,
            BLOCK.BIRCH_WOOD,
            BLOCK.LEAVES,
            BLOCK.BIRCH_LEAVES,
            BLOCK.VINE,
            BLOCK.WATER,
            BLOCK.SNOW
        ]
    },
    building: {
        name: 'Building',
        items: [
            BLOCK.PLANKS,
            BLOCK.BIRCH_PLANKS,
            BLOCK.CRAFTING_TABLE,
            BLOCK.FURNACE,
            BLOCK.CHEST,
            BLOCK.WOOL,
            BLOCK.GLASS,
            BLOCK.IRON_BLOCK,
            BLOCK.GOLD_BLOCK,
            BLOCK.COPPER_BLOCK,
            BLOCK.TORCH
        ]
    },
    tools: {
        name: 'Tools & Weapons',
        items: [
            BLOCK.WOODEN_PICKAXE,
            BLOCK.STONE_PICKAXE,
            BLOCK.IRON_PICKAXE,
            BLOCK.WOODEN_SHOVEL,
            BLOCK.STONE_SHOVEL,
            BLOCK.IRON_SHOVEL,
            BLOCK.WOODEN_SWORD,
            BLOCK.STONE_SWORD,
            BLOCK.IRON_SWORD,
            BLOCK.IRON_HELMET,
            BLOCK.IRON_CHESTPLATE,
            BLOCK.IRON_LEGGINGS,
            BLOCK.IRON_BOOTS,
            BLOCK.SHEARS,
            BLOCK.BOW,
            BLOCK.ARROW,
            BLOCK.SNOWBALL,
            BLOCK.FLINT_AND_STEEL,
            BLOCK.STICK,
            BLOCK.STRING,
            BLOCK.BONE,
            BLOCK.FLINT,
            BLOCK.IRON_INGOT,
            BLOCK.GOLD_INGOT,
            BLOCK.COPPER_INGOT
        ]
    },
    food: {
        name: 'Food',
        items: [
            BLOCK.APPLE,
            BLOCK.GOLDEN_APPLE,
            BLOCK.RAW_MEAT,
            BLOCK.COOKED_MEAT,
            BLOCK.SPIDER_EYE
        ]
    }
};

let currentCreativeCategory = 'stone';
let creativeTabsInitialized = false;
let isGeneratingCreativeUI = false;

function generateCreativeInventoryUI() {
    // Prevent re-entry
    if (isGeneratingCreativeUI) return;
    isGeneratingCreativeUI = true;
    
    const itemsContainer = document.getElementById('creative-items');
    const invGrid = document.getElementById('creative-inv-grid');
    const hotbar = document.getElementById('creative-hotbar');
    
    if (!itemsContainer || !invGrid || !hotbar) {
        isGeneratingCreativeUI = false;
        return;
    }
    
    // Clear existing
    itemsContainer.innerHTML = '';
    invGrid.innerHTML = '';
    hotbar.innerHTML = '';
    
    // Update equipment slots in creative inventory
    updateCreativeEquipmentSlots();
    
    // Generate category items
    const categoryItems = CREATIVE_CATEGORIES[currentCreativeCategory].items;
    
    for (let idx = 0; idx < categoryItems.length; idx++) {
        const blockType = categoryItems[idx];
        const item = document.createElement('div');
        item.className = 'creative-item';
        item.dataset.block = blockType;
        
        const preview = createBlockPreview(blockType);
        item.appendChild(preview);
        
        item.title = getBlockDisplayName(blockType);
        
        item.addEventListener('click', () => {
            addCreativeItemToInventory(blockType);
        });
        
        itemsContainer.appendChild(item);
    }
    
    // Generate player inventory slots
    for (let i = 0; i < 27; i++) {
        const slot = createSimpleCreativeSlot(i, 'inventory');
        invGrid.appendChild(slot);
    }
    
    // Generate hotbar slots
    for (let i = 0; i < 10; i++) {
        const slot = createSimpleCreativeSlot(i, 'hotbar');
        hotbar.appendChild(slot);
    }
    
    // Setup tab listeners only once
    if (!creativeTabsInitialized) {
        setupCreativeTabs();
        creativeTabsInitialized = true;
    }
    
    updateCreativeTabsVisual();
    isGeneratingCreativeUI = false;
}

function createSimpleCreativeSlot(index, type) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.index = index;
    slot.dataset.type = type;
    
    const items = type === 'hotbar' ? game.hotbar : game.inventory;
    if (!items || !items[index]) {
        return slot;
    }
    const item = items[index];
    
    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        slot.classList.add('has-item');
        
        const preview = createBlockPreview(item.block);
        slot.appendChild(preview);
        
        if (item.count > 1) {
            const count = document.createElement('span');
            count.className = 'slot-count';
            count.textContent = item.count;
            slot.appendChild(count);
        }
    }
    
    // Click to remove item (in creative, just clear the slot)
    slot.addEventListener('click', () => {
        const currentItems = type === 'hotbar' ? game.hotbar : game.inventory;
        if (currentItems[index] && currentItems[index].block !== BLOCK.AIR) {
            currentItems[index] = { block: BLOCK.AIR, count: 0 };
            // Update just this slot visually
            slot.innerHTML = '';
            slot.classList.remove('has-item');
            updateGameHotbar();
        }
    });
    
    // Right-click to get a stack
    slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const currentItems = type === 'hotbar' ? game.hotbar : game.inventory;
        if (currentItems[index] && currentItems[index].block !== BLOCK.AIR) {
            currentItems[index].count = 64; // Give full stack
            // Update just the count display
            const countEl = slot.querySelector('.slot-count');
            if (countEl) {
                countEl.textContent = '64';
            } else {
                const count = document.createElement('span');
                count.className = 'slot-count';
                count.textContent = '64';
                slot.appendChild(count);
            }
            updateGameHotbar();
        }
    });
    
    return slot;
}

function addCreativeItemToInventory(blockType) {
    // Try to add to hotbar first
    for (let i = 0; i < game.hotbar.length; i++) {
        if (game.hotbar[i].block === BLOCK.AIR || game.hotbar[i].count === 0) {
            game.hotbar[i] = { block: blockType, count: 64 };
            updateCreativeSlotDisplay('hotbar', i);
            updateGameHotbar();
            return;
        }
        if (game.hotbar[i].block === blockType && game.hotbar[i].count < 64) {
            game.hotbar[i].count = 64;
            updateCreativeSlotDisplay('hotbar', i);
            updateGameHotbar();
            return;
        }
    }
    
    // Then try inventory
    for (let i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].block === BLOCK.AIR || game.inventory[i].count === 0) {
            game.inventory[i] = { block: blockType, count: 64 };
            updateCreativeSlotDisplay('inventory', i);
            return;
        }
        if (game.inventory[i].block === blockType && game.inventory[i].count < 64) {
            game.inventory[i].count = 64;
            updateCreativeSlotDisplay('inventory', i);
            return;
        }
    }
}

function updateCreativeSlotDisplay(type, index) {
    const container = type === 'hotbar' 
        ? document.getElementById('creative-hotbar')
        : document.getElementById('creative-inv-grid');
    
    if (!container) return;
    
    const slots = container.querySelectorAll('.inventory-slot');
    const slot = slots[index];
    if (!slot) return;
    
    const items = type === 'hotbar' ? game.hotbar : game.inventory;
    const item = items[index];
    
    // Clear slot
    slot.innerHTML = '';
    slot.classList.remove('has-item');
    
    // Add item if present
    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        slot.classList.add('has-item');
        
        const preview = createBlockPreview(item.block);
        slot.appendChild(preview);
        
        if (item.count > 1) {
            const count = document.createElement('span');
            count.className = 'slot-count';
            count.textContent = item.count;
            slot.appendChild(count);
        }
    }
}

function setupCreativeTabs() {
    const tabs = document.querySelectorAll('.creative-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update category
            currentCreativeCategory = tab.dataset.category;
            // Regenerate items (this will also update tab visuals)
            generateCreativeInventoryUI();
        });
    });
}

function updateCreativeTabsVisual() {
    const tabs = document.querySelectorAll('.creative-tab');
    tabs.forEach(tab => {
        if (tab.dataset.category === currentCreativeCategory) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function openCraftingTable() {
    game.isInventoryOpen = true;
    game.usingCraftingTable = true;
    const inventoryOverlay = document.getElementById('inventory-overlay');
    
    generateInventoryUI();
    inventoryOverlay.classList.remove('hidden');
    
    // Stop player movement
    game.keys.left = false;
    game.keys.right = false;
    game.keys.jump = false;
}

function returnCraftingItems() {
    // Return 2x2 crafting grid items
    for (let i = 0; i < game.craftingGrid.length; i++) {
        const item = game.craftingGrid[i];
        if (item.block !== BLOCK.AIR && item.count > 0) {
            addToInventory(item.block, item.count);
            game.craftingGrid[i] = { block: BLOCK.AIR, count: 0 };
        }
    }
    
    // Return 3x3 crafting grid items
    for (let i = 0; i < game.craftingGrid3x3.length; i++) {
        const item = game.craftingGrid3x3[i];
        if (item.block !== BLOCK.AIR && item.count > 0) {
            addToInventory(item.block, item.count);
            game.craftingGrid3x3[i] = { block: BLOCK.AIR, count: 0 };
        }
    }
    
    game.craftingResult = { block: BLOCK.AIR, count: 0 };

    // Return held item
    if (game.heldItem.block !== BLOCK.AIR && game.heldItem.count > 0) {
        addToInventory(game.heldItem.block, game.heldItem.count);
        game.heldItem = { block: BLOCK.AIR, count: 0 };
    }

    // Remove held item cursor
    const existingCursor = document.getElementById('held-item-cursor');
    if (existingCursor) {
        existingCursor.remove();
    }
}

function updateHeldItemCursor() {
    let cursor = document.getElementById('held-item-cursor');
    
    if (game.heldItem.block === BLOCK.AIR || game.heldItem.count <= 0) {
        // Remove cursor if not holding anything
        if (cursor) {
            cursor.remove();
        }
        return;
    }

    // Create cursor if doesn't exist
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'held-item-cursor';
        document.body.appendChild(cursor);

        // Follow mouse
        document.addEventListener('mousemove', updateCursorPosition);
    }

    // Update cursor content
    cursor.innerHTML = '';
    cursor.className = 'held-item-cursor';

    const blockDiv = createBlockPreview(game.heldItem.block);
    cursor.appendChild(blockDiv);

    if (game.heldItem.count > 1) {
        const countSpan = document.createElement('span');
        countSpan.className = 'cursor-count';
        countSpan.textContent = game.heldItem.count;
        cursor.appendChild(countSpan);
    }
}

function updateCursorPosition(e) {
    const cursor = document.getElementById('held-item-cursor');
    if (cursor) {
        cursor.style.left = (e.clientX + 10) + 'px';
        cursor.style.top = (e.clientY + 10) + 'px';
    }
}

// ==================== FURNACE SYSTEM ====================
function getFurnaceData(x, y) {
    const key = `${x},${y}`;
    if (!game.furnaces[key]) {
        game.furnaces[key] = {
            input: { block: BLOCK.AIR, count: 0 },
            fuel: { block: BLOCK.AIR, count: 0 },
            output: { block: BLOCK.AIR, count: 0 },
            fuelRemaining: 0,
            smeltProgress: 0,
            isSmelting: false
        };
    }
    return game.furnaces[key];
}

function openFurnace(x, y) {
    game.furnaceOpen = true;
    game.furnacePos = { x, y };
    game.currentFurnace = getFurnaceData(x, y);
    
    const furnaceOverlay = document.getElementById('furnace-overlay');
    furnaceOverlay.classList.remove('hidden');
    
    generateFurnaceUI();
    
    // Stop player movement
    game.keys.left = false;
    game.keys.right = false;
    game.keys.jump = false;
}

function closeFurnace() {
    game.furnaceOpen = false;
    game.furnacePos = null;
    game.currentFurnace = null;
    
    const furnaceOverlay = document.getElementById('furnace-overlay');
    furnaceOverlay.classList.add('hidden');
    
    // Return held item
    if (game.heldItem.block !== BLOCK.AIR && game.heldItem.count > 0) {
        addToInventory(game.heldItem.block, game.heldItem.count);
        game.heldItem = { block: BLOCK.AIR, count: 0 };
    }
    
    const existingCursor = document.getElementById('held-item-cursor');
    if (existingCursor) {
        existingCursor.remove();
    }
}

// ==================== CHEST SYSTEM ====================
function getChestData(x, y) {
    const key = `${x},${y}`;
    if (!game.chests[key]) {
        // Initialize new chest
        game.chests[key] = {
            x: x,
            y: y,
            slots: Array(30).fill(null).map(() => ({ block: BLOCK.AIR, count: 0 }))
        };
    }
    return game.chests[key];
}

function openChest(x, y) {
    game.chestOpen = true;
    game.chestPos = { x, y };
    game.currentChest = getChestData(x, y);
    
    const chestOverlay = document.getElementById('chest-overlay');
    chestOverlay.classList.remove('hidden');
    
    generateChestUI();
    
    // Stop player movement
    game.keys.left = false;
    game.keys.right = false;
    game.keys.jump = false;
}

function closeChest() {
    game.chestOpen = false;
    game.chestPos = null;
    game.currentChest = null;
    
    const chestOverlay = document.getElementById('chest-overlay');
    chestOverlay.classList.add('hidden');
    
    // Return held item
    if (game.heldItem.block !== BLOCK.AIR && game.heldItem.count > 0) {
        addToInventory(game.heldItem.block, game.heldItem.count);
        game.heldItem = { block: BLOCK.AIR, count: 0 };
    }
    
    const existingCursor = document.getElementById('held-item-cursor');
    if (existingCursor) {
        existingCursor.remove();
    }
}

function generateChestUI() {
    if (!game.currentChest) return;
    
    const chestGrid = document.getElementById('chest-grid');
    const invGrid = document.getElementById('chest-inv-grid');
    const hotbarGrid = document.getElementById('chest-hotbar');
    
    // Clear existing
    chestGrid.innerHTML = '';
    invGrid.innerHTML = '';
    hotbarGrid.innerHTML = '';
    
    // Generate 30 chest slots (10x3)
    for (let i = 0; i < 30; i++) {
        const slot = createChestSlot(i, 'chest');
        chestGrid.appendChild(slot);
    }
    
    // Generate inventory grid (27 slots)
    for (let i = 0; i < 27; i++) {
        const slot = createChestSlot(i, 'inventory');
        invGrid.appendChild(slot);
    }
    
    // Generate hotbar (10 slots)
    for (let i = 0; i < 10; i++) {
        const slot = createChestSlot(i, 'hotbar');
        hotbarGrid.appendChild(slot);
    }
    
    updateHeldItemCursor();
}

function createChestSlot(index, type) {
    const slot = document.createElement('div');
    slot.className = 'chest-slot inventory-slot';
    slot.dataset.index = index;
    slot.dataset.type = type;
    
    // Get the item for this slot
    let item;
    if (type === 'chest') {
        item = game.currentChest ? game.currentChest.slots[index] : null;
    } else if (type === 'inventory') {
        item = game.inventory[index];
    } else {
        item = game.hotbar[index];
    }
    
    // Display item if present
    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        slot.classList.add('has-item');
        
        const blockDiv = createBlockPreview(item.block);
        blockDiv.classList.add('slot-block');
        slot.appendChild(blockDiv);
        
        if (item.count > 1) {
            const countSpan = document.createElement('span');
            countSpan.className = 'slot-count';
            countSpan.textContent = item.count;
            slot.appendChild(countSpan);
        }
    }
    
    // Use onclick instead of addEventListener for more reliable click handling
    slot.onclick = function() {
        handleChestSlotClick(index, type);
    };
    
    slot.oncontextmenu = function(e) {
        e.preventDefault();
        handleChestSlotRightClick(index, type);
    };
    
    return slot;
}

function updateChestUI() {
    if (!game.currentChest) return;
    
    // Update chest slots
    const chestSlots = document.querySelectorAll('#chest-grid .chest-slot');
    chestSlots.forEach((slot, i) => {
        const item = game.currentChest.slots[i];
        updateSlotDisplay(slot, item);
    });
    
    // Update inventory slots
    const invSlots = document.querySelectorAll('#chest-inv-grid .chest-slot');
    invSlots.forEach((slot, i) => {
        const item = game.inventory[i];
        updateSlotDisplay(slot, item);
    });
    
    // Update hotbar slots
    const hotbarSlots = document.querySelectorAll('#chest-hotbar .chest-slot');
    hotbarSlots.forEach((slot, i) => {
        const item = game.hotbar[i];
        updateSlotDisplay(slot, item);
    });
}

function updateSlotDisplay(slot, item) {
    slot.innerHTML = '';
    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        const preview = createBlockPreview(item.block);
        slot.appendChild(preview);
        
        if (item.count > 1) {
            const countEl = document.createElement('span');
            countEl.className = 'slot-count';
            countEl.textContent = item.count;
            slot.appendChild(countEl);
        }
    }
}

function handleChestSlotClick(index, type) {
    if (!game.currentChest) return;
    
    let targetArray;
    if (type === 'chest') {
        targetArray = game.currentChest.slots;
    } else if (type === 'inventory') {
        targetArray = game.inventory;
    } else {
        targetArray = game.hotbar;
    }
    
    const slotItem = targetArray[index];
    const held = game.heldItem;
    
    if (held.block === BLOCK.AIR || held.count === 0) {
        // Pick up item
        if (slotItem && slotItem.block !== BLOCK.AIR && slotItem.count > 0) {
            game.heldItem = { block: slotItem.block, count: slotItem.count };
            targetArray[index] = { block: BLOCK.AIR, count: 0 };
        }
    } else {
        // Place or swap item
        if (!slotItem || slotItem.block === BLOCK.AIR || slotItem.count === 0) {
            // Place in empty slot
            targetArray[index] = { block: held.block, count: held.count };
            game.heldItem = { block: BLOCK.AIR, count: 0 };
        } else if (slotItem.block === held.block && slotItem.count < 64) {
            // Stack items
            const space = 64 - slotItem.count;
            const toAdd = Math.min(space, held.count);
            slotItem.count += toAdd;
            held.count -= toAdd;
            if (held.count <= 0) {
                game.heldItem = { block: BLOCK.AIR, count: 0 };
            }
        } else {
            // Swap items
            game.heldItem = { block: slotItem.block, count: slotItem.count };
            targetArray[index] = { block: held.block, count: held.count };
        }
    }
    
    updateGameHotbar();
    generateChestUI();  // Regenerate UI to reflect changes
}

function handleChestSlotRightClick(index, type) {
    if (!game.currentChest) return;
    
    let targetArray;
    if (type === 'chest') {
        targetArray = game.currentChest.slots;
    } else if (type === 'inventory') {
        targetArray = game.inventory;
    } else {
        targetArray = game.hotbar;
    }
    
    const slotItem = targetArray[index];
    const held = game.heldItem;
    
    if (held.block === BLOCK.AIR || held.count === 0) {
        // Pick up half
        if (slotItem && slotItem.block !== BLOCK.AIR && slotItem.count > 0) {
            const halfCount = Math.ceil(slotItem.count / 2);
            game.heldItem = { block: slotItem.block, count: halfCount };
            slotItem.count -= halfCount;
            if (slotItem.count <= 0) {
                targetArray[index] = { block: BLOCK.AIR, count: 0 };
            }
        }
    } else {
        // Place one item
        if (!slotItem || slotItem.block === BLOCK.AIR || slotItem.count === 0) {
            targetArray[index] = { block: held.block, count: 1 };
            held.count--;
        } else if (slotItem.block === held.block && slotItem.count < 64) {
            slotItem.count++;
            held.count--;
        }
        
        if (held.count <= 0) {
            game.heldItem = { block: BLOCK.AIR, count: 0 };
        }
    }
    
    updateGameHotbar();
    generateChestUI();  // Regenerate UI to reflect changes
}

function generateFurnaceUI() {
    if (!game.currentFurnace) return;
    
    const inputSlot = document.getElementById('furnace-input');
    const fuelSlot = document.getElementById('furnace-fuel');
    const outputSlot = document.getElementById('furnace-output');
    const invGrid = document.getElementById('furnace-inv-grid');
    const hotbar = document.getElementById('furnace-hotbar');
    const fuelBar = document.getElementById('fuel-bar');
    const smeltProgress = document.getElementById('smelt-progress');
    
    // Clear existing
    inputSlot.innerHTML = '';
    fuelSlot.innerHTML = '';
    outputSlot.innerHTML = '';
    invGrid.innerHTML = '';
    hotbar.innerHTML = '';
    
    // Generate furnace slots
    createFurnaceSlot(inputSlot, game.currentFurnace.input, 'input');
    createFurnaceSlot(fuelSlot, game.currentFurnace.fuel, 'fuel');
    createFurnaceSlot(outputSlot, game.currentFurnace.output, 'output');
    
    // Update fuel bar
    if (game.currentFurnace.fuelRemaining > 0) {
        fuelBar.style.width = (game.currentFurnace.fuelRemaining * 100) + '%';
    } else {
        fuelBar.style.width = '0%';
    }
    
    // Update smelt progress
    smeltProgress.style.setProperty('--progress', (game.currentFurnace.smeltProgress * 100) + '%');
    if (smeltProgress.querySelector('::after')) {
        smeltProgress.style.width = (game.currentFurnace.smeltProgress * 100) + '%';
    }
    
    // Generate inventory grid
    for (let i = 0; i < 27; i++) {
        const slot = createFurnaceInventorySlot(i, 'inventory');
        invGrid.appendChild(slot);
    }
    
    // Generate hotbar
    for (let i = 0; i < 10; i++) {
        const slot = createFurnaceInventorySlot(i, 'hotbar');
        hotbar.appendChild(slot);
    }
    
    updateHeldItemCursor();
}

function createFurnaceSlot(container, item, type) {
    container.className = 'furnace-slot';
    if (type === 'output') container.classList.add('result-slot');
    
    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        container.classList.add('has-item');
        
        const blockDiv = createBlockPreview(item.block);
        blockDiv.classList.add('slot-block');
        container.appendChild(blockDiv);
        
        if (item.count > 1) {
            const countSpan = document.createElement('span');
            countSpan.className = 'slot-count';
            countSpan.textContent = item.count;
            container.appendChild(countSpan);
        }
    }
    
    container.onclick = () => handleFurnaceSlotClick(type);
}

function handleFurnaceSlotClick(slotType) {
    if (!game.currentFurnace) return;
    
    const held = game.heldItem;
    let slot;
    
    if (slotType === 'input') slot = game.currentFurnace.input;
    else if (slotType === 'fuel') slot = game.currentFurnace.fuel;
    else if (slotType === 'output') slot = game.currentFurnace.output;
    
    // Output slot - can only take items out
    if (slotType === 'output') {
        if (slot.block !== BLOCK.AIR && slot.count > 0) {
            if (held.block === BLOCK.AIR) {
                game.heldItem = { block: slot.block, count: slot.count };
                game.currentFurnace.output = { block: BLOCK.AIR, count: 0 };
            } else if (held.block === slot.block && held.count < 64) {
                const canAdd = Math.min(slot.count, 64 - held.count);
                held.count += canAdd;
                slot.count -= canAdd;
                if (slot.count <= 0) {
                    game.currentFurnace.output = { block: BLOCK.AIR, count: 0 };
                }
            }
        }
    }
    // Input and fuel slots
    else {
        if (held.block !== BLOCK.AIR && held.count > 0) {
            // For fuel slot, only accept fuel items
            if (slotType === 'fuel' && !FUEL_VALUES[held.block]) {
                generateFurnaceUI();
                return;
            }
            
            if (slot.block === BLOCK.AIR || slot.count === 0) {
                if (slotType === 'input') {
                    game.currentFurnace.input = { block: held.block, count: held.count };
                } else {
                    game.currentFurnace.fuel = { block: held.block, count: held.count };
                }
                game.heldItem = { block: BLOCK.AIR, count: 0 };
            } else if (slot.block === held.block && slot.count < 64) {
                const canAdd = Math.min(held.count, 64 - slot.count);
                slot.count += canAdd;
                held.count -= canAdd;
                if (held.count <= 0) {
                    game.heldItem = { block: BLOCK.AIR, count: 0 };
                }
            } else {
                // Swap
                const temp = { block: slot.block, count: slot.count };
                if (slotType === 'input') {
                    game.currentFurnace.input = { block: held.block, count: held.count };
                } else {
                    game.currentFurnace.fuel = { block: held.block, count: held.count };
                }
                game.heldItem = temp;
            }
        } else if (slot.block !== BLOCK.AIR && slot.count > 0) {
            game.heldItem = { block: slot.block, count: slot.count };
            if (slotType === 'input') {
                game.currentFurnace.input = { block: BLOCK.AIR, count: 0 };
            } else {
                game.currentFurnace.fuel = { block: BLOCK.AIR, count: 0 };
            }
        }
    }
    
    generateFurnaceUI();
}

function createFurnaceInventorySlot(index, type) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.index = index;
    slot.dataset.type = type;

    const items = type === 'hotbar' ? game.hotbar : game.inventory;
    const item = items[index];

    if (item && item.block !== BLOCK.AIR && item.count > 0) {
        slot.classList.add('has-item');
        
        const blockDiv = createBlockPreview(item.block);
        blockDiv.classList.add('slot-block');
        slot.appendChild(blockDiv);

        if (item.count > 1) {
            const countSpan = document.createElement('span');
            countSpan.className = 'slot-count';
            countSpan.textContent = item.count;
            slot.appendChild(countSpan);
        }
    }

    slot.addEventListener('click', () => handleFurnaceInventoryClick(index, type));

    return slot;
}

function handleFurnaceInventoryClick(index, type) {
    const items = type === 'hotbar' ? game.hotbar : game.inventory;
    const item = items[index];
    const held = game.heldItem;

    if (held.block !== BLOCK.AIR && held.count > 0) {
        if (item.block === BLOCK.AIR || item.count === 0) {
            items[index] = { block: held.block, count: held.count };
            game.heldItem = { block: BLOCK.AIR, count: 0 };
        } else if (item.block === held.block && item.count < 64) {
            const canAdd = Math.min(held.count, 64 - item.count);
            item.count += canAdd;
            held.count -= canAdd;
            if (held.count <= 0) {
                game.heldItem = { block: BLOCK.AIR, count: 0 };
            }
        } else {
            game.heldItem = { block: item.block, count: item.count };
            items[index] = { block: held.block, count: held.count };
        }
    } else if (item.block !== BLOCK.AIR && item.count > 0) {
        game.heldItem = { block: item.block, count: item.count };
        items[index] = { block: BLOCK.AIR, count: 0 };
    }

    updateGameHotbar();
    generateFurnaceUI();
}

function updateFurnaces() {
    // Update all furnaces (smelting logic)
    for (const key in game.furnaces) {
        const furnace = game.furnaces[key];
        
        // Check if can smelt
        const canSmelt = getSmeltResult(furnace.input.block) !== null;
        
        if (canSmelt && furnace.input.count > 0) {
            // Need fuel to smelt
            if (furnace.fuelRemaining <= 0 && furnace.fuel.count > 0) {
                // Consume fuel
                const fuelValue = FUEL_VALUES[furnace.fuel.block] || 0;
                if (fuelValue > 0) {
                    furnace.fuelRemaining = fuelValue;
                    furnace.fuel.count--;
                    if (furnace.fuel.count <= 0) {
                        furnace.fuel = { block: BLOCK.AIR, count: 0 };
                    }
                }
            }
            
            if (furnace.fuelRemaining > 0) {
                // Smelt progress
                furnace.smeltProgress += 0.02; // Takes about 50 frames to smelt
                furnace.fuelRemaining -= 0.01;
                
                if (furnace.smeltProgress >= 1) {
                    // Smelting complete
                    const result = getSmeltResult(furnace.input.block);
                    if (result) {
                        // Add to output
                        if (furnace.output.block === BLOCK.AIR || furnace.output.count === 0) {
                            furnace.output = { block: result, count: 1 };
                        } else if (furnace.output.block === result && furnace.output.count < 64) {
                            furnace.output.count++;
                        }
                        
                        // Consume input
                        furnace.input.count--;
                        if (furnace.input.count <= 0) {
                            furnace.input = { block: BLOCK.AIR, count: 0 };
                        }
                    }
                    furnace.smeltProgress = 0;
                }
            }
        } else {
            // Can't smelt, reset progress
            if (furnace.smeltProgress > 0) {
                furnace.smeltProgress = Math.max(0, furnace.smeltProgress - 0.02);
            }
        }
        
        // Decay fuel even when not smelting (if there's fuel remaining)
        if (furnace.fuelRemaining > 0 && !canSmelt) {
            furnace.fuelRemaining = Math.max(0, furnace.fuelRemaining - 0.005);
        }
    }
    
    // Update furnace UI if open
    if (game.furnaceOpen && game.currentFurnace) {
        const fuelBar = document.getElementById('fuel-bar');
        const smeltProgress = document.getElementById('smelt-progress');
        
        if (fuelBar) {
            fuelBar.style.width = (game.currentFurnace.fuelRemaining * 100 / 8) + '%'; // Normalize to coal's value
        }
        if (smeltProgress) {
            smeltProgress.innerHTML = `<div style="width: ${game.currentFurnace.smeltProgress * 100}%; height: 100%; background: #4a9a3e;"></div>`;
        }
    }
}

function getSmeltResult(blockType) {
    const smeltRecipes = {
        [BLOCK.IRON]: BLOCK.IRON_INGOT,
        [BLOCK.RAW_MEAT]: BLOCK.COOKED_MEAT,
        [BLOCK.COPPER_ORE]: BLOCK.COPPER_INGOT,
        [BLOCK.GOLD_ORE]: BLOCK.GOLD_INGOT,
        [BLOCK.COBBLESTONE]: BLOCK.STONE,
        [BLOCK.SAND]: BLOCK.GLASS
    };
    return smeltRecipes[blockType] || null;
}

// ==================== ENTITY SYSTEM ====================
function spawnInitialSheep(heights) {
    game.entities = [];
    
    // Spawn 10-15 sheep across the world
    const numSheep = 10 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numSheep; i++) {
        // Find a random grass block to spawn on
        let attempts = 0;
        while (attempts < 50) {
            const x = Math.floor(Math.random() * WORLD_WIDTH);
            const surfaceY = heights[x];
            
            // Check if there's grass at this position and air above it
            if (game.world[x][surfaceY] === BLOCK.GRASS && 
                surfaceY > 0 && 
                game.world[x][surfaceY - 1] === BLOCK.AIR) {
                // Spawn sheep standing ON TOP of the grass block
                // The sheep's feet should be at the top of the grass block
                const sheepY = surfaceY * BLOCK_SIZE - 24; // 24 is sheep height
                const sheep = createSheep(x * BLOCK_SIZE, sheepY);
                game.entities.push(sheep);
                break;
            }
            attempts++;
        }
    }
}

function createSheep(x, y) {
    return {
        type: 'sheep',
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        width: 28,
        height: 24,
        direction: Math.random() < 0.5 ? -1 : 1,  // -1 = left, 1 = right
        state: 'idle',  // idle, walking
        stateTimer: 0,
        onGround: false,
        sheared: false,  // Whether the sheep has been sheared
        woolGrowTimer: 0  // Timer for wool regrowth
    };
}

function spawnInitialFish(heights, biomes) {
    // Find ocean biomes and spawn fish in them
    for (let x = 0; x < WORLD_WIDTH; x++) {
        if (biomes[x] === 'ocean') {
            // Spawn fish with 5% chance per ocean column
            if (Math.random() < 0.05) {
                const surfaceY = heights[x];
                // Fish swim in water, between surface and ocean floor
                const waterTop = GROUND_LEVEL + 2;  // Match ocean water level
                const waterBottom = surfaceY - 1;
                
                if (waterBottom > waterTop) {
                    const fishY = waterTop + Math.floor(Math.random() * (waterBottom - waterTop));
                    const fish = createFish(x * BLOCK_SIZE, fishY * BLOCK_SIZE);
                    game.entities.push(fish);
                }
            }
        }
    }
}

function createFish(x, y) {
    return {
        type: 'fish',
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        width: 16,
        height: 10,
        direction: Math.random() < 0.5 ? -1 : 1,
        state: 'swimming',
        stateTimer: 60 + Math.floor(Math.random() * 120),
        health: 3  // Fish have 1.5 hearts
    };
}

function updateFish(fish) {
    // Random swimming behavior
    fish.stateTimer--;
    if (fish.stateTimer <= 0) {
        // Change direction randomly
        if (Math.random() < 0.3) {
            fish.direction *= -1;
        }
        // Random vertical movement
        fish.vy = (Math.random() - 0.5) * 2;
        fish.stateTimer = 60 + Math.floor(Math.random() * 120);
    }
    
    // Swim horizontally
    fish.vx = fish.direction * 1.5;
    
    // Apply movement
    fish.x += fish.vx;
    fish.y += fish.vy;
    
    // Keep fish in water
    const blockX = Math.floor(fish.x / BLOCK_SIZE);
    const blockY = Math.floor(fish.y / BLOCK_SIZE);
    
    // Check if fish is still in water
    if (blockX >= 0 && blockX < WORLD_WIDTH && blockY >= 0 && blockY < WORLD_HEIGHT) {
        if (game.world[blockX][blockY] !== BLOCK.WATER) {
            // Turn around if hitting non-water
            fish.direction *= -1;
            fish.x += fish.direction * BLOCK_SIZE;
        }
    }
    
    // World boundaries
    fish.x = Math.max(0, Math.min(fish.x, WORLD_WIDTH * BLOCK_SIZE - fish.width));
}

function renderFish(ctx, fish) {
    const screenX = fish.x - game.camera.x;
    const screenY = fish.y - game.camera.y;
    
    // Fish body (blue with white belly)
    // Main body - blue
    ctx.fillStyle = '#4a8ab8';
    ctx.beginPath();
    if (fish.direction === 1) {
        // Facing right
        ctx.ellipse(screenX + 8, screenY + 5, 8, 5, 0, 0, Math.PI * 2);
    } else {
        // Facing left
        ctx.ellipse(screenX + 8, screenY + 5, 8, 5, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // White belly
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(screenX + 3, screenY + 4, 10, 3);
    
    // Tail fin
    ctx.fillStyle = '#3a7aa8';
    if (fish.direction === 1) {
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 5);
        ctx.lineTo(screenX - 4, screenY);
        ctx.lineTo(screenX - 4, screenY + 10);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY + 5);
        ctx.lineTo(screenX + 20, screenY);
        ctx.lineTo(screenX + 20, screenY + 10);
        ctx.closePath();
        ctx.fill();
    }
    
    // Eye - black
    ctx.fillStyle = '#000000';
    if (fish.direction === 1) {
        ctx.beginPath();
        ctx.arc(screenX + 12, screenY + 4, 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(screenX + 4, screenY + 4, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function shearSheep() {
    // Check if holding shears
    const heldItem = game.hotbar[game.selectedHotbarSlot];
    if (!heldItem || heldItem.block !== BLOCK.SHEARS || heldItem.count <= 0) {
        return false;
    }
    
    // Get world position of mouse
    const worldX = game.mouse.x + game.camera.x;
    const worldY = game.mouse.y + game.camera.y;
    
    // Check distance from player
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerCenterY = game.player.y + game.player.height / 2;
    
    const distance = Math.sqrt(
        Math.pow(playerCenterX - worldX, 2) + 
        Math.pow(playerCenterY - worldY, 2)
    );
    
    // Only shear within reach
    if (distance > BLOCK_SIZE * 4) {
        return false;
    }
    
    // Check if clicking on any sheep
    for (const entity of game.entities) {
        if (entity.type !== 'sheep') continue;
        
        // Check if mouse is over this sheep
        if (worldX >= entity.x && worldX <= entity.x + entity.width &&
            worldY >= entity.y && worldY <= entity.y + entity.height) {
            
            // Can only shear if not already sheared
            if (!entity.sheared) {
                // Give wool
                addToInventory(BLOCK.WOOL, 2);
                
                // Mark as sheared
                entity.sheared = true;
                entity.woolGrowTimer = 600;  // 10 seconds to regrow wool (at 60fps)
                
                return true;
            }
        }
    }
    
    return false;
}

function updateEntities() {
    for (let i = game.entities.length - 1; i >= 0; i--) {
        const entity = game.entities[i];
        
        if (entity.type === 'sheep') {
            updateSheep(entity);
        } else if (entity.type === 'zombie') {
            updateZombie(entity);
        } else if (entity.type === 'skeleton') {
            updateSkeleton(entity);
        } else if (entity.type === 'spider') {
            updateSpider(entity);
        } else if (entity.type === 'fish') {
            updateFish(entity);
        }
        
        // Remove dead entities
        if (entity.health !== undefined && entity.health <= 0) {
            game.entities.splice(i, 1);
        }
    }
    
    // Update spawners
    updateSpawners();
    
    // Spawn mobs in caves
    spawnCaveMobs();
    
    // Spawn mobs on surface at night
    spawnNightMobs();
    
    // Update projectiles (arrows)
    updateProjectiles();
    
    // Update water physics
    updateWaterPhysics();
}

// ==================== WATER PHYSICS ====================
let waterUpdateTimer = 0;
const WATER_UPDATE_INTERVAL = 5; // Update every 5 frames

function updateWaterPhysics() {
    waterUpdateTimer++;
    if (waterUpdateTimer < WATER_UPDATE_INTERVAL) return;
    waterUpdateTimer = 0;
    
    // Only update water near the player for performance
    const playerBlockX = Math.floor(game.player.x / BLOCK_SIZE);
    const playerBlockY = Math.floor(game.player.y / BLOCK_SIZE);
    const updateRadius = 40; // Blocks around player to update
    
    const startX = Math.max(1, playerBlockX - updateRadius);
    const endX = Math.min(WORLD_WIDTH - 2, playerBlockX + updateRadius);
    const startY = Math.max(1, playerBlockY - updateRadius);
    const endY = Math.min(WORLD_HEIGHT - 2, playerBlockY + updateRadius);
    
    // Process from bottom to top, left to right
    for (let y = endY; y >= startY; y--) {
        for (let x = startX; x <= endX; x++) {
            if (game.world[x][y] === BLOCK.WATER) {
                // Water flows down first
                if (y + 1 < WORLD_HEIGHT && game.world[x][y + 1] === BLOCK.AIR) {
                    game.world[x][y + 1] = BLOCK.WATER;
                    // Don't remove source water, just spread
                }
                
                // Water spreads horizontally if there's a floor
                if (y + 1 < WORLD_HEIGHT && game.world[x][y + 1] !== BLOCK.AIR) {
                    // Spread left
                    if (x > 0 && game.world[x - 1][y] === BLOCK.AIR) {
                        game.world[x - 1][y] = BLOCK.WATER;
                    }
                    // Spread right
                    if (x < WORLD_WIDTH - 1 && game.world[x + 1][y] === BLOCK.AIR) {
                        game.world[x + 1][y] = BLOCK.WATER;
                    }
                }
            }
        }
    }
}

function updateSheep(sheep) {
    // Wool regrowth timer
    if (sheep.sheared && sheep.woolGrowTimer > 0) {
        sheep.woolGrowTimer--;
        if (sheep.woolGrowTimer <= 0) {
            sheep.sheared = false;
        }
    }
    
    // Apply gravity
    sheep.vy += GRAVITY * 0.5;
    sheep.vy = Math.min(sheep.vy, 10);
    
    // State machine for AI
    sheep.stateTimer--;
    
    if (sheep.stateTimer <= 0) {
        // Change state
        if (sheep.state === 'idle') {
            // Start walking
            sheep.state = 'walking';
            sheep.direction = Math.random() < 0.5 ? -1 : 1;
            sheep.stateTimer = 60 + Math.floor(Math.random() * 120);  // Walk for 1-3 seconds
        } else {
            // Stop and idle
            sheep.state = 'idle';
            sheep.stateTimer = 30 + Math.floor(Math.random() * 90);  // Idle for 0.5-2 seconds
        }
    }
    
    // Movement based on state
    if (sheep.state === 'walking') {
        sheep.vx = sheep.direction * 1;  // Slow walking speed
    } else {
        sheep.vx = 0;
    }
    
    // Horizontal movement with collision
    const newX = sheep.x + sheep.vx;
    if (!checkEntityCollision(newX, sheep.y, sheep.width, sheep.height)) {
        sheep.x = newX;
    } else {
        // Hit a wall, turn around
        sheep.direction *= -1;
        sheep.vx = 0;
    }
    
    // Check for edge/cliff - turn around if about to fall
    const frontX = sheep.direction > 0 ? sheep.x + sheep.width : sheep.x;
    const groundCheckX = Math.floor(frontX / BLOCK_SIZE);
    const groundCheckY = Math.floor((sheep.y + sheep.height + 5) / BLOCK_SIZE);
    
    if (groundCheckX >= 0 && groundCheckX < WORLD_WIDTH && 
        groundCheckY >= 0 && groundCheckY < WORLD_HEIGHT) {
        if (game.world[groundCheckX][groundCheckY] === BLOCK.AIR) {
            // No ground ahead, turn around
            sheep.direction *= -1;
        }
    }
    
    // Vertical movement with collision
    const newY = sheep.y + sheep.vy;
    if (!checkEntityCollision(sheep.x, newY, sheep.width, sheep.height)) {
        sheep.y = newY;
        sheep.onGround = false;
    } else {
        if (sheep.vy > 0) {
            sheep.onGround = true;
            sheep.y = Math.floor((sheep.y + sheep.height) / BLOCK_SIZE) * BLOCK_SIZE - sheep.height;
        }
        sheep.vy = 0;
    }
    
    // World boundaries
    sheep.x = Math.max(0, Math.min(sheep.x, WORLD_WIDTH * BLOCK_SIZE - sheep.width));
    
    // Respawn if fell into void
    if (sheep.y > WORLD_HEIGHT * BLOCK_SIZE) {
        // Remove this sheep
        const index = game.entities.indexOf(sheep);
        if (index > -1) {
            game.entities.splice(index, 1);
        }
    }
}

function checkEntityCollision(x, y, width, height) {
    // Check corners
    const corners = [
        { x: x + 2, y: y + 2 },
        { x: x + width - 2, y: y + 2 },
        { x: x + 2, y: y + height - 2 },
        { x: x + width - 2, y: y + height - 2 }
    ];

    for (const corner of corners) {
        const blockX = Math.floor(corner.x / BLOCK_SIZE);
        const blockY = Math.floor(corner.y / BLOCK_SIZE);

        if (blockX >= 0 && blockX < WORLD_WIDTH && 
            blockY >= 0 && blockY < WORLD_HEIGHT) {
            const block = game.world[blockX][blockY];
            // Water and vines are passable
            if (block !== BLOCK.AIR && block !== BLOCK.WATER && block !== BLOCK.VINE) {
                return true;
            }
        }
    }

    return false;
}

function renderEntities(ctx) {
    for (const entity of game.entities) {
        if (entity.type === 'sheep') {
            renderSheep(ctx, entity);
        } else if (entity.type === 'zombie') {
            renderZombie(ctx, entity);
        } else if (entity.type === 'skeleton') {
            renderSkeleton(ctx, entity);
        } else if (entity.type === 'spider') {
            renderSpider(ctx, entity);
        } else if (entity.type === 'fish') {
            renderFish(ctx, entity);
        }
    }
}

// Get damage based on weapon and mob type
function getWeaponDamage(mobType, weaponType) {
    // Damage values to achieve desired hit counts:
    // Spider: bare=5, wood=4, stone=3, iron=2 (health = 10)
    // Zombie: bare=6, wood=5, stone=4, iron=3 (health = 12)
    // Skeleton: bare=7, wood=6, stone=5, iron=3 (health = 21)
    
    const damageTable = {
        'spider': {
            bare: 2,      // 10/5 = 2 damage, 5 hits
            wood: 2.5,    // 10/4 = 2.5 damage, 4 hits
            stone: 3.34,  // 10/3 ≈ 3.34 damage, 3 hits
            iron: 5       // 10/2 = 5 damage, 2 hits
        },
        'zombie': {
            bare: 2,      // 12/6 = 2 damage, 6 hits
            wood: 2.4,    // 12/5 = 2.4 damage, 5 hits
            stone: 3,     // 12/4 = 3 damage, 4 hits
            iron: 4       // 12/3 = 4 damage, 3 hits
        },
        'skeleton': {
            bare: 3,      // 21/7 = 3 damage, 7 hits
            wood: 3.5,    // 21/6 = 3.5 damage, 6 hits
            stone: 4.2,   // 21/5 = 4.2 damage, 5 hits
            iron: 7       // 21/3 = 7 damage, 3 hits
        }
    };
    
    // Determine weapon tier
    let weaponTier = 'bare';
    if (weaponType === BLOCK.WOODEN_SWORD) weaponTier = 'wood';
    else if (weaponType === BLOCK.STONE_SWORD) weaponTier = 'stone';
    else if (weaponType === BLOCK.IRON_SWORD) weaponTier = 'iron';
    
    return damageTable[mobType]?.[weaponTier] || damageTable[mobType]?.bare || 1;
}

function attackEntity() {
    // Get world position of mouse
    const worldX = game.mouse.x + game.camera.x;
    const worldY = game.mouse.y + game.camera.y;
    
    // Check distance from player
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerCenterY = game.player.y + game.player.height / 2;
    
    const distance = Math.sqrt(
        Math.pow(playerCenterX - worldX, 2) + 
        Math.pow(playerCenterY - worldY, 2)
    );
    
    // Only attack within reach
    if (distance > BLOCK_SIZE * 4) {
        return false;
    }
    
    // Get held weapon
    const heldItem = game.hotbar[game.selectedHotbarSlot];
    const weaponType = heldItem ? heldItem.block : null;
    
    // Check if clicking on any entity
    for (let i = game.entities.length - 1; i >= 0; i--) {
        const entity = game.entities[i];
        
        // Check if mouse is over this entity
        if (worldX >= entity.x && worldX <= entity.x + entity.width &&
            worldY >= entity.y && worldY <= entity.y + entity.height) {
            
            // Sheep - instant kill, drops raw meat (wool only from shearing)
            if (entity.type === 'sheep') {
                const meatCount = 1 + Math.floor(Math.random() * 2);  // 1-2 raw meat
                addToInventory(BLOCK.RAW_MEAT, meatCount);
                game.entities.splice(i, 1);
                return true;
            }
            
            // Hostile mobs - have health
            if (entity.health !== undefined) {
                const damage = getWeaponDamage(entity.type, weaponType);
                entity.health -= damage;
                
                // Knockback
                entity.vx = (entity.x > playerCenterX ? 5 : -5);
                entity.vy = -5;
                
                if (entity.health <= 0) {
                    // Drop items based on mob type
                    if (entity.type === 'skeleton') {
                        // Drop 2 bones and 1 arrow
                        addToInventory(BLOCK.BONE, 2);
                        addToInventory(BLOCK.ARROW, 1);
                        // Chance to drop bow
                        if (Math.random() < 0.3) {
                            addToInventory(BLOCK.BOW, 1);
                        }
                    } else if (entity.type === 'spider') {
                        // Drop 2 string and 1 spider eye
                        addToInventory(BLOCK.STRING, 2);
                        addToInventory(BLOCK.SPIDER_EYE, 1);
                    }
                    game.entities.splice(i, 1);
                }
                return true;
            }
            
            return true;
        }
    }
    
    return false;
}

// ==================== HOSTILE MOBS ====================
function createZombie(x, y) {
    return {
        type: 'zombie',
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        width: 24,
        height: 48,
        direction: Math.random() < 0.5 ? -1 : 1,
        state: 'idle',
        stateTimer: 0,
        onGround: false,
        health: 12  // bare=6 hits, wood=5, stone=4, iron=3
    };
}

function createSkeleton(x, y) {
    return {
        type: 'skeleton',
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        width: 24,
        height: 48,
        direction: Math.random() < 0.5 ? -1 : 1,
        state: 'idle',
        stateTimer: 0,
        onGround: false,
        health: 21,  // bare=7 hits, wood=6, stone=5, iron=3
        shootTimer: 0
    };
}

function createSpider(x, y) {
    return {
        type: 'spider',
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        width: 28,
        height: 16,
        direction: Math.random() < 0.5 ? -1 : 1,
        state: 'idle',
        stateTimer: 0,
        onGround: false,
        health: 10  // bare=5 hits, wood=4, stone=3, iron=2
    };
}

function updateZombie(zombie) {
    // Apply gravity
    zombie.vy += GRAVITY * 0.5;
    zombie.vy = Math.min(zombie.vy, 10);
    
    // Simple AI - move toward player if close
    const distToPlayer = Math.abs(zombie.x - game.player.x);
    
    if (distToPlayer < 300) {
        // Chase player
        zombie.state = 'chasing';
        zombie.direction = game.player.x > zombie.x ? 1 : -1;
        zombie.vx = zombie.direction * 1.5;
    } else {
        // Wander
        zombie.stateTimer--;
        if (zombie.stateTimer <= 0) {
            if (zombie.state === 'idle') {
                zombie.state = 'walking';
                zombie.direction = Math.random() < 0.5 ? -1 : 1;
                zombie.stateTimer = 60 + Math.floor(Math.random() * 60);
            } else {
                zombie.state = 'idle';
                zombie.stateTimer = 30 + Math.floor(Math.random() * 60);
            }
        }
        zombie.vx = zombie.state === 'walking' ? zombie.direction * 1 : 0;
    }
    
    // Movement with collision
    const newX = zombie.x + zombie.vx;
    if (!checkEntityCollision(newX, zombie.y, zombie.width, zombie.height)) {
        zombie.x = newX;
    } else {
        zombie.direction *= -1;
    }
    
    const newY = zombie.y + zombie.vy;
    if (!checkEntityCollision(zombie.x, newY, zombie.width, zombie.height)) {
        zombie.y = newY;
        zombie.onGround = false;
    } else {
        if (zombie.vy > 0) zombie.onGround = true;
        zombie.vy = 0;
    }
    
    // Damage player on contact (1.5 hearts = 3 half-hearts)
    if (checkEntityPlayerCollision(zombie)) {
        damagePlayer(3, zombie.x, 'zombie');
    }
}

function updateSkeleton(skeleton) {
    // Apply gravity
    skeleton.vy += GRAVITY * 0.5;
    skeleton.vy = Math.min(skeleton.vy, 10);
    
    const distToPlayer = Math.abs(skeleton.x - game.player.x);
    const distToPlayerY = Math.abs(skeleton.y - game.player.y);
    
    // Face player
    skeleton.direction = game.player.x > skeleton.x ? 1 : -1;
    
    if (distToPlayer < 250 && distToPlayer > 80) {
        // Stay at range and shoot
        skeleton.state = 'shooting';
        skeleton.vx = 0;
        
        // Shoot arrow at player
        skeleton.shootTimer++;
        if (skeleton.shootTimer >= 90 && distToPlayerY < 100) {  // Shoot every 1.5 seconds
            skeleton.shootTimer = 0;
            // Spawn an actual arrow projectile
            spawnArrow(skeleton.x + skeleton.width / 2, skeleton.y + 10, skeleton.direction);
        }
    } else if (distToPlayer <= 80) {
        // Back away
        skeleton.vx = -skeleton.direction * 1.5;
        skeleton.shootTimer = 0;
    } else {
        // Wander
        skeleton.stateTimer--;
        skeleton.shootTimer = 0;
        if (skeleton.stateTimer <= 0) {
            skeleton.state = skeleton.state === 'idle' ? 'walking' : 'idle';
            skeleton.stateTimer = 30 + Math.floor(Math.random() * 60);
        }
        skeleton.vx = skeleton.state === 'walking' ? skeleton.direction * 0.8 : 0;
    }
    
    // Movement
    const newX = skeleton.x + skeleton.vx;
    if (!checkEntityCollision(newX, skeleton.y, skeleton.width, skeleton.height)) {
        skeleton.x = newX;
    }
    
    const newY = skeleton.y + skeleton.vy;
    if (!checkEntityCollision(skeleton.x, newY, skeleton.width, skeleton.height)) {
        skeleton.y = newY;
    } else {
        skeleton.vy = 0;
    }
}

function updateSpider(spider) {
    // Apply gravity
    spider.vy += GRAVITY * 0.5;
    spider.vy = Math.min(spider.vy, 10);
    
    const distToPlayer = Math.abs(spider.x - game.player.x);
    
    if (distToPlayer < 200) {
        // Chase player fast
        spider.state = 'chasing';
        spider.direction = game.player.x > spider.x ? 1 : -1;
        spider.vx = spider.direction * 2.5;
    } else {
        // Wander
        spider.stateTimer--;
        if (spider.stateTimer <= 0) {
            spider.state = spider.state === 'idle' ? 'walking' : 'idle';
            spider.direction = Math.random() < 0.5 ? -1 : 1;
            spider.stateTimer = 40 + Math.floor(Math.random() * 40);
        }
        spider.vx = spider.state === 'walking' ? spider.direction * 1.5 : 0;
    }
    
    // Movement
    const newX = spider.x + spider.vx;
    if (!checkEntityCollision(newX, spider.y, spider.width, spider.height)) {
        spider.x = newX;
    } else {
        spider.direction *= -1;
    }
    
    const newY = spider.y + spider.vy;
    if (!checkEntityCollision(spider.x, newY, spider.width, spider.height)) {
        spider.y = newY;
    } else {
        spider.vy = 0;
    }
    
    // Damage player on contact (1 heart = 2 half-hearts)
    if (checkEntityPlayerCollision(spider)) {
        damagePlayer(2, spider.x, 'spider');
    }
}

function checkEntityPlayerCollision(entity) {
    return !(entity.x + entity.width < game.player.x ||
             entity.x > game.player.x + game.player.width ||
             entity.y + entity.height < game.player.y ||
             entity.y > game.player.y + game.player.height);
}

function damagePlayer(amount, sourceX, deathCause) {
    // Creative mode = invincible
    if (game.gameMode === 'creative') return;
    
    // Check invincibility
    if (game.player.invincibleTimer > 0) return;
    
    // Calculate armor defense
    let totalDefense = 0;
    for (const slotType of ['helmet', 'chestplate', 'leggings', 'boots']) {
        const equipped = game.equipment[slotType];
        if (equipped && equipped.block !== BLOCK.AIR && ARMOR_DEFENSE[equipped.block]) {
            totalDefense += ARMOR_DEFENSE[equipped.block];
        }
    }
    
    // Reduce damage by armor (each defense point = 4% damage reduction, max 80%)
    const damageReduction = Math.min(totalDefense * 0.04, 0.80);
    amount = Math.ceil(amount * (1 - damageReduction));
    
    // Minimum 1 damage if any damage was dealt
    if (amount < 1 && damageReduction < 1) amount = 1;
    
    // Track what's damaging us for death message
    game.deathCause = deathCause || 'unknown';
    
    // Apply damage to absorption hearts first
    if (game.player.absorptionHearts > 0) {
        const absorbedDamage = Math.min(amount, game.player.absorptionHearts);
        game.player.absorptionHearts -= absorbedDamage;
        amount -= absorbedDamage;
    }
    
    // Apply remaining damage to health
    game.player.health -= amount;
    game.player.invincibleTimer = 60;  // 1 second of invincibility
    
    // Knockback away from source
    game.player.vy = -6;
    if (sourceX !== undefined) {
        game.player.vx = game.player.x > sourceX ? 8 : -8;
    }
    
    // Update health display
    updateHealthBar();
    
    // Check for death
    if (game.player.health <= 0) {
        game.player.health = 0;
        triggerGameOver(game.deathCause);
    }
}

function healPlayer(amount) {
    game.player.health = Math.min(game.player.health + amount, game.player.maxHealth);
    updateHealthBar();
}

function updateHealthBar() {
    const healthBar = document.getElementById('health-bar');
    if (!healthBar) return;
    
    healthBar.innerHTML = '';
    
    // Create 10 regular hearts
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        
        const bg = document.createElement('div');
        bg.className = 'heart-bg';
        heart.appendChild(bg);
        
        const fill = document.createElement('div');
        fill.className = 'heart-fill';
        
        const healthForThisHeart = game.player.health - (i * 2);
        
        if (healthForThisHeart >= 2) {
            // Full heart
            fill.className = 'heart-fill';
        } else if (healthForThisHeart >= 1) {
            // Half heart
            fill.className = 'heart-fill half';
        } else {
            // Empty heart
            fill.className = 'heart-fill empty';
        }
        
        heart.appendChild(fill);
        healthBar.appendChild(heart);
    }
    
    // Create absorption (golden) hearts if player has them
    const absorptionFullHearts = Math.floor(game.player.absorptionHearts / 2);
    const absorptionHalfHeart = game.player.absorptionHearts % 2;
    
    for (let i = 0; i < absorptionFullHearts + (absorptionHalfHeart ? 1 : 0); i++) {
        const heart = document.createElement('div');
        heart.className = 'heart golden';
        
        const bg = document.createElement('div');
        bg.className = 'heart-bg golden-bg';
        heart.appendChild(bg);
        
        const fill = document.createElement('div');
        if (i < absorptionFullHearts) {
            fill.className = 'heart-fill golden-fill';
        } else {
            fill.className = 'heart-fill golden-fill half';
        }
        
        heart.appendChild(fill);
        healthBar.appendChild(heart);
    }
}

function resetPlayerHealth() {
    game.player.health = game.player.maxHealth;
    game.player.invincibleTimer = 0;
    game.player.absorptionHearts = 0;
    game.player.absorptionTimer = 0;
    updateHealthBar();
}

function updateCoordinates() {
    // Calculate position relative to spawn (spawn = 0, 0)
    // X: horizontal position (positive = right of spawn, negative = left)
    // Y: vertical position (positive = above spawn, negative = below)
    
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerFeetY = game.player.y + game.player.height;
    const spawnCenterX = game.spawnPoint.x + game.player.width / 2;
    const spawnFeetY = game.spawnPoint.y + game.player.height;
    
    // Convert pixel positions to block coordinates
    const x = Math.floor((playerCenterX - spawnCenterX) / BLOCK_SIZE);
    const y = Math.floor((spawnFeetY - playerFeetY) / BLOCK_SIZE);  // Inverted so up is positive
    
    // Update display
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    
    if (coordX) coordX.textContent = x;
    if (coordY) coordY.textContent = y;
}

function updateSpawners() {
    for (const key in game.spawners) {
        const spawner = game.spawners[key];
        
        // Check if spawner block still exists
        if (game.world[spawner.x][spawner.y] !== BLOCK.SPAWNER) {
            delete game.spawners[key];
            continue;
        }
        
        // Count alive mobs from this spawner
        spawner.spawnedMobs = spawner.spawnedMobs.filter(mob => game.entities.includes(mob));
        
        // Spawn new mob if under limit
        if (spawner.spawnedMobs.length < spawner.maxMobs) {
            spawner.spawnTimer++;
            
            if (spawner.spawnTimer >= 300) {  // 5 seconds at 60fps
                spawner.spawnTimer = 0;
                
                // Spawn mob near spawner
                const spawnX = spawner.x * BLOCK_SIZE + Math.random() * 64 - 32;
                const spawnY = (spawner.y - 1) * BLOCK_SIZE;
                
                let newMob;
                if (spawner.mobType === 'zombie') {
                    newMob = createZombie(spawnX, spawnY);
                } else if (spawner.mobType === 'skeleton') {
                    newMob = createSkeleton(spawnX, spawnY);
                } else {
                    newMob = createSpider(spawnX, spawnY);
                }
                
                game.entities.push(newMob);
                spawner.spawnedMobs.push(newMob);
            }
        }
    }
}

// ==================== PROJECTILES (ARROWS & SNOWBALLS) ====================
function spawnArrow(x, y, direction) {
    const arrow = {
        type: 'arrow',
        x: x,
        y: y,
        vx: direction * 8,  // Arrow speed
        vy: 0,
        width: 16,
        height: 4,
        lifetime: 180,  // 3 seconds at 60fps
        direction: direction,
        damage: 4  // 2 hearts
    };
    game.projectiles.push(arrow);
}

function spawnSnowball(x, y, vx, vy) {
    const snowball = {
        type: 'snowball',
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        width: 8,
        height: 8,
        lifetime: 120,  // 2 seconds at 60fps
        damage: 0  // Snowballs do no damage, but have knockback
    };
    game.projectiles.push(snowball);
}

function updateProjectiles() {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
        const proj = game.projectiles[i];
        
        // Apply gravity (more for snowballs)
        proj.vy += proj.type === 'snowball' ? 0.3 : 0.15;
        
        // Move projectile
        proj.x += proj.vx;
        proj.y += proj.vy;
        
        // Decrease lifetime
        proj.lifetime--;
        
        // Remove if lifetime expired
        if (proj.lifetime <= 0) {
            game.projectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with blocks (walls)
        const blockX = Math.floor(proj.x / BLOCK_SIZE);
        const blockY = Math.floor(proj.y / BLOCK_SIZE);
        
        if (blockX >= 0 && blockX < WORLD_WIDTH && blockY >= 0 && blockY < WORLD_HEIGHT) {
            const block = game.world[blockX][blockY];
            if (block !== BLOCK.AIR && block !== BLOCK.WATER) {
                // Hit a wall - remove projectile
                game.projectiles.splice(i, 1);
                continue;
            }
        } else {
            // Out of bounds - remove projectile
            game.projectiles.splice(i, 1);
            continue;
        }
        
        // Arrows hit player (from skeletons)
        if (proj.type === 'arrow') {
            if (proj.x < game.player.x + game.player.width &&
                proj.x + proj.width > game.player.x &&
                proj.y < game.player.y + game.player.height &&
                proj.y + proj.height > game.player.y) {
                // Hit player!
                damagePlayer(proj.damage, proj.x, 'skeleton');
                game.projectiles.splice(i, 1);
                continue;
            }
        }
        
        // Snowballs hit mobs (knockback only)
        if (proj.type === 'snowball') {
            for (let j = game.entities.length - 1; j >= 0; j--) {
                const entity = game.entities[j];
                // Only hit hostile mobs
                if (entity.type !== 'zombie' && entity.type !== 'skeleton' && entity.type !== 'spider') continue;
                
                if (proj.x < entity.x + entity.width &&
                    proj.x + proj.width > entity.x &&
                    proj.y < entity.y + entity.height &&
                    proj.y + proj.height > entity.y) {
                    // Hit mob - apply knockback
                    entity.vx = proj.vx > 0 ? 8 : -8;
                    entity.vy = -5;
                    game.projectiles.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function renderProjectiles(ctx) {
    for (const proj of game.projectiles) {
        const screenX = proj.x - game.camera.x;
        const screenY = proj.y - game.camera.y;
        
        // Skip if off screen
        if (screenX < -20 || screenX > game.canvas.width + 20 ||
            screenY < -20 || screenY > game.canvas.height + 20) continue;
        
        if (proj.type === 'arrow') {
            // Draw arrow
            ctx.save();
            ctx.translate(screenX + proj.width / 2, screenY + proj.height / 2);
            
            // Rotate based on velocity
            const angle = Math.atan2(proj.vy, proj.vx);
            ctx.rotate(angle);
            
            // Arrow shaft (brown)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-8, -2, 16, 4);
            
            // Arrow head (gray)
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(4, -4);
            ctx.lineTo(4, 4);
            ctx.closePath();
            ctx.fill();
            
            // Feathers (red)
            ctx.fillStyle = '#cc3333';
            ctx.fillRect(-8, -3, 4, 2);
            ctx.fillRect(-8, 1, 4, 2);
            
            ctx.restore();
        } else if (proj.type === 'snowball') {
            // Draw snowball (simple white circle)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenX + 4, screenY + 4, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Add a slight shadow/highlight
            ctx.fillStyle = '#e0e0e0';
            ctx.beginPath();
            ctx.arc(screenX + 5, screenY + 5, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright spot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenX + 3, screenY + 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Cave mob spawning
let caveSpawnTimer = 0;
const CAVE_SPAWN_INTERVAL = 180; // Try to spawn every 3 seconds
const MAX_CAVE_MOBS = 8; // Maximum number of cave-spawned mobs
const TORCH_LIGHT_RADIUS = 5; // Torches light up 5 blocks

// Check if a position is lit by a nearby torch
function isPositionLit(blockX, blockY) {
    // Check in a radius around the position for torches
    for (let dx = -TORCH_LIGHT_RADIUS; dx <= TORCH_LIGHT_RADIUS; dx++) {
        for (let dy = -TORCH_LIGHT_RADIUS; dy <= TORCH_LIGHT_RADIUS; dy++) {
            const checkX = blockX + dx;
            const checkY = blockY + dy;
            
            // Bounds check
            if (checkX < 0 || checkX >= WORLD_WIDTH || checkY < 0 || checkY >= WORLD_HEIGHT) continue;
            
            // Check if there's a torch at this position
            if (game.world[checkX][checkY] === BLOCK.TORCH) {
                // Calculate distance (Manhattan or Euclidean)
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= TORCH_LIGHT_RADIUS) {
                    return true;
                }
            }
        }
    }
    return false;
}

function spawnCaveMobs() {
    // Only spawn in survival mode
    if (game.gameMode === 'creative') return;
    
    caveSpawnTimer++;
    if (caveSpawnTimer < CAVE_SPAWN_INTERVAL) return;
    caveSpawnTimer = 0;
    
    // Count existing hostile mobs
    const hostileMobs = game.entities.filter(e => 
        e.type === 'zombie' || e.type === 'skeleton' || e.type === 'spider'
    );
    
    if (hostileMobs.length >= MAX_CAVE_MOBS) return;
    
    // Get player position
    const playerBlockX = Math.floor(game.player.x / BLOCK_SIZE);
    const playerBlockY = Math.floor(game.player.y / BLOCK_SIZE);
    
    // Try to find a valid spawn location in caves near the player
    const spawnRadius = 30; // Blocks away from player to check
    const minDistance = 10; // Minimum distance from player
    
    for (let attempt = 0; attempt < 10; attempt++) {
        // Random position within spawn radius
        const offsetX = Math.floor(Math.random() * spawnRadius * 2) - spawnRadius;
        const offsetY = Math.floor(Math.random() * spawnRadius) + 5; // Bias downward (caves)
        
        const spawnX = playerBlockX + offsetX;
        const spawnY = playerBlockY + offsetY;
        
        // Check distance from player
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (distance < minDistance) continue;
        
        // Check bounds
        if (spawnX < 2 || spawnX >= WORLD_WIDTH - 2 || 
            spawnY < 10 || spawnY >= WORLD_HEIGHT - 2) continue;
        
        // Check if it's a valid cave spawn (air block with solid above and below nearby)
        if (game.world[spawnX][spawnY] !== BLOCK.AIR) continue;
        if (game.world[spawnX][spawnY + 1] !== BLOCK.AIR) continue; // Need 2 blocks tall
        
        // Check for ground below
        let hasGround = false;
        for (let checkY = spawnY + 2; checkY < spawnY + 5 && checkY < WORLD_HEIGHT; checkY++) {
            if (game.world[spawnX][checkY] !== BLOCK.AIR && 
                game.world[spawnX][checkY] !== BLOCK.WATER) {
                hasGround = true;
                break;
            }
        }
        if (!hasGround) continue;
        
        // Check if underground (has solid blocks above - it's a cave)
        let isUnderground = false;
        for (let checkY = spawnY - 1; checkY >= 0 && checkY > spawnY - 20; checkY--) {
            if (game.world[spawnX][checkY] !== BLOCK.AIR && 
                game.world[spawnX][checkY] !== BLOCK.WATER &&
                game.world[spawnX][checkY] !== BLOCK.LEAVES &&
                game.world[spawnX][checkY] !== BLOCK.BIRCH_LEAVES) {
                isUnderground = true;
                break;
            }
        }
        if (!isUnderground) continue;
        
        // Check if position is lit by torches - don't spawn if lit
        if (isPositionLit(spawnX, spawnY)) continue;
        
        // Valid spawn location found! Spawn a random hostile mob
        const roll = Math.random();
        let newMob;
        const pixelX = spawnX * BLOCK_SIZE;
        const pixelY = spawnY * BLOCK_SIZE;
        
        if (roll < 0.45) {
            newMob = createZombie(pixelX, pixelY);
        } else if (roll < 0.75) {
            newMob = createSkeleton(pixelX, pixelY);
        } else {
            newMob = createSpider(pixelX, pixelY);
        }
        
        game.entities.push(newMob);
        return; // Only spawn one mob per cycle
    }
}

// Night surface mob spawning
let nightSpawnTimer = 0;
const NIGHT_SPAWN_INTERVAL = 180; // Try to spawn every 3 seconds at night
const MAX_SURFACE_MOBS = 8; // Maximum surface mobs at night

function spawnNightMobs() {
    // Only spawn in survival mode and at night
    if (game.gameMode === 'creative') return;
    if (!game.dayNightCycle.isNight) return;
    
    nightSpawnTimer++;
    if (nightSpawnTimer < NIGHT_SPAWN_INTERVAL) return;
    nightSpawnTimer = 0;
    
    console.log("Attempting night mob spawn...");
    
    // Count existing hostile mobs on surface
    const surfaceMobs = game.entities.filter(e => 
        (e.type === 'zombie' || e.type === 'skeleton') && 
        e.y < WORLD_HEIGHT * BLOCK_SIZE * 0.4 // Upper 40% of world
    ).length;
    
    if (surfaceMobs >= MAX_SURFACE_MOBS) return;
    
    // Try to find a spawn location on surface near the player
    const playerBlockX = Math.floor(game.player.x / BLOCK_SIZE);
    const playerBlockY = Math.floor(game.player.y / BLOCK_SIZE);
    
    for (let attempt = 0; attempt < 10; attempt++) {
        // Spawn 20-40 blocks away from player
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 20);
        const spawnX = Math.floor(playerBlockX + offsetX);
        
        // Check bounds
        if (spawnX < 2 || spawnX >= WORLD_WIDTH - 2) continue;
        
        // Find the surface (first solid block from top, spawn in air above it)
        let spawnY = -1;
        for (let y = 0; y < WORLD_HEIGHT - 2; y++) {
            // Looking for 2 air blocks with solid ground below
            if (game.world[spawnX][y] === BLOCK.AIR && 
                game.world[spawnX][y + 1] === BLOCK.AIR &&
                y + 2 < WORLD_HEIGHT &&
                game.world[spawnX][y + 2] !== BLOCK.AIR &&
                game.world[spawnX][y + 2] !== BLOCK.WATER) {
                spawnY = y;
                break;
            }
        }
        
        // Skip if no valid spawn found or if too deep underground (surface is typically Y < 150)
        if (spawnY < 0 || spawnY > 180) continue;
        
        // Check if position is lit by torches - don't spawn if lit
        if (isPositionLit(spawnX, spawnY)) continue;
        
        // Valid spawn location! Spawn a zombie or skeleton
        const pixelX = spawnX * BLOCK_SIZE;
        const pixelY = spawnY * BLOCK_SIZE;
        
        const newMob = Math.random() < 0.6 ? 
            createZombie(pixelX, pixelY) : 
            createSkeleton(pixelX, pixelY);
        
        game.entities.push(newMob);
        console.log(`Night mob spawned at ${spawnX}, ${spawnY}!`);
        return; // Only spawn one mob per cycle
    }
    console.log("No valid spawn location found");
}

function renderZombie(ctx, zombie) {
    const screenX = zombie.x - game.camera.x;
    const screenY = zombie.y - game.camera.y;
    
    if (screenX < -50 || screenX > game.canvas.width + 50 ||
        screenY < -50 || screenY > game.canvas.height + 50) return;
    
    // Body (green)
    ctx.fillStyle = '#4a8a4a';
    ctx.fillRect(screenX, screenY + 16, zombie.width, zombie.height - 16);
    
    // Head (green)
    ctx.fillStyle = '#5a9a5a';
    ctx.fillRect(screenX + 2, screenY, zombie.width - 4, 16);
    
    // Eyes (dark)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(screenX + 6, screenY + 5, 4, 4);
    ctx.fillRect(screenX + 14, screenY + 5, 4, 4);
    
    // Shirt
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(screenX + 4, screenY + 20, zombie.width - 8, 8);
    
    // Legs
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(screenX + 2, screenY + zombie.height - 16, 8, 16);
    ctx.fillRect(screenX + zombie.width - 10, screenY + zombie.height - 16, 8, 16);
}

function renderSkeleton(ctx, skeleton) {
    const screenX = skeleton.x - game.camera.x;
    const screenY = skeleton.y - game.camera.y;
    
    if (screenX < -50 || screenX > game.canvas.width + 50 ||
        screenY < -50 || screenY > game.canvas.height + 50) return;
    
    // Body (white bones)
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(screenX + 8, screenY + 16, 8, 24);
    
    // Ribs
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(screenX + 4, screenY + 18, 16, 2);
    ctx.fillRect(screenX + 4, screenY + 22, 16, 2);
    ctx.fillRect(screenX + 4, screenY + 26, 16, 2);
    
    // Head (skull)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(screenX + 4, screenY, 16, 14);
    
    // Eye sockets (dark)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(screenX + 6, screenY + 4, 4, 5);
    ctx.fillRect(screenX + 14, screenY + 4, 4, 5);
    
    // Nose hole
    ctx.fillRect(screenX + 11, screenY + 8, 2, 3);
    
    // Legs (bones)
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(screenX + 6, screenY + 40, 4, 8);
    ctx.fillRect(screenX + 14, screenY + 40, 4, 8);
    
    // Bow - curved shape
    ctx.strokeStyle = '#8a6a42';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (skeleton.direction > 0) {
        // Facing right - bow on right side
        ctx.arc(screenX + 26, screenY + 28, 12, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        // Bowstring
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 26, screenY + 16);
        ctx.lineTo(screenX + 26, screenY + 40);
        ctx.stroke();
    } else {
        // Facing left - bow on left side
        ctx.arc(screenX - 2, screenY + 28, 12, Math.PI * 0.6, Math.PI * 1.4);
        ctx.stroke();
        // Bowstring
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX - 2, screenY + 16);
        ctx.lineTo(screenX - 2, screenY + 40);
        ctx.stroke();
    }
}

function renderSpider(ctx, spider) {
    const screenX = spider.x - game.camera.x;
    const screenY = spider.y - game.camera.y;
    
    if (screenX < -50 || screenX > game.canvas.width + 50 ||
        screenY < -50 || screenY > game.canvas.height + 50) return;
    
    // Body (dark gray/black)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(screenX + 8, screenY + 4, 12, 10);
    
    // Head
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(screenX + 4, screenY + 6, 6, 6);
    
    // Eyes (red)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX + 4, screenY + 7, 2, 2);
    ctx.fillRect(screenX + 7, screenY + 7, 2, 2);
    
    // Legs
    ctx.fillStyle = '#1a1a1a';
    // Left legs
    ctx.fillRect(screenX, screenY + 2, 8, 2);
    ctx.fillRect(screenX, screenY + 8, 8, 2);
    ctx.fillRect(screenX, screenY + 12, 8, 2);
    // Right legs
    ctx.fillRect(screenX + 20, screenY + 2, 8, 2);
    ctx.fillRect(screenX + 20, screenY + 8, 8, 2);
    ctx.fillRect(screenX + 20, screenY + 12, 8, 2);
}

function renderSheep(ctx, sheep) {
    const screenX = sheep.x - game.camera.x;
    const screenY = sheep.y - game.camera.y;
    
    // Only render if on screen
    if (screenX < -50 || screenX > game.canvas.width + 50 ||
        screenY < -50 || screenY > game.canvas.height + 50) {
        return;
    }
    
    if (sheep.sheared) {
        // Sheared sheep - pink/skinny body
        ctx.fillStyle = '#e8c0c0';
        ctx.fillRect(screenX + 4, screenY + 8, 20, 12);
    } else {
        // Sheep body (wool) - white fluffy rectangle
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(screenX + 2, screenY + 4, 24, 16);
        
        // Wool texture (darker spots)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(screenX + 5, screenY + 6, 4, 4);
        ctx.fillRect(screenX + 15, screenY + 8, 5, 5);
        ctx.fillRect(screenX + 10, screenY + 12, 4, 4);
    }
    
    // Sheep head - facing direction
    ctx.fillStyle = '#d0d0d0';
    if (sheep.direction > 0) {
        // Facing right
        ctx.fillRect(screenX + 22, screenY + 6, 8, 10);
        // Face
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(screenX + 26, screenY + 7, 4, 8);
        // Eye
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX + 27, screenY + 9, 2, 2);
    } else {
        // Facing left
        ctx.fillRect(screenX - 2, screenY + 6, 8, 10);
        // Face
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(screenX - 2, screenY + 7, 4, 8);
        // Eye
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX - 1, screenY + 9, 2, 2);
    }
    
    // Legs
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(screenX + 4, screenY + 18, 4, 6);
    ctx.fillRect(screenX + 20, screenY + 18, 4, 6);
}

function updateHotbarUI() {
    // Update the main game hotbar
    const slots = document.querySelectorAll('#game-ui .hotbar-slot');
    slots.forEach((slot, i) => {
        slot.classList.remove('selected');
        if (i === game.selectedHotbarSlot) {
            slot.classList.add('selected');
        }
    });

    // Update inventory hotbar if open
    if (game.isInventoryOpen) {
        generateInventoryUI();
    }
}

function updateGameHotbar() {
    // Update the visual game hotbar to reflect inventory state
    const slots = document.querySelectorAll('#game-ui .hotbar-slot');
    
    slots.forEach((slot, i) => {
        const item = game.hotbar[i];
        let blockPreview = slot.querySelector('.block-preview');
        
        // Remove existing count display
        const existingCount = slot.querySelector('.hotbar-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        if (item && item.block !== BLOCK.AIR && item.count > 0) {
            // Show the block
            if (blockPreview) {
                blockPreview.style.display = 'block';
                // Update block type class
                blockPreview.className = `block-preview ${getBlockClassName(item.block)}`;
                // Apply custom texture if available
                applyCustomTextureToElement(blockPreview, item.block);
            }
            
            // Add count display
            const countSpan = document.createElement('span');
            countSpan.className = 'hotbar-count';
            countSpan.textContent = item.count;
            slot.appendChild(countSpan);
        } else {
            // Hide the block preview if empty
            if (blockPreview) {
                blockPreview.style.display = 'none';
                // Clear any custom texture styles
                blockPreview.style.backgroundImage = '';
            }
        }
        
        // Update selection
        slot.classList.remove('selected');
        if (i === game.selectedHotbarSlot) {
            slot.classList.add('selected');
        }
    });
}

function addToInventory(blockType, count = 1) {
    let added = false;
    
    // First try to stack in existing slots
    for (let i = 0; i < game.hotbar.length; i++) {
        if (game.hotbar[i].block === blockType && game.hotbar[i].count < 64) {
            const canAdd = Math.min(count, 64 - game.hotbar[i].count);
            game.hotbar[i].count += canAdd;
            count -= canAdd;
            added = true;
            if (count <= 0) {
                updateGameHotbar();
                return true;
            }
        }
    }

    for (let i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].block === blockType && game.inventory[i].count < 64) {
            const canAdd = Math.min(count, 64 - game.inventory[i].count);
            game.inventory[i].count += canAdd;
            count -= canAdd;
            if (count <= 0) return true;
        }
    }

    // Then try empty slots in hotbar
    for (let i = 0; i < game.hotbar.length; i++) {
        if (game.hotbar[i].block === BLOCK.AIR || game.hotbar[i].count === 0) {
            game.hotbar[i] = { block: blockType, count: Math.min(count, 64) };
            count -= Math.min(count, 64);
            added = true;
            if (count <= 0) {
                updateGameHotbar();
                return true;
            }
        }
    }

    // Then try empty slots in inventory
    for (let i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].block === BLOCK.AIR || game.inventory[i].count === 0) {
            game.inventory[i] = { block: blockType, count: Math.min(count, 64) };
            count -= Math.min(count, 64);
            if (count <= 0) {
                if (added) updateGameHotbar();
                return true;
            }
        }
    }

    if (added) updateGameHotbar();
    return count <= 0;
}

// ==================== WORLD GENERATION ====================
function generateWorld() {
    game.world = [];

    // Initialize empty world
    for (let x = 0; x < WORLD_WIDTH; x++) {
        game.world[x] = [];
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            game.world[x][y] = BLOCK.AIR;
        }
    }

    // Generate biomes - chunks of 40-80 blocks
    const biomes = [];
    let currentBiome = 'plains';
    let biomeLength = 0;
    
    for (let x = 0; x < WORLD_WIDTH; x++) {
        if (biomeLength <= 0) {
            // Switch biome randomly
            const roll = Math.random();
            if (roll < 0.08 && currentBiome !== 'swamp') {
                currentBiome = 'swamp';
            } else if (roll < 0.18 && currentBiome !== 'mountain') {
                currentBiome = 'mountain';
            } else if (roll < 0.30 && currentBiome !== 'forest') {
                currentBiome = 'forest';
            } else if (roll < 0.42 && currentBiome !== 'birch_forest') {
                currentBiome = 'birch_forest';
            } else if (roll < 0.55 && currentBiome !== 'ocean') {
                currentBiome = 'ocean';
            } else {
                currentBiome = 'plains';
            }
            biomeLength = 40 + Math.floor(Math.random() * 40);  // 40-80 blocks wide
        }
        biomes[x] = currentBiome;
        biomeLength--;
    }
    
    // Make sure spawn area (center) is plains
    const spawnCenter = Math.floor(WORLD_WIDTH / 2);
    for (let x = spawnCenter - 20; x < spawnCenter + 20; x++) {
        if (x >= 0 && x < WORLD_WIDTH) {
            biomes[x] = 'plains';
        }
    }
    
    // Store biomes in game state for rendering
    game.biomes = biomes;

    // Generate terrain using simple noise
    const heights = [];
    let height = GROUND_LEVEL;

    for (let x = 0; x < WORLD_WIDTH; x++) {
        // Swamp biomes are flatter and lower
        if (biomes[x] === 'swamp') {
            height += Math.floor(Math.random() * 2) - 0.5;
            height = Math.max(GROUND_LEVEL + 2, Math.min(GROUND_LEVEL + 5, height));
        } else if (biomes[x] === 'mountain') {
            // Mountain biome - extreme peaks with steep terrain
            // Create dramatic height changes that actually form peaks
            const peakChance = Math.random();
            if (peakChance < 0.3) {
                height -= 8;  // Steep climb up
            } else if (peakChance < 0.5) {
                height -= 4;  // Gradual climb
            } else if (peakChance < 0.7) {
                height += 2;  // Slight descent
            } else {
                height += 6;  // Steep descent
            }
            height = Math.max(GROUND_LEVEL - 120, Math.min(GROUND_LEVEL - 15, height));  // Tall peaks!
        } else if (biomes[x] === 'forest') {
            // Forest biome - gentle hills with slight variation
            height += (Math.random() * 2) - 1;
            height = Math.max(GROUND_LEVEL - 5, Math.min(GROUND_LEVEL + 5, height));
        } else if (biomes[x] === 'birch_forest') {
            // Birch forest biome - similar to forest, gentle hills
            height += (Math.random() * 2) - 1;
            height = Math.max(GROUND_LEVEL - 5, Math.min(GROUND_LEVEL + 5, height));
        } else if (biomes[x] === 'ocean') {
            // Ocean biome - deep water with sandy bottom
            // Ocean floor is 5-12 blocks below grass level
            height += (Math.random() * 1) - 0.5;
            height = Math.max(GROUND_LEVEL + 5, Math.min(GROUND_LEVEL + 12, height));
        } else {
            // Plains biome - gentle rolling hills, mostly flat
            height += (Math.random() * 1.5) - 0.75;  // Smaller variation
            height = Math.max(GROUND_LEVEL - 3, Math.min(GROUND_LEVEL + 3, height));  // Smaller hills
        }
        heights[x] = Math.floor(height);
    }

    // Smooth the terrain (skip mountains and oceans)
    for (let i = 0; i < 3; i++) {
        for (let x = 1; x < WORLD_WIDTH - 1; x++) {
            // Don't smooth mountains - keep the peaks sharp!
            // Don't smooth oceans - keep the depth consistent for water
            if (biomes[x] === 'mountain' || biomes[x] === 'ocean') continue;
            heights[x] = Math.floor((heights[x - 1] + heights[x] + heights[x + 1]) / 3);
        }
    }
    
    // Create beach slopes at ocean edges
    for (let x = 1; x < WORLD_WIDTH - 1; x++) {
        const isOcean = biomes[x] === 'ocean';
        const leftIsOcean = biomes[x - 1] === 'ocean';
        const rightIsOcean = biomes[x + 1] === 'ocean';
        
        // Detect ocean-land transitions
        if (isOcean && !leftIsOcean) {
            // Left edge of ocean - create beach slope going into ocean
            const beachWidth = 4 + Math.floor(Math.random() * 3); // 4-6 blocks
            const landHeight = heights[x - 1];
            const oceanFloor = heights[x];
            
            for (let i = 0; i < beachWidth && x + i < WORLD_WIDTH; i++) {
                if (biomes[x + i] !== 'ocean') break;
                // Gradual slope from land to ocean floor
                const t = i / beachWidth;
                heights[x + i] = Math.floor(landHeight + (oceanFloor - landHeight) * t);
            }
        }
        
        if (isOcean && !rightIsOcean) {
            // Right edge of ocean - create beach slope coming out of ocean
            const beachWidth = 4 + Math.floor(Math.random() * 3); // 4-6 blocks
            const landHeight = heights[x + 1];
            const oceanFloor = heights[x];
            
            for (let i = 0; i < beachWidth && x - i >= 0; i++) {
                if (biomes[x - i] !== 'ocean') break;
                // Gradual slope from ocean floor to land
                const t = i / beachWidth;
                heights[x - i] = Math.floor(landHeight + (oceanFloor - landHeight) * t);
            }
        }
        
        // Add sandy beach on land next to ocean
        if (!isOcean && (leftIsOcean || rightIsOcean)) {
            // Mark this as a beach area (we'll use sand instead of grass)
            biomes[x] = 'beach';
        }
    }

    // Fill in blocks
    for (let x = 0; x < WORLD_WIDTH; x++) {
        const surfaceY = heights[x];
        const isSwamp = biomes[x] === 'swamp';
        const isMountain = biomes[x] === 'mountain';
        const isOcean = biomes[x] === 'ocean';
        const isBeach = biomes[x] === 'beach';

        for (let y = 0; y < WORLD_HEIGHT; y++) {
            if (isOcean) {
                // Ocean biome - sand floor with water above
                // Water level aligns with grass level (GROUND_LEVEL + 2 to be slightly below grass)
                const waterLevel = GROUND_LEVEL + 2;
                
                if (y === surfaceY) {
                    game.world[x][y] = BLOCK.SAND;
                } else if (y > surfaceY && y < surfaceY + 3) {
                    // Mix of sand and gravel below surface
                    game.world[x][y] = Math.random() < 0.3 ? BLOCK.GRAVEL : BLOCK.SAND;
                } else if (y >= surfaceY + 3 && y < surfaceY + 6) {
                    game.world[x][y] = BLOCK.GRAVEL;
                } else if (y >= surfaceY + 6) {
                    game.world[x][y] = BLOCK.STONE;
                } else if (y < surfaceY && y >= waterLevel) {
                    // Fill with water from water level down to sand floor
                    game.world[x][y] = BLOCK.WATER;
                }
            } else if (isBeach) {
                // Beach biome - sand surface with sand/dirt below
                if (y === surfaceY) {
                    game.world[x][y] = BLOCK.SAND;
                } else if (y > surfaceY && y < surfaceY + 3) {
                    game.world[x][y] = BLOCK.SAND;
                } else if (y >= surfaceY + 3 && y < surfaceY + 5) {
                    game.world[x][y] = BLOCK.DIRT;
                } else if (y >= surfaceY + 5) {
                    game.world[x][y] = BLOCK.STONE;
                }
            } else if (y === surfaceY) {
                if (isMountain) {
                    // Mountain surface - snow on high peaks, stone on lower parts
                    if (surfaceY < GROUND_LEVEL - 30) {
                        game.world[x][y] = BLOCK.SNOW;  // Snow on peaks (30+ blocks high)
                    } else {
                        game.world[x][y] = BLOCK.STONE;  // Exposed stone
                    }
                } else {
                    // Use regular grass - biome coloring is handled during rendering
                    game.world[x][y] = BLOCK.GRASS;
                }
            } else if (y > surfaceY && y < surfaceY + 5) {
                if (isMountain) {
                    game.world[x][y] = BLOCK.STONE;  // Mountains are mostly stone
                } else {
                    game.world[x][y] = BLOCK.DIRT;
                }
            } else if (y >= surfaceY + 5) {
                game.world[x][y] = BLOCK.STONE;
            }
        }
    }

    // Generate swamp features (water and islands)
    generateSwampBiome(heights, biomes);

    // Generate trees (pass biomes for swamp trees)
    generateTrees(heights, biomes);

    // Generate caves
    generateCaves(heights);

    // Generate ores (after caves so we can place them near cave walls)
    generateOres(heights);

    // Generate dungeons (20% chance)
    generateDungeons(heights);

    // Set player spawn position
    const spawnX = Math.floor(WORLD_WIDTH / 2);
    game.player.x = spawnX * BLOCK_SIZE + BLOCK_SIZE / 2 - game.player.width / 2;
    game.player.y = (heights[spawnX] - 3) * BLOCK_SIZE;
    game.player.vx = 0;
    game.player.vy = 0;

    // Save spawn point for respawning
    game.spawnPoint.x = game.player.x;
    game.spawnPoint.y = game.player.y;
    game.player.lastY = game.player.y;

    // Reset health for new world
    game.player.health = game.player.maxHealth;
    game.player.invincibleTimer = 0;

    // Reset inventory for new world
    initInventory();

    // Spawn sheep
    spawnInitialSheep(heights);
    
    // Spawn fish in ocean biomes
    spawnInitialFish(heights, biomes);
}

function generateSwampBiome(heights, biomes) {
    // Find swamp regions and add water
    for (let x = 0; x < WORLD_WIDTH; x++) {
        if (biomes[x] !== 'swamp') continue;
        
        const surfaceY = heights[x];
        
        // Determine if this is water or island
        // Create pools of water with occasional small islands
        const isIsland = Math.random() < 0.15;  // 15% chance for island
        
        if (!isIsland) {
            // Replace grass with water (1 block deep) in swamp
            if (game.world[x][surfaceY] === BLOCK.GRASS) {
                game.world[x][surfaceY] = BLOCK.WATER;
                // Make sure there's dirt below
                if (surfaceY + 1 < WORLD_HEIGHT) {
                    game.world[x][surfaceY + 1] = BLOCK.DIRT;
                }
            }
        }
    }
    
    // Smooth out water edges - make water pools more connected
    for (let pass = 0; pass < 2; pass++) {
        for (let x = 1; x < WORLD_WIDTH - 1; x++) {
            if (biomes[x] !== 'swamp') continue;
            
            const surfaceY = heights[x];
            const leftIsWater = game.world[x-1][heights[x-1]] === BLOCK.WATER;
            const rightIsWater = game.world[x+1][heights[x+1]] === BLOCK.WATER;
            
            // If surrounded by water on both sides, make this water too
            if (leftIsWater && rightIsWater && game.world[x][surfaceY] === BLOCK.GRASS) {
                if (Math.random() < 0.7) {
                    game.world[x][surfaceY] = BLOCK.WATER;
                }
            }
        }
    }
}

function generateTrees(heights, biomes) {
    let lastTreeX = -10;

    for (let x = 5; x < WORLD_WIDTH - 5; x++) {
        const isSwamp = biomes && biomes[x] === 'swamp';
        const isMountain = biomes && biomes[x] === 'mountain';
        const isForest = biomes && biomes[x] === 'forest';
        const isBirchForest = biomes && biomes[x] === 'birch_forest';
        const isOcean = biomes && biomes[x] === 'ocean';
        const isBeach = biomes && biomes[x] === 'beach';
        
        // No trees on mountains, in oceans, or on beaches
        if (isMountain) continue;
        if (isOcean) continue;
        if (isBeach) continue;
        
        // In swamp, only place trees on islands (grass blocks, not water)
        if (isSwamp && game.world[x][heights[x]] === BLOCK.WATER) continue;
        
        // Random chance to spawn tree, with minimum spacing
        // Forest has lots of trees, swamps have many trees, plains have scattered trees
        let treeChance;
        let minSpacing;
        if (isForest || isBirchForest) {
            treeChance = 0.35;  // Forest: 35% - very dense
            minSpacing = 3;     // Trees can be closer together
        } else if (isSwamp) {
            treeChance = 0.18;  // Swamp: 18%
            minSpacing = 5;
        } else {
            treeChance = 0.07;  // Plains: 7%
            minSpacing = 5;
        }
        
        if (x - lastTreeX > minSpacing && Math.random() < treeChance) {
            const surfaceY = heights[x];
            
            // Check if ground is relatively flat
            if (Math.abs(heights[x - 1] - heights[x]) <= 1 && 
                Math.abs(heights[x + 1] - heights[x]) <= 1) {
                
                if (isSwamp) {
                    generateSwampTree(x, surfaceY);
                } else if (isBirchForest) {
                    // Birch forest has only birch trees, 10% are tall
                    if (Math.random() < 0.10) {
                        generateTallBirchTree(x, surfaceY);
                    } else {
                        generateBirchTree(x, surfaceY);
                    }
                } else if (isForest) {
                    // Forest has a mix of oak and birch trees
                    if (Math.random() < 0.4) {
                        generateBirchTree(x, surfaceY);
                    } else {
                        generateTree(x, surfaceY);
                    }
                } else {
                    // Plains - regular oak trees
                    generateTree(x, surfaceY);
                }
                lastTreeX = x;
            }
        }
    }
}

function generateTree(x, surfaceY) {
    const trunkHeight = 4 + Math.floor(Math.random() * 3);
    
    // Generate trunk
    for (let ty = 1; ty <= trunkHeight; ty++) {
        const worldY = surfaceY - ty;
        if (worldY >= 0 && worldY < WORLD_HEIGHT) {
            game.world[x][worldY] = BLOCK.WOOD;
        }
    }

    // Generate leaves
    const leavesStartY = surfaceY - trunkHeight;
    const leavesRadius = 2;

    for (let lx = -leavesRadius; lx <= leavesRadius; lx++) {
        for (let ly = -leavesRadius; ly <= 1; ly++) {
            const worldX = x + lx;
            const worldY = leavesStartY + ly;

            if (worldX >= 0 && worldX < WORLD_WIDTH && 
                worldY >= 0 && worldY < WORLD_HEIGHT) {
                
                // Circular-ish shape
                const dist = Math.abs(lx) + Math.abs(ly);
                if (dist <= leavesRadius + 1 && game.world[worldX][worldY] === BLOCK.AIR) {
                    // Don't place leaves at corners for more natural look
                    if (!(Math.abs(lx) === leavesRadius && Math.abs(ly) === leavesRadius)) {
                        game.world[worldX][worldY] = BLOCK.LEAVES;
                    }
                }
            }
        }
    }
}

function generateBirchTree(x, surfaceY) {
    const trunkHeight = 5 + Math.floor(Math.random() * 3);  // Slightly taller than oak
    
    // Generate trunk (birch wood)
    for (let ty = 1; ty <= trunkHeight; ty++) {
        const worldY = surfaceY - ty;
        if (worldY >= 0 && worldY < WORLD_HEIGHT) {
            game.world[x][worldY] = BLOCK.BIRCH_WOOD;
        }
    }

    // Generate leaves (birch leaves - darker)
    const leavesStartY = surfaceY - trunkHeight;
    const leavesRadius = 2;

    for (let lx = -leavesRadius; lx <= leavesRadius; lx++) {
        for (let ly = -leavesRadius; ly <= 1; ly++) {
            const worldX = x + lx;
            const worldY = leavesStartY + ly;

            if (worldX >= 0 && worldX < WORLD_WIDTH && 
                worldY >= 0 && worldY < WORLD_HEIGHT) {
                
                // Circular-ish shape
                const dist = Math.abs(lx) + Math.abs(ly);
                if (dist <= leavesRadius + 1 && game.world[worldX][worldY] === BLOCK.AIR) {
                    // Don't place leaves at corners for more natural look
                    if (!(Math.abs(lx) === leavesRadius && Math.abs(ly) === leavesRadius)) {
                        game.world[worldX][worldY] = BLOCK.BIRCH_LEAVES;
                    }
                }
            }
        }
    }
}

function generateTallTree(x, surfaceY) {
    const trunkHeight = 10 + Math.floor(Math.random() * 4);  // 10-13 blocks tall
    
    // Generate trunk
    for (let ty = 1; ty <= trunkHeight; ty++) {
        const worldY = surfaceY - ty;
        if (worldY >= 0 && worldY < WORLD_HEIGHT) {
            game.world[x][worldY] = BLOCK.WOOD;
        }
    }

    // Generate larger leaf canopy for tall trees
    const leavesStartY = surfaceY - trunkHeight;
    const leavesRadius = 3;

    for (let lx = -leavesRadius; lx <= leavesRadius; lx++) {
        for (let ly = -leavesRadius; ly <= 2; ly++) {
            const worldX = x + lx;
            const worldY = leavesStartY + ly;

            if (worldX >= 0 && worldX < WORLD_WIDTH && 
                worldY >= 0 && worldY < WORLD_HEIGHT) {
                const dist = Math.abs(lx) + Math.abs(ly);
                if (dist <= leavesRadius + 1 && game.world[worldX][worldY] === BLOCK.AIR) {
                    if (!(Math.abs(lx) === leavesRadius && Math.abs(ly) >= leavesRadius - 1)) {
                        game.world[worldX][worldY] = BLOCK.LEAVES;
                    }
                }
            }
        }
    }
}

function generateTallBirchTree(x, surfaceY) {
    const trunkHeight = 10 + Math.floor(Math.random() * 4);  // 10-13 blocks tall
    
    // Generate trunk (birch wood)
    for (let ty = 1; ty <= trunkHeight; ty++) {
        const worldY = surfaceY - ty;
        if (worldY >= 0 && worldY < WORLD_HEIGHT) {
            game.world[x][worldY] = BLOCK.BIRCH_WOOD;
        }
    }

    // Generate larger leaf canopy for tall trees
    const leavesStartY = surfaceY - trunkHeight;
    const leavesRadius = 3;

    for (let lx = -leavesRadius; lx <= leavesRadius; lx++) {
        for (let ly = -leavesRadius; ly <= 2; ly++) {
            const worldX = x + lx;
            const worldY = leavesStartY + ly;

            if (worldX >= 0 && worldX < WORLD_WIDTH && 
                worldY >= 0 && worldY < WORLD_HEIGHT) {
                const dist = Math.abs(lx) + Math.abs(ly);
                if (dist <= leavesRadius + 1 && game.world[worldX][worldY] === BLOCK.AIR) {
                    if (!(Math.abs(lx) === leavesRadius && Math.abs(ly) >= leavesRadius - 1)) {
                        game.world[worldX][worldY] = BLOCK.BIRCH_LEAVES;
                    }
                }
            }
        }
    }
}

function generateSwampTree(x, surfaceY) {
    const trunkHeight = 5 + Math.floor(Math.random() * 3);  // Taller than normal trees
    
    // Generate trunk
    for (let ty = 1; ty <= trunkHeight; ty++) {
        const worldY = surfaceY - ty;
        if (worldY >= 0 && worldY < WORLD_HEIGHT) {
            game.world[x][worldY] = BLOCK.WOOD;
        }
    }

    // Generate swamp leaves (darker)
    const leavesStartY = surfaceY - trunkHeight;
    const leavesRadius = 3;  // Wider canopy

    const leafPositions = [];  // Track where leaves are for vines

    for (let lx = -leavesRadius; lx <= leavesRadius; lx++) {
        for (let ly = -leavesRadius; ly <= 1; ly++) {
            const worldX = x + lx;
            const worldY = leavesStartY + ly;

            if (worldX >= 0 && worldX < WORLD_WIDTH && 
                worldY >= 0 && worldY < WORLD_HEIGHT) {
                
                // Circular-ish shape
                const dist = Math.abs(lx) + Math.abs(ly);
                if (dist <= leavesRadius + 1 && game.world[worldX][worldY] === BLOCK.AIR) {
                    // Skip some corners for natural look
                    if (!(Math.abs(lx) === leavesRadius && Math.abs(ly) === leavesRadius)) {
                        // Use regular leaves - biome coloring is handled during rendering
                        game.world[worldX][worldY] = BLOCK.LEAVES;
                        leafPositions.push({ x: worldX, y: worldY });
                    }
                }
            }
        }
    }

    // Add vines hanging from leaves
    for (const leaf of leafPositions) {
        // 40% chance to have a vine hanging from each edge leaf
        if (Math.random() < 0.4) {
            // Check if it's an edge leaf (has air below or is on the edge)
            const belowY = leaf.y + 1;
            if (belowY < WORLD_HEIGHT && game.world[leaf.x][belowY] === BLOCK.AIR) {
                // Add 1-4 vine blocks hanging down
                const vineLength = 1 + Math.floor(Math.random() * 4);
                for (let v = 1; v <= vineLength; v++) {
                    const vineY = leaf.y + v;
                    if (vineY < WORLD_HEIGHT && game.world[leaf.x][vineY] === BLOCK.AIR) {
                        game.world[leaf.x][vineY] = BLOCK.VINE;
                    } else {
                        break;  // Stop if we hit something
                    }
                }
            }
        }
    }
}

function generateCaves(heights) {
    // Generate fewer cave systems using worm algorithm
    const numCaves = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numCaves; i++) {
        // Start cave at random position underground
        const startX = Math.floor(Math.random() * WORLD_WIDTH);
        const minY = heights[startX] + 10; // Start deeper below dirt layer
        const maxY = WORLD_HEIGHT - 5;
        
        if (minY >= maxY) continue;
        
        const startY = minY + Math.floor(Math.random() * (maxY - minY));
        
        // Carve cave using worm algorithm
        carveCaveWorm(startX, startY, heights);
    }
    
    // Add a few small cave rooms
    const numRooms = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numRooms; i++) {
        const roomX = 10 + Math.floor(Math.random() * (WORLD_WIDTH - 20));
        const minY = heights[roomX] + 18;
        const maxY = WORLD_HEIGHT - 10;
        
        if (minY >= maxY) continue;
        
        const roomY = minY + Math.floor(Math.random() * (maxY - minY));
        carveCaveRoom(roomX, roomY, heights);
    }
}

function carveCaveWorm(startX, startY, heights) {
    let x = startX;
    let y = startY;
    let angle = Math.random() * Math.PI * 2;
    const length = 10 + Math.floor(Math.random() * 15); // Shorter caves
    
    for (let i = 0; i < length; i++) {
        // Carve out smaller area around current position
        const radius = 1 + Math.floor(Math.random() * 2); // Smaller radius
        
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    const cx = Math.floor(x + dx);
                    const cy = Math.floor(y + dy);
                    
                    // Check bounds and don't carve above surface
                    if (cx >= 0 && cx < WORLD_WIDTH && 
                        cy >= 0 && cy < WORLD_HEIGHT &&
                        cy > heights[cx] + 5) {
                        game.world[cx][cy] = BLOCK.AIR;
                    }
                }
            }
        }
        
        // Move worm
        angle += (Math.random() - 0.5) * 0.8;
        x += Math.cos(angle) * 1.5;
        y += Math.sin(angle) * 1;
        
        // Keep within bounds
        x = Math.max(2, Math.min(WORLD_WIDTH - 2, x));
        y = Math.max(heights[Math.floor(x)] + 8, Math.min(WORLD_HEIGHT - 2, y));
    }
}

function carveCaveRoom(centerX, centerY, heights) {
    const width = 2 + Math.floor(Math.random() * 3);  // Smaller rooms
    const height = 2 + Math.floor(Math.random() * 2);
    
    for (let dx = -width; dx <= width; dx++) {
        for (let dy = -height; dy <= height; dy++) {
            // Elliptical shape
            const normalizedDist = (dx * dx) / (width * width) + (dy * dy) / (height * height);
            if (normalizedDist <= 1) {
                const cx = centerX + dx;
                const cy = centerY + dy;
                
                // Check bounds and don't carve above surface
                if (cx >= 0 && cx < WORLD_WIDTH && 
                    cy >= 0 && cy < WORLD_HEIGHT &&
                    cy > heights[cx] + 5) {
                    game.world[cx][cy] = BLOCK.AIR;
                }
            }
        }
    }
}

function generateOres(heights) {
    // First pass: place ores near caves (higher chance)
    for (let x = 0; x < WORLD_WIDTH; x++) {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            if (game.world[x][y] !== BLOCK.STONE) continue;
            
            // Check if near a cave (adjacent to air underground)
            const nearCave = isNearCave(x, y, heights);
            const depth = y - heights[x];
            
            // Coal generation - less common now
            // Higher chance near caves, lower chance elsewhere
            const coalChance = nearCave ? 0.04 : 0.008;
            if (Math.random() < coalChance) {
                placeOreVein(x, y, BLOCK.COAL, 2 + Math.floor(Math.random() * 2), heights);
            }
            
            // Copper generation - similar depth to coal, but rarer
            if (depth > 8) {
                const copperChance = nearCave ? 0.025 : 0.005;
                if (Math.random() < copperChance) {
                    placeOreVein(x, y, BLOCK.COPPER_ORE, 2 + Math.floor(Math.random() * 3), heights);
                }
            }
            
            // Iron generation - rarer than coal
            // Only spawns deeper and with lower chance
            if (depth > 12) { // Iron only spawns deeper
                const ironChance = nearCave ? 0.015 : 0.003;
                if (Math.random() < ironChance) {
                    placeOreVein(x, y, BLOCK.IRON, 1 + Math.floor(Math.random() * 2), heights);
                }
            }
            
            // Gold generation - deepest and rarest (not in mountains)
            const isMountainBiome = game.biomes && game.biomes[x] === 'mountain';
            if (depth > 25 && !isMountainBiome) { // Gold only spawns very deep, not in mountains
                const goldChance = nearCave ? 0.012 : 0.002;
                if (Math.random() < goldChance) {
                    placeOreVein(x, y, BLOCK.GOLD_ORE, 1 + Math.floor(Math.random() * 2), heights);
                }
            }
        }
    }
}

function isNearCave(x, y, heights) {
    // Check if any adjacent block is air (underground)
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < WORLD_WIDTH && 
                ny >= 0 && ny < WORLD_HEIGHT &&
                ny > heights[nx] + 3) { // Only count as cave if underground
                if (game.world[nx][ny] === BLOCK.AIR) {
                    return true;
                }
            }
        }
    }
    return false;
}

function generateDungeons(heights) {
    // Reset spawners and chests
    game.spawners = {};
    game.chests = {};
    
    // Always spawn a dungeon 10 blocks from player spawn for testing
    const playerSpawnX = Math.floor(WORLD_WIDTH / 2);
    const dungeonX = playerSpawnX + 10;  // 10 blocks to the right of player
    const surfaceY = heights[dungeonX] || heights[playerSpawnX];
    const dungeonY = surfaceY + 15;  // 15 blocks below surface (in stone layer)
    
    // Make sure we have room
    if (dungeonX + 10 < WORLD_WIDTH && dungeonY + 8 < WORLD_HEIGHT) {
        // Clear area and create dungeon
        createDungeonRoom(dungeonX, dungeonY);
    }
}

function createDungeonRoom(startX, startY) {
    const width = 10;
    const height = 8;
    
    // Build walls with mix of cobblestone and mossy cobblestone
    for (let x = startX; x < startX + width; x++) {
        for (let y = startY; y < startY + height; y++) {
            if (x === startX || x === startX + width - 1 ||
                y === startY || y === startY + height - 1) {
                // Walls - 40% chance of mossy cobblestone, 60% regular cobblestone
                if (Math.random() < 0.4) {
                    game.world[x][y] = BLOCK.MOSSY_COBBLESTONE;
                } else {
                    game.world[x][y] = BLOCK.COBBLESTONE;
                }
            } else {
                // Interior - hollow it out
                game.world[x][y] = BLOCK.AIR;
            }
        }
    }
    
    // Place spawner on the floor (one block above bottom wall)
    const spawnerX = startX + Math.floor(width / 2);
    const spawnerY = startY + height - 2;  // On the floor
    game.world[spawnerX][spawnerY] = BLOCK.SPAWNER;
    
    // Determine spawner type (50% zombie, 25% skeleton, 25% spider)
    const roll = Math.random();
    let mobType;
    if (roll < 0.50) {
        mobType = 'zombie';
    } else if (roll < 0.75) {
        mobType = 'skeleton';
    } else {
        mobType = 'spider';
    }
    
    // Store spawner data
    const spawnerKey = `${spawnerX},${spawnerY}`;
    game.spawners[spawnerKey] = {
        x: spawnerX,
        y: spawnerY,
        mobType: mobType,
        spawnTimer: 0,
        maxMobs: 4,
        spawnedMobs: []
    };
    
    // Place 1-2 chests on the floor
    const numChests = 1 + Math.floor(Math.random() * 2);  // 1 or 2
    const floorY = startY + height - 2;  // Same level as spawner
    const usedPositions = [spawnerX];  // Don't place chest where spawner is
    
    for (let i = 0; i < numChests; i++) {
        // Find a valid position for chest (not on spawner, not on walls)
        let chestX;
        let attempts = 0;
        do {
            chestX = startX + 2 + Math.floor(Math.random() * (width - 4));  // Avoid walls
            attempts++;
        } while (usedPositions.includes(chestX) && attempts < 10);
        
        if (!usedPositions.includes(chestX)) {
            usedPositions.push(chestX);
            game.world[chestX][floorY] = BLOCK.CHEST;
            
            // Initialize chest with dungeon loot
            const chestKey = `${chestX},${floorY}`;
            game.chests[chestKey] = {
                x: chestX,
                y: floorY,
                slots: generateDungeonLoot()
            };
        }
    }
}

function generateDungeonLoot() {
    // Loot table with probabilities (must sum to 100%)
    const lootTable = [
        { item: BLOCK.PLANKS, minCount: 2, maxCount: 4, chance: 2 },
        { item: BLOCK.MOSSY_COBBLESTONE, minCount: 1, maxCount: 2, chance: 0.8 },
        { item: BLOCK.COBBLESTONE, minCount: 1, maxCount: 2, chance: 1 },
        { item: BLOCK.APPLE, minCount: 2, maxCount: 4, chance: 10 },
        { item: BLOCK.RAW_MEAT, minCount: 1, maxCount: 1, chance: 5 },
        { item: BLOCK.COOKED_MEAT, minCount: 1, maxCount: 1, chance: 2.4 },
        { item: BLOCK.DIRT, minCount: 4, maxCount: 5, chance: 1.5 },
        { item: BLOCK.IRON_INGOT, minCount: 1, maxCount: 2, chance: 4 },
        { item: BLOCK.GOLD_INGOT, minCount: 1, maxCount: 1, chance: 0.15 },
        { item: BLOCK.COAL, minCount: 2, maxCount: 5, chance: 10 },
        { item: BLOCK.CRAFTING_TABLE, minCount: 1, maxCount: 1, chance: 0.2 },
        { item: BLOCK.VINE, minCount: 3, maxCount: 3, chance: 2.3 },
        { item: BLOCK.WOODEN_PICKAXE, minCount: 1, maxCount: 1, chance: 13 },
        { item: BLOCK.GOLDEN_APPLE, minCount: 1, maxCount: 1, chance: 0.01 },
        { item: BLOCK.AIR, minCount: 1, maxCount: 15, chance: 35 }  // Nothing
    ];
    
    // Create 30 empty slots
    const slots = Array(30).fill(null).map(() => ({ block: BLOCK.AIR, count: 0 }));
    
    // Fill slots with random loot
    let slotIndex = 0;
    
    // Generate 5-15 loot rolls
    const numRolls = 5 + Math.floor(Math.random() * 11);
    
    for (let roll = 0; roll < numRolls && slotIndex < 30; roll++) {
        // Roll for item type
        const randomValue = Math.random() * 100;
        let cumulativeChance = 0;
        
        for (const loot of lootTable) {
            cumulativeChance += loot.chance;
            if (randomValue < cumulativeChance) {
                // Skip if it's "nothing"
                if (loot.item === BLOCK.AIR) break;
                
                // Generate random count
                const count = loot.minCount + Math.floor(Math.random() * (loot.maxCount - loot.minCount + 1));
                
                // Try to stack with existing same item
                let stacked = false;
                for (let i = 0; i < slotIndex; i++) {
                    if (slots[i].block === loot.item && slots[i].count < 64) {
                        const space = 64 - slots[i].count;
                        const toAdd = Math.min(count, space);
                        slots[i].count += toAdd;
                        stacked = true;
                        break;
                    }
                }
                
                // If couldn't stack, add to new slot
                if (!stacked && slotIndex < 30) {
                    slots[slotIndex] = { block: loot.item, count: count };
                    slotIndex++;
                }
                
                break;
            }
        }
    }
    
    // Shuffle the slots so items aren't always at the start
    for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    
    return slots;
}

function placeOreVein(startX, startY, oreType, size, heights) {
    // Place a small vein of ore
    const placed = [];
    placed.push({ x: startX, y: startY });
    
    if (game.world[startX][startY] === BLOCK.STONE) {
        game.world[startX][startY] = oreType;
    }
    
    for (let i = 1; i < size; i++) {
        if (placed.length === 0) break;
        
        // Pick a random placed block to grow from
        const source = placed[Math.floor(Math.random() * placed.length)];
        
        // Try to place in a random adjacent position
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
        
        // Shuffle directions
        for (let j = directions.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [directions[j], directions[k]] = [directions[k], directions[j]];
        }
        
        for (const dir of directions) {
            const nx = source.x + dir.dx;
            const ny = source.y + dir.dy;
            
            if (nx >= 0 && nx < WORLD_WIDTH && 
                ny >= 0 && ny < WORLD_HEIGHT &&
                ny > heights[nx] + 5 &&
                game.world[nx][ny] === BLOCK.STONE) {
                game.world[nx][ny] = oreType;
                placed.push({ x: nx, y: ny });
                break;
            }
        }
    }
}

// ==================== GAME LOOP ====================
function startGame() {
    showScreen('game');
    game.isPlaying = true;
    game.isPaused = false;
    
    // Update the visual hotbar to show current inventory
    updateGameHotbar();
    
    // Initialize health bar
    updateHealthBar();
    
    // Update game mode indicator
    const indicator = document.getElementById('game-mode-indicator');
    if (game.gameMode === 'creative') {
        indicator.textContent = 'Creative Mode';
        indicator.className = 'game-mode-indicator creative';
    } else {
        indicator.textContent = 'Survival Mode';
        indicator.className = 'game-mode-indicator survival';
    }
    
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!game.isPlaying) return;

    if (!game.isPaused && !game.isInventoryOpen && !game.furnaceOpen && !game.chestOpen) {
        update();
        updateEntities();
    }
    
    // Always update furnaces (smelting continues even when not looking)
    updateFurnaces();
    
    // Always update day/night cycle
    updateDayNightCycle();
    
    render();
    requestAnimationFrame(gameLoop);
}

function updateDayNightCycle() {
    const cycle = game.dayNightCycle;
    const totalCycleLength = cycle.dayLength + cycle.nightLength;
    
    // Increment time
    cycle.time++;
    if (cycle.time >= totalCycleLength) {
        cycle.time = 0;
    }
    
    // Determine if it's night
    cycle.isNight = cycle.time >= cycle.dayLength;
}

function drawMoon(ctx, alpha) {
    // Position moon in upper right portion of sky
    const moonX = game.canvas.width - 150;
    const moonY = 80;
    const blockSize = 12; // Size of each "pixel" in the blocky moon
    
    ctx.globalAlpha = alpha;
    
    // Blocky moon pattern (8x8 grid representing a pixelated moon)
    const moonPattern = [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0]
    ];
    
    // Draw the moon blocks
    for (let py = 0; py < moonPattern.length; py++) {
        for (let px = 0; px < moonPattern[py].length; px++) {
            if (moonPattern[py][px] === 1) {
                const x = moonX + px * blockSize;
                const y = moonY + py * blockSize;
                
                // Main moon color
                ctx.fillStyle = '#f5f5dc';
                ctx.fillRect(x, y, blockSize, blockSize);
                
                // Add some crater details (darker spots)
                if ((px === 2 && py === 2) || (px === 5 && py === 4) || (px === 3 && py === 5)) {
                    ctx.fillStyle = '#d4d4aa';
                    ctx.fillRect(x + 2, y + 2, blockSize - 4, blockSize - 4);
                }
                
                // Block border for pixelated look
                ctx.strokeStyle = 'rgba(200, 200, 180, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, blockSize, blockSize);
            }
        }
    }
    
    // Draw a subtle glow around the moon
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = '#ffffee';
    ctx.beginPath();
    ctx.arc(moonX + 4 * blockSize, moonY + 4 * blockSize, 6 * blockSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
}

// ==================== PHYSICS & UPDATE ====================
function update() {
    // Update invincibility timer
    if (game.player.invincibleTimer > 0) {
        game.player.invincibleTimer--;
    }
    
    // Update absorption timer
    if (game.player.absorptionTimer > 0) {
        game.player.absorptionTimer--;
        if (game.player.absorptionTimer <= 0) {
            game.player.absorptionHearts = 0;
            updateHealthBar();
        }
    }
    
    // Store Y position before movement for fall damage calculation
    const previousY = game.player.y;
    const wasOnGround = game.player.onGround;
    
    // Player horizontal movement
    if (game.keys.left) {
        game.player.vx = -MOVE_SPEED;
    } else if (game.keys.right) {
        game.player.vx = MOVE_SPEED;
    } else {
        game.player.vx = 0;
    }

    // Check if player is in water for swimming
    const playerBlockX = Math.floor((game.player.x + game.player.width / 2) / BLOCK_SIZE);
    const playerBodyY = Math.floor((game.player.y + game.player.height / 2) / BLOCK_SIZE);
    const isInWater = playerBlockX >= 0 && playerBlockX < WORLD_WIDTH && 
                      playerBodyY >= 0 && playerBodyY < WORLD_HEIGHT &&
                      game.world[playerBlockX][playerBodyY] === BLOCK.WATER;

    // Flying mode (creative only)
    if (game.player.isFlying && game.gameMode === 'creative') {
        // Flying controls
        if (game.keys.jump) {
            game.player.vy = -MOVE_SPEED;  // Fly up
        } else if (game.keys.down) {
            game.player.vy = MOVE_SPEED;   // Fly down
        } else {
            game.player.vy = 0;  // Hover
        }
    } else if (isInWater) {
        // Swimming in water
        if (game.keys.jump) {
            game.player.vy = -3;  // Swim up
        } else {
            // Slow sinking in water
            game.player.vy += GRAVITY * 0.3;
            game.player.vy = Math.min(game.player.vy, 2);  // Slow fall in water
        }
        // Reset lastY to prevent fall damage when exiting water
        game.player.lastY = game.player.y;
    } else {
        // Normal jumping
        if (game.keys.jump && game.player.onGround) {
            game.player.vy = -JUMP_FORCE;
            game.player.onGround = false;
            game.player.lastY = game.player.y;  // Track where we started falling
        }

        // Apply gravity
        game.player.vy += GRAVITY;

        // Limit fall speed
        game.player.vy = Math.min(game.player.vy, 15);
    }

    // Move player with collision detection
    movePlayer();

    // Check for fall damage when landing
    if (game.player.onGround && !wasOnGround && game.gameMode !== 'creative') {
        // Check if player is in or near water (no fall damage in water)
        const playerBlockX = Math.floor((game.player.x + game.player.width / 2) / BLOCK_SIZE);
        const playerFeetY = Math.floor((game.player.y + game.player.height) / BLOCK_SIZE);
        const playerBodyY = Math.floor((game.player.y + game.player.height / 2) / BLOCK_SIZE);
        
        let inWater = false;
        // Check feet and body level for water
        for (const checkY of [playerFeetY, playerBodyY, playerFeetY - 1]) {
            if (playerBlockX >= 0 && playerBlockX < WORLD_WIDTH && 
                checkY >= 0 && checkY < WORLD_HEIGHT &&
                game.world[playerBlockX][checkY] === BLOCK.WATER) {
                inWater = true;
                break;
            }
        }
        
        if (!inWater) {
            const fallDistance = (game.player.y - game.player.lastY) / BLOCK_SIZE;
            if (fallDistance > 3) {  // More than 3 blocks fall
                const damage = Math.floor((fallDistance - 3) * 2);  // 1 heart per block after 3
                if (damage > 0) {
                    damagePlayer(damage, null, 'fall');
                }
            }
        }
    }
    
    // Update lastY when on ground or starting to fall
    if (game.player.onGround || game.player.vy < 0) {
        game.player.lastY = game.player.y;
    }

    // Update camera to follow player
    updateCamera();
    
    // Update coordinates display
    updateCoordinates();

    // Continuous block breaking/placing
    if (game.mouse.leftDown) breakBlock();
    if (game.mouse.rightDown) placeBlock();
}

function movePlayer() {
    // Horizontal movement
    const newX = game.player.x + game.player.vx;
    if (!checkCollision(newX, game.player.y)) {
        game.player.x = newX;
    } else {
        game.player.vx = 0;
    }

    // Vertical movement
    const newY = game.player.y + game.player.vy;
    if (!checkCollision(game.player.x, newY)) {
        game.player.y = newY;
        game.player.onGround = false;
    } else {
        if (game.player.vy > 0) {
            // Landing on ground
            game.player.onGround = true;
            // Snap to ground
            game.player.y = Math.floor((game.player.y + game.player.height) / BLOCK_SIZE) * BLOCK_SIZE - game.player.height;
        }
        game.player.vy = 0;
    }

    // World boundaries (horizontal only)
    game.player.x = Math.max(0, Math.min(game.player.x, WORLD_WIDTH * BLOCK_SIZE - game.player.width));
    
    // Check if player fell into the void
    if (game.player.y > WORLD_HEIGHT * BLOCK_SIZE + 100) {
        if (game.gameMode === 'creative') {
            // In creative mode, teleport back to spawn instead of dying
            game.player.x = game.spawnPoint.x;
            game.player.y = game.spawnPoint.y;
            game.player.vy = 0;
        } else {
            triggerGameOver('void');
        }
    }
}

function checkCollision(x, y) {
    // Check all corners of the player hitbox
    const corners = [
        { x: x + 2, y: y + 2 },
        { x: x + game.player.width - 2, y: y + 2 },
        { x: x + 2, y: y + game.player.height - 2 },
        { x: x + game.player.width - 2, y: y + game.player.height - 2 }
    ];

    for (const corner of corners) {
        const blockX = Math.floor(corner.x / BLOCK_SIZE);
        const blockY = Math.floor(corner.y / BLOCK_SIZE);

        if (blockX >= 0 && blockX < WORLD_WIDTH && 
            blockY >= 0 && blockY < WORLD_HEIGHT) {
            const block = game.world[blockX][blockY];
            // Water and vines are passable
            if (block !== BLOCK.AIR && block !== BLOCK.WATER && block !== BLOCK.VINE) {
                return true;
            }
        }
    }

    return false;
}

function updateCamera() {
    // Center camera on player
    const targetX = game.player.x - game.canvas.width / 2 + game.player.width / 2;
    const targetY = game.player.y - game.canvas.height / 2 + game.player.height / 2;

    // Smooth camera movement
    game.camera.x += (targetX - game.camera.x) * 0.1;
    game.camera.y += (targetY - game.camera.y) * 0.1;

    // Camera boundaries
    game.camera.x = Math.max(0, Math.min(game.camera.x, WORLD_WIDTH * BLOCK_SIZE - game.canvas.width));
    game.camera.y = Math.max(0, Math.min(game.camera.y, WORLD_HEIGHT * BLOCK_SIZE - game.canvas.height));
}

// ==================== BLOCK INTERACTION ====================
function getBlockAtMouse() {
    const worldX = game.mouse.x + game.camera.x;
    const worldY = game.mouse.y + game.camera.y;
    
    const blockX = Math.floor(worldX / BLOCK_SIZE);
    const blockY = Math.floor(worldY / BLOCK_SIZE);

    return { x: blockX, y: blockY };
}

function breakBlock() {
    const block = getBlockAtMouse();
    
    if (block.x >= 0 && block.x < WORLD_WIDTH && 
        block.y >= 0 && block.y < WORLD_HEIGHT) {
        
        const blockType = game.world[block.x][block.y];
        if (blockType === BLOCK.AIR) return;
        
        // Check distance from player
        const playerCenterX = game.player.x + game.player.width / 2;
        const playerCenterY = game.player.y + game.player.height / 2;
        const blockCenterX = block.x * BLOCK_SIZE + BLOCK_SIZE / 2;
        const blockCenterY = block.y * BLOCK_SIZE + BLOCK_SIZE / 2;
        
        const distance = Math.sqrt(
            Math.pow(playerCenterX - blockCenterX, 2) + 
            Math.pow(playerCenterY - blockCenterY, 2)
        );

        // Only break blocks within reach
        if (distance < BLOCK_SIZE * 5) {
            // Creative mode - can break anything and always get the item
            if (game.gameMode === 'creative') {
                addToInventory(blockType, 1);
                game.world[block.x][block.y] = BLOCK.AIR;
                return;
            }
            
            // Water and spawners are unmineable
            if (blockType === BLOCK.WATER || blockType === BLOCK.SPAWNER) {
                return;
            }
            
            // Survival mode - need proper tools
            // Get the item the player is holding
            const heldItem = game.hotbar[game.selectedHotbarSlot];
            const holdingWoodenPickaxe = heldItem && heldItem.block === BLOCK.WOODEN_PICKAXE && heldItem.count > 0;
            const holdingStonePickaxe = heldItem && heldItem.block === BLOCK.STONE_PICKAXE && heldItem.count > 0;
            const holdingIronPickaxe = heldItem && heldItem.block === BLOCK.IRON_PICKAXE && heldItem.count > 0;
            const holdingShears = heldItem && heldItem.block === BLOCK.SHEARS && heldItem.count > 0;
            const holdingAnyPickaxe = holdingWoodenPickaxe || holdingStonePickaxe || holdingIronPickaxe;
            
            // Determine what can be mined
            let canHarvest = true;
            
            if (blockType === BLOCK.STONE || blockType === BLOCK.COAL) {
                // Stone and coal need at least wooden pickaxe
                canHarvest = holdingAnyPickaxe;
            } else if (blockType === BLOCK.COPPER_ORE) {
                // Copper needs at least stone pickaxe
                canHarvest = holdingStonePickaxe || holdingIronPickaxe;
            } else if (blockType === BLOCK.IRON) {
                // Iron needs at least stone pickaxe
                canHarvest = holdingStonePickaxe || holdingIronPickaxe;
            } else if (blockType === BLOCK.GOLD_ORE) {
                // Gold needs iron pickaxe
                canHarvest = holdingIronPickaxe;
            } else if (blockType === BLOCK.LEAVES || blockType === BLOCK.BIRCH_LEAVES) {
                // Leaves need shears to harvest the block itself
                canHarvest = holdingShears;
                // 15% chance to drop apple when breaking leaves with hands
                if (!holdingShears && Math.random() < 0.15) {
                    addToInventory(BLOCK.APPLE, 1);
                }
            } else if (blockType === BLOCK.VINE) {
                // Vines need shears to harvest
                canHarvest = holdingShears;
            } else if (blockType === BLOCK.GLASS) {
                // Glass cannot be harvested with any tool - only breaks
                canHarvest = false;
            } else if (blockType === BLOCK.GRAVEL) {
                // Gravel drops itself, but 20% chance to drop flint instead
                canHarvest = true;
                if (Math.random() < 0.20) {
                    addToInventory(BLOCK.FLINT, 1);
                    canHarvest = false;  // Don't also drop gravel
                }
            } else if (blockType === BLOCK.MOSSY_COBBLESTONE || blockType === BLOCK.COPPER_BLOCK || 
                       blockType === BLOCK.IRON_BLOCK || blockType === BLOCK.GOLD_BLOCK ||
                       blockType === BLOCK.COBBLESTONE) {
                // Metal blocks, mossy cobblestone, and cobblestone need at least wooden pickaxe
                canHarvest = holdingAnyPickaxe;
            }
            
            // Shears can ONLY harvest leaves and vines, not other blocks
            if (holdingShears && blockType !== BLOCK.LEAVES && blockType !== BLOCK.BIRCH_LEAVES && blockType !== BLOCK.VINE) {
                // Don't break the block at all with shears (except leaves/vines)
                return;
            }
            
            if (canHarvest) {
                // Stone drops cobblestone when mined with pickaxe
                if (blockType === BLOCK.STONE) {
                    addToInventory(BLOCK.COBBLESTONE, 1);
                } else if (blockType === BLOCK.SNOW) {
                    // Snow drops snowball
                    addToInventory(BLOCK.SNOWBALL, 1);
                } else if (blockType === BLOCK.GRAVEL) {
                    // Gravel has 10% chance to drop flint instead
                    if (Math.random() < 0.1) {
                        addToInventory(BLOCK.FLINT, 1);
                    } else {
                        addToInventory(BLOCK.GRAVEL, 1);
                    }
                } else {
                    addToInventory(blockType, 1);
                }
            }
            // Block still breaks, just doesn't drop anything if wrong tool
            
            // Remove block from world
            game.world[block.x][block.y] = BLOCK.AIR;
        }
    }
}

function placeBlock() {
    const block = getBlockAtMouse();
    
    // Check if we have an item to use
    const hotbarItem = game.hotbar[game.selectedHotbarSlot];
    if (!hotbarItem || hotbarItem.block === BLOCK.AIR || hotbarItem.count <= 0) return;
    
    // Eat apple if holding one (right click to eat)
    if (hotbarItem.block === BLOCK.APPLE) {
        // Heal 1.5 hearts (3 half-hearts)
        healPlayer(3);
        
        // Consume the apple
        if (game.gameMode === 'survival') {
            hotbarItem.count--;
            if (hotbarItem.count <= 0) {
                hotbarItem.block = BLOCK.AIR;
                hotbarItem.count = 0;
            }
            updateGameHotbar();
        }
        return;
    }
    
    // Eat raw meat if holding one (right click to eat)
    if (hotbarItem.block === BLOCK.RAW_MEAT) {
        // Heal 0.5 hearts (1 half-heart)
        healPlayer(1);
        
        // Consume the raw meat
        if (game.gameMode === 'survival') {
            hotbarItem.count--;
            if (hotbarItem.count <= 0) {
                hotbarItem.block = BLOCK.AIR;
                hotbarItem.count = 0;
            }
            updateGameHotbar();
        }
        return;
    }
    
    // Eat cooked meat if holding one (right click to eat)
    if (hotbarItem.block === BLOCK.COOKED_MEAT) {
        // Heal 4 hearts (8 half-hearts)
        healPlayer(8);
        
        // Consume the cooked meat
        if (game.gameMode === 'survival') {
            hotbarItem.count--;
            if (hotbarItem.count <= 0) {
                hotbarItem.block = BLOCK.AIR;
                hotbarItem.count = 0;
            }
            updateGameHotbar();
        }
        return;
    }
    
    // Eat golden apple if holding one (right click to eat)
    if (hotbarItem.block === BLOCK.GOLDEN_APPLE) {
        // Heal to full health
        game.player.health = game.player.maxHealth;
        // Add 2 absorption hearts (4 half-hearts) for 1 minute (3600 frames at 60fps)
        game.player.absorptionHearts = 4;
        game.player.absorptionTimer = 3600;
        updateHealthBar();
        
        // Consume the golden apple
        if (game.gameMode === 'survival') {
            hotbarItem.count--;
            if (hotbarItem.count <= 0) {
                hotbarItem.block = BLOCK.AIR;
                hotbarItem.count = 0;
            }
            updateGameHotbar();
        }
        return;
    }
    
    // Throw snowball if holding one (right click to throw)
    if (hotbarItem.block === BLOCK.SNOWBALL) {
        // Get direction to mouse
        const worldX = game.mouse.x + game.camera.x;
        const worldY = game.mouse.y + game.camera.y;
        const playerCenterX = game.player.x + game.player.width / 2;
        const playerCenterY = game.player.y + game.player.height / 2;
        
        const dx = worldX - playerCenterX;
        const dy = worldY - playerCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and scale for throw speed
        const speed = 10;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        
        // Spawn snowball projectile
        spawnSnowball(playerCenterX, playerCenterY, vx, vy);
        
        // Consume the snowball
        if (game.gameMode === 'survival') {
            hotbarItem.count--;
            if (hotbarItem.count <= 0) {
                hotbarItem.block = BLOCK.AIR;
                hotbarItem.count = 0;
            }
            updateGameHotbar();
        }
        return;
    }
    
    // Items that cannot be placed as blocks
    const nonPlaceableItems = [
        BLOCK.IRON_INGOT,
        BLOCK.STICK,
        BLOCK.WOODEN_PICKAXE,
        BLOCK.STONE_PICKAXE,
        BLOCK.IRON_PICKAXE,
        BLOCK.SHEARS,
        BLOCK.BOW,
        BLOCK.STRING,
        BLOCK.SPIDER_EYE,
        BLOCK.RAW_MEAT,
        BLOCK.COOKED_MEAT,
        BLOCK.COPPER_INGOT,
        BLOCK.GOLD_INGOT,
        BLOCK.GOLDEN_APPLE,
        BLOCK.BONE,
        BLOCK.ARROW,
        BLOCK.FLINT,
        BLOCK.FLINT_AND_STEEL,
        BLOCK.WOODEN_SWORD,
        BLOCK.STONE_SWORD,
        BLOCK.IRON_SWORD,
        BLOCK.WOODEN_SHOVEL,
        BLOCK.STONE_SHOVEL,
        BLOCK.IRON_SHOVEL,
        BLOCK.SNOWBALL,
        BLOCK.IRON_HELMET,
        BLOCK.IRON_CHESTPLATE,
        BLOCK.IRON_LEGGINGS,
        BLOCK.IRON_BOOTS
    ];
    
    if (nonPlaceableItems.includes(hotbarItem.block)) {
        return;  // Can't place these items
    }
    
    if (block.x >= 0 && block.x < WORLD_WIDTH && 
        block.y >= 0 && block.y < WORLD_HEIGHT) {
        
        // Check if block is empty
        if (game.world[block.x][block.y] !== BLOCK.AIR) return;

        // Check distance from player
        const playerCenterX = game.player.x + game.player.width / 2;
        const playerCenterY = game.player.y + game.player.height / 2;
        const blockCenterX = block.x * BLOCK_SIZE + BLOCK_SIZE / 2;
        const blockCenterY = block.y * BLOCK_SIZE + BLOCK_SIZE / 2;
        
        const distance = Math.sqrt(
            Math.pow(playerCenterX - blockCenterX, 2) + 
            Math.pow(playerCenterY - blockCenterY, 2)
        );

        // Check if placing block would overlap with player
        const playerLeft = game.player.x;
        const playerRight = game.player.x + game.player.width;
        const playerTop = game.player.y;
        const playerBottom = game.player.y + game.player.height;
        
        const blockLeft = block.x * BLOCK_SIZE;
        const blockRight = blockLeft + BLOCK_SIZE;
        const blockTop = block.y * BLOCK_SIZE;
        const blockBottom = blockTop + BLOCK_SIZE;

        const overlaps = !(playerRight <= blockLeft || 
                         playerLeft >= blockRight || 
                         playerBottom <= blockTop || 
                         playerTop >= blockBottom);

        // Only place blocks within reach and not overlapping player
        if (distance < BLOCK_SIZE * 5 && !overlaps) {
            game.world[block.x][block.y] = hotbarItem.block;
            
            // In survival mode, decrement count
            if (game.gameMode === 'survival') {
                hotbarItem.count--;
                if (hotbarItem.count <= 0) {
                    hotbarItem.block = BLOCK.AIR;
                    hotbarItem.count = 0;
                }
            }
            // In creative mode, blocks are infinite
            
            // Update the visual hotbar
            updateGameHotbar();
        }
    }
}

// ==================== RENDERING ====================
function render() {
    const ctx = game.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

    // Calculate day/night transition
    const cycle = game.dayNightCycle;
    const totalCycle = cycle.dayLength + cycle.nightLength;
    let nightAlpha = 0;
    
    if (cycle.isNight) {
        // Nighttime - calculate how far into night we are
        const nightProgress = (cycle.time - cycle.dayLength) / cycle.nightLength;
        // Fade in during first 10%, stay dark, fade out during last 10%
        if (nightProgress < 0.1) {
            nightAlpha = nightProgress * 10;
        } else if (nightProgress > 0.9) {
            nightAlpha = (1 - nightProgress) * 10;
        } else {
            nightAlpha = 1;
        }
    }
    
    // Draw sky gradient (day colors)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
    skyGradient.addColorStop(0, '#1e3a5f');
    skyGradient.addColorStop(0.5, '#4a7c9b');
    skyGradient.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Draw night overlay
    if (nightAlpha > 0) {
        const nightGradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
        nightGradient.addColorStop(0, `rgba(5, 5, 20, ${nightAlpha * 0.85})`);
        nightGradient.addColorStop(0.5, `rgba(10, 15, 35, ${nightAlpha * 0.75})`);
        nightGradient.addColorStop(1, `rgba(15, 25, 50, ${nightAlpha * 0.65})`);
        ctx.fillStyle = nightGradient;
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        
        // Draw blocky moon at night
        if (nightAlpha > 0.3) {
            drawMoon(ctx, nightAlpha);
        }
    }

    // Calculate visible blocks
    const startX = Math.max(0, Math.floor(game.camera.x / BLOCK_SIZE));
    const endX = Math.min(WORLD_WIDTH, Math.ceil((game.camera.x + game.canvas.width) / BLOCK_SIZE) + 1);
    const startY = Math.max(0, Math.floor(game.camera.y / BLOCK_SIZE));
    const endY = Math.min(WORLD_HEIGHT, Math.ceil((game.camera.y + game.canvas.height) / BLOCK_SIZE) + 1);

    // Draw blocks
    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            const block = game.world[x][y];
            if (block !== BLOCK.AIR) {
                drawBlock(ctx, x, y, block);
            }
        }
    }
    
    // Draw torch light glow effects (especially visible at night)
    if (nightAlpha > 0.2) {
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                if (game.world[x][y] === BLOCK.TORCH) {
                    const screenX = x * BLOCK_SIZE - game.camera.x + BLOCK_SIZE / 2;
                    const screenY = y * BLOCK_SIZE - game.camera.y + BLOCK_SIZE / 3;
                    
                    // Draw light glow
                    const gradient = ctx.createRadialGradient(
                        screenX, screenY, 0,
                        screenX, screenY, TORCH_LIGHT_RADIUS * BLOCK_SIZE
                    );
                    gradient.addColorStop(0, `rgba(255, 200, 100, ${0.3 * nightAlpha})`);
                    gradient.addColorStop(0.3, `rgba(255, 150, 50, ${0.15 * nightAlpha})`);
                    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, TORCH_LIGHT_RADIUS * BLOCK_SIZE, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    // Draw entities (sheep, etc.)
    renderEntities(ctx);
    
    // Draw projectiles (arrows)
    renderProjectiles(ctx);

    // Draw player
    drawPlayer(ctx);

    // Draw block selection highlight
    drawBlockHighlight(ctx);
}

// Custom block textures storage - uses cached images for performance
let customBlockTextures = {};
let customBlockImages = {}; // Pre-loaded Image objects for fast drawing

function loadCustomBlockTextures() {
    try {
        const saved = localStorage.getItem('crafterCustomBlocks');
        if (saved) {
            customBlockTextures = JSON.parse(saved);
            console.log('Loading custom block textures:', Object.keys(customBlockTextures).length);
            
            // Pre-load all custom textures as Image objects for fast rendering
            for (const blockId in customBlockTextures) {
                const data = customBlockTextures[blockId];
                if (data.imageData) {
                    // Use cached image data
                    const img = new Image();
                    img.src = data.imageData;
                    customBlockImages[blockId] = img;
                } else if (data.pixels) {
                    // Generate image from pixels (backwards compatibility)
                    const canvas = document.createElement('canvas');
                    canvas.width = 32;
                    canvas.height = 32;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    
                    const pixelSize = 32 / 16;
                    for (let py = 0; py < 16; py++) {
                        for (let px = 0; px < 16; px++) {
                            if (data.pixels[py] && data.pixels[py][px]) {
                                ctx.fillStyle = data.pixels[py][px];
                                ctx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
                            }
                        }
                    }
                    
                    const img = new Image();
                    img.src = canvas.toDataURL();
                    customBlockImages[blockId] = img;
                }
            }
            console.log('Custom textures loaded and cached!');
        }
    } catch (e) {
        console.error('Error loading custom block textures:', e);
    }
}

function drawCustomBlock(ctx, screenX, screenY, blockType) {
    const img = customBlockImages[blockType];
    if (!img || !img.complete) return false;
    
    // Draw the cached image - super fast!
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
    
    return true;
}

// Apply custom texture to a UI block preview element
function applyCustomTextureToElement(element, blockType) {
    const data = customBlockTextures[blockType];
    if (data && data.imageData) {
        // Add custom texture class to override CSS pseudo-elements
        element.classList.add('custom-texture');
        element.style.backgroundImage = `url(${data.imageData})`;
        element.style.backgroundSize = 'cover';
        element.style.imageRendering = 'pixelated';
        // Clear all default styling
        element.style.backgroundColor = 'transparent';
        element.style.border = 'none';
        element.style.background = `url(${data.imageData})`;
        element.style.backgroundSize = 'cover';
        return true;
    }
    return false;
}

// Create block preview element with custom texture support
function createBlockPreview(blockType) {
    const preview = document.createElement('div');
    preview.className = 'block-preview ' + getBlockClassName(blockType);
    
    // Apply custom texture if available
    applyCustomTextureToElement(preview, blockType);
    
    return preview;
}

function drawBlock(ctx, x, y, blockType) {
    const screenX = x * BLOCK_SIZE - game.camera.x;
    const screenY = y * BLOCK_SIZE - game.camera.y;
    
    // Check for custom texture first
    if (customBlockTextures[blockType]) {
        drawCustomBlock(ctx, screenX, screenY, blockType);
        return;
    }
    
    let colors = BLOCK_COLORS[blockType];

    if (!colors) return;
    
    // Check if we're in a swamp biome for grass/leaves tinting
    const isSwampBiome = game.biomes && game.biomes[x] === 'swamp';

    // Main block fill
    if (blockType === BLOCK.GRASS) {
        // Grass has special rendering - darker in swamp
        if (isSwampBiome) {
            ctx.fillStyle = '#4a6a3a';  // Darker swamp grass top
            ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE * 0.3);
            ctx.fillStyle = '#8B6914';  // Darker dirt
            ctx.fillRect(screenX, screenY + BLOCK_SIZE * 0.3, BLOCK_SIZE, BLOCK_SIZE * 0.7);
        } else {
            ctx.fillStyle = colors.top;
            ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE * 0.3);
            ctx.fillStyle = colors.middle;
            ctx.fillRect(screenX, screenY + BLOCK_SIZE * 0.3, BLOCK_SIZE, BLOCK_SIZE * 0.7);
        }
    } else if (blockType === BLOCK.LEAVES) {
        // Leaves - darker in swamp
        if (isSwampBiome) {
            const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + BLOCK_SIZE);
            gradient.addColorStop(0, '#3a5a3a');  // Darker swamp leaves
            gradient.addColorStop(1, '#2a4a2a');
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
            // Draw darker leaf clusters
            ctx.fillStyle = '#2a4a2a';
            ctx.fillRect(screenX + 2, screenY + 2, 10, 10);
            ctx.fillRect(screenX + 18, screenY + 6, 8, 8);
            ctx.fillRect(screenX + 6, screenY + 16, 12, 10);
        } else {
            const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + BLOCK_SIZE);
            gradient.addColorStop(0, colors.top);
            gradient.addColorStop(1, colors.bottom);
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
        }
    } else {
        // Gradient for other blocks
        const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + BLOCK_SIZE);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(1, colors.bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
    }

    // Draw ore spots for coal and iron
    if (blockType === BLOCK.COAL || blockType === BLOCK.IRON) {
        ctx.fillStyle = colors.ore;
        // Draw several ore spots using block position as seed for consistency
        const seed = x * 1000 + y;
        const spots = [
            { x: 6, y: 6, s: 5 },
            { x: 18, y: 10, s: 6 },
            { x: 10, y: 20, s: 5 },
            { x: 22, y: 22, s: 4 }
        ];
        spots.forEach((spot, i) => {
            if ((seed + i) % 3 !== 0) { // Vary spots per block
                ctx.fillRect(screenX + spot.x, screenY + spot.y, spot.s, spot.s);
            }
        });
    }

    // Draw gold ore spots
    if (blockType === BLOCK.GOLD_ORE) {
        ctx.fillStyle = '#ffd700';
        const seed = x * 1000 + y;
        const spots = [
            { x: 6, y: 6, s: 6 },
            { x: 18, y: 12, s: 5 },
            { x: 8, y: 20, s: 5 },
            { x: 20, y: 22, s: 4 }
        ];
        spots.forEach((spot, i) => {
            if ((seed + i) % 3 !== 0) {
                ctx.fillRect(screenX + spot.x, screenY + spot.y, spot.s, spot.s);
            }
        });
    }

    // Draw copper ore spots
    if (blockType === BLOCK.COPPER_ORE) {
        ctx.fillStyle = '#e07840';
        const seed = x * 1000 + y;
        const spots = [
            { x: 5, y: 5, s: 6 },
            { x: 17, y: 8, s: 7 },
            { x: 8, y: 18, s: 6 },
            { x: 20, y: 20, s: 5 }
        ];
        spots.forEach((spot, i) => {
            if ((seed + i) % 3 !== 0) {
                ctx.fillRect(screenX + spot.x, screenY + spot.y, spot.s, spot.s);
            }
        });
    }

    // Draw copper block pattern
    if (blockType === BLOCK.COPPER_BLOCK) {
        ctx.fillStyle = '#c06030';
        ctx.fillRect(screenX + 4, screenY + 4, 12, 12);
        ctx.fillRect(screenX + 16, screenY + 16, 12, 12);
    }

    // Draw iron block pattern
    if (blockType === BLOCK.IRON_BLOCK) {
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(screenX + 4, screenY + 4, 12, 12);
        ctx.fillRect(screenX + 16, screenY + 16, 12, 12);
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(screenX + 16, screenY + 4, 12, 12);
        ctx.fillRect(screenX + 4, screenY + 16, 12, 12);
    }

    // Draw gold block pattern
    if (blockType === BLOCK.GOLD_BLOCK) {
        ctx.fillStyle = '#ffe040';
        ctx.fillRect(screenX + 4, screenY + 4, 12, 12);
        ctx.fillRect(screenX + 16, screenY + 16, 12, 12);
        ctx.fillStyle = '#c89010';
        ctx.fillRect(screenX + 16, screenY + 4, 12, 12);
        ctx.fillRect(screenX + 4, screenY + 16, 12, 12);
    }

    // Draw snow sparkles (icy blue tint)
    if (blockType === BLOCK.SNOW) {
        ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
        ctx.fillRect(screenX + 6, screenY + 6, 3, 3);
        ctx.fillRect(screenX + 18, screenY + 10, 4, 4);
        ctx.fillRect(screenX + 10, screenY + 20, 3, 3);
        ctx.fillRect(screenX + 22, screenY + 24, 2, 2);
    }

    // Draw wool fluffy texture (cream colored curls)
    if (blockType === BLOCK.WOOL) {
        ctx.fillStyle = 'rgba(220, 210, 190, 0.8)';
        // Fluffy curl pattern
        ctx.beginPath();
        ctx.arc(screenX + 8, screenY + 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 20, screenY + 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 10, screenY + 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 24, screenY + 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY + 14, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw torch (special - smaller than full block)
    if (blockType === BLOCK.TORCH) {
        // Clear the default block fill - torch is transparent background
        ctx.clearRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Redraw sky/background behind torch
        const cycle = game.dayNightCycle;
        let nightAlpha = 0;
        if (cycle.isNight) {
            const nightProgress = (cycle.time - cycle.dayLength) / cycle.nightLength;
            if (nightProgress < 0.1) nightAlpha = nightProgress * 10;
            else if (nightProgress > 0.9) nightAlpha = (1 - nightProgress) * 10;
            else nightAlpha = 1;
        }
        
        // Day sky
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Night overlay
        if (nightAlpha > 0) {
            ctx.fillStyle = `rgba(10, 15, 35, ${nightAlpha * 0.7})`;
            ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
        }
        
        // Torch stick (brown wooden stick)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 13, screenY + 8, 6, 20);
        ctx.fillStyle = '#5a3a0a';
        ctx.fillRect(screenX + 13, screenY + 8, 1, 20); // Left edge shadow
        
        // Flame glow (outer)
        ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY + 6, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Flame (yellow-orange)
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY);
        ctx.lineTo(screenX + 20, screenY + 10);
        ctx.lineTo(screenX + 12, screenY + 10);
        ctx.closePath();
        ctx.fill();
        
        // Flame core (bright yellow)
        ctx.fillStyle = '#ffff66';
        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY + 3);
        ctx.lineTo(screenX + 18, screenY + 8);
        ctx.lineTo(screenX + 14, screenY + 8);
        ctx.closePath();
        ctx.fill();
        
        return; // Skip border drawing for torch
    }

    // Draw plank lines
    if (blockType === BLOCK.PLANKS) {
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(screenX + 2, screenY + 8, BLOCK_SIZE - 4, 2);
        ctx.fillRect(screenX + 2, screenY + 16, BLOCK_SIZE - 4, 2);
        ctx.fillRect(screenX + 2, screenY + 24, BLOCK_SIZE - 4, 2);
    }

    // Draw crafting table top pattern
    if (blockType === BLOCK.CRAFTING_TABLE) {
        // Top half has grid pattern
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(screenX + 4, screenY + 4, 10, 10);
        ctx.fillRect(screenX + 18, screenY + 4, 10, 10);
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(screenX + 6, screenY + 6, 6, 6);
        ctx.fillRect(screenX + 20, screenY + 6, 6, 6);
    }

    // Draw cobblestone cracks pattern
    if (blockType === BLOCK.COBBLESTONE) {
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(screenX + 2, screenY + 3, 12, 8);
        ctx.fillRect(screenX + 18, screenY + 2, 10, 10);
        ctx.fillRect(screenX + 4, screenY + 14, 8, 9);
        ctx.fillRect(screenX + 16, screenY + 16, 12, 10);
        ctx.fillRect(screenX + 8, screenY + 25, 6, 5);
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(screenX + 14, screenY, 2, BLOCK_SIZE);
        ctx.fillRect(screenX, screenY + 12, BLOCK_SIZE, 2);
        ctx.fillRect(screenX + 12, screenY + 24, 6, 2);
    }

    // Draw mossy cobblestone moss patches
    if (blockType === BLOCK.MOSSY_COBBLESTONE) {
        ctx.fillStyle = '#6a8a5a';
        ctx.fillRect(screenX + 4, screenY + 4, 8, 5);
        ctx.fillRect(screenX + 18, screenY + 12, 10, 6);
        ctx.fillRect(screenX + 8, screenY + 22, 7, 5);
    }
    
    // Draw birch wood black spots
    if (blockType === BLOCK.BIRCH_WOOD) {
        ctx.fillStyle = '#2a2a2a';
        // Horizontal black stripes/spots typical of birch bark
        ctx.fillRect(screenX + 3, screenY + 4, 8, 2);
        ctx.fillRect(screenX + 18, screenY + 8, 6, 2);
        ctx.fillRect(screenX + 6, screenY + 14, 10, 2);
        ctx.fillRect(screenX + 2, screenY + 20, 5, 2);
        ctx.fillRect(screenX + 20, screenY + 24, 7, 2);
    }
    
    // Draw birch leaves darker clusters
    if (blockType === BLOCK.BIRCH_LEAVES) {
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(screenX + 2, screenY + 2, 8, 8);
        ctx.fillRect(screenX + 16, screenY + 6, 10, 10);
        ctx.fillRect(screenX + 6, screenY + 18, 12, 8);
    }

    // Draw spawner cage
    if (blockType === BLOCK.SPAWNER) {
        // Cage bars
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(screenX + 4, screenY, 2, BLOCK_SIZE);
        ctx.fillRect(screenX + 14, screenY, 2, BLOCK_SIZE);
        ctx.fillRect(screenX + 26, screenY, 2, BLOCK_SIZE);
        ctx.fillRect(screenX, screenY + 4, BLOCK_SIZE, 2);
        ctx.fillRect(screenX, screenY + 14, BLOCK_SIZE, 2);
        ctx.fillRect(screenX, screenY + 26, BLOCK_SIZE, 2);
        
        // Inner glow
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(screenX + 8, screenY + 8, 16, 16);
    }

    // Draw chest
    if (blockType === BLOCK.CHEST) {
        // Lid
        ctx.fillStyle = '#a06030';
        ctx.fillRect(screenX + 2, screenY + 2, BLOCK_SIZE - 4, 10);
        // Lid edge
        ctx.fillStyle = '#7a4a28';
        ctx.fillRect(screenX + 2, screenY + 10, BLOCK_SIZE - 4, 2);
        // Lock/latch
        ctx.fillStyle = '#c0a040';
        ctx.fillRect(screenX + 12, screenY + 14, 8, 6);
        ctx.fillStyle = '#8a7030';
        ctx.fillRect(screenX + 14, screenY + 16, 4, 2);
    }

    // Draw furnace face
    if (blockType === BLOCK.FURNACE) {
        // Furnace opening
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(screenX + 10, screenY + 10, 12, 10);
        
        // Check if this furnace is active
        const key = `${x},${y}`;
        const furnace = game.furnaces[key];
        if (furnace && furnace.fuelRemaining > 0) {
            // Draw fire glow
            ctx.fillStyle = '#ff6b35';
            ctx.fillRect(screenX + 12, screenY + 16, 8, 3);
            ctx.fillStyle = '#ff9500';
            ctx.fillRect(screenX + 13, screenY + 17, 6, 2);
        }
    }

    // Draw water with transparency and waves
    if (blockType === BLOCK.WATER) {
        ctx.fillStyle = 'rgba(58, 124, 165, 0.7)';
        ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Water surface highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(screenX + 4, screenY + 2, 12, 3);
        ctx.fillRect(screenX + 18, screenY + 4, 8, 2);
        return;  // Skip border for water
    }

    // Draw vine
    if (blockType === BLOCK.VINE) {
        // Main vine strand
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(screenX + 12, screenY, 8, BLOCK_SIZE);
        
        // Side leaves
        ctx.fillStyle = '#2a6a2a';
        ctx.fillRect(screenX + 6, screenY + 6, 8, 5);
        ctx.fillRect(screenX + 18, screenY + 14, 8, 5);
        ctx.fillRect(screenX + 4, screenY + 22, 8, 5);
        return;  // Skip border for vine
    }

    // Block border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX + 1, screenY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // Highlight on top edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(screenX + 2, screenY + 2, BLOCK_SIZE - 4, 4);

    // Shadow on bottom edge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(screenX + 2, screenY + BLOCK_SIZE - 6, BLOCK_SIZE - 4, 4);
}

function drawPlayer(ctx) {
    const screenX = game.player.x - game.camera.x;
    const screenY = game.player.y - game.camera.y;

    // Player body
    ctx.fillStyle = '#4a90d9';
    ctx.fillRect(screenX, screenY + 16, game.player.width, game.player.height - 16);

    // Player head
    ctx.fillStyle = '#e8c4a0';
    ctx.fillRect(screenX + 2, screenY, game.player.width - 4, 16);

    // Eyes
    ctx.fillStyle = '#333';
    ctx.fillRect(screenX + 6, screenY + 5, 4, 4);
    ctx.fillRect(screenX + 14, screenY + 5, 4, 4);

    // Shirt detail
    ctx.fillStyle = '#3a70a9';
    ctx.fillRect(screenX + 4, screenY + 20, game.player.width - 8, 8);

    // Legs
    ctx.fillStyle = '#5a5a8a';
    ctx.fillRect(screenX + 2, screenY + game.player.height - 16, 8, 16);
    ctx.fillRect(screenX + game.player.width - 10, screenY + game.player.height - 16, 8, 16);
}

function drawBlockHighlight(ctx) {
    const block = getBlockAtMouse();
    
    if (block.x >= 0 && block.x < WORLD_WIDTH && 
        block.y >= 0 && block.y < WORLD_HEIGHT) {
        
        const screenX = block.x * BLOCK_SIZE - game.camera.x;
        const screenY = block.y * BLOCK_SIZE - game.camera.y;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
    }
}

// ==================== SAVE/LOAD ====================
function saveWorld() {
    const saveData = {
        world: game.world,
        biomes: game.biomes,
        player: {
            x: game.player.x,
            y: game.player.y,
            health: game.player.health
        },
        spawnPoint: {
            x: game.spawnPoint.x,
            y: game.spawnPoint.y
        },
        inventory: game.inventory,
        hotbar: game.hotbar,
        equipment: game.equipment,
        selectedHotbarSlot: game.selectedHotbarSlot,
        spawners: game.spawners,
        chests: game.chests,
        gameMode: game.gameMode,
        dayNightCycle: game.dayNightCycle
    };

    localStorage.setItem('crafterWorld', JSON.stringify(saveData));
    game.hasSavedWorld = true;
}

function loadWorld() {
    const savedData = localStorage.getItem('crafterWorld');
    
    if (!savedData) {
        alert('No saved world found!');
        return false;
    }

    try {
        const data = JSON.parse(savedData);
        game.world = data.world;
        game.biomes = data.biomes || [];
        game.player.x = data.player.x;
        game.player.y = data.player.y;
        game.player.vx = 0;
        game.player.vy = 0;
        
        // Set spawn point (use saved spawn or current position)
        if (data.spawnPoint) {
            game.spawnPoint.x = data.spawnPoint.x;
            game.spawnPoint.y = data.spawnPoint.y;
        } else {
            game.spawnPoint.x = game.player.x;
            game.spawnPoint.y = game.player.y;
        }

        // Load inventory
        if (data.inventory) {
            game.inventory = data.inventory;
        }
        if (data.hotbar) {
            game.hotbar = data.hotbar;
        }
        if (data.equipment) {
            game.equipment = data.equipment;
        }
        if (data.selectedHotbarSlot !== undefined) {
            game.selectedHotbarSlot = data.selectedHotbarSlot;
        }
        
        // Load spawners and chests
        if (data.spawners) {
            game.spawners = data.spawners;
            // Reset spawn timers for active spawning
            for (const key in game.spawners) {
                game.spawners[key].spawnTimer = 0;
                game.spawners[key].spawnedMobs = [];
            }
        } else {
            game.spawners = {};
        }
        if (data.chests) {
            game.chests = data.chests;
        } else {
            game.chests = {};
        }
        
        // Load player health
        if (data.player.health !== undefined) {
            game.player.health = data.player.health;
        } else {
            game.player.health = game.player.maxHealth;
        }
        
        // Load game mode
        if (data.gameMode) {
            game.gameMode = data.gameMode;
        } else {
            game.gameMode = 'survival';
        }
        
        // Load day/night cycle
        if (data.dayNightCycle) {
            game.dayNightCycle = data.dayNightCycle;
        }

        return true;
    } catch (e) {
        alert('Error loading saved world!');
        return false;
    }
}

// ==================== START ====================
document.addEventListener('DOMContentLoaded', init);

