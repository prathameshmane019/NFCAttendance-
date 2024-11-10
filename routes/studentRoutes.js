const express = require('express');
const studentController = require('../controllers/studentControllers');
const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

// router.post('/upload', upload.single('file'), studentController.uploadStudents);
router.get('/', studentController.getAllStudents);
router.post('/', studentController.addStudent);
router.get('/:id', studentController.getStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
