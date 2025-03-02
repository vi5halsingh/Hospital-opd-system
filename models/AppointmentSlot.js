// models/AppointmentSlot.js
const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  virtualMeetingLink: {
    type: String,
    default: null // Link to the virtual meeting room, generated upon booking
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  }
});

module.exports = mongoose.model('AppointmentSlot', appointmentSlotSchema);
