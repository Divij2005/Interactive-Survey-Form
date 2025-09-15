const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const SurveyResponse = require('./models/surveyresponse');

dotenv.config();

const app = express();
const path = require('path');

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Survey Backend Running 🚀');
});

// Save survey response
app.post('/api/submit', async (req, res) => {
  try {
    const { answers, score } = req.body;

    const newResponse = new SurveyResponse({ answers, score });
    await newResponse.save();

    res.json({ success: true, message: 'Survey submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all responses (for testing/admin)
app.get('/api/responses', async (req, res) => {
  try {
    const responses = await SurveyResponse.find().sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
