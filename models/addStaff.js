const mongoose = require('mongoose');

const addStaffSchema = new mongoose.Schema({
    mobileNumber: {
        type: Number,
        required: true,
        unique: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'signupdetails',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: true
    },
   
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

// Export the model directly
const Staff = mongoose.model('Staff', addStaffSchema);
module.exports = Staff;
