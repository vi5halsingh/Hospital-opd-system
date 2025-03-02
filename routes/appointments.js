const AppointmentSlot = require('../models/AppointmentSlot');

// POST route to create a new appointment slot (accessible to authenticated doctors)
router.post('/create-slot', async (req, res) => {
  try {
    const { date, time } = req.body;
    const doctorId = req.user._id; // Assuming req.user is populated for authenticated doctors

    const slot = new AppointmentSlot({
      doctor: doctorId,
      date,
      time
    });

    await slot.save();
    res.status(201).send({ message: "Appointment slot created successfully." });
  } catch (error) {
    console.error("Error creating appointment slot:", error);
    res.status(500).send("An error occurred while creating the appointment slot.");
  }
});

// routes/appointments.js

// GET route to fetch available appointment slots
router.get('/available-slots', async (req, res) => {
    const slots = await AppointmentSlot.find({ isBooked: false }).populate('doctor', 'firstName lastName');
    res.json(slots.map(slot => ({
      _id: slot._id,
      doctorName: `${slot.doctor.firstName} ${slot.doctor.lastName}`,
      date: slot.date,
      time: slot.time
    })));
  });
  
  // POST route to book an appointment slot
  router.post('/book-slot/:id', async (req, res) => {
    try {
      const slot = await AppointmentSlot.findById(req.params.id);
      if (!slot || slot.isBooked) {
        return res.status(400).send("Slot is no longer available.");
      }
  
      // Generate virtual meeting link here
      slot.virtualMeetingLink = `https://virtualmeeting.com/room/${slot._id}`;
      slot.isBooked = true;
      slot.bookedBy = req.user._id; // Assuming req.user is populated for authenticated patients
  
      await slot.save();
      res.send({ message: "Appointment booked successfully.", meetingLink: slot.virtualMeetingLink });
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).send("An error occurred while booking the appointment.");
    }
  });
  

module.exports = router;