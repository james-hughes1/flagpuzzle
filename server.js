// Hidden variables
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}`);
const nameSchema = new mongoose.Schema({ firstName: String });
const Name = mongoose.model("Name", nameSchema);

// Routes
// Add a new name
app.post("/add-name", async (req, res) => {
    const { firstName } = req.body;
    if (!firstName) return res.status(400).send("First name is required.");
    const newName = new Name({ firstName });
    await newName.save();
    res.send("Name added successfully.");
});

// Get all names
app.get("/names", async (req, res) => {
    const names = await Name.find();
    res.json(names);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
