/**
 * Tetris - A complete, production-quality implementation
 * Uses HTML5 Canvas for rendering and implements all classic Tetris mechanics
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 30;
const PREVIEW_CELL_SIZE = 20;

const COLORS = {
    I: '#00ffff',
    O: '#ffff00',
    T: '#aa00ff',
    S: '#00ff00',
    Z: '#ff0000',
    J: '#0000ff',
    L: '#ff8800'
};

const GHOST_COLOR = 'rgba(255, 255, 255, 0.2)';
const LOCK_DELAY_MS = 500;
const SOFT_DROP_SPEED = 20;
const LINE_CLEAR_ANIMATION_MS = 300;

// Gravity intervals in ms for each level (1-15)
const GRAVITY_INTERVALS = [
    1000, 793, 618, 473, 355, 262, 190, 135, 94, 64,
    43, 28, 17, 10, 5, 2
];

// Scoring values
const SCORE = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2
};

// Tetromino shapes - each piece has 4 rotation states
// Format: [row, col] offsets from center
const TETROMINOES = {
    I: [
        [[0, -1], [0, 0], [0, 1], [0, 2]],
        [[-1, 0], [0, 0], [1, 0], [2, 0]],
        [[0, -1], [0, 0], [0, 1], [0, 2]],
        [[-1, 0], [0, 0], [1, 0], [2, 0]]
    ],
    O: [
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]]
    ],
    T: [
        [[0, -1], [0, 0], [0, 1], [-1, 0]],
        [[-1, 0], [0, 0], [1, 0], [0, -1]],
        [[0, -1], [0, 0], [0, 1], [1, 0]],
        [[-1, 0], [0, 0], [1, 0], [0, 1]]
    ],
    S: [
        [[0, -1], [0, 0], [-1, 0], [-1, 1]],
        [[-1, 0], [0, 0], [0, -1], [1, -1]],
        [[0, -1], [0, 0], [1, 0], [1, 1]],
        [[-1, 0], [0, 0], [0, 1], [1, 1]]
    ],
    Z: [
        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
        [[-1, 0], [0, 0], [0, -1], [1, -1]],
        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
        [[-1, 0], [0, 0], [0, -1], [1, -1]]
    ],
    J: [
        [[-1, -1], [0, -1], [0, 0], [0, 1]],
        [[-1, 0], [-1, 1], [0, 0], [1, 0]],
        [[0, -1], [0, 0], [0, 1], [1, 1]],
        [[-1, 0], [0, 0], [1, 0], [1, -1]]
    ],
    L: [
        [[-1, 1], [0, -1], [0, 0], [0, 1]],
        [[-1, 0], [0, 0], [1, 0], [1, 1]],
        [[0, -1], [0, 0], [0, 1], [1, -1]],
        [[-1, -1], [-1, 0], [0, 0], [1, 0]]
    ]
};

// SRS Wall Kick data
// Format: [current rotation, [test offsets...]]
const WALL_KICKS = {
    'JLSTZ': {
        '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
    },
    'I': {
        '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
        '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
    }
};

// ============================================================================
// GAME STATE
// ============================================================================

const GameState = {
    board: [],
    currentPiece: null,
    nextPiece: null,
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    isPaused: false,
    isGameOver: false,
    isLocking: false,
    lockTimer: null,
    lastDropTime: 0,
    bag: [],
    lineClearAnimation: null,
    animationStartTime: 0
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    gameCanvas: null,
    holdCanvas: null,
    nextCanvas: null,
    scoreDisplay: null,
    levelDisplay: null,
    linesDisplay: null,
    speedDisplay: null,
    pauseOverlay: null,
    gameoverOverlay: null,
    finalScoreDisplay: null,
    restartBtn: null,
    musicToggle: null
};

// ============================================================================
// CANVAS CONTEXTS
// ============================================================================

let ctx = null;
let holdCtx = null;
let nextCtx = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    cacheDOM();
    setupCanvases();
    resetGame();
    bindEvents();
    requestAnimationFrame(gameLoop);
}

function cacheDOM() {
    elements.gameCanvas = document.getElementById('game-canvas');
    elements.holdCanvas = document.getElementById('hold-canvas');
    elements.nextCanvas = document.getElementById('next-canvas');
    elements.scoreDisplay = document.getElementById('score');
    elements.levelDisplay = document.getElementById('level');
    elements.linesDisplay = document.getElementById('lines');
    elements.speedDisplay = document.getElementById('speed');
    elements.pauseOverlay = document.getElementById('pause-overlay');
    elements.gameoverOverlay = document.getElementById('gameover-overlay');
    elements.finalScoreDisplay = document.getElementById('final-score');
    elements.restartBtn = document.getElementById('restart-btn');
    elements.musicToggle = document.getElementById('music-toggle');
}

function setupCanvases() {
    ctx = elements.gameCanvas.getContext('2d');
    holdCtx = elements.holdCanvas.getContext('2d');
    nextCtx = elements.nextCanvas.getContext('2d');

    elements.gameCanvas.width = COLS * CELL_SIZE;
    elements.gameCanvas.height = ROWS * CELL_SIZE;
    elements.holdCanvas.width = 4 * PREVIEW_CELL_SIZE;
    elements.holdCanvas.height = 4 * PREVIEW_CELL_SIZE;
    elements.nextCanvas.width = 4 * PREVIEW_CELL_SIZE;
    elements.nextCanvas.height = 4 * PREVIEW_CELL_SIZE;
}

function resetGame() {
    GameState.board = createEmptyBoard();
    GameState.score = 0;
    GameState.level = 1;
    GameState.lines = 0;
    GameState.combo = 0;
    GameState.isPaused = false;
    GameState.isGameOver = false;
    GameState.isLocking = false;
    GameState.canHold = true;
    GameState.bag = [];
    GameState.lineClearAnimation = null;

    if (GameState.lockTimer) {
        clearTimeout(GameState.lockTimer);
        GameState.lockTimer = null;
    }

    GameState.nextPiece = generatePiece();
    spawnNewPiece();

    hideOverlay(elements.pauseOverlay);
    hideOverlay(elements.gameoverOverlay);

    if (elements.musicToggle.classList.contains('active')) {
        audioManager.startMusic();
    }

    updateUI();
    render();
}

function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// ============================================================================
// 7-BAG RANDOMIZER
// ============================================================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function refillBag() {
    GameState.bag = shuffleArray(['I', 'O', 'T', 'S', 'Z', 'J', 'L']);
}

function getNextPieceType() {
    if (GameState.bag.length === 0) {
        refillBag();
    }
    return GameState.bag.pop();
}

function generatePiece() {
    const type = getNextPieceType();
    return {
        type,
        rotation: 0,
        row: type === 'I' ? -1 : 0,
        col: type === 'O' ? 4 : 3
    };
}

function spawnNewPiece() {
    GameState.currentPiece = GameState.nextPiece;
    GameState.nextPiece = generatePiece();
    GameState.canHold = true;

    if (checkCollision(GameState.currentPiece)) {
        gameOver();
    }

    renderPreview(nextCtx, GameState.nextPiece);
}

// ============================================================================
// PIECE MECHANICS
// ============================================================================

function getPieceBlocks(piece) {
    return TETROMINOES[piece.type][piece.rotation].map(([row, col]) => ({
        row: piece.row + row,
        col: piece.col + col
    }));
}

function checkCollision(piece, offsetRow = 0, offsetCol = 0, rotation = piece.rotation) {
    const testPiece = { ...piece, row: piece.row + offsetRow, col: piece.col + offsetCol, rotation };
    const blocks = TETROMINOES[testPiece.type][testPiece.rotation];

    for (const [row, col] of blocks) {
        const newRow = testPiece.row + row;
        const newCol = testPiece.col + col;

        if (newCol < 0 || newCol >= COLS || newRow >= ROWS) {
            return true;
        }

        if (newRow >= 0 && GameState.board[newRow][newCol] !== null) {
            return true;
        }
    }

    return false;
}

function movePiece(direction) {
    const deltaCol = direction === 'left' ? -1 : 1;

    if (!checkCollision(GameState.currentPiece, 0, deltaCol)) {
        GameState.currentPiece.col += deltaCol;

        if (GameState.isLocking) {
            resetLockDelay();
        }

        audioManager.playMove();
        return true;
    }

    return false;
}

function rotatePiece(direction) {
    const currentRotation = GameState.currentPiece.rotation;
    const newRotation = direction === 'cw'
        ? (currentRotation + 1) % 4
        : (currentRotation + 3) % 4;

    const kickKey = `${currentRotation}>${newRotation}`;
    const kickTable = GameState.currentPiece.type === 'I'
        ? WALL_KICKS['I']
        : WALL_KICKS['JLSTZ'];

    const kicks = kickTable[kickKey] || [[0, 0]];

    for (const [rowKick, colKick] of kicks) {
        if (!checkCollision(GameState.currentPiece, rowKick, colKick, newRotation)) {
            GameState.currentPiece.row += rowKick;
            GameState.currentPiece.col += colKick;
            GameState.currentPiece.rotation = newRotation;

            if (GameState.isLocking) {
                resetLockDelay();
            }

            audioManager.playRotate();
            return true;
        }
    }

    return false;
}

function softDrop() {
    if (!checkCollision(GameState.currentPiece, 1, 0)) {
        GameState.currentPiece.row++;
        GameState.score += SCORE.SOFT_DROP;
        updateUI();
        return true;
    }
    return false;
}

function hardDrop() {
    let dropDistance = 0;

    while (!checkCollision(GameState.currentPiece, 1, 0)) {
        GameState.currentPiece.row++;
        dropDistance++;
    }

    GameState.score += dropDistance * SCORE.HARD_DROP;
    updateUI();
    audioManager.playHardDrop();
    lockPiece();
}

function getGhostPosition() {
    let ghostRow = GameState.currentPiece.row;

    while (!checkCollision(GameState.currentPiece, ghostRow - GameState.currentPiece.row + 1, 0)) {
        ghostRow++;
    }

    return ghostRow;
}

function holdPiece() {
    if (!GameState.canHold) return;

    const currentType = GameState.currentPiece.type;

    if (GameState.holdPiece) {
        GameState.currentPiece = {
            type: GameState.holdPiece,
            rotation: 0,
            row: GameState.holdPiece === 'I' ? -1 : 0,
            col: GameState.holdPiece === 'O' ? 4 : 3
        };
    } else {
        spawnNewPiece();
    }

    GameState.holdPiece = currentType;
    GameState.canHold = false;

    renderPreview(holdCtx, { type: GameState.holdPiece, rotation: 0 });

    if (GameState.isLocking) {
        clearTimeout(GameState.lockTimer);
        GameState.isLocking = false;
    }
}

// ============================================================================
// LOCK DELAY
// ============================================================================

function tryLock() {
    if (checkCollision(GameState.currentPiece, 1, 0)) {
        if (!GameState.isLocking) {
            startLockDelay();
        }
    } else {
        if (GameState.isLocking) {
            clearTimeout(GameState.lockTimer);
            GameState.isLocking = false;
        }
    }
}

function startLockDelay() {
    GameState.isLocking = true;
    resetLockDelay();
}

function resetLockDelay() {
    if (GameState.lockTimer) {
        clearTimeout(GameState.lockTimer);
    }

    GameState.lockTimer = setTimeout(() => {
        if (GameState.isLocking && checkCollision(GameState.currentPiece, 1, 0)) {
            lockPiece();
        }
    }, LOCK_DELAY_MS);
}

function lockPiece() {
    const blocks = getPieceBlocks(GameState.currentPiece);

    for (const { row, col } of blocks) {
        if (row < 0) {
            gameOver();
            return;
        }
        GameState.board[row][col] = GameState.currentPiece.type;
    }

    GameState.isLocking = false;
    if (GameState.lockTimer) {
        clearTimeout(GameState.lockTimer);
        GameState.lockTimer = null;
    }

    audioManager.playLock();
    clearLines();
    spawnNewPiece();
}

// ============================================================================
// LINE CLEARING
// ============================================================================

function clearLines() {
    const linesToClear = [];

    for (let row = 0; row < ROWS; row++) {
        if (GameState.board[row].every(cell => cell !== null)) {
            linesToClear.push(row);
        }
    }

    if (linesToClear.length === 0) {
        GameState.combo = 0;
        return;
    }

    GameState.combo++;
    GameState.lines += linesToClear.length;

    const baseScore = [0, SCORE.SINGLE, SCORE.DOUBLE, SCORE.TRIPLE, SCORE.TETRIS][linesToClear.length];
    const comboBonus = GameState.combo > 1 ? GameState.combo * 50 : 0;
    GameState.score += (baseScore + comboBonus) * GameState.level;

    updateLevel();

    if (linesToClear.length === 4) {
        audioManager.playTetris();
    } else {
        audioManager.playLineClear(linesToClear.length);
    }

    startLineClearAnimation(linesToClear);

    updateUI();
}

function startLineClearAnimation(lines) {
    GameState.lineClearAnimation = lines;
    GameState.animationStartTime = performance.now();

    setTimeout(() => {
        removeLines(lines);
        GameState.lineClearAnimation = null;
        render();
    }, LINE_CLEAR_ANIMATION_MS);
}

function removeLines(lines) {
    for (const row of lines.sort((a, b) => b - a)) {
        GameState.board.splice(row, 1);
        GameState.board.unshift(Array(COLS).fill(null));
    }
}

// ============================================================================
// LEVEL PROGRESSION
// ============================================================================

function updateLevel() {
    const newLevel = Math.floor(GameState.lines / 10) + 1;
    GameState.level = Math.min(newLevel, 15);
}

function getGravityInterval() {
    return GRAVITY_INTERVALS[Math.min(GameState.level - 1, GRAVITY_INTERVALS.length - 1)];
}

function getSpeedMultiplier() {
    const interval = getGravityInterval();
    return (1000 / interval).toFixed(1);
}

// ============================================================================
// GAME OVER & PAUSE
// ============================================================================

function gameOver() {
    GameState.isGameOver = true;
    GameState.isPaused = false;

    if (GameState.lockTimer) {
        clearTimeout(GameState.lockTimer);
        GameState.lockTimer = null;
    }

    audioManager.playGameOver();
    audioManager.stopMusic();

    elements.finalScoreDisplay.textContent = GameState.score;
    showOverlay(elements.gameoverOverlay);
}

function togglePause() {
    if (GameState.isGameOver) return;

    GameState.isPaused = !GameState.isPaused;

    if (GameState.isPaused) {
        showOverlay(elements.pauseOverlay);
    } else {
        hideOverlay(elements.pauseOverlay);
    }
}

function toggleMusic() {
    const isPlaying = audioManager.toggleMusic();
    elements.musicToggle.classList.toggle('active', isPlaying);
    elements.musicToggle.querySelector('.music-status').textContent = isPlaying ? 'ON' : 'OFF';
}

function showOverlay(overlay) {
    overlay.classList.remove('hidden');
}

function hideOverlay(overlay) {
    overlay.classList.add('hidden');
}

// ============================================================================
// GAME LOOP
// ============================================================================

let lastTime = 0;
let dropAccumulator = 0;

function gameLoop(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!GameState.isPaused && !GameState.isGameOver && !GameState.lineClearAnimation) {
        update(deltaTime);
    }

    render();
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    dropAccumulator += deltaTime;
    const gravityInterval = getGravityInterval();

    while (dropAccumulator >= gravityInterval) {
        dropAccumulator -= gravityInterval;

        if (!checkCollision(GameState.currentPiece, 1, 0)) {
            GameState.currentPiece.row++;
            GameState.isLocking = false;
        } else {
            tryLock();
        }
    }
}

// ============================================================================
// RENDERING
// ============================================================================

function render() {
    ctx.clearRect(0, 0, elements.gameCanvas.width, elements.gameCanvas.height);

    renderBoard();
    renderGhostPiece();
    renderCurrentPiece();

    if (GameState.lineClearAnimation) {
        renderLineClearAnimation();
    }
}

function renderBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = GameState.board[row][col];

            if (cell) {
                renderCell(ctx, col, row, cell, CELL_SIZE);
            }

            renderCellBorder(ctx, col, row, CELL_SIZE);
        }
    }
}

function renderCurrentPiece() {
    if (!GameState.currentPiece) return;

    const blocks = getPieceBlocks(GameState.currentPiece);

    for (const { row, col } of blocks) {
        if (row >= 0) {
            renderCell(ctx, col, row, GameState.currentPiece.type, CELL_SIZE);
        }
    }
}

function renderGhostPiece() {
    if (!GameState.currentPiece) return;

    const ghostRow = getGhostPosition();
    const blocks = TETROMINOES[GameState.currentPiece.type][GameState.currentPiece.rotation];

    for (const [row, col] of blocks) {
        const newRow = ghostRow + row;
        const newCol = GameState.currentPiece.col + col;

        if (newRow >= 0) {
            renderGhostCell(ctx, newCol, newRow, CELL_SIZE);
        }
    }
}

function renderCell(context, col, row, type, size) {
    const x = col * size;
    const y = row * size;

    context.fillStyle = COLORS[type];
    context.fillRect(x + 1, y + 1, size - 2, size - 2);

    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x + 1, y + 1, size - 2, 4);
    context.fillRect(x + 1, y + 1, 4, size - 2);

    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x + size - 5, y + 1, 4, size - 2);
    context.fillRect(x + 1, y + size - 5, size - 2, 4);
}

function renderGhostCell(context, col, row, size) {
    const x = col * size;
    const y = row * size;

    context.fillStyle = GHOST_COLOR;
    context.fillRect(x + 2, y + 2, size - 4, size - 4);

    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 2;
    context.strokeRect(x + 2, y + 2, size - 4, size - 4);
}

function renderCellBorder(context, col, row, size) {
    const x = col * size;
    const y = row * size;

    context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    context.lineWidth = 1;
    context.strokeRect(x, y, size, size);
}

function renderLineClearAnimation() {
    const elapsed = performance.now() - GameState.animationStartTime;
    const progress = Math.min(elapsed / LINE_CLEAR_ANIMATION_MS, 1);

    for (const row of GameState.lineClearAnimation) {
        for (let col = 0; col < COLS; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            const flash = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
            const alpha = 1 - progress;

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * flash})`;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }
}

function renderPreview(context, piece) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (!piece) return;

    const blocks = TETROMINOES[piece.type][piece.rotation];

    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;

    for (const [row, col] of blocks) {
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
    }

    const pieceWidth = (maxCol - minCol + 1) * PREVIEW_CELL_SIZE;
    const pieceHeight = (maxRow - minRow + 1) * PREVIEW_CELL_SIZE;

    const offsetX = (context.canvas.width - pieceWidth) / 2 - minCol * PREVIEW_CELL_SIZE;
    const offsetY = (context.canvas.height - pieceHeight) / 2 - minRow * PREVIEW_CELL_SIZE;

    for (const [row, col] of blocks) {
        const x = offsetX + col * PREVIEW_CELL_SIZE;
        const y = offsetY + row * PREVIEW_CELL_SIZE;

        context.fillStyle = COLORS[piece.type];
        context.fillRect(x + 1, y + 1, PREVIEW_CELL_SIZE - 2, PREVIEW_CELL_SIZE - 2);

        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.fillRect(x + 1, y + 1, PREVIEW_CELL_SIZE - 2, 3);
        context.fillRect(x + 1, y + 1, 3, PREVIEW_CELL_SIZE - 2);

        context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fillRect(x + PREVIEW_CELL_SIZE - 4, y + 1, 3, PREVIEW_CELL_SIZE - 2);
        context.fillRect(x + 1, y + PREVIEW_CELL_SIZE - 4, PREVIEW_CELL_SIZE - 2, 3);
    }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateUI() {
    elements.scoreDisplay.textContent = GameState.score.toLocaleString();
    elements.levelDisplay.textContent = GameState.level;
    elements.linesDisplay.textContent = GameState.lines;
    elements.speedDisplay.textContent = `${getSpeedMultiplier()}x`;
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

const keyState = {
    left: false,
    right: false,
    down: false,
    lastMove: 0,
    moveDelay: 100,
    initialMoveDelay: 200
};

function bindEvents() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    elements.restartBtn.addEventListener('click', resetGame);
    elements.musicToggle.addEventListener('click', toggleMusic);
}

function handleKeyDown(e) {
    if (GameState.isGameOver && e.key.toLowerCase() !== 'r') {
        return;
    }

    const key = e.key.toLowerCase();

    switch (key) {
        case 'arrowleft':
            e.preventDefault();
            if (!keyState.left) {
                keyState.left = true;
                movePiece('left');
                keyState.lastMove = performance.now();
            }
            break;

        case 'arrowright':
            e.preventDefault();
            if (!keyState.right) {
                keyState.right = true;
                movePiece('right');
                keyState.lastMove = performance.now();
            }
            break;

        case 'arrowdown':
            e.preventDefault();
            if (!keyState.down) {
                keyState.down = true;
                softDrop();
            }
            break;

        case 'arrowup':
            e.preventDefault();
            rotatePiece('cw');
            break;

        case 'z':
            e.preventDefault();
            rotatePiece('ccw');
            break;

        case ' ':
            e.preventDefault();
            hardDrop();
            break;

        case 'c':
            e.preventDefault();
            holdPiece();
            break;

        case 'p':
            e.preventDefault();
            togglePause();
            break;

        case 'r':
            e.preventDefault();
            resetGame();
            break;

        case 'm':
            e.preventDefault();
            toggleMusic();
            break;
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();

    switch (key) {
        case 'arrowleft':
            keyState.left = false;
            break;

        case 'arrowright':
            keyState.right = false;
            break;

        case 'arrowdown':
            keyState.down = false;
            break;
    }
}

// ============================================================================
// AUTO-REPEAT MOVEMENT
// ============================================================================

setInterval(() => {
    if (!GameState.currentPiece || GameState.isPaused || GameState.isGameOver) return;

    const now = performance.now();

    if (keyState.left && now - keyState.lastMove > keyState.moveDelay) {
        movePiece('left');
        keyState.lastMove = now;
    }

    if (keyState.right && now - keyState.lastMove > keyState.moveDelay) {
        movePiece('right');
        keyState.lastMove = now;
    }

    if (keyState.down) {
        softDrop();
    }
}, 16);

// ============================================================================
// AUDIO MANAGER - MP3 Music & Sound Effects
// ============================================================================

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isMusicPlaying = false;
        this.isInitialized = false;
        this.musicSource = null;
    }

    init() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    toggleMusic() {
        if (!this.isInitialized) this.init();
        this.resume();

        if (this.isMusicPlaying) {
            this.stopMusic();
        } else {
            this.startMusic();
        }

        return this.isMusicPlaying;
    }

    async startMusic() {
        if (!this.isInitialized) this.init();
        this.resume();

        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource.disconnect();
        }

        try {
            const response = await fetch('forever-bound_stereo-madness.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.musicSource = this.audioContext.createBufferSource();
            this.musicSource.buffer = audioBuffer;
            this.musicSource.loop = true;
            this.musicSource.connect(this.audioContext.destination);

            this.musicSource.start(0);
            this.isMusicPlaying = true;
        } catch (e) {
            console.warn('Could not load music file:', e);
        }
    }

    stopMusic() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource = null;
        }
        this.isMusicPlaying = false;
    }

    playLineClear(lines) {
        if (!this.isInitialized) return;
        this.resume();

        const baseNotes = [659.25, 783.99, 1046.50, 1318.51];

        for (let i = 0; i < lines; i++) {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'square';
                osc.frequency.value = baseNotes[i] || baseNotes[3];

                gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.25);
            }, i * 100);
        }
    }

    playHardDrop() {
        if (!this.isInitialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playMove() {
        if (!this.isInitialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.value = 600;

        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playRotate() {
        if (!this.isInitialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
    }

    playLock() {
        if (!this.isInitialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.value = 150;

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playTetris() {
        if (!this.isInitialized) return;
        this.resume();

        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'square';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.2);
            }, i * 100);
        });
    }

    playGameOver() {
        if (!this.isInitialized) return;
        this.resume();

        const notes = [392, 349.23, 329.63, 261.63, 220, 174.61, 146.83, 130.81];

        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'square';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.2);
            }, i * 150);
        });
    }
}

const audioManager = new AudioManager();

// ============================================================================
// START GAME
// ============================================================================

document.addEventListener('DOMContentLoaded', init);
