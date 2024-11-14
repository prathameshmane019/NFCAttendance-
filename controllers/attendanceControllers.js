const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ExcelJS = require('exceljs');
const emailService = require('../services/emailServices');
const Session = require('../models/Session');

exports.recordAttendance = async (req, res) => {
  const { cardId } = req.body;

  try {
    const student = await Student.findOne({ cardId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Use UTC time to avoid timezone issues
    const now = new Date();
    // Convert to local time in your target timezone (e.g., 'Asia/Dubai' or your specific timezone)
    const localTime = now.toLocaleString('en-US', { 
      timeZone: process.env.TIMEZONE || 'UTC',
      hour12: false 
    });
    const localDateTime = new Date(localTime);

    // Get day and time in the correct timezone
    const currentDay = localDateTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = localDateTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    // Log for debugging
    console.log({
      serverTime: now.toISOString(),
      localTime: localTime,
      currentDay,
      currentTime
    });

    // Find active session
    const session = await Session.findOne({
      days: currentDay,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    if (!session) {
      console.log('No session found for:', {
        currentDay,
        currentTime,
        availableSessions: await Session.find({}) // Log available sessions for debugging
      });
      return res.status(404).json({ message: 'No active session found at this time' });
    }

    // Set date range for attendance check in local timezone
    const todayStart = new Date(localDateTime);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(localDateTime);
    todayEnd.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      sessionId: session._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (existingAttendance) {
      return res.status(200).json({ message: 'Attendance already recorded for this session' });
    }

    const newAttendance = new Attendance({
      studentId: student._id,
      sessionId: session._id,
      date: localDateTime
    });

    await newAttendance.save();
    res.status(200).json({ 
      message: 'Attendance recorded successfully',
      debug: {
        sessionId: session._id,
        currentTime,
        currentDay
      }
    });
  } catch (error) {
    console.error('Attendance Recording Error:', error);
    res.status(500).json({ 
      message: 'Error recording attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};