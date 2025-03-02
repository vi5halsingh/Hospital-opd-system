const express = require('express');
const router = express.Router();
const { doctorAuthentication } = require('../middleware/auth');
const { restrictTo } = require('../middleware/auth');

// Example route for doctor dashboard
router.get('/api/doctor/dashboard', doctorAuthentication, restrictTo('doctor'), (req, res) => {
  // Your dashboard logic here
  res.render('doctor-dashboard/index', { doctor: req.doctor });
});

module.exports = router; 