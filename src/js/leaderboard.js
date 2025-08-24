// Submit score
export async function submitScore(username, score) {
  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Score submitted successfully!');
    } else {
      console.error('Failed to submit score:', data.error);
    }
  } catch (err) {
    console.error('Error submitting score:', err);
  }
}

// Fetch leaderboard
export async function loadLeaderboard() {
  const res = await fetch('/scores');
  const scores = await res.json();

  const leaderboardEl = document.getElementById('leaderboard');
  leaderboardEl.innerHTML = ''; // clear old list

  scores.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${entry.username} — ${entry.score}`;
    leaderboardEl.appendChild(li);
  });
}
