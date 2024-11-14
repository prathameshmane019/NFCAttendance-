const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  days: {
    type: [String],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
});
module.exports = mongoose.model('Session', sessionSchema);
