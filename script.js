// ================= VARIABLES =================

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let vsAI = false;

let scoreX = 0;
let scoreO = 0;

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");

const pvpBtn = document.getElementById("pvpBtn");
const aiBtn = document.getElementById("aiBtn");

const winConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// ================= EVENT LISTENERS =================

cells.forEach(cell => {
    cell.addEventListener("click", handleClick);
});

// Mode switch
pvpBtn.addEventListener("click", () => {
    vsAI = false;
    pvpBtn.classList.add("active");
    aiBtn.classList.remove("active");
    restartGame();
});

aiBtn.addEventListener("click", () => {
    vsAI = true;
    aiBtn.classList.add("active");
    pvpBtn.classList.remove("active");
    restartGame();
});

// ================= GAME LOGIC =================

function handleClick() {
    const index = this.getAttribute("data-index");

    if (board[index] !== "" || !gameActive) return;

    // Block clicking when AI turn
    if (vsAI && currentPlayer === "O") return;

    // Human move
    makeMove(index, currentPlayer);

    if (!gameActive) return;

    // AI move
    if (vsAI && currentPlayer === "O") {
        statusText.textContent = "🤖 AI Thinking...";

        setTimeout(() => {
            let bestMove = minimax(board, "O").index;
            makeMove(bestMove, "O");
        }, 500);
    }
}

// ================= MOVE FUNCTION =================

function makeMove(index, player) {
    if (board[index] !== "") return;

    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player);

    checkWinner();

    if (!gameActive) return;

    currentPlayer = player === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer} Turn`;
}

// ================= WIN CHECK =================

function checkWinner() {
    for (let condition of winConditions) {
        const [a, b, c] = condition;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {

            // Highlight winning cells
            cells[a].classList.add("win");
            cells[b].classList.add("win");
            cells[c].classList.add("win");

            // Update score
            if (board[a] === "X") {
                scoreX++;
                scoreXText.textContent = scoreX;
            } else {
                scoreO++;
                scoreOText.textContent = scoreO;
            }

            statusText.textContent = `🎉 Player ${board[a]} Wins!`;
            gameActive = false;

            setTimeout(restartGame, 2000);
            return;
        }
    }

    if (!board.includes("")) {
        statusText.textContent = "It's a Draw!";
        gameActive = false;

        setTimeout(restartGame, 2000);
    }
}

// ================= RESTART =================

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";

    statusText.textContent = "Player X Turn";

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win", "X", "O");
    });
}

// ================= MINIMAX AI =================

function minimax(newBoard, player) {
    let availSpots = newBoard
        .map((val, idx) => val === "" ? idx : null)
        .filter(v => v !== null);

    if (checkWinState(newBoard, "X")) return { score: -10 };
    if (checkWinState(newBoard, "O")) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    let moves = [];

    for (let i of availSpots) {
        let move = {};
        move.index = i;
        newBoard[i] = player;

        if (player === "O") {
            let result = minimax(newBoard, "X");
            move.score = result.score;
        } else {
            let result = minimax(newBoard, "O");
            move.score = result.score;
        }

        newBoard[i] = "";
        moves.push(move);
    }

    let bestMove;

    if (player === "O") {
        let bestScore = -Infinity;
        for (let move of moves) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let move of moves) {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

// ================= HELPER =================

function checkWinState(board, player) {
    return winConditions.some(condition =>
        condition.every(index => board[index] === player)
    );
}