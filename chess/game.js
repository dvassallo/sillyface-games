// Game Constants
const BOARD_SIZE = 8;
const COLORS = { WHITE: 'w', BLACK: 'b' };
const PIECES = {
    KING: 'k',
    QUEEN: 'q',
    ROOK: 'r',
    BISHOP: 'b',
    KNIGHT: 'n',
    PAWN: 'p'
};

const PIECE_UNICODE = {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟'
};

// Game State
let board = [];
let turn = COLORS.WHITE;
let selectedSquare = null;
let validMoves = []; // Array of {row, col}
let history = [];
let whiteKingPos = { r: 7, c: 4 };
let blackKingPos = { r: 0, c: 4 };
let promotionPending = null; // { from: {r, c}, to: {r, c} }

// DOM Elements
const boardEl = document.getElementById('chess-board');
const turnIndicator = document.getElementById('turn-indicator');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');
const promotionModal = document.getElementById('promotion-modal');
const checkIndicator = document.getElementById('check-indicator');

// Initialize Game
function initGame() {
    // 8x8 Board
    // initial setup
    // White is at bottom (rows 6, 7). Black at top (rows 0, 1).
    board = Array(8).fill(null).map(() => Array(8).fill(null));

    const setupRow = (row, color, pieces) => {
        pieces.forEach((type, col) => {
            board[row][col] = { type, color, hasMoved: false };
        });
    };

    const backRow = [PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN, PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK];
    const pawnRow = Array(8).fill(PIECES.PAWN);

    setupRow(0, COLORS.BLACK, backRow);
    setupRow(1, COLORS.BLACK, pawnRow);
    setupRow(6, COLORS.WHITE, pawnRow);
    setupRow(7, COLORS.WHITE, backRow);

    whiteKingPos = { r: 7, c: 4 };
    blackKingPos = { r: 0, c: 4 };

    turn = COLORS.WHITE;
    selectedSquare = null;
    validMoves = [];
    history = [];
    
    if (checkIndicator) checkIndicator.classList.add('hidden');
    updateUI();
    messageEl.textContent = '';
}

// Logic: Check if position is on board
function onBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Logic: Get Valid Moves for a piece at (r, c) considering check
function getLegalMoves(r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    
    // 1. Generate pseudo-legal moves
    let moves = getPseudoLegalMoves(r, c, piece);

    // 2. Filter moves that leave king in check
    moves = moves.filter(move => {
        // Simulate move
        const originalTarget = board[move.r][move.c];
        const originalSource = board[r][c];
        
        // Handle Castling simulation (king moves 2 squares)
        // If castling, we need to ensure intermediate square is not attacked is handled in pseudo logic usually or here?
        // Standard rule: King cannot castle OUT of check, THROUGH check, or INTO check.
        // OUT of check is handled by checking initial state.
        // INTO check is handled by this simulation.
        // THROUGH check needs special handling for castling.
        
        // Let's do a simple simulation first
        board[move.r][move.c] = { ...originalSource, hasMoved: true }; // potential bug: modifying hasMoved doesn't matter for check check
        board[r][c] = null;
        
        // Update king pos if king moved
        let kPos = piece.color === COLORS.WHITE ? whiteKingPos : blackKingPos;
        if (piece.type === PIECES.KING) {
            kPos = { r: move.r, c: move.c };
        }

        const inCheck = isSquareAttacked(kPos.r, kPos.c, piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);

        // Undo move
        board[r][c] = originalSource;
        board[move.r][move.c] = originalTarget;

        return !inCheck;
    });

    // Special Castling Logic (filter out if castling through check)
    if (piece.type === PIECES.KING) {
        moves = moves.filter(move => {
            if (Math.abs(move.c - c) === 2) {
                // It is castling
                // Check if current square is checked (cannot castle out of check)
                if (isSquareAttacked(r, c, getOpponentColor(piece.color))) return false;
                
                // Check if crossover square is checked
                const midC = (move.c + c) / 2;
                if (isSquareAttacked(r, midC, getOpponentColor(piece.color))) return false;
            }
            return true;
        });
    }

    return moves;
}

