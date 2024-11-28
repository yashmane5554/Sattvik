require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();

// CORS Configuration
const corsOptions = {
    origin: 'https://sattvikproteinfoods.in', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('MongoDB URI is not defined in the environment variables.');
    process.exit(1); // Exit if the URI is missing
}

mongoose
    .connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// Define Mongoose Schema and Model
const entrySchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    cashInOut: { type: String, enum: ['cashIn', 'cashOut'], required: true },
    date: { type: String, required: true },
    place: { type: String, required: true },
    responsiblePerson: { type: String, required: true },
});
const Entry = mongoose.model('Entry', entrySchema);

// Define Routes
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Create a new entry
app.post('/entries', async (req, res) => {
    try {
        const { description, amount, cashInOut, date, place, responsiblePerson } = req.body;

        // Validate request data (basic checks)
        if (!description || !amount || !cashInOut || !date || !place || !responsiblePerson) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newEntry = new Entry(req.body);
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error('Error saving entry:', err.message);
        res.status(500).json({ error: 'Failed to save entry', details: err.message });
    }
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
