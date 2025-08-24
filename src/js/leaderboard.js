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
