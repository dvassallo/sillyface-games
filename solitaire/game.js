// ========== CONSTANTS ==========
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = ['hearts', 'diamonds'];
const BLACK_SUITS = ['spades', 'clubs'];

// Scoring
const SCORE_WASTE_TO_TABLEAU = 5;
const SCORE_WASTE_TO_FOUNDATION = 10;
const SCORE_TABLEAU_TO_FOUNDATION = 10;
const SCORE_FOUNDATION_TO_TABLEAU = -15;
const SCORE_FLIP_CARD = 5;
const SCORE_RECYCLE_WASTE = -20;

// ========== GAME STATE ==========
let gameState = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    drawCount: 1,
    score: 0,
    moves: 0,
    time: 0,
    timerInterval: null,
    history: [],
    gameStarted: false,
    isWon: false
};

// Drag state
let dragState = {
    isDragging: false,
    cards: [],
    sourceType: null,
    sourceIndex: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
};

// DOM Elements
const titleScreen = document.getElementById('titleScreen');
const gameScreen = document.getElementById('gameScreen');
const winScreen = document.getElementById('winScreen');
const menuModal = document.getElementById('menuModal');

const playBtn = document.getElementById('playBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtn = document.getElementById('menuBtn');
const undoBtn = document.getElementById('undoBtn');
const hintBtn = document.getElementById('hintBtn');
const autoBtn = document.getElementById('autoBtn');
const newGameBtn = document.getElementById('newGameBtn');
const restartBtn = document.getElementById('restartBtn');
const resumeBtn = document.getElementById('resumeBtn');

const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');

const stockPile = document.getElementById('stock');
const wastePile = document.getElementById('waste');

// ========== UTILITY FUNCTIONS ==========
function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (let rank = 0; rank < RANKS.length; rank++) {
            deck.push({
                suit,
                rank,
                faceUp: false,
                id: `${suit}-${rank}`
            });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function isRed(suit) {
    return RED_SUITS.includes(suit);
}

function canStackOnTableau(card, targetCard) {
    if (!targetCard) return card.rank === 12; // King on empty
    return isRed(card.suit) !== isRed(targetCard.suit) && card.rank === targetCard.rank - 1;
}

function canStackOnFoundation(card, foundationCards, foundationIndex) {
    if (foundationCards.length === 0) {
        return card.rank === 0; // Ace
    }
    const topCard = foundationCards[foundationCards.length - 1];
    return card.suit === topCard.suit && card.rank === topCard.rank + 1;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========== GAME INITIALIZATION ==========
function initGame(drawCount = 1) {
    // Reset state
    gameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawCount,
        score: 0,
        moves: 0,
        time: 0,
        timerInterval: null,
        history: [],
        gameStarted: false,
        isWon: false
    };

    // Create and shuffle deck
    const deck = shuffleDeck(createDeck());

    // Deal to tableau
    let cardIndex = 0;
    for (let col = 0; col < 7; col++) {
        for (let row = col; row < 7; row++) {
            const card = deck[cardIndex++];
            card.faceUp = (row === col);
            gameState.tableau[row].push(card);
        }
    }

    // Remaining cards go to stock
    gameState.stock = deck.slice(cardIndex);

    // Start timer
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        if (gameState.gameStarted && !gameState.isWon) {
            gameState.time++;
            updateUI();
        }
    }, 1000);

    renderGame();
    updateUI();
}

// ========== RENDERING ==========
function renderGame() {
    renderStock();
    renderWaste();
    renderFoundations();
    renderTableau();
}

function createCardElement(card, index = 0, offset = 0) {
    const el = document.createElement('div');
    el.className = `card ${card.faceUp ? '' : 'face-down'} ${isRed(card.suit) ? 'red' : 'black'}`;
    el.dataset.id = card.id;
    el.dataset.suit = card.suit;
    el.style.top = `${offset}px`;
    el.style.zIndex = index;

    const symbol = SUIT_SYMBOLS[card.suit];
    const rankDisplay = RANKS[card.rank];

    el.innerHTML = `
        <div class="card-front">
            <div class="card-corner top">
                <span class="card-rank">${rankDisplay}</span>
                <span class="card-suit-small">${symbol}</span>
            </div>
            <div class="card-center">${symbol}</div>
            <div class="card-corner bottom">
                <span class="card-rank">${rankDisplay}</span>
                <span class="card-suit-small">${symbol}</span>
            </div>
        </div>
        <div class="card-back"></div>
    `;

    return el;
}

