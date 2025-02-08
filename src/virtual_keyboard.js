const userInput = document.getElementById('userInput');
const keys = document.querySelectorAll(".key");
const spaceButton = document.getElementById("space");
const backspaceButton = document.getElementById("backspace");
const clearButton = document.getElementById("clear");

// Keyboard actions
// Add event listeners for the keys
keys.forEach(key => {
    key.addEventListener("click", function() {
        const keyValue = key.getAttribute("data-key");
        userInput.value += keyValue;
    });
});

// Space button
spaceButton.addEventListener("click", function() {
    userInput.value += " ";
});

// Backspace button
backspaceButton.addEventListener("click", function() {
    userInput.value = userInput.value.slice(0, -1);
});

// Clear button
clearButton.addEventListener("click", function() {
    userInput.value = "";
});
