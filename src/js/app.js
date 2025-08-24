import { QuizRecord } from './quiz.js';
import { GridController } from './grid.js';
import { submitScore } from './leaderboard.js';

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

// Number of hidden rows atop grid
const ROWBUFFER = 10;

// Read in number of rows and columns from html code and set CSS style
const numRows = parseInt(blockGrid.dataset.rows, 10) + ROWBUFFER;
blockGrid.style.setProperty('--rows', numRows - ROWBUFFER);
const numCols = parseInt(blockGrid.dataset.columns, 10);
blockGrid.style.setProperty('--columns', numCols);

// Update powers
function updatePowers(powerStates) {
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

// Function to update country assets in game
function updateCountry({ question, answer }) {
  flagImg.src = '/assets/flags/' + question + '.svg';
  hintImg.src = '/assets/flags/' + question + '.svg';
  hintCountry.textContent = answer;
  // You can cheat if you know where to look!
  console.log('New country: ' + answer);
}

function updateScoreCounter(score) {
  // Update the text content of each element
  scoreElements.forEach((span) => {
    span.textContent = score;
  });
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
        if (
          answerInput.value.toLowerCase() !=
          countryRecord.getCurrentQA().answer.toLowerCase()
        ) {
          blockMove = 'down';
        } else {
          tick.style.display = 'block';
          score++;
          if (powers.length < 3) {
            if (blockGridController.fallingBlock.blockType === 3) {
              powers.push('water');
              updatePowers(powers);
            }
            if (blockGridController.fallingBlock.blockType === 6) {
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
    if (
      answerInput.value.toLowerCase() !=
      countryRecord.getCurrentQA().answer.toLowerCase()
    ) {
      blockMove = 'down';
    } else {
      tick.style.display = 'block';
      score++;
      if (powers.length < 3) {
        if (blockGridController.fallingBlock.blockType === 3) {
          powers.push('water');
          updatePowers(powers);
        }
        if (blockGridController.fallingBlock.blockType === 6) {
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
let blockGridController = new GridController(
  numRows,
  numCols,
  ROWBUFFER,
  blockGrid,
  document
);
blockGridController.render();
let blockMoveUnlocked = false;
let blockMove = 'none';
let pause = false;
let countryRecord = new QuizRecord();
let timeInterval = 500;
blockMoveUnlocked = false;
let score = 0;

// Hide end menu
endMenu.style.display = 'none';
blockGridController.createFallingBlock();
let falling = true;
let answerCorrect = false;

// Initial country
updateCountry(countryRecord.getCurrentQA());

// Powers
let powers = [];
updatePowers(powers);
let powerUsed = 'none';
let powerActive = false;

// Game loop function
function playGame() {
  // Game loop
  let intervalId = setInterval(() => {
    // Check unpaused
    if (!pause) {
      if (!powerActive) {
        // Square movement
        if (!falling) {
          // Square falling
          blockGridController.resetFallingBlock();
          falling = true;
        } else {
          // Moving block left, right, or down
          if (blockMove != 'none') {
            if (blockMoveUnlocked) {
              if (blockMove != 'down') {
                // Left/right: move once
                blockGridController.moveBlockCheck(blockMove);
              } else {
                // Move down: push all the way to the bottom
                let moveValid = blockGridController.moveBlockCheck(blockMove);
                while (moveValid) {
                  moveValid = blockGridController.moveBlockCheck(blockMove);
                }
              }
              blockMove = 'none';
            }
          }
          // Transition from falling to stationary
          // Check if hit floor
          if (blockGridController.stillFallingCheck()) {
            blockGridController.fallOneStep();
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
              countryRecord.update('correct');
              answerCorrect = false;
              // New flag
              countryRecord.updateIndex();
              updateCountry(countryRecord.getCurrentQA());
              tick.style.display = 'none';
            } else {
              countryRecord.update('incorrect');
              // Show hint of flag
              pause = true;
              hintMenu.style.display = 'block';
              setTimeout(() => {
                pause = false;
                hintMenu.style.display = 'none';
                // New flag
                countryRecord.updateIndex();
                updateCountry(countryRecord.getCurrentQA());
                tick.style.display = 'none';
              }, 3000);
            }
            // Switch to power if used
            if (powerUsed != 'none') {
              powerActive = true;
            }
            // Change to fixed cells
            blockGridController.solidify();
            // Eliminate rows
            blockGridController.eliminateRows();
          }
        }
      } else {
        // Powers
        if (powerUsed === 'water') {
          let powerEnd = blockGridController.waterMove();
          blockGridController.render();
          if (powerEnd) {
            powerActive = false;
            powerUsed = 'none';
          }
        } else if (powerUsed === 'fire') {
          let powerEnd = blockGridController.fireMove();
          blockGridController.render();
          if (powerEnd) {
            powerActive = false;
            powerUsed = 'none';
          }
        }
      }
    }

    // Game over
    if (blockGridController.gameOver()) {
      clearInterval(intervalId);
      // Display end Menu and score
      endMenu.style.display = 'block';
      submitScore(window.USERNAME, score);
    }
    blockGridController.render();
  }, timeInterval);
}

console.log(`Player name: ${window.USERNAME}, score: ${score}`);

playGame();
