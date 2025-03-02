const express = require('express');
const router = express.Router();
const { checkForAuthentication , doctorAuthentication} = require('../middleware/auth')
const { handleSignup ,handleLogin, doctorLogin , updateUserInfo, changePassword, verifyOtp, forget_pw} = require('../controller/credential');
const { setAppointment, updateAppointmentStatus } = require('../controller/appointment');
const { uploadFile } = require('../controller/profileImage');
const { addDoctors } = require('../controller/doctor');
const {AppointmentSchema} = require('../models/appintmentSchema')
const { generateAppointmentPdf } = require('../controller/appointment')
const Doctor = require('../models/doctorSchema'); 
const {addStaff, removeStaff} = require('../controller/addStaff');
const Staff = require('../models/addStaff');
const Signupdetail = require('../models/signupSchema');

router.use(express.urlencoded({ extended: true }));

router.post('/signup', handleSignup);
router.post('/logout', (req, res) => {
    res.clearCookie('token');  // Removes the cookie
    res.redirect('/');             // Redirect to the login page
  });
router.post('/verify-otp', verifyOtp);
router.post('/forget-password', forget_pw);
router.post('/login/patient', handleLogin);

router.post('/login/doctor',doctorLogin);
router.post('/appointments/:id/updateStatus', doctorAuthentication, async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await AppointmentSchema.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Get io instance and emit update
        const io = req.app.get('io');
        if (io) {
            io.emit('status-update', {
                appointmentId: appointment._id,
                status: appointment.status,
                doctorId: appointment.doctor.toString()
            });
        }

        res.json({ 
            success: true, 
            message: 'Status updated successfully',
            appointment 
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/appointment-booking',checkForAuthentication,setAppointment);
router.post('/profile-picture',checkForAuthentication ,uploadFile)
router.post('/add-doctor',checkForAuthentication ,addDoctors)
router.post('/join-as-staff', checkForAuthentication, async(req, res) =>{
const license = req.body.license
const doctor = await Doctor.findOne({license: license})
if(!doctor) return res.send("doctor Couldn't find")

});

router.put('/patiet/change-password',checkForAuthentication,changePassword)
router.put('/patiet/Update-user-information',checkForAuthentication,updateUserInfo)

router.delete('/appointment/delete/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const deleteAppointment = await AppointmentSchema.findOneAndDelete({ _id: appointmentId });

    if (!deleteAppointment) {
      return res.status(404).json({ message: "No appointment found for this ID" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("Error in deleting appointment:", error);
    res.status(500).json({ message: "Error deleting appointment" });
  }
});
router.post('/add-staff', doctorAuthentication, addStaff);

router.post('/update-staff-status', doctorAuthentication, async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const staff = await Staff.findOne({ mobileNumber });
        
        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        
        // Toggle status
        staff.status = staff.status === 'active' ? 'inactive' : 'active';
        await staff.save();
        
        res.json({ status: staff.status });
    } catch (error) {
        console.error('Error updating staff status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/staff-details/:id', doctorAuthentication, async (req, res) => {
    try {
        const staffId = req.params.id;
        const doctorId = req.doctor._id;
        
        const staffMember = await Staff.findOne({ 
            _id: staffId,
            doctorId: doctorId 
        }).populate('UserId');
        
        if (!staffMember) {
            return res.status(404).send('Staff member not found');
        }
        
        res.render('doctor-dashboard/staff-detail', { 
            doctor: req.doctor,
            staff: staffMember
        });
    } catch (error) {
        console.error('Error fetching staff details:', error);
        res.status(500).send('Server Error');
    }
});

router.post('/remove-staff/:id', doctorAuthentication, async (req, res) => {
    try {
        const staffId = req.params.id;
        const staff = await Staff.findById(staffId).populate('UserId');
        
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        
        // Update user type back to patient
        await Signupdetail.findByIdAndUpdate(staff.UserId._id, {
            userType: 'patient'
        });
        
        // Remove staff record
        await Staff.findByIdAndDelete(staffId);
        
        res.json({ message: 'Staff removed successfully' });
    } catch (error) {
        console.error('Error removing staff:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/staff-details/:id', doctorAuthentication, removeStaff);

module.exports = router;
