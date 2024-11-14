const Session = require('../models/Session');

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};
exports.addSession = async (req, res) => {
  const { days, startTime, endTime } = req.body;

  try {
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm format.' });
    }

    const newSession = new Session({ days, startTime, endTime });
    await newSession.save();
    res.status(201).json({ message: 'Session added successfully', session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Error adding session', error: error.message });
  }
};
// Update session controller
exports.updateSession = async (req, res) => {
  const { id } = req.params;
  const { days, startTime, endTime } = req.body;

  try {
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm format.' });
    }

    const updatedSession = await Session.findByIdAndUpdate(
      id, 
      { days, startTime, endTime }, 
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session updated successfully', session: updatedSession });
  } catch (error) {
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
};
exports.deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSession = await Session.findByIdAndDelete(id);
    if (!deletedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};