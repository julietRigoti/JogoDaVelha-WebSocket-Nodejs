const express = require("express"); // Biblioteca para criar servidores web.
const http = require("http"); // Módulo nativo para criar servidores HTTP.
const { Server } = require("socket.io"); // Biblioteca para comunicação em tempo real.

const app = express(); // Inicializa o servidor Express.
const server = http.createServer(app); // Cria um servidor HTTP usando o Express.
const io = new Server(server); // Inicializa o Socket.IO no servidor.

app.use(express.static("public")); // Define a pasta "public" como raiz para arquivos estáticos.

// Variáveis globais do jogo
let board = Array(9).fill(null); // Representa o tabuleiro do jogo.
let currentPlayer = "X"; // Começa com o jogador X.
let players = {}; // Mapeia os sockets para os símbolos (X ou O).

// Quando um cliente se conecta
io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  // Atribui um símbolo (X ou O) ao jogador
  const playerSymbol = Object.values(players).includes("X") ? "O" : "X";
  players[socket.id] = playerSymbol;
  socket.emit("assignSymbol", playerSymbol);
  console.log(`Jogador ${playerSymbol} conectado!`);

  // Atualiza o jogador atual no cliente
  io.emit("updateCurrentPlayer", currentPlayer);

  // Quando o jogador faz uma jogada
  socket.on("makeMove", ({ index, symbol }) => {
    if (board[index] === null && symbol === currentPlayer) {
      board[index] = symbol; // Atualiza o tabuleiro com o símbolo do jogador.

      // Verifica se há vencedor
      const winner = checkWinner();
      if (winner) {
        io.emit("gameOver", winner); // Notifica os clientes do vencedor.
        resetBoard();
      } else if (!board.includes(null)) {
        io.emit("gameOver", "Empate"); // Notifica os clientes do empate.
        resetBoard();
      } else {
        // Alterna o jogador atual
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        io.emit("updateCurrentPlayer", currentPlayer);
      }

      io.emit("updateBoard", board); // Atualiza o tabuleiro nos clientes.
    }
  });

  // Quando o jogo é reiniciado
  socket.on("restartGame", () => {
    resetBoard();
    io.emit("updateBoard", board); // Envia o tabuleiro vazio.
    io.emit("updateCurrentPlayer", currentPlayer); // Atualiza o jogador atual.
  });

  // Quando o jogador se desconecta
  socket.on("disconnect", () => {
    console.log(`Jogador ${players[socket.id]} desconectado: ${socket.id}`);
    delete players[socket.id];
    resetBoard();
    io.emit("updateBoard", board); // Envia o tabuleiro vazio.
  });
});

// Verifica se há um vencedor
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
      return board[a]; // Retorna o símbolo do vencedor (X ou O).
    }
  }

  return null; // Nenhum vencedor.
}

// Reinicia o tabuleiro e o jogador atual
function resetBoard() {
  board = Array(9).fill(null);
  currentPlayer = "X"; // Reinicia para o jogador X.
}

const PORT = 3000; // Define a porta do servidor.
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
