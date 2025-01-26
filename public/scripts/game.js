// Conexão com o servidor via Socket.io
const socket = io();
let playerSymbol = null; // Símbolo do jogador
const boardElement = document.getElementById("board");
const cells = [];

// Inicializa o tabuleiro
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.addEventListener("click", () => makeMove(i));
  boardElement.appendChild(cell);
  cells.push(cell);
}

// Recebe o símbolo do jogador do servidor
socket.on("assignSymbol", (symbol) => {
  playerSymbol = symbol;
  document.getElementById("playerSymbol").innerText = symbol;
  console.log(`Você é o jogador: ${symbol}`);
});

// Atualiza o tabuleiro
socket.on("updateBoard", (board) => {
  board.forEach((value, index) => {
    cells[index].innerText = value || "";
  });
});

// Atualiza o status do jogador atual
socket.on("updateCurrentPlayer", (currentPlayer) => {
  const statusText = `Jogador ${currentPlayer} jogando`;
  document.getElementById("currentPlayer").innerText = statusText;
});

// Exibe o vencedor ou empate
socket.on("gameOver", (result) => {
  if (result === "Empate") {
    alert("O jogo empatou!");
  } else {
    document.getElementById("winner").innerText = result;
    alert(`Jogador ${result} venceu!`);
  }
});

// Reiniciar o jogo
const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", () => {
  socket.emit("restartGame");
  document.getElementById("winner").innerText = "-"; // Limpa o vencedor
});

// Realiza uma jogada
function makeMove(index) {
  if (cells[index].innerText === "" && playerSymbol) {
    socket.emit("makeMove", { index, symbol: playerSymbol });
  }
}
