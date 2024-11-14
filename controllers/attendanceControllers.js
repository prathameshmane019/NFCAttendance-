const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ExcelJS = require('exceljs');
const emailService = require('../services/emailServices');
const Session = require('../models/Session')
// Record Attendance
// Attendance Controller - recordAttendance function
exports.recordAttendance = async (req, res) => {
  const { cardId } = req.body;
  
  try {
    const student = await Student.findOne({ cardId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get current time and day
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    });
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Find matching session
    const session = await Session.findOne({
      days: currentDay,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found at this time' });
    }

    // Check for existing attendance
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      sessionId: session._id,
      date: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    if (existingAttendance) {
      return res.status(200).json({ message: 'Attendance already recorded for this session' });
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      studentId: student._id,
      sessionId: session._id,
      date: now
    });

    await newAttendance.save();
    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error recording attendance' });
  }
};

// Updated getAttendanceReport function
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, class: classId } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sessions = await Session.find().sort({ startTime: 1 });
    const students = await Student.find({ class: classId });

    const attendanceData = await Promise.all(
      students.map(async (student) => {
        const sessionAttendance = await Promise.all(
          sessions.map(async (session) => {
            // Count the attendance records for the specific student, session, and date range
            const attendanceCount = await Attendance.countDocuments({
              studentId: student._id,
              sessionId: session._id,
              date: { $gte: start, $lte: end },
            });

            return {
              _id: session._id,
              startTime: session.startTime,
              endTime: session.endTime,
              count: attendanceCount, // Actual count of attendance
            };
          })
        );

        // Sum up total attendance counts
        const totalAttendance = sessionAttendance.reduce((acc, session) => acc + session.count, 0);

        return {
          student: {
            _id: student._id,
            name: student.name,
            cardId: student.cardId,
          },
          sessions: sessionAttendance,
          totalAttendance,
        };
      })
    );

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error('Error in getAttendanceReport:', error);
    res.status(500).json({ message: 'Error fetching attendance report', error: error.message });
  }
};
exports.downloadAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, class: classId } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch sessions sorted by start time and students belonging to the specified class
    const sessions = await Session.find().sort({ startTime: 1 });
    const students = await Student.find({ class: classId });

    // Generate attendance data with detailed counts for each student and session
    const attendanceData = await Promise.all(
      students.map(async (student) => {
        const sessionAttendance = await Promise.all(
          sessions.map(async (session) => {
            // Count the number of times the student attended the session within the date range
            const attendanceCount = await Attendance.countDocuments({
              studentId: student._id,
              sessionId: session._id,
              date: { $gte: start, $lte: end },
            });

            return {
              startTime: session.startTime,
              endTime: session.endTime,
              count: attendanceCount, // The actual count of attendance records
            };
          })
        );

        // Calculate the total attendance across all sessions for the student
        const totalAttendance = sessionAttendance.reduce(
          (acc, session) => acc + session.count,
          0
        );

        return {
          name: student.name,
          cardId: student.cardId,
          attendance: sessionAttendance,
          totalAttendance,
        };
      })
    );

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Add headers: Session times are dynamically included based on start and end times
    const headers = [
      'Name',
      'Card ID',
      ...sessions.map(
        (s) => `${s.startTime}-${s.endTime}`
      ),
      'Total Attendance',
    ];
    worksheet.addRow(headers);

    // Add attendance data rows with actual attendance counts for each session
    attendanceData.forEach((record) => {
      worksheet.addRow([
        record.name,
        record.cardId,
        ...record.attendance.map((session) => session.count),
        record.totalAttendance,
      ]);
    });

    // Set response headers to trigger a file download of the generated Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_report_${classId}.xlsx`
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error in downloadAttendanceReport:', error);
    res
      .status(500)
      .json({ message: 'Error generating attendance report', error: error.message });
  }
};
exports.sendAbsenceNotifications = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const presentStudents = await Attendance.find({ date: today }).distinct('studentId');
    const absentStudents = await Student.find({ _id: { $nin: presentStudents } });

    for (const student of absentStudents) {
      await emailService.sendAbsenceNotification(student);
    }

    res.status(200).json({ message: 'Absence notifications sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing absent students' });
  }
};

// Remove Attendance Record
exports.removeAttendance = async (req, res) => {
  const { studentId, date } = req.body;
  try {
    const result = await Attendance.deleteOne({
      studentId,
      date: new Date(date).setHours(0, 0, 0, 0),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing attendance record' });
  }
};