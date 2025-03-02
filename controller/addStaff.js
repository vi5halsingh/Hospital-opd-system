// controller/addStaff.js
const Staff = require('../models/addStaff');
const { Signupdetail } = require('../models/signupSchema');
const nodemailer = require('nodemailer');

// Use the same transporter configuration as in credential.js
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWD,
  },
  connectionTimeout: 100000,
  logger: true,
  debug: true,
  tls: {
    family: 4,
  }
});

async function addStaff(req, res) {
  try {
    const { mobileNumber } = req.body;
    const doctor = req.doctor;

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if staff exists
    const existingStaff = await Staff.findOne({ 
      mobileNumber, 
      doctorId: doctor._id 
    });

    if (existingStaff) {
      return res.status(400).json({ 
        error: 'This number is already in your staff.' 
      });
    }

    // Check if user exists
    const existingUser = await Signupdetail.findOne({ 
      phoneNumber: mobileNumber 
    });

    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found. Please ask them to sign up first.' 
      });
    }

    // Create staff member
    const newStaff = new Staff({
      mobileNumber,
      UserId: existingUser._id,
      doctorId: doctor._id,
    });

    await newStaff.save();

    // Update user type
    existingUser.userType = 'staff';
    await existingUser.save();

    // Simple email notification
    const mailOptions = {
      from: process.env.EMAIL,
      to: existingUser.email,
      subject: 'Staff Addition Confirmation',
      text: `Hello ${existingUser.firstName},

You have been added as staff by Dr. ${doctor.firstName} ${doctor.lastName}.

Best regards,
Hospital Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });

    return res.status(200).json({
      message: "Staff member added successfully",
      staff: {
        _id: newStaff._id,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
        mobile: mobileNumber,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error adding staff:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function removeStaff(req, res) {
  try {
    const { id } = req.params; // staff id
    const doctor = req.doctor;
    const doctorId = doctor._id;
    
    // Find the staff member to ensure they belong to the doctor
    const staffMember = await Staff.findOne({ _id: id, doctorId });
    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Remove the staff record
    await Staff.deleteOne({ _id: id });

    // Update the associated user's userType (for example, revert to "patient")
    const existingUser = await Signupdetail.findById(staffMember.UserId);
    if (existingUser) {
      existingUser.userType = 'patient';
      await existingUser.save();

      // Send email notification to the user that they have been removed
      const mailOptions = {
        from: process.env.EMAIL,
        to: existingUser.email,
        subject: 'Removed from Staff',
        text: `Hello ${existingUser.firstName},

You have been removed as a staff member from ${doctor.hospital} by Dr. ${doctor.firstName} ${doctor.lastName}.
If you have any questions, please contact the hospital administration.

Best regards,
${doctor.hospital}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending removal email:", error);
        } else {
          console.log("Staff removal email sent: " + info.response);
        }
      });
    }

    return res.status(200).json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Error removing staff:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { addStaff, removeStaff };