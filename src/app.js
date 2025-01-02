const form = document.getElementById("nameForm");
const firstNameInput = document.getElementById("firstName");
const namesList = document.getElementById("namesList");

// API URLs
const API_BASE_URL = "http://localhost:5000";

// Fetch and display all names
async function fetchNames() {
    const response = await fetch(`${API_BASE_URL}/names`);
    const names = await response.json();
    namesList.innerHTML = names.map(name => `<li>${name.firstName}</li>`).join("");
}

// Add a new name
form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form submission reload
    const firstName = firstNameInput.value.trim();
    if (!firstName) return;

    await fetch(`${API_BASE_URL}/add-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName }),
    });

    firstNameInput.value = ""; // Clear the input
    fetchNames(); // Refresh the list
});

// Initial fetch
fetchNames();
