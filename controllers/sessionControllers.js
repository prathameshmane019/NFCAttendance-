const Session = require('../models/Session');

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};


exports.addSession = async (req, res) => {
  const { days, startTime, endTime } = req.body;

  try {
    const newSession = new Session({ days, startTime, endTime });
    await newSession.save();
    res.status(201).json({ message: 'Session added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding session' });
  }
};


exports.updateSession = async (req, res) => {
  const { id } = req.params;
  const { days, startTime, endTime } = req.body;

  try {
    const updatedSession = await Session.findByIdAndUpdate(id, { days, startTime, endTime }, { new: true });
    if (!updatedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session updated successfully', session: updatedSession });
  } catch (error) {
    res.status(500).json({ message: 'Error updating session' });
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
    res.status(500).json({ message: 'Error deleting session' });
  }
};
