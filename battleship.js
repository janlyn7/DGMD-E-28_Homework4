
const placement = {
	"ships":
	[
		{
		"name": "ship1",
		"orientation": "vertical",
		"size": 4,
		"coords":[5,2]
		},
		{
		"name": "ship2",
		"orientation": "horizontal",
		"size": 3,
		"coords":[0,0]
		},
		{
		"name": "ship3",
		"orientation": "vertical",
		"size": 3,
		"coords":[1,3]
		},
		{
		"name": "ship4",
		"orientation": "horizontal",
		"size": 2,
		"coords":[3,1]
		}
	]
}

function loadBoard() {
	let game = new Game();
	game.initAnnounce();
	game.buildBoard();
	game.placeShips();
}

function Game() {
	this.boardDim = 6; 	// dimension for square board
	this.numGuesses = 20;
	this.squares = [];  // stores if square is a ship; if it is a ship, stores if it has been hit
	this.shipCoords = [];  // array of square indicies where the ships are located
	this.initAnnounce = initAnnounce;
	this.createButton = createButton;
	this.buildBoard = buildBoard;
	this.placeShips = placeShips;
	this.checkSunk = checkSunk;
	this.checkAllSunk = checkAllSunk;
	this.isClicked = isClicked;
	this.showShips = showShips;
	this.disableAllButtons = disableAllButtons;
	this.addRestartButton = addRestartButton;
}

function initAnnounce() {
	let banner = document.getElementById("banner");
	banner.innerHTML = "Click on the squares to play" + "</br>You have " + this.numGuesses + " guesses to sink 4 battleships";
}

function buildBoard() {
	let board = document.getElementById("board");
	let grid = document.createElement('div');
	grid.id = "grid";
	grid.setAttribute("class", "w3-display-container w3-center w3-animate-zoom w3-gray");

	// create 6x6 playing field
	for (let ii = 0; ii < Math.pow(this.boardDim,2); ii++) {
		this.createButton(ii, grid);
		this.squares.push( new Square() );
	}
	board.appendChild(grid);
}

function createButton(numId, grid) {

	let button = document.createElement( "button");
	button.id = "button" + numId;
	button.className = "square";
	button.type = "button";
	button.innerHTML = "&nbsp;";

	button.addEventListener('click', () => {
		this.isClicked(button.id);
	});

	grid.appendChild(button);
}

function isClicked(id) {
	let pos = parseInt(id.substring(6));
	let btn = document.getElementById(id);

	let action;
	let allSunk = false;
	//change sunken ship Squares to black
	if (this.squares[pos].isShip === true) {
		this.squares[pos].isHit = true;

		// check to see if the entire ship has been hit
		let posArr = this.checkSunk(pos);

		if (posArr != null) {
			for (let ii = 0; ii < posArr.length; ii++) {
				document.getElementById("button" + posArr[ii]).style.backgroundColor = 'black';
			}
			allSunk = this.checkAllSunk();
			if (allSunk === true) {
				action = "Congratulations!  You sunk all the battleships!</br>GAME OVER";
				this.numGuesses = 1;

			} else {
				action = "<b>!! SUNK !!</b>";
			}

		} else {
			btn.style.backgroundColor = "#B22222";
			action = "<b> >> HIT << </b>";
		}
	} else {
			btn.style.backgroundColor = 'silver';
			action = "- MISS -";
	}

	btn.disabled = true;

	// update number of guesses
	this.numGuesses--;
	let banner = document.getElementById("banner");
	if (this.numGuesses === 0) {
		if (allSunk === false) {
			banner.innerHTML = "GAME OVER </br> Here are all the ships";
			this.showShips();
		} else {
			banner.innerHTML = action;
		}

		// turn off buttons to prevent user from clicking more squares
		this.disableAllButtons();

		// append a 'Play Again' button below the game board
		this.addRestartButton();

	} else {
		banner.innerHTML = action + "<br/>You have " + this.numGuesses + " guesses left";
	}
}

function checkAllSunk() {
	let result = true;
	this.squares.forEach( sq => {
		if  (sq.isShip === true) {
			result = (result && sq.isHit);
		}
	});

	return result;
}
function checkSunk(pos){
	let result = null;

	this.shipCoords.map( posArr => {
		if (posArr.includes(pos)) {
			let allHit = true;
			posArr.forEach(sqIndex => {
				allHit = this.squares[sqIndex].isHit && allHit;
			})

			if (allHit === true) {
				result = posArr;
			}
		}
	});

	return result;
}
function placeShips() {
	// using the JSON object, find the coordinates, length, and orientation of each ship and
	// if the Square coordinates match, update the Square.isShip to true

	let index, startPos;
	placement.ships.forEach( ship =>
		{
			startPos = (ship.coords[0]) + (ship.coords[1]  * this.boardDim);
			let pos;  // zero based indexing
			let posArr = [];

			for (index = 0; index < ship.size; index++) {
				if (ship.orientation === "vertical") {
					pos = (startPos + (this.boardDim * index));
				} else {
					pos = (startPos + index);
				}
				this.squares[pos].isShip = true;
				posArr.push(pos);
			}
			this.shipCoords.push(posArr);
		}
	)
}

function disableAllButtons() {
	for (let ii = 0; ii < Math.pow(this.boardDim,2); ii++) {
        let btn = document.getElementById("button" + ii);
        btn.disabled = true;
        btn.style.pointerEvents = "none";
    }

}
function addRestartButton() {
    let restart = document.getElementById("restart");
    let btn = document.createElement( "button");
    btn.type = "button";
    btn.id = "playAgain";
    btn.style.fontSize = "20px";
    btn.innerText = "Play Again";
    btn.setAttribute("class", "w3-button w3-black")
    btn.addEventListener ('click', reloadBoard);
    restart.appendChild(btn);
}

function reloadBoard() {
    // remove the old board
    let div = document.getElementById("grid");
    div.parentNode.removeChild(div);

    // remove the 'Play Again' button
    div = document.getElementById("playAgain");
    div.parentNode.removeChild(div);

    // load a fresh game board
    loadBoard();
}
function showShips() {
	let index = 0;
	this.squares.forEach( sq => {
		if  (sq.isShip === true) {
			document.getElementById("button" + index).style.backgroundColor = "#B22222";
		} else {
			document.getElementById("button" + index).style.backgroundColor = "lightgray";
		}
		index++;
	});
}


function Square() {
	this.isShip = false;
	this.isHit = false;
}