function renderStock() {
    stockPile.innerHTML = '';
    
    if (gameState.stock.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'pile-placeholder';
        placeholder.textContent = '🔄';
        stockPile.appendChild(placeholder);
    } else {
        // Show back of top card(s)
        const showCount = Math.min(3, gameState.stock.length);
        for (let i = 0; i < showCount; i++) {
            const card = gameState.stock[gameState.stock.length - 1 - i];
            const el = createCardElement({ ...card, faceUp: false }, showCount - 1 - i, i * 2);
            el.style.pointerEvents = i === 0 ? 'auto' : 'none';
            stockPile.appendChild(el);
        }
    }
}

function renderWaste() {
    wastePile.innerHTML = '';
    
    if (gameState.waste.length === 0) return;

    // Show up to 3 cards spread out
    const showCount = Math.min(gameState.drawCount === 1 ? 1 : 3, gameState.waste.length);
    const startIndex = Math.max(0, gameState.waste.length - showCount);
    
    for (let i = startIndex; i < gameState.waste.length; i++) {
        const card = gameState.waste[i];
        const displayIndex = i - startIndex;
        const el = createCardElement({ ...card, faceUp: true }, displayIndex, 0);
        el.style.left = `${displayIndex * 20}px`;
        
        // Only top card is draggable
        if (i === gameState.waste.length - 1) {
            setupCardDrag(el, 'waste', null);
            el.addEventListener('dblclick', () => tryAutoMove('waste', null));
        } else {
            el.style.pointerEvents = 'none';
        }
        
        wastePile.appendChild(el);
    }
}

function renderFoundations() {
    for (let i = 0; i < 4; i++) {
        const pile = document.getElementById(`foundation-${i}`);
        const cards = gameState.foundations[i];
        
        // Remove existing cards but keep the suit marker
        const suitMarker = pile.querySelector('.foundation-suit');
        pile.innerHTML = '';
        if (suitMarker) pile.appendChild(suitMarker);
        
        if (cards.length > 0) {
            const topCard = cards[cards.length - 1];
            const el = createCardElement({ ...topCard, faceUp: true }, 0, 0);
            setupCardDrag(el, 'foundation', i);
            pile.appendChild(el);
        }
    }
}

function renderTableau() {
    const faceUpOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-offset')) || 28;
    const faceDownOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-offset-hidden')) || 8;
    
    for (let col = 0; col < 7; col++) {
        const pile = document.getElementById(`tableau-${col}`);
        const cards = gameState.tableau[col];
        
        pile.innerHTML = '';
        
        let cumulativeOffset = 0;
        
        cards.forEach((card, row) => {
            const el = createCardElement(card, row, cumulativeOffset);
            
            if (card.faceUp) {
                setupCardDrag(el, 'tableau', col, row);
                el.addEventListener('dblclick', () => tryAutoMove('tableau', col, row));
            }
            
            pile.appendChild(el);
            
            // Add offset for the NEXT card based on THIS card's state
            cumulativeOffset += card.faceUp ? faceUpOffset : faceDownOffset;
        });
    }
}

// ========== DRAG AND DROP ==========
function setupCardDrag(el, sourceType, sourceIndex, cardIndex = null) {
    el.addEventListener('mousedown', (e) => startDrag(e, sourceType, sourceIndex, cardIndex));
    el.addEventListener('touchstart', (e) => startDrag(e, sourceType, sourceIndex, cardIndex), { passive: false });
}

