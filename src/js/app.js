import { Block, WaterGroup, FireGroup } from './blocks.js';
import { QuizRecord } from './quiz.js';

const blockGrid = document.getElementById('blockGrid');
const pauseMenu = document.getElementById('pauseMenu');
const endMenu = document.getElementById('endMenu');
const hintMenu = document.getElementById('hintMenu');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const enterBtn = document.getElementById('enterBtn');
const scoreElements = document.querySelectorAll('.score');
const answerInput = document.getElementById('answerInput');
const flagImg = document.getElementById('flagImg');
const hintImg = document.getElementById('hintImg');
const hintCountry = document.getElementById('hintCountry');
const tick = document.getElementById('tick');
const powerImgArray = document.querySelectorAll('.powerImg');
const powerSlotArray = document.querySelectorAll('.powerSlot');
const ROWBUFFER = 10;

// Read in number of rows and columns from html code and set CSS style
const numRows = parseInt(blockGrid.dataset.rows, 10) + ROWBUFFER;
blockGrid.style.setProperty('--rows', numRows - ROWBUFFER);
const numCols = parseInt(blockGrid.dataset.columns, 10);
blockGrid.style.setProperty('--columns', numCols);

let blockMoveUnlocked = false;
let blockMove = 'none';
let pause = false;

const NUMCOUNTRIES = 246;

// Async function to country code mapping
export async function loadCountries() {
  const response = await fetch('assets/iso-alpha-2.json');
  const data = await response.json();
  return data;
}

// Update powers
export function updatePowers(powerStates) {
  for (let powerId = 0; powerId < 3; powerId++) {
    if (powerId < powerStates.length) {
      if (powerStates[powerId] === 'water') {
        powerImgArray[powerId].style.display = 'block';
        powerImgArray[powerId].src = 'assets/rain.png';
      } else if (powerStates[powerId] === 'fire') {
        powerImgArray[powerId].style.display = 'block';
        powerImgArray[powerId].src = 'assets/fire2.png';
      } else {
        powerImgArray[powerId].style.display = 'none';
      }
    } else {
      powerImgArray[powerId].style.display = 'none';
    }
  }
}

// Function to get country
export async function updateCountry(countryIndex) {
  const countriesData = await loadCountries();
  const countries = Object.entries(countriesData);
  countryCode = countries[countryIndex][1]['alpha-2'].toLowerCase();
  answer = countries[countryIndex][1]['name'];
  flagImg.src = '/assets/flags/' + countryCode + '.svg';
  hintImg.src = '/assets/flags/' + countryCode + '.svg';
  hintCountry.textContent = answer;
}

let countryRecord = new QuizRecord(NUMCOUNTRIES);

function updateScoreCounter(score) {
  // Update the text content of each element
  scoreElements.forEach((span) => {
    span.textContent = score;
  });
}

// Function to create a grid
function createGrid(numRows, numCols, cellStates) {
  blockGrid.innerHTML = ''; // Clear existing grid

  for (let row = ROWBUFFER; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.dataset.row = row;
      square.dataset.col = col;
      if (cellStates[row][col] === 1) {
        // Stationary square
        square.classList.add('ground');
      } else if (cellStates[row][col] === 2) {
        // Falling square
        square.classList.add('falling');
      } else if ([3, 4, 5].includes(cellStates[row][col])) {
        // Water block, water object, inactive water object
        square.classList.add('rain');
      } else if ([6, 7, 8].includes(cellStates[row][col])) {
        // Fire block, fire object, inactive fire object
        square.classList.add('fire');
      }
      blockGrid.appendChild(square);
    }
  }
}

function eliminateRows(cellStates) {
  // Check for full rows to eliminate
  for (let row = ROWBUFFER; row < numRows; row++) {
    let fullRow = true;
    for (let col = 0; col < numCols; col++) {
      fullRow = fullRow && cellStates[row][col] === 1;
    }
    if (fullRow) {
      // Shift cell values down
      for (let aboveRow = row; aboveRow >= 0; aboveRow--) {
        for (let col = 0; col < numCols; col++) {
          if (aboveRow > 0) {
            cellStates[aboveRow][col] = cellStates[aboveRow - 1][col];
          } else {
            cellStates[aboveRow][col] = 0;
          }
        }
      }
    }
  }
  return cellStates;
}

