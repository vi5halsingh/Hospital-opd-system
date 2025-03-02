const {AppointmentSchema} = require('../../models/appintmentSchema');
const Doctor = require('../../models/doctorSchema');
const {Signupdetail} = require('../../models/signupSchema');

// Dashboard Overview
const getDashboard = async (req, res) => {
    try {
        const totalAppointments = await AppointmentSchema.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await Signupdetail.countDocuments();
        res.render('admin/dashboard', { layout: 'layout',totalAppointments, totalDoctors, totalPatients });
        // res.render('dashboard', { layout: 'layout' });

      
    } catch (err) {
        res.status(500).send('Error loading dashboard');
    }
};

// Appointments Management
const getAppointments = async (req, res) => {
    const appointments = await AppointmentSchema.find().populate('doctor').populate('Signupdetail');
    res.render('admin/appointments', {layout: 'layout', appointments });
};

const updateAppointment = async (req, res) => {
    const { appointmentId, status } = req.body;
    await AppointmentSchema.findByIdAndUpdate(appointmentId, { status });
    res.redirect('/admin/appointments');
};

// Users Management
const getDoctors = async (req, res) => {
    const doctors = await Doctor.find();
    res.render('admin/doctors', {layout: 'layout', doctors });
};

const getPatients = async (req, res) => {
    const patients = await Signupdetail.find();
    res.render('admin/patients', {layout: 'layout', patients });
};

// Notifications
const getNotifications = (req, res) => {
    res.render('admin/notifications', {layout: 'layout'});
};

const sendNotification = async (req, res) => {
    const { title, message, target } = req.body;
    // Logic to send notification
    res.redirect('/admin/notifications');
};

// Settings
const getSettings = (req, res) => {
    res.render('admin/settings' ,{layout: 'layout',});
};

const updateSettings = (req, res) => {
    // Logic to update settings
    res.redirect('/admin/settings');
};

module.exports = {getDashboard,updateAppointment,getAppointments,
    getDoctors,
    getPatients,
    getNotifications,
    sendNotification,
    getSettings,
    updateSettings}