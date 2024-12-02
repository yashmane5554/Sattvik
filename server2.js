const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://sattvikproteinfoods.in', // Replace with your website's domain
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
  name: String,
  email: String,
  message: String,
});

const Form = mongoose.model('Form', formSchema);

// Routes

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

// Start Server
const PORT = process.env.PORT || 5000; // Adjust as necessary for your hosting platform
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