// Add listeners for arrow key controls
document.addEventListener('keydown', function (event) {
  switch (event.key) {
    case 'ArrowLeft':
      if (answerCorrect) {
        blockMove = 'left';
      }
      break;
    case 'ArrowRight':
      if (answerCorrect) {
        blockMove = 'right';
      }
      break;
    case 'ArrowDown':
      if (answerCorrect) {
        blockMove = 'down';
      }
      break;
    case 'Enter':
      if (!pause && !powerActive) {
        if (answerInput.value.toLowerCase() != answer.toLowerCase()) {
          blockMove = 'down';
        } else {
          tick.style.display = 'block';
          score++;
          if (powers.length < 3) {
            if (fallingBlock.blockType === 3) {
              powers.push('water');
              updatePowers(powers);
            }
            if (fallingBlock.blockType === 6) {
              powers.push('fire');
              updatePowers(powers);
            }
          }
          updateScoreCounter(score);
          answerCorrect = true;
        }
        blockMoveUnlocked = true;
        answerInput.value = '';
      }
  }
});

// Add listeners for swipe actions
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX; // Get the touch start position
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].clientX; // Get the touch end position
  touchEndY = e.changedTouches[0].clientY;
  handleSwipe();
});

function handleSwipe() {
  const xDiff = touchEndX - touchStartX;
  const yDiff = touchEndY - touchStartY;

  // If the swipe is horizontal
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      if (answerCorrect) {
        blockMove = 'right';
      }
    } else {
      if (answerCorrect) {
        blockMove = 'left';
      }
    }
  }
  // If the swipe is vertical
  else {
    if (yDiff > 0) {
      if (answerCorrect) {
        blockMove = 'down';
      }
    }
  }
}

// Enter button - same as clicking Enter
enterBtn.addEventListener('click', () => {
  if (!pause && !powerActive) {
    if (answerInput.value.toLowerCase() != answer.toLowerCase()) {
      blockMove = 'down';
    } else {
      tick.style.display = 'block';
      score++;
      if (powers.length < 3) {
        if (fallingBlock.blockType === 3) {
          powers.push('water');
          updatePowers(powers);
        }
        if (fallingBlock.blockType === 6) {
          powers.push('fire');
          updatePowers(powers);
        }
      }
      updateScoreCounter(score);
      answerCorrect = true;
    }
    blockMoveUnlocked = true;
    answerInput.value = '';
  }
});

// Pause & Resume Menu
pauseBtn.addEventListener('click', () => {
  pauseMenu.style.display = 'block'; // Show the pause menu
  pause = true;
});

resumeBtn.addEventListener('click', () => {
  pauseMenu.style.display = 'none'; // Hide the pause menu
  pause = false;
  answerInput.value = '';
});

// Power buttons
powerSlotArray.forEach((slot) => {
  slot.addEventListener('click', function () {
    const slotNumber = parseInt(slot.getAttribute('data-number'), 10);
    if (powers.length > slotNumber && powerUsed === 'none') {
      powerUsed = powers[slotNumber];
      powers.splice(slotNumber, 1);
      updatePowers(powers);
    }
  });
});

// Initialise game parameters
let timeInterval = 500;
blockMoveUnlocked = false;
let cellStates = [];
for (let row = 0; row < numRows; row++) {
  cellStates[row] = [];
  for (let col = 0; col < numCols; col++) {
    cellStates[row][col] = 0;
  }
}
let score = 0;

// Hide end menu
let end = false;
endMenu.style.display = 'none';

// Create and render fallingBlock
let fallingBlock = new Block(numCols);
let blockPositions = fallingBlock.shapePositions();
for (let cell = 0; cell < 4; cell++) {
  let cellPosition = blockPositions[cell];
  cellStates[cellPosition[0]][cellPosition[1]] = fallingBlock.blockType;
}
let falling = true;
let answerCorrect = false;

// Create water, fire
let waterGroup = new WaterGroup(numCols);
let fireGroup = new FireGroup(numCols);

// Initial country
let answer = '';
let countryIndex = 0;
let countryCode = '';
updateCountry(countryIndex);

// Powers
let powers = [];
updatePowers(powers);
let powerUsed = 'none';
let powerActive = false;

// Initial display
createGrid(numRows, numCols, cellStates);

