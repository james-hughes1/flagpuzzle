// Hidden variables
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}`);
const nameSchema = new mongoose.Schema({ firstName: String });
const Name = mongoose.model("Name", nameSchema);

// Routes
// Landing Page
app.get('/', (req, res) => {
    res.render('landing'); // Render landing.ejs
});

// Enter Name Page
app.get('/enter-name', (req, res) => {
    res.render('enter-name'); // Render enter-name.ejs
});

// Handle Form Submission
app.post('/submit-name', async (req, res) => {
    const newName = new Name({ firstName: req.body.firstName });
    await newName.save();
    res.redirect('/names');
    return;
});

// Display All Names
app.get('/names', async (req, res) => {
    const names = await Name.find();
    res.render('names', { namesList: names }); // Render names.ejs with data
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
