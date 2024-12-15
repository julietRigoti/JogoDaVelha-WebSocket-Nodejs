const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Variáveis do jogo
let board = Array(9).fill(null);
let currentPlayer = "X";
let scores = { X: 0, O: 0 };

// Atribui símbolos aos jogadores
io.on("connection", (socket) => {
  console.log("Novo jogador conectado!");

  // Atribuir símbolos (X ou O)
  const playerSymbol = io.engine.clientsCount % 2 === 0 ? "O" : "X";
  socket.emit("assignSymbol", playerSymbol);

  // Lógica da jogada
  socket.on("makeMove", ({ index, symbol }) => {
    if (board[index] === null && symbol === currentPlayer) {
      board[index] = symbol;

      // Verifica vencedor
      const winner = checkWinner();
      if (winner) {
        scores[winner]++;
        io.emit("gameOver", winner);
        resetBoard();
      } else if (!board.includes(null)) {
        io.emit("gameOver", "Empate");
        resetBoard();
      } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
      }

      io.emit("updateBoard", board);
      io.emit("updateScores", scores);
      io.emit("updateCurrentPlayer", currentPlayer);
    }
  });

  // Reiniciar jogo
  socket.on("restartGame", () => {
    resetBoard();
    io.emit("updateBoard", board);
  });
});

// Função para verificar vencedor
function checkWinner() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

// Reinicia o tabuleiro
function resetBoard() {
  board = Array(9).fill(null);
  currentPlayer = "X";
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
