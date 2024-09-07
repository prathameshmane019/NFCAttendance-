const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    console.log(username,password);
    
    const admin = await Admin.findOne({ username });
    console.log(admin);
   
    
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    
    const match = password === admin.password
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: admin.username });
  } catch (error) {
    console.log(error);
  
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.json({ username: admin.username });
  } catch (error) {
    console.log(error);
    
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;