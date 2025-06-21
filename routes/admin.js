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
    updateSettings,
    addDoctor,
    editDoctorForm,
    editDoctor,
    deleteDoctor
  } = require('../controller/admin/adminController');
const { requireAdminAuth } = require('../middleware/auth');


// router.get("/super-admin", (req, res) => {
//     res.render("admin/admin");
//   });
  
//   router.get("/add-doctor", (req, res) => {
//     res.render("admin/add_doctor", { doctor: null, errorMessage: null, successMessage: null });
//   });
// Dashboard
router.get('/dashboard',requireAdminAuth, getDashboard);

// Appointments
router.get('/appointments',requireAdminAuth, getAppointments);
router.post('/appointments/update',requireAdminAuth, updateAppointment);

// Users
router.get('/doctors',requireAdminAuth, getDoctors);
router.get('/patients',requireAdminAuth, getPatients);

// Notifications
router.get('/notifications', getNotifications);
router.post('/notifications/send',requireAdminAuth, sendNotification);

// Settings
router.get('/settings',requireAdminAuth, getSettings);
router.post('/settings/update',requireAdminAuth, updateSettings);

// Admin login routes
router.get('/login', (req, res) => {
  res.render('admin/admin-login');
});

router.post('/login', require('../controller/admin/authController').adminLogin);

router.get('/logout',requireAdminAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Protect all routes below this line
router.use(requireAdminAuth);

// Doctor CRUD
router.get('/doctors/add',requireAdminAuth, (req, res) => res.render('admin/add_doctor', { 
  doctor: null, 
  errorMessage: req.flash('error')[0] || null,
  successMessage: req.flash('success')[0] || null
}));
router.post('/doctors/add',requireAdminAuth, addDoctor);
router.get('/doctors/edit/:id',requireAdminAuth, editDoctorForm);
router.post('/doctors/edit/:id',requireAdminAuth, editDoctor);
router.post('/doctors/delete/:id',requireAdminAuth, deleteDoctor);

module.exports = router;
