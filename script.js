// script.js
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameMode = 'single';
let difficulty = 'Moderate';
let scores = { X: 0, O: 0, draws: 0 };
let playerNames = { X: 'PLAYER X', O: 'PLAYER O' };
let isBoardActive = true;

document.addEventListener('DOMContentLoaded', () => {
    const savedScores = localStorage.getItem('ttt-scores');
    if (savedScores) scores = JSON.parse(savedScores);
    
    document.getElementById('nameForm').addEventListener('submit', (e) => {
        e.preventDefault();
        playerNames.X = document.getElementById('playerXName').value || 'PLAYER X';
        playerNames.O = document.getElementById('playerOName').value || 'PLAYER O';
        document.getElementById('nameModal').style.display = 'none';
        updatePlayerDisplay();
        createBoard();
        updateScoreboard();
    });

    document.querySelectorAll('.cyber-radio[data-level]').forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.level));
    });

    updateScoreboard();
    updatePlayerDisplay();
    createBoard();
});

function createBoard() {
    const boardDiv = document.getElementById('game-board');
    boardDiv.innerHTML = '';
    board.forEach((_, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', () => handleMove(i));
        boardDiv.appendChild(cell);
    });
}

function handleMove(index) {
    if (!isBoardActive || board[index] !== '') return;
    
    board[index] = currentPlayer;
    updateBoard();

    if (checkWinner(currentPlayer)) {
        endGame(currentPlayer);
    } else if (board.every(cell => cell !== '')) {
        endGame('draw');
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerDisplay();
        
        if (gameMode === 'single' && currentPlayer === 'O') {
            isBoardActive = false;
            setTimeout(() => {
                const move = difficulty === 'Easy' ? randomMove() : bestMove();
                board[move] = 'O';
                updateBoard();
                
                if (checkWinner('O')) {
                    endGame('O');
                } else if (board.every(cell => cell !== '')) {
                    endGame('draw');
                } else {
                    currentPlayer = 'X';
                    updatePlayerDisplay();
                    isBoardActive = true;
                }
            }, difficulty === 'Difficult' ? 800 : 300);
        }
    }
}

function randomMove() {
    const emptyCells = board.reduce((acc, cell, i) => 
        cell === '' ? [...acc, i] : acc, []);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function bestMove() {
    let bestScore = -Infinity;
    let move = -1;
    const maxDepth = { Easy: 2, Moderate: 4, Difficult: 8 }[difficulty];

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false, maxDepth);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing, maxDepth) {
    if (checkWinner('O')) return 10 - depth;
    if (checkWinner('X')) return depth - 10;
    if (board.every(cell => cell !== '') || depth >= maxDepth) return 0;

    if (isMaximizing) {
        return Math.max(...board.map((cell, i) => {
            if (cell === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false, maxDepth);
                board[i] = '';
                return score;
            }
            return -Infinity;
        }));
    } else {
        return Math.min(...board.map((cell, i) => {
            if (cell === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true, maxDepth);
                board[i] = '';
                return score;
            }
            return Infinity;
        }));
    }
}

function checkWinner(player) {
    const wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    return wins.some(combo => combo.every(i => board[i] === player));
}

function endGame(result) {
    isBoardActive = false;
    triggerWinEffects(result);
    
    // Fixed score increment logic
    if (result === 'draw') {
        scores.draws++;
        document.getElementById('status').textContent = 'DRAW!';
    } else {
        scores[result] = scores[result] + 1; // Explicit increment
        document.getElementById('status').textContent = `${playerNames[result]} WINS!`;
    }
    
    updateScoreboard();
    setTimeout(resetGame, 3000);
}

function updateBoard() {
    document.querySelectorAll('.cell').forEach((cell, i) => {
        cell.textContent = board[i];
        cell.classList.toggle('x-stat', board[i] === 'X');
        cell.classList.toggle('o-stat', board[i] === 'O');
    });
}

function updateScoreboard() {
    document.getElementById('playerXScore').textContent = String(scores.X).padStart(2, '0');
    document.getElementById('playerOScore').textContent = String(scores.O).padStart(2, '0');
    document.getElementById('drawsScore').textContent = String(scores.draws).padStart(2, '0');
    localStorage.setItem('ttt-scores', JSON.stringify(scores)); // Fixed syntax error
}

function updatePlayerDisplay() {
    const tag = document.getElementById('currentPlayerTag');
    tag.querySelector('.player-name').textContent = playerNames[currentPlayer];
    tag.querySelector('.player-icon').textContent = currentPlayer === 'X' ? '⚡' : '☠';
}

function triggerWinEffects(winner) {
    if (winner === 'draw') return;
    const cells = document.querySelectorAll('.cell');
    const winCombos = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    
    winCombos.forEach(combo => {
        if (combo.every(i => board[i] === winner)) {
            combo.forEach(i => cells[i].classList.add('win-glow'));
        }
    });
}

function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    isBoardActive = true;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('win-glow');
    });
    updatePlayerDisplay();
    createBoard();
    document.getElementById('status').textContent = `${playerNames.X} TURN`;
}

function setGameMode(mode) {
    gameMode = mode;
    document.querySelectorAll('[data-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    resetGame();
}

function setDifficulty(level) {
    difficulty = level;
    document.querySelectorAll('[data-level]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level.toLowerCase());
    });
    resetGame();
}

function resetScores() {
    scores = { X: 0, O: 0, draws: 0 };
    updateScoreboard();
    localStorage.setItem('ttt-scores', JSON.stringify(scores));
}