// Game loop function
function playGame() {
  // Block move function
  function moveBlockCheck() {
    let moveValid = true;
    let contactPositions = fallingBlock.contactPositions(blockMove);
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = contactPositions[cell];
      moveValid =
        moveValid &&
        cellPosition[0] < numRows &&
        cellStates[cellPosition[0]][cellPosition[1]] != 1;
    }
    if (moveValid) {
      blockPositions = fallingBlock.shapePositions();
      for (let cell = 0; cell < 4; cell++) {
        let cellPosition = blockPositions[cell];
        cellStates[cellPosition[0]][cellPosition[1]] = 0;
      }
      fallingBlock.move(blockMove);
      blockPositions = fallingBlock.shapePositions();
      for (let cell = 0; cell < 4; cell++) {
        let cellPosition = blockPositions[cell];
        cellStates[cellPosition[0]][cellPosition[1]] = fallingBlock.blockType;
      }
    }
    return moveValid;
  }

  // Game loop
  let intervalId = setInterval(() => {
    // Check unpaused
    if (!pause) {
      if (!powerActive) {
        // Square movement
        if (!falling) {
          // Square falling
          fallingBlock.reset();
          blockPositions = fallingBlock.shapePositions();
          for (let cell = 0; cell < 4; cell++) {
            let cellPosition = blockPositions[cell];
            cellStates[cellPosition[0]][cellPosition[1]] =
              fallingBlock.blockType;
          }
          falling = true;
        } else {
          // Moving block left, right, or down
          if (blockMove != 'none') {
            if (blockMoveUnlocked) {
              if (blockMove != 'down') {
                moveBlockCheck();
              } else {
                let moveValid = moveBlockCheck();
                while (moveValid) {
                  moveValid = moveBlockCheck();
                }
              }
              blockMove = 'none';
            }
          }
          // Transition from falling to stationary
          // Check if hit floor
          let stillFalling = true;
          let contactPositions = fallingBlock.contactPositions('down');
          for (let cell = 0; cell < 4; cell++) {
            let cellPosition = contactPositions[cell];
            stillFalling =
              stillFalling &&
              cellPosition[0] < numRows &&
              cellStates[cellPosition[0]][cellPosition[1]] != 1;
          }
          if (stillFalling) {
            // Handle falling
            blockPositions = fallingBlock.shapePositions();
            for (let cell = 0; cell < 4; cell++) {
              let cellPosition = blockPositions[cell];
              cellStates[cellPosition[0]][cellPosition[1]] = 0;
            }
            fallingBlock.move('down');
            blockPositions = fallingBlock.shapePositions();
            for (let cell = 0; cell < 4; cell++) {
              let cellPosition = blockPositions[cell];
              cellStates[cellPosition[0]][cellPosition[1]] =
                fallingBlock.blockType;
            }
          } else {
            // Handle hitting the floor
            falling = false;
            blockMoveUnlocked = false;
            // Increase game speed
            timeInterval *= 0.99;
            clearInterval(intervalId);
            playGame();
            // Update record and show hint
            if (answerCorrect) {
              countryRecord.update(countryIndex, 'correct');
              answerCorrect = false;
              // New flag
              countryIndex = countryRecord.smartIndex();
              updateCountry(countryIndex);
              tick.style.display = 'none';
            } else {
              countryRecord.update(countryIndex, 'incorrect');
              // Show hint of flag
              pause = true;
              hintMenu.style.display = 'block';
              setTimeout(() => {
                pause = false;
                hintMenu.style.display = 'none';
                // New flag
                countryIndex = countryRecord.smartIndex();
                updateCountry(countryIndex);
                tick.style.display = 'none';
              }, 3000);
            }
            // Switch to power if used
            if (powerUsed != 'none') {
              powerActive = true;
            }
            // Change to fixed cells
            blockPositions = fallingBlock.shapePositions();
            for (let cell = 0; cell < 4; cell++) {
              let cellPosition = blockPositions[cell];
              cellStates[cellPosition[0]][cellPosition[1]] = 1;
            }
            // Eliminate rows
            cellStates = eliminateRows(cellStates);
          }
        }
      } else {
        // Powers
        if (powerUsed === 'water') {
          if (!waterGroup.spawned) {
            // Initialise
            waterGroup.spawn(cellStates);
          } else if (waterGroup.active) {
            // Move
            waterGroup.move(cellStates);
          } else {
            // End
            waterGroup.solidify(cellStates);
            powerUsed = 'none';
            powerActive = false;
            // Eliminate rows
            cellStates = eliminateRows(cellStates);
          }
          createGrid(numRows, numCols, cellStates);
        } else if (powerUsed === 'fire') {
          if (!fireGroup.spawned) {
            // Initialise
            fireGroup.spawn(cellStates);
          } else if (fireGroup.active) {
            // Move
            fireGroup.move(numRows, numCols, cellStates);
          } else {
            // End
            fireGroup.despawn(numRows, numCols, cellStates);
            powerUsed = 'none';
            powerActive = false;
          }
          createGrid(numRows, numCols, cellStates);
        }
      }
    }

    // Game over
    for (let row = 0; row < ROWBUFFER; row++) {
      for (let col = 0; col < numCols; col++) {
        if (cellStates[row][col] === 1) {
          clearInterval(intervalId);
          end = true;
        }
      }
    }

    if (end) {
      // Display end Menu and score
      endMenu.style.display = 'block';
    }

    createGrid(numRows, numCols, cellStates);
  }, timeInterval);
}

playGame();