function getPseudoLegalMoves(r, c, piece) {
    let moves = [];
    const directions = {
        [PIECES.ROOK]: [[0, 1], [0, -1], [1, 0], [-1, 0]],
        [PIECES.BISHOP]: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        [PIECES.QUEEN]: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        [PIECES.KNIGHT]: [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
        [PIECES.KING]: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    };

    const type = piece.type;
    const color = piece.color;
    const opponent = getOpponentColor(color);

    if (type === PIECES.PAWN) {
        const forward = color === COLORS.WHITE ? -1 : 1;
        const startRow = color === COLORS.WHITE ? 6 : 1;

        // Move forward 1
        if (onBoard(r + forward, c) && !board[r + forward][c]) {
            moves.push({ r: r + forward, c: c });
            // Move forward 2
            if (r === startRow && onBoard(r + forward * 2, c) && !board[r + forward * 2][c]) {
                moves.push({ r: r + forward * 2, c: c });
            }
        }
        // Capture
        [[forward, 1], [forward, -1]].forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (onBoard(nr, nc)) {
                const target = board[nr][nc];
                if (target && target.color === opponent) {
                    moves.push({ r: nr, c: nc });
                }
                // En Passant
                // Look at last move in history
                if (history.length > 0) {
                    const lastMove = history[history.length - 1];
                    // If last move was a pawn moving 2 squares, and it landed next to us
                    if (lastMove.piece.type === PIECES.PAWN && Math.abs(lastMove.from.r - lastMove.to.r) === 2 && lastMove.to.r === r && lastMove.to.c === nc) {
                        moves.push({ r: nr, c: nc, isEnPassant: true });
                    }
                }
            }
        });
    } else if (type === PIECES.KING) {
        // Normal moves
        directions[type].forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (onBoard(nr, nc)) {
                const target = board[nr][nc];
                if (!target || target.color === opponent) {
                    moves.push({ r: nr, c: nc });
                }
            }
        });
        // Castling
        if (!piece.hasMoved) {
            // Kingside
            if (canCastle(r, c, 7)) {
                moves.push({ r, c: c + 2, isCastling: 'K' });
            }
            // Queenside
            if (canCastle(r, c, 0)) {
                moves.push({ r, c: c - 2, isCastling: 'Q' });
            }
        }
    } else if (type === PIECES.KNIGHT) {
         directions[type].forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (onBoard(nr, nc)) {
                const target = board[nr][nc];
                if (!target || target.color === opponent) {
                    moves.push({ r: nr, c: nc });
                }
            }
        });
    } else {
        // Sliding pieces (Rook, Bishop, Queen)
         directions[type].forEach(([dr, dc]) => {
            let nr = r + dr;
            let nc = c + dc;
            while (onBoard(nr, nc)) {
                const target = board[nr][nc];
                if (!target) {
                    moves.push({ r: nr, c: nc });
                } else {
                    if (target.color === opponent) {
                        moves.push({ r: nr, c: nc });
                    }
                    break; // Blocked
                }
                nr += dr;
                nc += dc;
            }
        });
    }

    return moves;
}

function getOpponentColor(color) {
    return color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
}

