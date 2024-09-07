const Class = require('../models/Class');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

exports.addClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json({ message: 'Class added successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Error adding class' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class updated successfully', class: updatedClass });
  } catch (error) {
    res.status(500).json({ message: 'Error updating class' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class' });
  }
};