const express = require('express');
const router = express.Router();
const {
  getDashboard,
    updateAppointment,
    getDoctors,
    getPatients,
    getNotifications,
    sendNotification,
    getSettings,
    getAppointments,
    updateSettings
  } = require('../controller/admin/adminController');


router.get("/super-admin", (req, res) => {
    res.render("admin/admin");
  });
  
  router.get("/add-doctor", (req, res) => {
    res.render("admin/add_doctor");
  });
// Dashboard
router.get('/dashboard', getDashboard);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments/update', updateAppointment);

// Users
router.get('/doctors', getDoctors);
router.get('/patients', getPatients);

// Notifications
router.get('/notifications', getNotifications);
router.post('/notifications/send', sendNotification);

// Settings
router.get('/settings', getSettings);
router.post('/settings/update', updateSettings);
 
module.exports = router;
