// import print from './print.js';
import { Chess } from './classes.js';
import { getPiece, isWhite } from './util.js';
// import isDiscoveredCheck from './isDiscoveredCheck.js';
const boardGrid = document.querySelector('.board');

const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
let chessMain = new Chess(FEN);

function formPiece(piece, i, j) {
	let pieceElement = document.createElement('img');
	pieceElement.classList.add('piece');
	pieceElement.src = '../assets/' + getPiece(piece) + '.svg';
	pieceElement.alt = 'Failed To Load!';
	pieceElement.dataset.i = i;
	pieceElement.dataset.j = j;
	pieceElement.id = piece;
	pieceElement.draggable = false;
	pieceElement.style.transform = `translate(${j * 6.25}rem, ${i * 6.25}rem)`;

	return pieceElement;
}

for (let i = 0; i < 8; ++i) {
	for (let j = 0; j < 8; ++j) {
		if (chessMain.Board[i][j] === ' ') continue;
		boardGrid.appendChild(formPiece(chessMain.Board[i][j], i, j));
	}
}

let presentSelectedMoves = [];

function fflushSelected() {
	var selectedPrev = [
		...document.querySelectorAll('.square__highlight_regular'),
		...document.querySelectorAll('.square__highlight_piece'),
		document.querySelector('.square_selected'),
	];
	selectedPrev.forEach((square) => {
		square?.classList.remove('square__highlight_regular');
		square?.classList.remove('square__highlight_piece');
		square?.classList.remove('square_selected');
	});
}

function removeCheck() {
	var checkedKing = document.querySelector('.square__highlight_king');
	checkedKing?.classList.remove('square__highlight_king');
}

function displayMove() {
	var movesToDisplay = presentSelectedMoves.map((coordinate) => {
		return document.querySelector(
			`[data-i="${coordinate[0]}"][data-j="${coordinate[1]}"]`
		);
	});
	movesToDisplay.forEach((square) => {
		const moveHigh = square.lastElementChild;
		// console.log(moveHigh);
		const atIJ = chessMain.Board[square.dataset.i][square.dataset.j];
		if (atIJ === ' ') {
			moveHigh.classList.add('square__highlight_regular');
		} else if (atIJ.toLowerCase() !== 'k') {
			moveHigh.classList.add('square__highlight_piece');
		}
	});
}

var pieces = document.querySelectorAll('.piece');
var squares = document.querySelectorAll('.square');
let selectedPiece;

function move(i, j) {
	// move
	selectedPiece.style.transform = `translate(${j * 6.25}rem, ${i * 6.25}rem)`;

	removeCheck();

	const [fI, fJ] = [
		parseInt(selectedPiece.dataset.i),
		parseInt(selectedPiece.dataset.j),
	];
	chessMain.setBoard([fI, fJ], [i, j]);
	chessMain.FENUpdate(fI, i);
	selectedPiece.dataset.i = i;
	selectedPiece.dataset.j = j;

	chessMain.toggleMove();

	presentSelectedMoves = [];

	const Index = chessMain.whiteToMove ? 0 : 1;
	const KingCoor = [chessMain.Kings[Index].i, chessMain.Kings[Index].j];

	if (chessMain.Kings[Index].isChecked) {
		document
			.querySelector(`[data-i="${KingCoor[0]}"][data-j="${KingCoor[1]}"]`)
			.lastElementChild.classList.add('square__highlight_king');
	}
}

function capture(i, j) {
	const piece = document.querySelector(`.piece[data-i="${i}"][data-j="${j}"]`);
	setTimeout(() => {
		piece.parentNode.removeChild(piece);
	}, 300);
	
}

pieces.forEach((piece) => {
	piece.addEventListener('click', () => {
		let i = parseInt(piece.dataset.i);
		let j = parseInt(piece.dataset.j);
		fflushSelected();
		// print(chessMain.whiteToMove);
		if (chessMain.whiteToMove !== isWhite(piece.id)) {
			if (presentSelectedMoves.some((coor) => coor[0] === i && coor[1] === j)) {
				capture(i, j);
				move(i, j);
			}
		} else {
			selectedPiece = piece;
			document
				.querySelector(`[data-i="${i}"][data-j="${j}"]`)
				.classList.add('square_selected');
			presentSelectedMoves = chessMain.legalMoves[`${i}${j}`];
			displayMove();
		}
	});
});

squares.forEach((square) => {
	square.addEventListener('click', () => {
		// check if square is in the legible move then, move
		// else return
		fflushSelected();
		let i = parseInt(square.dataset.i);
		let j = parseInt(square.dataset.j);
		if (presentSelectedMoves.some((coor) => coor[0] === i && coor[1] === j)) {
			move(i, j);
		}
	});
});
