const { AppointmentSchema } = require('../models/appintmentSchema');
const { ProfileImage } = require('../models/profileImageSchema');
const Doctor = require('../models/doctorSchema'); 
const { checkForAuthentication } = require("../middleware/auth");
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const io  = require("../server"); // Import Socket.IO instance
async function setAppointment(req, res) {
    const { reason, mobile, fullname, age, date, gender, address, doctorId } = req.body;

    try {
        if (!req.user || !req.user._id) {
            return res.redirect(`/api/appointment-booking?errorMessage=Unauthorized: User not authenticated`);
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.redirect(`/api/appointment-booking?errorMessage=Invalid doctor selected.`);
        }

        const drName = `${doctor.title} ${doctor.firstName} ${doctor.lastName}`;
        const checkExistingAppointment = await AppointmentSchema.findOne({
            mobile: mobile,
            drName: drName,
            status: "new",
        });

        if (checkExistingAppointment) {
            return res.redirect(`/api/appointment-booking?errorMessage=You already have an uncheck appointment for this Doctor`);
        }

        const newAppointment = await AppointmentSchema.create({
            reason,
            mobile,
            fullname,
            drName,
            age,
            date,
            gender,
            address,
            createdBy: req.user._id,
            doctor: doctorId,
            status: "new",
        });

        // Get io instance from app
        const io = req.app.get('io');
        
        // Emit the event only if io exists
        if (io) {
            io.emit('new-appointment', {
                appointment: newAppointment,
                doctorId: doctorId
            });

            // Also emit to specific doctor's channel
            io.emit(`doctor-${doctorId}`, {
                message: 'New appointment booked',
                newAppointment: newAppointment
            });
        }

        res.redirect(`/api/appointment-booking?successMessage=Successfully appointed! Thank you.`);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.redirect(`/api/appointment-booking?errorMessage=An error occurred while booking the appointment.`);
    }
}



async function updateAppointmentStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
        let appointment = await AppointmentSchema.findById(id);
        
        if (appointment) {
            appointment.status = status;
            await appointment.save();
            console.log(`Appointment ${id} updated with status: ${status}`);
            if (status !== 'new') {
                return res.status(200).json({ success: true, message: 'Status updated and moved to patient records' });
            } else {
                return res.status(200).json({ success: true, message: 'Status updated' });
            }
        } else {
         
            console.log(`Appointment with ID ${id} not found`);
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
    } catch (error) {

        console.error('Error updating appointment status:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
// Example: Fetching and displaying appointments (e.g., in your controller)
async function getAppointments(req, res) {
    try {
        const appointments = await AppointmentSchema.find({ doctor: req.user._id });
        res.render('newAppointments', { allAppointments: appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments.' });
    }
}


module.exports = {
  setAppointment,updateAppointmentStatus,getAppointments,
};
