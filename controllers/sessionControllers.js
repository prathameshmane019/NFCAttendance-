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
    // Convert startTime and endTime to Date objects
    const start = new Date(`2023-01-01T${startTime}:00`);
    const end = new Date(`2023-01-01T${endTime}:00`);

    const newSession = new Session({ days, startTime: start, endTime: end });
    await newSession.save();
    res.status(201).json({ message: 'Session added successfully', session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Error adding session', error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  const { id } = req.params;
  const { days, startTime, endTime } = req.body;

  try {
    // Convert startTime and endTime to Date objects
    const start = new Date(`2023-01-01T${startTime}:00`);
    const end = new Date(`2023-01-01T${endTime}:00`);

    const updatedSession = await Session.findByIdAndUpdate(id, { days, startTime: start, endTime: end }, { new: true });
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