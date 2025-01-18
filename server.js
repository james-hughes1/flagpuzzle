const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Routes
// Landing Page
app.get('/', (req, res) => {
    res.render('about'); // Render about.ejs
});

// Handle Name Submission
app.post('/submit-name', async (req, res) => {
    const username = req.body.username;
    console.log(username)
    res.redirect('/play');
    return;
});

// Play Page
app.get('/play', (req, res) => {
    res.render('play'); // Render play.ejs
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
