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
    // Initialisation
    let cellStates = [];
    for (let row = 0; row < 20; row++) {
        cellStates[row] = [];
        for (let col = 0; col < 8; col++) {
            if (Math.random() > 0.1 * col) {
                cellStates[row][col] = 1;
            } else {
                cellStates[row][col] = 0;
            }
        }
    }

    // Initial display
    createGrid(20, 8, cellStates);
}

// Run game
playGame();
