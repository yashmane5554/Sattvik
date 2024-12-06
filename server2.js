const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://yellow-alene-40.tiiny.site', // Replace with your website's domain
  methods: ['GET', 'POST'],
}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://yashwardhanmane:K48fZmH0tbhd0nNm@cluster0.9brq2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Schema and Model
const formSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  cashType: String,
  date: String,
  place: String,
  person: String,
  createdAt: { type: Date, default: Date.now }, // Auto-generated timestamp
});

const Form = mongoose.model('Form', formSchema);

// Save form data
app.post('/api/submit', async (req, res) => {
  try {
    const newEntry = new Form(req.body);
    await newEntry.save();
    res.json({ success: true, message: 'Data saved successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving data', error });
  }
});

// Fetch all form data
app.get('/api/data', async (req, res) => {
  try {
    const data = await Form.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Get Total Cash In Hand
app.get('/api/cash-in-hand', async (req, res) => {
  try {
    const cashInTotal = await Form.aggregate([
      { $match: { cashType: 'Cash In' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const cashOutTotal = await Form.aggregate([
      { $match: { cashType: 'Cash Out' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalCashIn = cashInTotal[0]?.total || 0;
    const totalCashOut = cashOutTotal[0]?.total || 0;

    const cashInHand = totalCashIn - totalCashOut;

    res.json({ cashInHand });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating cash in hand', error });
  }
});


// Start Server
const PORT = process.env.PORT || 5000; // Adjust as necessary
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