function startDrag(e, sourceType, sourceIndex, cardIndex) {
    e.preventDefault();
    
    if (!gameState.gameStarted) gameState.gameStarted = true;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    // Get cards being dragged
    let cardsToMove = [];
    if (sourceType === 'waste') {
        cardsToMove = [gameState.waste[gameState.waste.length - 1]];
    } else if (sourceType === 'foundation') {
        cardsToMove = [gameState.foundations[sourceIndex][gameState.foundations[sourceIndex].length - 1]];
    } else if (sourceType === 'tableau') {
        cardsToMove = gameState.tableau[sourceIndex].slice(cardIndex);
    }
    
    if (cardsToMove.length === 0) return;
    
    dragState = {
        isDragging: true,
        cards: cardsToMove,
        sourceType,
        sourceIndex,
        cardIndex,
        startX: clientX,
        startY: clientY,
        offsetX: 0,
        offsetY: 0
    };
    
    // Create drag elements
    const dragContainer = document.createElement('div');
    dragContainer.id = 'drag-container';
    dragContainer.style.cssText = `
        position: fixed;
        left: ${clientX - 35}px;
        top: ${clientY - 50}px;
        z-index: 10000;
        pointer-events: none;
    `;
    
    cardsToMove.forEach((card, i) => {
        const el = createCardElement({ ...card, faceUp: true }, i, i * 28);
        el.classList.add('dragging');
        dragContainer.appendChild(el);
    });
    
    document.body.appendChild(dragContainer);
    
    // Highlight valid targets
    highlightValidTargets(cardsToMove[0]);
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    const dragContainer = document.getElementById('drag-container');
    if (dragContainer) {
        dragContainer.style.left = `${clientX - 35}px`;
        dragContainer.style.top = `${clientY - 50}px`;
    }
}

function endDrag(e) {
    if (!dragState.isDragging) return;
    
    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
    
    // Find drop target
    const dragContainer = document.getElementById('drag-container');
    if (dragContainer) dragContainer.style.display = 'none';
    
    const dropTarget = document.elementFromPoint(clientX, clientY);
    
    if (dragContainer) dragContainer.remove();
    
    // Clear highlights
    document.querySelectorAll('.pile.highlight').forEach(p => p.classList.remove('highlight'));
    
    // Check if valid drop
    if (dropTarget) {
        const pile = dropTarget.closest('.pile');
        if (pile) {
            const targetType = pile.dataset.pile;
            const targetIndex = parseInt(pile.dataset.index);
            
            if (tryMove(dragState.sourceType, dragState.sourceIndex, dragState.cardIndex, targetType, targetIndex)) {
                // Move successful
            }
        }
    }
    
    // Reset drag state
    dragState = {
        isDragging: false,
        cards: [],
        sourceType: null,
        sourceIndex: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    };
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    
    renderGame();
    checkWin();
}

function highlightValidTargets(card) {
    // Check foundations
    for (let i = 0; i < 4; i++) {
        if (canStackOnFoundation(card, gameState.foundations[i], i)) {
            document.getElementById(`foundation-${i}`).classList.add('highlight');
        }
    }
    
    // Check tableau
    for (let col = 0; col < 7; col++) {
        const tableau = gameState.tableau[col];
        const topCard = tableau.length > 0 ? tableau[tableau.length - 1] : null;
        if (canStackOnTableau(card, topCard)) {
            document.getElementById(`tableau-${col}`).classList.add('highlight');
        }
    }
}