function isSquareAttacked(r, c, attackerColor) {
    // Check all opponent pieces to see if they can hit (r, c)
    // Optimization: Check lines from (r,c) for sliding pieces, check knight jumps, check pawn attacks
    
    // 1. Pawn attacks
    const pawnDir = attackerColor === COLORS.WHITE ? -1 : 1; // Pawns attack "forward" from their perspective. 
    // Wait, if checking if WHITE attacks (r,c), White pawns are at r+1 (looking "up" board is r-1).
    // If I am at (r,c), a white pawn at (r+1, c+/-1) attacks me.
    // A black pawn at (r-1, c+/-1) attacks me.
    const forward = attackerColor === COLORS.WHITE ? 1 : -1; 
    if (onBoard(r + forward, c - 1)) {
        const p = board[r + forward][c - 1];
        if (p && p.color === attackerColor && p.type === PIECES.PAWN) return true;
    }
    if (onBoard(r + forward, c + 1)) {
        const p = board[r + forward][c + 1];
        if (p && p.color === attackerColor && p.type === PIECES.PAWN) return true;
    }

    // 2. Knight attacks
    const knightMoves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    for (const [dr, dc] of knightMoves) {
        const nr = r + dr, nc = c + dc;
        if (onBoard(nr, nc)) {
            const p = board[nr][nc];
            if (p && p.color === attackerColor && p.type === PIECES.KNIGHT) return true;
        }
    }

    // 3. King attacks (adjacent)
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (onBoard(nr, nc)) {
                 const p = board[nr][nc];
                 if (p && p.color === attackerColor && p.type === PIECES.KING) return true;
            }
        }
    }

    // 4. Sliding pieces (Rook/Queen)
    const orthDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of orthDirs) {
        let nr = r + dr, nc = c + dc;
        while (onBoard(nr, nc)) {
            const p = board[nr][nc];
            if (p) {
                if (p.color === attackerColor && (p.type === PIECES.ROOK || p.type === PIECES.QUEEN)) return true;
                break;
            }
            nr += dr;
            nc += dc;
        }
    }

    // 5. Sliding pieces (Bishop/Queen)
    const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of diagDirs) {
        let nr = r + dr, nc = c + dc;
        while (onBoard(nr, nc)) {
            const p = board[nr][nc];
            if (p) {
                if (p.color === attackerColor && (p.type === PIECES.BISHOP || p.type === PIECES.QUEEN)) return true;
                break;
            }
            nr += dr;
            nc += dc;
        }
    }

    return false;
}

function canCastle(r, c, rookCol) {
    const rookSquare = board[r][rookCol];
    // Check rook exists and hasn't moved
    if (!rookSquare || rookSquare.type !== PIECES.ROOK || rookSquare.hasMoved) return false;
    
    // Check path clear
    const start = Math.min(c, rookCol) + 1;
    const end = Math.max(c, rookCol);
    for (let i = start; i < end; i++) {
        if (board[r][i]) return false;
    }
    return true;
}

// Interaction
function handleSquareClick(r, c) {
    // If promoting, ignore other clicks
    if (promotionPending) return;

    // Check if clicked square is a valid move for selected piece
    const move = validMoves.find(m => m.r === r && m.c === c);

    if (move) {
        executeMove(move);
    } else {
        // Select piece
        const piece = board[r][c];
        if (piece && piece.color === turn) {
            selectedSquare = { r, c };
            validMoves = getLegalMoves(r, c);
            renderBoard();
        } else {
            // Deselect
            selectedSquare = null;
            validMoves = [];
            renderBoard();
        }
    }
}

function executeMove(move) {
    const fromR = selectedSquare.r;
    const fromC = selectedSquare.c;
    const piece = board[fromR][fromC];

    // Check for promotion
    if (piece.type === PIECES.PAWN && (move.r === 0 || move.r === 7)) {
        promotionPending = { from: {r: fromR, c: fromC}, to: move };
        showPromotionModal();
        return;
    }

    completeMove(fromR, fromC, move);
}

function completeMove(fromR, fromC, move, promotionType = null) {
    const piece = board[fromR][fromC];
    const target = board[move.r][move.c];

    // Record history
    history.push({
        piece: { ...piece },
        from: { r: fromR, c: fromC },
        to: move,
        captured: target
    });

    // Update board
    board[move.r][move.c] = piece;
    board[fromR][fromC] = null;
    piece.hasMoved = true;

    // Handle Promotion
    if (promotionType) {
        piece.type = promotionType;
    }

    // Handle En Passant
    if (move.isEnPassant) {
        // Capture the pawn behind
        const captureRow = fromR; // The pawn being captured is on the same row as 'from'
        board[captureRow][move.c] = null;
    }

    // Handle Castling
    if (move.isCastling) {
        const rookCol = move.isCastling === 'K' ? 7 : 0;
        const newRookCol = move.isCastling === 'K' ? 5 : 3; // Standard chess: King goes to col 6 (g) or 2 (c), Rook jumps over
        // Wait, my move logic set King to c +/- 2.
        // Kingside: e1(4) -> g1(6). Rook h1(7) -> f1(5).
        // Queenside: e1(4) -> c1(2). Rook a1(0) -> d1(3).
        // Let's verify cols.
        // Cols: 0 1 2 3 4 5 6 7
        //       a b c d e f g h
        
        // Kingside: c:4 -> c:6. Rook 7 -> 5.
        // Queenside: c:4 -> c:2. Rook 0 -> 3.
        
        const rookFromC = move.isCastling === 'K' ? 7 : 0;
        const rookToC = move.isCastling === 'K' ? 5 : 3;
        
        const rook = board[fromR][rookFromC];
        board[fromR][rookToC] = rook;
        board[fromR][rookFromC] = null;
        rook.hasMoved = true;
    }

    // Update King Pos
    if (piece.type === PIECES.KING) {
        if (piece.color === COLORS.WHITE) whiteKingPos = { r: move.r, c: move.c };
        else blackKingPos = { r: move.r, c: move.c };
    }

    // Switch Turn
    turn = turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    selectedSquare = null;
    validMoves = [];

    // Check Game Status
    updateStatus();
    updateUI();
}

