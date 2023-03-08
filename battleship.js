// JSON object
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

// Game class - builds the game board, places the ships according to the coordinates in the JSON object,
// and keeps track of number of guesses
function Game() {
	this.boardDim = 6; 	// dimension for square board
	this.numGuesses = 20;  //  number of guesses left
	this.squares = [];  // stores an array of Square objects
	this.shipCoords = [];  // array of square indicies where the ships are located
	this.red = "#B22222";
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

// lets the user know how to start playing the game and the number of guesses they initially have
function initAnnounce() {
	let banner = document.getElementById("banner");
	banner.innerHTML = "Click on the squares to play" + "</br>You have " + this.numGuesses + " guesses to sink 4 battleships";
}

// creates the HTML game board with buttons and underlying Square objects
// Squares are the internal representation of the buttons and are used to keep track of if the button/square
// is a ship and if a ship has been hit
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

// create a button and attach it to the grid
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

// if a button has been clicked check to see if it is a ship
// if the square is not a ship, it is a "miss"; change button to silver
// if the square is a ship, it is a "hit"; change button to red
// if all the ship squares have been hit, it is "sunk"; change all ship buttons to black
function isClicked(id) {
	let pos = parseInt(id.substring(6));
	let btn = document.getElementById(id);

	let resultStr;
	let allSunk = false;
	
	//change sunken ship Squares to black
	if (this.squares[pos].isShip === true) {
		this.squares[pos].isHit = true;

		// check to see if the entire ship has been hit
		let posArr = this.checkSunk(pos);

		if (posArr != null) {
			// if the entire ship has been hit, change ship buttons to black
			for (let ii = 0; ii < posArr.length; ii++) {
				document.getElementById("button" + posArr[ii]).style.backgroundColor = 'black';
			}

			// if all the ships squares have been hit, the game is over
			allSunk = this.checkAllSunk();
			if (allSunk === true) {
				resultStr = "Congratulations!  You sunk all the battleships!</br>GAME OVER";
				this.numGuesses = 1;

			} else {
				resultStr = "<b>!! SUNK !!</b>";
			}

		} else {
			btn.style.backgroundColor = this.red;
			resultStr = "<b> >> HIT << </b>";
		}
	} else {
			btn.style.backgroundColor = 'silver';
			resultStr = "- MISS -";
	}

	// disable button once it has been clicked
	btn.disabled = true;

	// update number of guesses
	this.numGuesses--;
	let banner = document.getElementById("banner");

	// if the user has used all their guesses, the game is over
	// reveal where the ships are located on the game board
	if (this.numGuesses === 0) {
		if (allSunk === false) {
			banner.innerHTML = "GAME OVER </br> Here are all the ships";
			this.showShips();
		} else {
			banner.innerHTML = resultStr;
		}

		// turn off buttons to prevent user from clicking more squares
		this.disableAllButtons();

		// append a 'Play Again' button below the game board
		this.addRestartButton();

	} else {
		// announce the number of guesses left to the user
		banner.innerHTML = resultStr + "<br/>You have " + this.numGuesses + " guesses left";
	}
}

// loop through the squares;  if all ship squares have been hit, return true
function checkAllSunk() {
	let result = true;
	this.squares.forEach( sq => {
		if  (sq.isShip === true) {
			result = (result && sq.isHit);
		}
	});

	return result;
}

// find which ship was hit and check all the ship squares to see if it has been sunk
// return the coordinates for the sunk ship
function checkSunk(pos){
	let result = null;

	this.shipCoords.forEach( posArr => {
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


// using the JSON object, find the coordinates, length, and orientation of each ship and
// if the Square coordinates match, update the Square.isShip to true
// save the ship indices in an array
function placeShips() {

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

// turn off hover and disable all buttons on the game board after the game has ended
function disableAllButtons() {
	for (let ii = 0; ii < Math.pow(this.boardDim,2); ii++) {
        let btn = document.getElementById("button" + ii);
        btn.disabled = true;
        btn.style.pointerEvents = "none";
    }

}

// after the game has ended, add a button below the
// game board allowing the user to reset the board and play another game
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

// reload board and start a new game
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

// at the end of the game, update the game board to show where the ships are located
function showShips() {
	let index = 0;
	this.squares.forEach( sq => {
		if  (sq.isShip === true) {
			document.getElementById("button" + index).style.backgroundColor = this.red;
		} else {
			document.getElementById("button" + index).style.backgroundColor = "lightgray";
		}
		index++;
	});
}


// Square class - stores info on whether the square/button is a ship and if the ship has been hit
function Square() {
	this.isShip = false;
	this.isHit = false;
}