// ========== GAME MOVES ==========
function tryMove(sourceType, sourceIndex, cardIndex, targetType, targetIndex) {
    let card, cardsToMove;
    
    // Get card(s) to move
    if (sourceType === 'waste') {
        card = gameState.waste[gameState.waste.length - 1];
        cardsToMove = [card];
    } else if (sourceType === 'foundation') {
        card = gameState.foundations[sourceIndex][gameState.foundations[sourceIndex].length - 1];
        cardsToMove = [card];
    } else if (sourceType === 'tableau') {
        cardsToMove = gameState.tableau[sourceIndex].slice(cardIndex);
        card = cardsToMove[0];
    }
    
    if (!card) return false;
    
    // Check if move is valid
    let isValid = false;
    
    if (targetType === 'foundation') {
        if (cardsToMove.length === 1) {
            isValid = canStackOnFoundation(card, gameState.foundations[targetIndex], targetIndex);
        }
    } else if (targetType === 'tableau') {
        const targetCards = gameState.tableau[targetIndex];
        const topCard = targetCards.length > 0 ? targetCards[targetCards.length - 1] : null;
        isValid = canStackOnTableau(card, topCard);
    }
    
    if (!isValid) return false;
    
    // Save state for undo
    saveState();
    
    // Execute move
    if (sourceType === 'waste') {
        gameState.waste.pop();
    } else if (sourceType === 'foundation') {
        gameState.foundations[sourceIndex].pop();
    } else if (sourceType === 'tableau') {
        gameState.tableau[sourceIndex].splice(cardIndex);
        // Flip top card if needed
        const remaining = gameState.tableau[sourceIndex];
        if (remaining.length > 0 && !remaining[remaining.length - 1].faceUp) {
            remaining[remaining.length - 1].faceUp = true;
            gameState.score += SCORE_FLIP_CARD;
        }
    }
    
    // Add to target
    if (targetType === 'foundation') {
        gameState.foundations[targetIndex].push(...cardsToMove);
        gameState.score += sourceType === 'waste' ? SCORE_WASTE_TO_FOUNDATION : SCORE_TABLEAU_TO_FOUNDATION;
    } else if (targetType === 'tableau') {
        gameState.tableau[targetIndex].push(...cardsToMove);
        if (sourceType === 'waste') {
            gameState.score += SCORE_WASTE_TO_TABLEAU;
        } else if (sourceType === 'foundation') {
            gameState.score += SCORE_FOUNDATION_TO_TABLEAU;
        }
    }
    
    gameState.moves++;
    gameState.score = Math.max(0, gameState.score);
    
    updateUI();
    return true;
}

function tryAutoMove(sourceType, sourceIndex, cardIndex = null) {
    let card;
    
    if (sourceType === 'waste') {
        card = gameState.waste[gameState.waste.length - 1];
        cardIndex = gameState.waste.length - 1;
    } else if (sourceType === 'tableau') {
        if (cardIndex === null) cardIndex = gameState.tableau[sourceIndex].length - 1;
        card = gameState.tableau[sourceIndex][cardIndex];
    }
    
    if (!card) return false;
    
    // Try foundations first
    for (let i = 0; i < 4; i++) {
        if (canStackOnFoundation(card, gameState.foundations[i], i)) {
            if (sourceType === 'tableau' && cardIndex !== gameState.tableau[sourceIndex].length - 1) {
                continue; // Can only move top card to foundation
            }
            return tryMove(sourceType, sourceIndex, cardIndex, 'foundation', i);
        }
    }
    
    // Try tableau
    for (let col = 0; col < 7; col++) {
        if (sourceType === 'tableau' && sourceIndex === col) continue;
        const tableau = gameState.tableau[col];
        const topCard = tableau.length > 0 ? tableau[tableau.length - 1] : null;
        if (canStackOnTableau(card, topCard)) {
            return tryMove(sourceType, sourceIndex, cardIndex, 'tableau', col);
        }
    }
    
    return false;
}

// ========== STOCK AND WASTE ==========
stockPile.addEventListener('click', onStockClick);

function onStockClick() {
    if (!gameState.gameStarted) gameState.gameStarted = true;
    
    if (gameState.stock.length === 0) {
        // Recycle waste to stock
        if (gameState.waste.length === 0) return;
        
        saveState();
        gameState.stock = gameState.waste.reverse();
        gameState.stock.forEach(card => card.faceUp = false);
        gameState.waste = [];
        gameState.score += SCORE_RECYCLE_WASTE;
        gameState.score = Math.max(0, gameState.score);
        gameState.moves++;
    } else {
        // Draw cards
        saveState();
        const drawCount = Math.min(gameState.drawCount, gameState.stock.length);
        for (let i = 0; i < drawCount; i++) {
            const card = gameState.stock.pop();
            card.faceUp = true;
            gameState.waste.push(card);
        }
        gameState.moves++;
    }
    
    renderGame();
    updateUI();
}