function updateStatus() {
    // Check for checkmate/stalemate
    let hasLegalMoves = false;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === turn) {
                if (getLegalMoves(r, c).length > 0) {
                    hasLegalMoves = true;
                    break;
                }
            }
        }
        if (hasLegalMoves) break;
    }

    const kingPos = turn === COLORS.WHITE ? whiteKingPos : blackKingPos;
    const inCheck = isSquareAttacked(kingPos.r, kingPos.c, getOpponentColor(turn));

    if (!hasLegalMoves) {
        if (inCheck) {
            messageEl.textContent = `Checkmate! ${getOpponentColor(turn) === COLORS.WHITE ? "White" : "Black"} Wins!`;
            if (checkIndicator) checkIndicator.classList.add('hidden');
        } else {
            messageEl.textContent = "Stalemate! It's a Draw.";
            if (checkIndicator) checkIndicator.classList.add('hidden');
        }
    } else if (inCheck) {
        // messageEl.textContent = "Check!";
        if (checkIndicator) checkIndicator.classList.remove('hidden');
    } else {
        // messageEl.textContent = "";
        if (checkIndicator) checkIndicator.classList.add('hidden');
    }
}

// UI Rendering
function renderBoard() {
    boardEl.innerHTML = '';
    
    // Rotate board? No, mobile shared screen -> usually one view.
    // Or we could flip based on turn?
    // User requested "same device". Flipping is jarring. Fixed perspective is better.
    // White at bottom is standard.

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.r = r;
            square.dataset.c = c;

            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                square.classList.add('selected');
            }

            const move = validMoves.find(m => m.r === r && m.c === c);
            if (move) {
                square.classList.add('valid-move');
                if (board[r][c]) {
                     square.classList.add('valid-capture');
                }
            }

            const piece = board[r][c];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.color === COLORS.WHITE ? 'white' : 'black'}`;
                pieceEl.textContent = PIECE_UNICODE[piece.type];
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', () => handleSquareClick(r, c));
            boardEl.appendChild(square);
        }
    }
    
    turnIndicator.textContent = `${turn === COLORS.WHITE ? "White" : "Black"}'s Turn`;
    turnIndicator.style.background = turn === COLORS.WHITE ? "var(--c-card)" : "var(--c-text)";
    turnIndicator.style.color = turn === COLORS.WHITE ? "var(--c-text)" : "var(--c-card)";
}

function updateUI() {
    renderBoard();
}

// Promotion Modal
function showPromotionModal() {
    promotionModal.classList.remove('hidden');
}

function hidePromotionModal() {
    promotionModal.classList.add('hidden');
    promotionPending = null;
}

// Setup Promotion Listeners
document.querySelectorAll('.promo-piece').forEach(el => {
    el.addEventListener('click', (e) => {
        if (!promotionPending) return;
        const type = e.target.dataset.type;
        completeMove(promotionPending.from.r, promotionPending.from.c, promotionPending.to, type);
        hidePromotionModal();
    });
});

resetBtn.addEventListener('click', initGame);

// Start
initGame();
