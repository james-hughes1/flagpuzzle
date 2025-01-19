let blockMove = 'none'

// Function to create a grid
function createGrid(numRows, numCols, cellStates) {
    const blockGrid = document.getElementById('blockGrid');
    blockGrid.innerHTML = ''; // Clear existing grid

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = row;
            square.dataset.col = col;

            if (cellStates[row][col] === 1) {
                // Blue square
                square.classList.add('red');
            }
            blockGrid.appendChild(square);
        }
    }
}

function playGame() {
    const numRows = 10;
    const numCols = 8;

    // Initialisation
    let cellStates = [];
    for (let row = 0; row < numRows; row++) {
        cellStates[row] = [];
        for (let col = 0; col < numCols; col++) {
            cellStates[row][col] = 0;
        }
    }
    let falling = 1;
    let fallingPosition = {row: 0, col: Math.floor(numCols * Math.random())};
    cellStates[fallingPosition.row][fallingPosition.col] = 1;

    // Initial display
    createGrid(numRows, numCols, cellStates);

    // Game loop
    intervalId = setInterval(() => {
        if (falling === 0) {
            fallingPosition = {row: 0, col: Math.floor(numCols * Math.random())};
            cellStates[fallingPosition.row][fallingPosition.col] = 1;
            falling = 1;
        } else {
            if (blockMove != 'none') {
                if ((blockMove === 'left') && (cellStates[fallingPosition.row][(fallingPosition.col + numCols - 1) % numCols] === 0)) {
                    cellStates[fallingPosition.row][fallingPosition.col] = 0;
                    fallingPosition.col = (fallingPosition.col + numCols - 1) % numCols;
                    cellStates[fallingPosition.row][fallingPosition.col] = 1;
                    blockMove = 'none';
                } else if ((blockMove === 'right') && (cellStates[fallingPosition.row][(fallingPosition.col + numCols + 1) % numCols] === 0)) {
                    cellStates[fallingPosition.row][fallingPosition.col] = 0;
                    fallingPosition.col = (fallingPosition.col + numCols + 1) % numCols;
                    cellStates[fallingPosition.row][fallingPosition.col] = 1;
                    blockMove = 'none';
                }
            }
            if ((fallingPosition.row + 1 === numRows) || (cellStates[fallingPosition.row + 1][fallingPosition.col] === 1)) {
                falling = 0;
            } else {
                cellStates[fallingPosition.row][fallingPosition.col] = 0;
                fallingPosition.row++;
                cellStates[fallingPosition.row][fallingPosition.col] = 1;
            }
        }

        createGrid(numRows, numCols, cellStates);
    }, 200);
}

// Add listeners for arrow key controls
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            blockMove = 'left';
            break;
        case 'ArrowRight':
            blockMove = 'right';
            break;
    }
});

// Run game
playGame();
