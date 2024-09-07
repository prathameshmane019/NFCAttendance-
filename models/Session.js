const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  days: {
    type: [String],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Session', sessionSchema);
