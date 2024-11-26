const express = require('express');
const attendanceController = require('../controllers/attendanceControllers');

const router = express.Router();

router.post('/record', attendanceController.recordAttendance);
router.get('/report', attendanceController.getAttendanceReport); // Fetch JSON report
router.get('/report/download', attendanceController.downloadAttendanceReport); // Download Excel report
router.post('/absent', attendanceController.sendAbsenceNotifications);
router.delete('/remove', attendanceController.removeAttendance);

module.exports = router;
