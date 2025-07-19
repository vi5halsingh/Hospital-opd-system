const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_Secret;

function setuser(user) {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        address: user.address,
        userType: user.userType,
        category: user.category,
    }, secret,);
}

// Function to verify the token and retrieve the user data
function getuser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("Error while authenticating:", error);
        return null;
    }
}


function setdoctor(doctor) {
    return jwt.sign({
        _id: doctor._id,
        email: doctor.contactInfo.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        phoneNumber: doctor.contactInfo.phoneNumber,
        userType: doctor.userType,
        specialty: doctor.specialty,
        address: doctor.contactInfo.address,
        medicalSchool: doctor.qualifications.medicalSchool,
        degree: doctor.qualifications.degree,
        hospital: doctor.workInfo.hospital,
        department: doctor.workInfo.department,
        experience: doctor.workInfo.experience,
        days: doctor.availability.days,
        startTime: doctor.availability.startTime,
        endTime: doctor.availability.endTime,
        days: doctor.availability.days,
        }, secret, { expiresIn: '2h' });
}
module.exports = { setuser, getuser , setdoctor };
