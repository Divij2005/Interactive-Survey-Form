const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  answers: {
    type: Map,
    of: String,   // stores answers keyed by question number
  },
  score: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
