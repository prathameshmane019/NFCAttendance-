const Student = require('../models/Student');
const XLSX = require('xlsx');

exports.uploadStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      const student = new Student({
        name: row.Name,
        cardId: row.CardID,
        email: row.Email,
        class: row.Class
      });
      await student.save();
    }

    res.status(200).json({ message: 'Students uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading students' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('class', 'name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error adding student' });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class', 'name');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('class', 'name');
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' });
  }
};