const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Serve static files from the "src" folder
app.use(express.static('src'));

// Routes
// Landing page
app.get('/', (req, res) => {
    res.render('about'); // Render about.ejs
});

// Handle username submission
app.post('/play', async (req, res) => {
    const { username } = req.body;
    res.render('play', { username });
    return;
});

// Handle username submission
app.get('/about', async (req, res) => {
    res.render('about');
});

// Start server
const PORT = process.env.PORT || 5000; // Use Render's assigned port or fallback to 5000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}; see http://localhost:${PORT}/`);
});
