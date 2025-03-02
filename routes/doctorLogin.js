const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Doctor = require('../models/doctorSchema');

// This route assumes that the doctor logs in via POST at "/api/login/doctor"
router.post('/api/login/doctor', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).redirect('/login/doctor?error=Invalid credentials');
    }

    // Compare passwords (assuming the password is hashed)
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).redirect('/login/doctor?error=Invalid credentials');
    }

    // Save user in session (this is just one option; adjust to your auth flow)
    req.session.user = doctor;
    
    // Check userType and redirect accordingly
    if (doctor.userType === 'staff') {
      // Redirect to staff dashboard
      return res.redirect('/api/staff/dashboard');
    } else if (doctor.userType === 'doctor') {
      // Redirect to doctor dashboard
      return res.redirect('/api/doctor/dashboard');
    } else {
      return res.redirect('/login/doctor?error=Unknown user type');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).redirect('/login/doctor?error=Server error');
  }
});

module.exports = router; 