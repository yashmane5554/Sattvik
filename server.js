require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();

// CORS Configuration
const corsOptions = {
    origin: ['https://sattvikproteinfoods.in', 'http://localhost:3000'], // Allow production and local development origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(bodyParser.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MongoDB URI is not defined in the environment variables.');
    process.exit(1); // Exit if the URI is missing
}

mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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
    date: { type: Date, required: true }, // Changed to Date type for better validation
    place: { type: String, required: true },
    responsiblePerson: { type: String, required: true },
    entryTime: { type: Date, default: Date.now }, // Automatically track entry time
});
const Entry = mongoose.model('Entry', entrySchema);

// Routes
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Fetch all entries
app.get('/entries', async (req, res) => {
    try {
        const entries = await Entry.find(); // Fetch all entries from the database
        res.status(200).json(entries); // Respond with the entries
    } catch (err) {
        console.error('Error fetching entries:', err.message);
        res.status(500).json({ error: 'Failed to fetch entries', details: err.message });
    }
});

// Create a new entry
app.post('/entries', async (req, res) => {
    try {
        const { description, amount, cashInOut, date, place, responsiblePerson } = req.body;

        // Validate request data
        if (!description || !amount || !cashInOut || !date || !place || !responsiblePerson) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newEntry = new Entry({
            description,
            amount,
            cashInOut,
            date: new Date(date), // Convert to Date object
            place,
            responsiblePerson,
        });

        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error('Error saving entry:', err.message, err.errors);
        res.status(500).json({ error: 'Failed to save entry', details: err.message });
    }
});

// Update an entry
app.put('/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedEntry = await Entry.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(200).json(updatedEntry);
    } catch (err) {
        console.error('Error updating entry:', err.message, err.errors);
        res.status(500).json({ error: 'Failed to update entry', details: err.message });
    }
});

// Delete an entry
app.delete('/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEntry = await Entry.findByIdAndDelete(id);
        if (!deletedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(200).json({ message: 'Entry deleted successfully', deletedEntry });
    } catch (err) {
        console.error('Error deleting entry:', err.message);
        res.status(500).json({ error: 'Failed to delete entry', details: err.message });
    }
});

// Global Error Handling Middleware
app.use((err, _req, res, _next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