// ========== UNDO ==========
function saveState() {
    const stateCopy = {
        stock: gameState.stock.map(c => ({ ...c })),
        waste: gameState.waste.map(c => ({ ...c })),
        foundations: gameState.foundations.map(f => f.map(c => ({ ...c }))),
        tableau: gameState.tableau.map(t => t.map(c => ({ ...c }))),
        score: gameState.score,
        moves: gameState.moves
    };
    gameState.history.push(stateCopy);
    
    // Limit history
    if (gameState.history.length > 50) {
        gameState.history.shift();
    }
}

function undo() {
    if (gameState.history.length === 0) return;
    
    const prevState = gameState.history.pop();
    gameState.stock = prevState.stock;
    gameState.waste = prevState.waste;
    gameState.foundations = prevState.foundations;
    gameState.tableau = prevState.tableau;
    gameState.score = prevState.score;
    gameState.moves = prevState.moves;
    
    renderGame();
    updateUI();
}

undoBtn.addEventListener('click', undo);

// ========== HINT SYSTEM ==========
function findHint() {
    // Check waste to foundation
    if (gameState.waste.length > 0) {
        const card = gameState.waste[gameState.waste.length - 1];
        for (let i = 0; i < 4; i++) {
            if (canStackOnFoundation(card, gameState.foundations[i], i)) {
                return { type: 'waste', card };
            }
        }
    }
    
    // Check tableau to foundation
    for (let col = 0; col < 7; col++) {
        const tableau = gameState.tableau[col];
        if (tableau.length === 0) continue;
        const card = tableau[tableau.length - 1];
        if (!card.faceUp) continue;
        
        for (let i = 0; i < 4; i++) {
            if (canStackOnFoundation(card, gameState.foundations[i], i)) {
                return { type: 'tableau', col, card };
            }
        }
    }
    
    // Check tableau to tableau
    for (let col = 0; col < 7; col++) {
        const tableau = gameState.tableau[col];
        for (let row = 0; row < tableau.length; row++) {
            const card = tableau[row];
            if (!card.faceUp) continue;
            
            for (let targetCol = 0; targetCol < 7; targetCol++) {
                if (targetCol === col) continue;
                const target = gameState.tableau[targetCol];
                const topCard = target.length > 0 ? target[target.length - 1] : null;
                
                if (canStackOnTableau(card, topCard)) {
                    // Don't suggest moving king from empty to empty
                    if (card.rank === 12 && row === 0 && target.length === 0) continue;
                    return { type: 'tableau', col, row, card };
                }
            }
        }
    }
    
    // Check waste to tableau
    if (gameState.waste.length > 0) {
        const card = gameState.waste[gameState.waste.length - 1];
        for (let col = 0; col < 7; col++) {
            const tableau = gameState.tableau[col];
            const topCard = tableau.length > 0 ? tableau[tableau.length - 1] : null;
            if (canStackOnTableau(card, topCard)) {
                return { type: 'waste', card };
            }
        }
    }
    
    return null;
}

function showHint() {
    // Clear previous hints
    document.querySelectorAll('.card.hint').forEach(c => c.classList.remove('hint'));
    
    const hint = findHint();
    if (!hint) {
        // No hint available - flash hint button
        hintBtn.style.animation = 'none';
        hintBtn.offsetHeight; // Trigger reflow
        hintBtn.style.animation = 'shake 0.5s ease';
        return;
    }
    
    // Highlight the card
    const cardEl = document.querySelector(`[data-id="${hint.card.id}"]`);
    if (cardEl) {
        cardEl.classList.add('hint');
        setTimeout(() => cardEl.classList.remove('hint'), 2000);
    }
}

hintBtn.addEventListener('click', showHint);

