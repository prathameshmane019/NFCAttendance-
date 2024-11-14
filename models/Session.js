// Session Model
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  days: {
    type: [String],
    required: true
  },
  startTime: {
    type: String,  // Changed to String to store time in HH:mm format
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  },
  endTime: {
    type: String,  // Changed to String to store time in HH:mm format
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  }
});

module.exports = mongoose.model('Session', sessionSchema);
