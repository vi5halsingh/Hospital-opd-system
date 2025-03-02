

// Assuming you're using a controller or route handler to get appointments
 async function QueueStatus(req, res){
    try {
        const doctorId = req.user._id; // Assuming the logged-in doctor is stored in req.user
        const newAppointments = await Appointment.find({
            doctor: doctorId,
            status: { $in: ['new', 'waitlisted', 'accepted'] } // Filter by relevant statuses
        }).sort({ createdAt: -1 }); // Sort by latest appointments

        res.json(newAppointments); // Send the appointments to the frontend
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
module.exports ={ QueueStatus}