// ========== AUTO COMPLETE ==========
function canAutoComplete() {
    // All face-down cards must be flipped
    for (const tableau of gameState.tableau) {
        for (const card of tableau) {
            if (!card.faceUp) return false;
        }
    }
    return gameState.stock.length === 0 && gameState.waste.length === 0 || 
           (gameState.waste.length <= 1 && gameState.stock.length === 0);
}

async function autoComplete() {
    if (!canAutoComplete()) return;
    
    let moved = true;
    while (moved && !gameState.isWon) {
        moved = false;
        
        // Move from waste
        if (gameState.waste.length > 0) {
            const card = gameState.waste[gameState.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (canStackOnFoundation(card, gameState.foundations[i], i)) {
                    saveState();
                    gameState.waste.pop();
                    gameState.foundations[i].push(card);
                    gameState.score += SCORE_WASTE_TO_FOUNDATION;
                    gameState.moves++;
                    moved = true;
                    renderGame();
                    updateUI();
                    await sleep(150);
                    break;
                }
            }
        }
        
        // Move from tableau
        for (let col = 0; col < 7 && !moved; col++) {
            const tableau = gameState.tableau[col];
            if (tableau.length === 0) continue;
            
            const card = tableau[tableau.length - 1];
            for (let i = 0; i < 4; i++) {
                if (canStackOnFoundation(card, gameState.foundations[i], i)) {
                    saveState();
                    tableau.pop();
                    gameState.foundations[i].push(card);
                    gameState.score += SCORE_TABLEAU_TO_FOUNDATION;
                    gameState.moves++;
                    moved = true;
                    renderGame();
                    updateUI();
                    await sleep(150);
                    break;
                }
            }
        }
        
        checkWin();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

autoBtn.addEventListener('click', autoComplete);

// ========== WIN DETECTION ==========
function checkWin() {
    const totalInFoundations = gameState.foundations.reduce((sum, f) => sum + f.length, 0);
    if (totalInFoundations === 52) {
        gameState.isWon = true;
        clearInterval(gameState.timerInterval);
        showWinScreen();
    }
}

function showWinScreen() {
    document.getElementById('winTime').textContent = formatTime(gameState.time);
    document.getElementById('winScore').textContent = gameState.score;
    document.getElementById('winMoves').textContent = gameState.moves;
    
    winScreen.classList.add('active');
    createConfetti();
}

function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    
    const colors = ['#ff6b9d', '#ffd32a', '#18dcff', '#7bed9f', '#a29bfe', '#ff4757'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
            animation-delay: ${Math.random() * 2}s;
            transform: rotate(${Math.random() * 360}deg);
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        container.appendChild(confetti);
    }
}

// ========== UI UPDATE ==========
function updateUI() {
    timerEl.textContent = formatTime(gameState.time);
    scoreEl.textContent = gameState.score;
    movesEl.textContent = gameState.moves;
    
    undoBtn.disabled = gameState.history.length === 0;
}

// ========== MENU ==========
menuBtn.addEventListener('click', () => {
    menuModal.classList.add('active');
});

resumeBtn.addEventListener('click', () => {
    menuModal.classList.remove('active');
});

newGameBtn.addEventListener('click', () => {
    menuModal.classList.remove('active');
    initGame(3); // Always Draw 3
});

restartBtn.addEventListener('click', () => {
    menuModal.classList.remove('active');
    initGame(gameState.drawCount);
});

// ========== SCREEN TRANSITIONS ==========
playBtn.addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    gameScreen.classList.add('active');
    initGame(3); // Always Draw 3
});

playAgainBtn.addEventListener('click', () => {
    winScreen.classList.remove('active');
    initGame(3); // Always Draw 3
});

// Close modal on outside click
menuModal.addEventListener('click', (e) => {
    if (e.target === menuModal) {
        menuModal.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
    }
    if (e.key === 'h') {
        showHint();
    }
    if (e.key === 'Escape') {
        menuModal.classList.toggle('active');
    }
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize on load (just show title screen)
document.addEventListener('DOMContentLoaded', () => {
    // Pre-initialize to prevent first-game lag
    createDeck();
});

