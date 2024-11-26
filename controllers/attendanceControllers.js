const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ExcelJS = require('exceljs');
const emailService = require('../services/emailServices');
const Session = require('../models/Session');
const Class = require('../models/Class');
// Record Attendance
exports.recordAttendance = async (req, res) => {
  const { cardId } = req.body;

  try {
    const student = await Student.findOne({ cardId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Set Indian timezone (IST)
    const INDIAN_TIMEZONE = 'Asia/Kolkata';
    
    // Create current date in UTC
    const utcDate = new Date();
    
    // Convert to Indian time using Intl.DateTimeFormat
    const indianFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: INDIAN_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      second: '2-digit'
    });

    // Get all date parts
    const dateParts = indianFormatter.formatToParts(utcDate);
    const dateObj = {};
    dateParts.forEach(part => {
      dateObj[part.type] = part.value;
    });

    // Format time as HH:mm for session comparison
    const currentTime = `${dateObj.hour}:${dateObj.minute}`;
    const currentDay = new Intl.DateTimeFormat('en-US', { 
      timeZone: INDIAN_TIMEZONE,
      weekday: 'long'
    }).format(utcDate);

    // Create an ISO date string in Indian timezone
    // Note: Month in JavaScript is 0-based, so we subtract 1
    const indianDate = new Date(
      Date.UTC(
        parseInt(dateObj.year),
        parseInt(dateObj.month) - 1,
        parseInt(dateObj.day),
        parseInt(dateObj.hour) - 5, // Adjust for IST offset (-5:30)
        parseInt(dateObj.minute) - 30 // Adjust for IST offset
      )
    );

    // Debug logging
    console.log({
      serverTime: utcDate.toISOString(),
      indianTime: currentTime,
      indianDay: currentDay,
      timezone: INDIAN_TIMEZONE,
      fullIndianDate: indianDate.toISOString()
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

    // Set date range for attendance check
    // Create start and end of day in Indian timezone
    const todayStart = new Date(indianDate);
    todayStart.setUTCHours(0, 0, 0, 0);
    
    const todayEnd = new Date(indianDate);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      sessionId: session._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (existingAttendance) {
      return res.status(200).json({ 
        message: 'Attendance already recorded for this session',
        debug: {
          existingTime: existingAttendance.date,
          currentTime,
          currentDay
        }
      });
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      studentId: student._id,
      sessionId: session._id,
      date: indianDate
    });

    await newAttendance.save();
    
    res.status(200).json({ 
      message: 'Attendance recorded successfully',
      debug: {
        sessionId: session._id,
        currentTime,
        currentDay,
        timezone: INDIAN_TIMEZONE,
        indianDate: indianDate.toISOString(),
        serverTime: utcDate.toISOString()
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
  try {
    const { startDate, endDate, classId } = req.body;
console.log(req.body);

    // Validate required parameters
    if (!startDate || !endDate || !classId) {
      return res.status(400).json({
        message: 'Missing required parameters: startDate, endDate, and classId',
      });
    }

    // Parse dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Validate date range
    if (start > end) {
      return res.status(400).json({
        message: 'Start date cannot be after end date',
      });
    }

    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 31) {
      return res.status(400).json({
        message: 'Date range cannot exceed 31 days',
      });
    }

    // Fetch sessions for the class within the date range
    const sessions = await Session.find({
      days: { $in: getDaysArray(start, end) },
    });

    // Fetch students in the class
    const students = await Student.find({ class:classId }).select('name email').lean();
    if (!students.length) {
      return res.status(404).json({
        message: 'No students found in this class',
      });
    }

    // Get absence records for each student
    const absenteeReport = await Promise.all(
      students.map(async (student) => {
        const absentSessions = await Promise.all(
          sessions.map(async (session) => {
            const isPresent = await Attendance.findOne({
              studentId: student._id,
              sessionId: session._id,
              date: { $gte: start, $lte: end },
            });

            if (!isPresent) {
              return {
                date: getSessionDate(session, start, end),
                startTime: session.startTime,
                endTime: session.endTime,
              };
            }
            return null;
          })
        );

        const filteredAbsentSessions = absentSessions.filter(Boolean);

        if (filteredAbsentSessions.length > 0) {
          try {
            await emailService.sendDetailedAbsenceNotification(
              student,
              filteredAbsentSessions
            );

            return {
              studentName: student.name,
              email: student.email,
              absentSessions: filteredAbsentSessions,
            };
          } catch (emailError) {
            console.error(
              `Failed to send email to ${student.email}:`,
              emailError
            );
            return null;
          }
        }
      })
    );

    const filteredAbsenteeReport = absenteeReport.filter(Boolean);

    if (filteredAbsenteeReport.length === 0) {
      return res.status(200).json({
        message: 'No absences found for the selected period',
        absenteeReport: [],
      });
    }

    return res.status(200).json({
      message: 'Absence notifications sent successfully',
      absenteeReport: filteredAbsenteeReport,
    });
  } catch (error) {
    console.error('Error in sendAbsenceNotifications:', error);
    return res.status(500).json({
      message: 'Error sending absence notifications',
      error: error.message,
    });
  }
};
// Helper functions remain the same
function getDaysArray(start, end) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysSet = new Set();
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    daysSet.add(days[dt.getDay()]);
  }
  return Array.from(daysSet);
}

function getSessionDate(session, start, end) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    if (session.days.includes(days[dt.getDay()])) {
      return dt.toISOString().split('T')[0];
    }
  }
  return null;
}
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