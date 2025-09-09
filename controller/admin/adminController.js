const {AppointmentSchema} = require('../../models/appintmentSchema');
const Doctor = require('../../models/doctorSchema');
const {Signupdetail} = require('../../models/signupSchema');
const Notification = require('../../models/notificationSchema');
const bcrypt = require('bcrypt');

const getDashboard = async (req, res) => {
    try {
        const [
            totalAppointments,
            totalDoctors,
            totalPatients,
            pendingAppointments,
            completedAppointments
        ] = await Promise.all([
            AppointmentSchema.countDocuments(),
            Doctor.countDocuments({ status: true }),
            Signupdetail.countDocuments({ userType: 'patient' }),
            AppointmentSchema.countDocuments({ status: 'new' }),
            AppointmentSchema.countDocuments({ status: 'completed' })
        ]);

        res.render('admin/dashboard', { 
            totalAppointments, 
            totalDoctors, 
            totalPatients,
            pendingAppointments,
            completedAppointments
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).send('Error loading dashboard');
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentSchema.find()
            .populate('doctor', 'firstName lastName specialty')
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.render('admin/appointments', { appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send('Error loading appointments');
    }
};

const updateAppointment = async (req, res) => {
    const { appointmentId, status } = req.body;
    try {
        const updatedAppointment = await AppointmentSchema.findByIdAndUpdate(appointmentId, { status }, { new: true });
        res.json({ success: true, appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
};

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.render('admin/doctors', { doctors });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).send('Error loading doctors');
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await Signupdetail.find({ userType: 'patient' }).sort({ createdAt: -1 });
        res.render('admin/patients', { patients });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).send('Error loading patients');
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.render('admin/notifications', { notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Error loading notifications');
    }
};

const sendNotification = async (req, res) => {
    try {
        const { title, message, target } = req.body;
        const newNotification = new Notification({ title, message, target });
        await newNotification.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('admin-notification', newNotification);
        }
        
        req.flash('success', 'Notification sent successfully!');
        res.redirect('/admin/notifications');
    } catch (error) {
        console.error('Error sending notification:', error);
        req.flash('error', 'Failed to send notification.');
        res.redirect('/admin/notifications');
    }
};

const getSettings = (req, res) => {
    res.render('admin/settings');
};

const updateSettings = async (req, res) => {
    const { adminPassword, newPassword, confirmPassword } = req.body;

    if (!adminPassword || !newPassword || !confirmPassword) {
        req.flash('error', 'Please fill all password fields.');
        return res.redirect('/admin/settings');
    }

    if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match.');
        return res.redirect('/admin/settings');
    }

    try {
        const admin = await Signupdetail.findById(req.session.adminId);
        const isMatch = await bcrypt.compare(adminPassword, admin.password);

        if (!isMatch) {
            req.flash('error', 'Incorrect current password.');
            return res.redirect('/admin/settings');
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        
        req.flash('success', 'Password updated successfully!');
        res.redirect('/admin/settings');
    } catch (error) {
        console.error('Error updating password:', error);
        req.flash('error', 'An error occurred while updating the password.');
        res.redirect('/admin/settings');
    }
};

const addDoctor = async (req, res) => {
  try {
    const doctorData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      title: req.body.title,
      specialty: req.body.specialty,
      contactInfo: {
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
      },
      qualifications: {
        medicalSchool: req.body.medicalSchool,
        degree: req.body.degree,
        licensureNumber: req.body.licensureNumber,
        certification: req.body.certification,
      },
      workInfo: {
        hospital: req.body.hospital,
        department: req.body.department,
        experience: req.body.experience,
      },
      availability: {
        days: req.body.days,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      },
      authentication_Information: {
        userName: req.body.userName,
        password: await bcrypt.hash(req.body.password , 10),
      },
    };
    await Doctor.create(doctorData);
    req.flash('success', 'Doctor added successfully!');
    res.redirect('/admin/doctors');
  } catch (err) {
    req.flash('error', 'Error adding doctor: ' + err.message);
    res.redirect('/admin/doctors/add');
  }
};

const editDoctorForm = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      req.flash('error', 'Doctor not found.');
      return res.redirect('/admin/doctors');
    }
    res.render('admin/add_doctor', { 
      doctor, 
      errorMessage: req.flash('error')[0] || null,
      successMessage: req.flash('success')[0] || null
    });
  } catch (err) {
    req.flash('error', 'Error loading doctor: ' + err.message);
    res.redirect('/admin/doctors');
  }
};

const editDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      req.flash('error', 'Doctor not found.');
      return res.redirect('/admin/doctors');
    }
    doctor.firstName = req.body.firstName;
    doctor.lastName = req.body.lastName;
    doctor.title = req.body.title;
    doctor.specialty = req.body.specialty;
    doctor.contactInfo.email = req.body.email;
    doctor.contactInfo.phoneNumber = req.body.phoneNumber;
    doctor.contactInfo.address = req.body.address;
    doctor.qualifications.medicalSchool = req.body.medicalSchool;
    doctor.qualifications.degree = req.body.degree;
    doctor.qualifications.licensureNumber = req.body.licensureNumber;
    doctor.qualifications.certification = req.body.certification;
    doctor.workInfo.hospital = req.body.hospital;
    doctor.workInfo.department = req.body.department;
    doctor.workInfo.experience = req.body.experience;
    doctor.availability.days = req.body.days;
    doctor.availability.startTime = req.body.startTime;
    doctor.availability.endTime = req.body.endTime;
    doctor.authentication_Information.userName = req.body.userName;
    if (req.body.password) {
      doctor.authentication_Information.password = req.body.password;
    }
    await doctor.save();
    req.flash('success', 'Doctor updated successfully!');
    res.redirect('/admin/doctors');
  } catch (err) {
    req.flash('error', 'Error updating doctor: ' + err.message);
    res.redirect(`/admin/doctors/edit/${req.params.id}`);
  }
};

const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.redirect('/admin/doctors');
  } catch (err) {
    req.flash('error', 'Error deleting doctor: ' + err.message);
    res.redirect('/admin/doctors');
  }
};

module.exports = {getDashboard,updateAppointment,getAppointments,
    getDoctors,
    getPatients,
    getNotifications,
    sendNotification,
    getSettings,
    updateSettings,
    addDoctor,
    editDoctorForm,
    editDoctor,
    deleteDoctor}