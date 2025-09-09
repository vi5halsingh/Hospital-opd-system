const { AppointmentSchema } = require('../models/appintmentSchema');
const { ProfileImage } = require('../models/profileImageSchema');

async function QueueStatus(req, res){
    try {
        const doctorId = req.user._id;
        const newAppointments = await AppointmentSchema.find({
            doctor: doctorId,
            status: { $in: ['new', 'waitlisted', 'accepted'] }
        }).sort({ createdAt: -1 });

        res.json(newAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

async function getPatientAppointmentDetails(req, res) {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.doctor._id;

        const appointment = await AppointmentSchema.findById(appointmentId).populate('createdBy');
        if (!appointment) {
            return res.status(404).send("Appointment not found");
        }
        
        const patient = appointment.createdBy;
        if (!patient) {
            return res.status(404).send("Patient not found for this appointment");
        }

        const profileImage = await ProfileImage.findOne({ uploadedBy: patient._id });
        const imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : '/main page/asset/defalut user.jpg';

        const totalVisits = await AppointmentSchema.countDocuments({
            createdBy: patient._id,
            doctor: doctorId
        });

        const lastAppointment = await AppointmentSchema.findOne({
            createdBy: patient._id,
            doctor: doctorId,
            _id: { $ne: appointmentId }
        }).sort({ date: -1 });

        const lastVisitDate = lastAppointment ? new Date(lastAppointment.date).toLocaleDateString() : 'This is the first visit.';
        
        res.render('doctor-dashboard/patient-appointment-detail', {
            doctor: req.doctor,
            appointment,
            patient,
            imageUrl,
            totalVisits,
            lastVisitDate
        });

    } catch (error) {
        console.error('Error fetching patient appointment details:', error);
        res.status(500).send('Server Error');
    }
}

module.exports ={ QueueStatus, getPatientAppointmentDetails}
