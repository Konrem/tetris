const PLAYFIELD_COLUMNS = 12;
const PLAYFIELD_ROWS = 20;

const TETROMINO_NAMES = ["O", "L", "J", "S", "Z", "T", "I"];

const TETROMINOES = {
	O: [
		[1, 1],
		[1, 1],
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
	],
	J: [
		[0, 0, 0],
		[1, 1, 1],
		[0, 0, 1],
	],
	S: [
		[0, 0, 0],
		[0, 1, 1],
		[1, 1, 0],
	],
	Z: [
		[0, 0, 0],
		[1, 1, 0],
		[0, 1, 1],
	],
	T: [
		[0, 0, 0],
		[1, 1, 1],
		[0, 1, 0],
	],
	I: [
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	],
};

const colorFigure = [
	"rgba(246, 223, 36 , 1)",
	"rgba(246, 172, 255 , 1)",
	"rgba(61, 238, 241, 0.75)",
	"rgba(94, 229, 0 , 1)",
	"rgba(229, 159, 61 , 1)",
	"rgba(77, 175, 255 , 1)",
	"rgba(255, 94, 174 , 0.75)",
	"rgba(166, 134, 241 , 1)",
	"rgba(248, 56, 89 , 1)",
	"rgba(107, 72, 228 , 1)",
	"rgba(35, 37, 223 , 1)",
];

let playfield, tetromino;
let score = 0;
let cells;
let isPaused = false;
let isGameOver = false;
const gameOverBlock = document.querySelector(".game-over");
const btnRestart = document.querySelector(".restart");

init();

function init() {
	gameOverBlock.style.display = "none";
	isGameOver = false;
	generatePlayField();
	generateTetromino();
	autoMoveTetromino();
	cells = document.querySelectorAll(".tetris div");
	draw();
	swipe();
	score = 0;
	scoreShow(0);
}

document.addEventListener("keydown", onKeyDown);

function convertPositionToIndex(row, column) {
	return row * PLAYFIELD_COLUMNS + column;
}

function getRandom(elemRandom) {
	return Math.floor(Math.random() * elemRandom);
}

function generatePlayField() {
	document.querySelector(".tetris").innerHTML = "";
	for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
		let div = document.createElement("div");
		document.querySelector(".tetris").append(div);
	}
	playfield = new Array(PLAYFIELD_ROWS)
		.fill()
		.map(() => new Array(PLAYFIELD_COLUMNS).fill());
}

function generateTetromino() {
	const name = TETROMINO_NAMES[getRandom(TETROMINO_NAMES.length)];
	const matrix = TETROMINOES[name];

	const column = Math.floor(
		(PLAYFIELD_COLUMNS - TETROMINOES[name].length) / 2
	);
	const row = -2;

	// const color = colorFigure[getRandom(colorFigure.length)];

	tetromino = {
		name: name,
		matrix: matrix,
		row: row,
		column: column,
		// color: color,
	};
}

function drawPlayField() {
	for (let row = 0; row < PLAYFIELD_ROWS; row++) {
		for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
			const name = playfield[row][column];
			const cellIndex = convertPositionToIndex(row, column);
			if (name) {
				cells[cellIndex].classList.add(name);
			} else {
				cells[cellIndex].style.removeProperty("background");
			}
		}
	}
}

function drawTetromino() {
	const name = tetromino.name;
	const tetrominoMatrixSize = tetromino.matrix.length;

	for (let row = 0; row < tetrominoMatrixSize; row++) {
		for (let column = 0; column < tetrominoMatrixSize; column++) {
			if (!tetromino.matrix[row][column]) continue;
			const cellIndex = convertPositionToIndex(
				tetromino.row + row,
				tetromino.column + column
			);

			if (cellIndex >= 0 && tetromino.row >= -1) {
				cells[cellIndex].classList.add(name);
				// cells[cellIndex].style.background = tetromino.color;
			}
		}
	}
}

function draw() {
	cells.forEach(function (cell) {
		cell.removeAttribute("class");
	});
	drawPlayField();
	drawTetromino();
}

// Pause game

function togglePauseGame() {
	isPaused = !isPaused;

	if (isPaused) {
		stopMoveTetromino();
	} else {
		autoMoveTetromino();
	}
}

// Keys control

function onKeyDown(event) {
	switchBtnMove(event.key);
}

function htmlButton(event) {
	switchBtnMove(event.dataset.key);
}

function switchBtnMove(arrow) {
	if (arrow == "p") togglePauseGame();
	if (isPaused) return;
	switch (arrow) {
		case " ":
			dropTetrominoDown();
			break;
		case "ArrowRight":
			moveTetromino("right");
			break;
		case "ArrowDown":
			moveTetromino("down");
			break;
		case "ArrowLeft":
			moveTetromino("left");
			break;
		case "ArrowUp":
			rotateTetromino();
			break;
	}
	draw();
}

// Swipe control

function swipe() {
	document.addEventListener("swiped-right", function (e) {
		moveTetromino("right");
	});
	document.addEventListener("swiped-down", function (e) {
		moveTetromino("down");
	});
	document.addEventListener("swiped-left", function (e) {
		moveTetromino("left");
	});
	document.addEventListener("swiped-up", function (e) {
		rotateTetromino();
	});
	draw();
}

function dropTetrominoDown() {
	while (!isValid()) {
		tetromino.row++;
	}
	tetromino.row--;
}

