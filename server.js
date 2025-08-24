require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());

// Serve static files (JS, CSS, images) from "src"
app.use(express.static('src'));

// ----------------------
// MongoDB setup
// ----------------------

// MongoDB connection
const DB_PASSWORD = process.env.DB_PASSWORD;
mongoose
  .connect(
    `mongodb+srv://jhughes2712:${DB_PASSWORD}@cluster0.0h99v.mongodb.net/flag_puzzle`
  )
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: mongoose.Schema.Types.Int32, required: true },
});

const Score = mongoose.model('Score', scoreSchema);

// ----------------------
// Routes
// ----------------------

// Landing page with leaderboard
app.get('/', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.render('about', { scores });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading leaderboard');
  }
});

// Username form → play screen
app.post('/play', async (req, res) => {
  const { username } = req.body;
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.render('play', { scores, username });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading leaderboard');
  }
});

// About page (also shows leaderboard)
app.get('/about', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.render('about', { scores });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading leaderboard');
  }
});

// Handle submission of new score
app.post('/api/score', async (req, res) => {
  const { username, score } = req.body;

  if (!username || score == null) {
    return res.status(400).json({ error: 'Username and score are required' });
  }

  try {
    const newScore = new Score({ username, score });
    await newScore.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving score:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 5000; // Works on Render or local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
