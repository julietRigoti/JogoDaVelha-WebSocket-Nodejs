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

// Exibe vencedor ou empate
socket.on("gameOver", (result) => {
  if (result === "Empate") {
    alert("O jogo empatou!");
  } else {
    alert(`Jogador ${result} venceu!`);
  }
});

socket.on("updateCurrentPlayer", (currentPlayer) => {
  document.getElementById("currentPlayer").innerText = `Jogador atual: ${currentPlayer}`;
});

// Atualiza o placar
socket.on("updateScores", (scores) => {
  document.getElementById("scoreX").innerText = `Vitórias X: ${scores.X}`;
  document.getElementById("scoreO").innerText = `Vitórias O: ${scores.O}`;
});

// Reiniciar jogo
document.getElementById("restartButton").addEventListener("click", () => {
  socket.emit("restartGame");
});

// Realiza uma jogada
function makeMove(index) {
  if (cells[index].innerText === "" && playerSymbol) {
    socket.emit("makeMove", { index, symbol: playerSymbol });
  }
}