function moveTetromino(direction) {
	const originalRow = tetromino.row;
	const originalColumn = tetromino.column;

	switch (direction) {
		case "down":
			tetromino.row += 1;
			break;
		case "left":
			tetromino.column -= 1;
			break;
		case "right":
			tetromino.column += 1;
			break;
	}

	if (isValid()) {
		tetromino.row = originalRow;
		tetromino.column = originalColumn;

		if (direction == "down") {
			placeTetromino();
		}
	}
}

function hasCollisions(row, column) {
	return playfield[tetromino.row + row]?.[tetromino.column + column];
	// if (tetromino.row + row >= 0)
	// 	return playfield[tetromino.row + row][tetromino.column + column];
}

function isOutsideOfGameBoard(row, column) {
	return (
		tetromino.column + column < 0 ||
		tetromino.column + column >= PLAYFIELD_COLUMNS ||
		tetromino.row + row >= playfield.length
	);
}

function isValid() {
	const matrixSize = tetromino.matrix.length;
	for (let row = 0; row < matrixSize; row++) {
		for (let column = 0; column < matrixSize; column++) {
			if (!tetromino.matrix[row][column]) continue;
			if (isOutsideOfGameBoard(row, column)) return true;
			if (hasCollisions(row, column)) return true;
		}
	}
	return false;
}

function placeTetromino() {
	const matrixSize = tetromino.matrix.length;
	for (let row = 0; row < matrixSize; row++) {
		for (let column = 0; column < matrixSize; column++) {
			if (!tetromino.matrix[row][column]) continue;
			console.log(tetromino.row + row);
			if (tetromino.row + row < 0) {
				isGameOver = true;
				return;
			}
			playfield[tetromino.row + row][tetromino.column + column] =
				tetromino.name;
		}
	}
	const filledRows = findFilledRows();
	removeFillRows(filledRows);
	generateTetromino();
}

// ROTATE TETROMINO

function rotateTetromino() {
	const oldMatrix = tetromino.matrix;
	tetromino.matrix = rotateMatrix(tetromino.matrix);
	if (isValid()) tetromino.matrix = oldMatrix;
	draw();
}

function rotateMatrix(matrixTetromino) {
	const N = matrixTetromino.length;
	const rotateMatrix = [];
	for (let i = 0; i < N; i++) {
		rotateMatrix[i] = [];
		for (let j = 0; j < N; j++) {
			rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
		}
	}
	return rotateMatrix;
}

// DELETE ROWS

function findFilledRows() {
	const filledRows = [];
	for (let row = 0; row < PLAYFIELD_ROWS; row++) {
		let filledColumns = 0;
		for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
			if (playfield[row][column]) filledColumns++;
		}
		if (PLAYFIELD_COLUMNS == filledColumns) filledRows.push(row);
	}
	return filledRows;
}

function removeFillRows(filledRows) {
	let scoreAllRows = 0;
	for (let i = 0; i < filledRows.length; i++) {
		scoreAllRows += scoreRow(filledRows[i]);
		dropRowsAbove(filledRows[i]);
	}
	finalScore(scoreAllRows, filledRows.length);
}

function dropRowsAbove(rowDeleted) {
	for (let row = rowDeleted; row > 0; row--) {
		playfield[row] = playfield[row - 1];
	}
	playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

// SCORE

function scoreRow(row, rowsDeleted) {
	let scoreRow = 0;
	for (let i = 0; i < PLAYFIELD_COLUMNS; i++) {
		switch (playfield[row][i]) {
			case "O":
				scoreRow += 2;
				break;
			case "L":
				scoreRow += 3;
				break;
			case "J":
				scoreRow += 3;
				break;
			case "S":
				scoreRow += 4;
				break;
			case "Z":
				scoreRow += 4;
				break;
			case "T":
				scoreRow += 3;
				break;
			case "I":
				scoreRow += 2;
				break;
		}
	}

	return scoreRow / 2;
}

function finalScore(scoreRows, rowsDeleted) {
	scoreRows = scoreRows * Math.exp(rowsDeleted / 4);
	score += Math.round(scoreRows);
	scoreShow(rowsDeleted);
}

function scoreShow(rows) {
	let message = "";
	switch (rows) {
		case 0:
			message = "Згадай цю класичну гру!";
			break;
		case 1:
			message = "На одну лінію меншу.";
			break;
		case 2:
			message = "Аж цілих 2 ряда відразу!";
			break;
		case 3:
			message = "Ого! Аж 3 ряди підряд!";
			break;
		case 4:
			message = "Це законно? 4 ряда відразу!";
			break;
	}

	document.getElementById("score").innerHTML = "Score: " + score;
	document.getElementById("message").innerHTML = message;

	// О, ти почав уже? - 100
	// Батя, я стараюся - 350
	// Поки ти граєш, ще стало на 5 більше "хороших руськіх" - 1000
	// Поки ти грав,
	// end - Миша, все не то. Давай по новому.
	// end < 100 - Арестович, ти?
}

// AUTOMOVE

function moveDown() {
	moveTetromino("down");
	draw();
	stopMoveTetromino();
	autoMoveTetromino();
	if (isGameOver) gameOver();
}
function autoMoveTetromino() {
	timerId = setInterval(() => {
		moveDown();
	}, 800);
}

function stopMoveTetromino() {
	timerId = clearInterval(timerId);
}

// Game Overq

function gameOver() {
	stopMoveTetromino();
	gameOverBlock.style.display = "flex";
}

btnRestart.addEventListener("click", function () {
	init();
});
