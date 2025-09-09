const mongoose = require('mongoose');

const AppointSchema = new mongoose.Schema({
    reason: { type: String, required: true },
    mobile: { type: Number, required: true },
    fullname: { type: String, required: true },
    drName: { type: String, required: true },
    age: { type: Number },
    date: { type: String },
    gender: { type: String },
    address: { type: String },
    status: {
        type: String,
        enum: ['new', 'accepted', 'declined', 'waitlisted'],
        default: 'new'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "signupdetails", 
        
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required:true,
    },
});

const AppointmentSchema = mongoose.model("Appointments", AppointSchema);
module.exports = { AppointmentSchema };
