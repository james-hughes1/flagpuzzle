const blockGrid = document.getElementById('blockGrid');
const pauseMenu = document.getElementById('pauseMenu');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

let blockMove = 'none';
let pause = 0;

// Function to create a grid
function createGrid(numRows, numCols, cellStates) {
    blockGrid.innerHTML = ''; // Clear existing grid

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = row;
            square.dataset.col = col;
            if (cellStates[row][col] === 1) {
                // Stationary square
                square.classList.add('red');
            } else if (cellStates[row][col] === 2) {
                // Falling square
                square.classList.add('blue')
            } else if (row < 4) {
                square.classList.add('grey');
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
    cellStates[fallingPosition.row][fallingPosition.col] = 2;

    // Initial display
    createGrid(numRows, numCols, cellStates);

    // Game loop
    intervalId = setInterval(() => {
        // Check unpaused
        if (pause == 0) {
            // Square movement
            if (falling === 0) {
                // Square falling
                fallingPosition = {row: 0, col: Math.floor(numCols * Math.random())};
                cellStates[fallingPosition.row][fallingPosition.col] = 2;
                falling = 1;
            } else {
                if (blockMove != 'none') {
                    if ((blockMove === 'left') && (cellStates[fallingPosition.row][(fallingPosition.col + numCols - 1) % numCols] === 0)) {
                        cellStates[fallingPosition.row][fallingPosition.col] = 0;
                        fallingPosition.col = (fallingPosition.col + numCols - 1) % numCols;
                        cellStates[fallingPosition.row][fallingPosition.col] = 2;
                        blockMove = 'none';
                    } else if ((blockMove === 'right') && (cellStates[fallingPosition.row][(fallingPosition.col + numCols + 1) % numCols] === 0)) {
                        cellStates[fallingPosition.row][fallingPosition.col] = 0;
                        fallingPosition.col = (fallingPosition.col + numCols + 1) % numCols;
                        cellStates[fallingPosition.row][fallingPosition.col] = 2;
                        blockMove = 'none';
                    }
                }
                if ((fallingPosition.row + 1 === numRows) || (cellStates[fallingPosition.row + 1][fallingPosition.col] === 1)) {
                    // Transition from falling to stationary
                    falling = 0;
                    cellStates[fallingPosition.row][fallingPosition.col] = 1;
                } else {
                    cellStates[fallingPosition.row][fallingPosition.col] = 0;
                    fallingPosition.row++;
                    cellStates[fallingPosition.row][fallingPosition.col] = 2;
                }
            }
        }

        // Game over
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < numCols; col++) {
                if (cellStates[row][col] === 1) {
                    clearInterval(intervalId);
                }
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

// Pause & Resume Menu
pauseBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'block'; // Show the pause menu
    pause = 1;
});

resumeBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'none'; // Hide the pause menu
    pause = 0;
});

// Run game
playGame();
