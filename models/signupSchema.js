
const mongoose = require("mongoose");
const express = require('express');

const SignupSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required:true},
    phoneNumber: { type: Number, required: true,unique:true},
    dob: { type: String, required: true},
    address: { type: String, required: true},
    category: { type: String, required: true },
    userType: { type: String, default:"patient" },
    otp: String,
    otpExpires: Date,
    isVerified: {
        type: Boolean,
        default: false, // Default to false
      },
});

// function isValidEmail(email) {
//     // Basic email format validation
//     const re = /\S+@\S+\.\S+/;
//     return re.test(email);
// }


 const Signupdetail = mongoose.model("signupdetails" , SignupSchema)
 module.exports = { Signupdetail };
 