const bcrypt = require('bcrypt');
const { Signupdetail } = require('../models/signupSchema');
const Doctor = require('../models/doctorSchema');
const { setuser , setdoctor } = require('../services/auth');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Try port 587 if this doesn't work
  secure: true, // Use SSL for port 465; change to false for port 587
  auth: {
    user: process.env.EMAIL,
    pass:process.env.PASSWD, // Replace with your Gmail App Password
  },
  connectionTimeout: 100000,
  logger: true,
  debug: true,
  tls: {
    family: 4,
  },
});

const crypto = require('crypto'); // For secure OTP generation
const { Console } = require('console');

async function handleSignup(req, res) {
    const { firstName, lastName, email, password, phoneNumber, dob, address, category } = req.body;
    
    const existingUser = await Signupdetail.findOne({ phoneNumber });
    if (existingUser) {
      
        req.flash('error', 'You are signed up. Please go to login.');
        return res.redirect('/login/patient');
    }

    if (!firstName || !lastName || !email || !password || !phoneNumber || !category) {
        req.flash('error', 'Feel free to fill all fields.');
        return res.redirect('/signup');
    }

    if (category === "select") {
        req.flash('error', 'Please select your category.');
        return res.redirect('/signup');
    }

    const saltRounds = 10;
    const edPassword = await bcrypt.hash(password, saltRounds);

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);
    const hashedOtp = await bcrypt.hash(String(otp), saltRounds);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    try {
        
        const mailOptions = {
            from: '"H-Medico" <vishalsinghrendom@gmail.com>',
            to: email,
            subject: "OTP Verification for Signup",
            html: `
            <h2>Welcome ${firstName}!</h2>
            <p><strong>${otp}</strong> : is Your OTP for verification </p>
            <p>This OTP is valid for 10 minutes.</p>
            `,
        };
        const newUser = await Signupdetail.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            dob,
            address,
            category,
            otp: hashedOtp,
            otpExpires,
        });

        transporter.sendMail(mailOptions,async (error, info) => {
            if (error) {
                console.error("Error sending OTP email:", error);
                req.flash('error', 'Signup successful ! go to login');
                return  res.redirect('/login/patient');
            } else {
                // console.log("OTP email sent successfully:", info.response);
                req.flash('success', 'Signup successful! Check your email for OTP verification.');
                return res.redirect(`/otp-varification?email=${encodeURIComponent(email)}`);
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        req.flash('error', 'There are some issues, please try again.');
        return res.redirect('/signup');
    }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  let user = await Signupdetail.findOne({ email });
  if (!user) {
    user = await Doctor.findOne({ email });
  }

  if (!user) {
    req.flash('error', 'Invalid email or user does not exist.');
    return res.redirect('/otp-varification');
  }

  if (Date.now() > user.otpExpires) {
    req.flash('error', 'OTP has expired. Please request a new one.');
    return res.redirect('/otp-varification');
  }

  const isOtpValid = await bcrypt.compare(String(otp), user.otp);
  if (!isOtpValid) {
    req.flash('error', 'Invalid OTP. Please try again.');
    return res.redirect('/otp-varification');
  }

  // OTP is valid; mark user as verified
  user.otp = undefined;
  user.otpExpires = undefined;
  user.isVerified = true; // Mark as verified
  await user.save();

  req.flash('success', 'Account verified successfully! You can now log in.');
  return res.redirect('/login/patient');
}

  


async function handleLogin(req, res, next) {
    try {
        const { phoneNumber, password } = req.body;

        const user = await Signupdetail.findOne({ phoneNumber });
        if (!user) {
            req.flash('error', 'You are not signed up. Please go to signup.');
            return res.redirect('/login/patient');
        } 
      

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            req.flash('error', 'Password or mobile number is incorrect.');
            return res.redirect('/login/patient');
        }
        const token = setuser(user);
        res.cookie("token", token, { httpOnly: true });

        
        if (user.userType === 'patient') {
             return res.redirect('/api/patient'); 
        } else {
            req.flash('error', 'Invalid user type.');
            return res.redirect('/login/patient');
        }
    } catch (error) {
        console.error('Error handling login:', error);
        req.flash('error', 'Internal server error.');
        return res.redirect('/login/patient');
    }
}


async function doctorLogin(req, res) {
    try {
        const { phoneNumber, password } = req.body;

        const trimmedPhoneNumber = phoneNumber.trim();

        // console.log('Searching for phone number:', trimmedPhoneNumber);
        
        const doctor = await Doctor.findOne({ "contactInfo.phoneNumber": phoneNumber });
        if (!doctor) {
            
            req.flash('error', 'Check your Mobile No. Or Contact With us ');
            return res.redirect('/login/doctor');
        }
       
        
        const passwordMatch = await bcrypt.compare(password, doctor.authentication_Information.password);
        if (!passwordMatch) {
            req.flash('error', ' think again and Give the Right Password Please');
            return res.redirect('/login/doctor');
        }
       
        const token = setdoctor(doctor);
        res.cookie("token", token);
        if (doctor.userType === "doctor") {
            return res.redirect('/api/staff');
        } else {
            req.flash('error', ' I think u have chosen wrong usertype by mistake');
            return res.redirect('/login/doctor');
        }
    } catch (error) {
        console.error('Error handling login:', error);
       
        req.flash('error', 'There are some issue! please try again');
        return res.redirect('/login/doctor');
    }
}

// Update user information
 async function updateUserInfo (req, res) {
  try {
    const userId = req.user._id; // Assuming `req.user` contains authenticated user data
    const updatedData = req.body;
// console.log("Id is", userId , "data is "+ updatedData.firstName)
    const updatedUser = await Signupdetail.findByIdAndUpdate(userId, updatedData, { new: true });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Failed to update user data.' });
  }
};

 async function changePassword (req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id; // Assuming `req.user` contains authenticated user data
    const user = await Signupdetail.findById(userId);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword , user.password); // Assuming a `comparePassword` method in your User model
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match.' });
const saltRounds = 10;
    const hashPw = await bcrypt.hash(newPassword,saltRounds);
    user.password = hashPw;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

async function forget_pw(req, res) {
  try {
    const email = req.body.email;

    // Validate email
    if (!email || email.trim() === "") {
      req.flash("error", "Please enter your email.");
      return res.redirect("/forget-patient-password"); // Redirect to forgot-password page
    }
// Console.log(email)
    // Prepare email options
    const mailOptions = {
      from: '"H-Medico" <vishalsinghrendom@gmail.com>', // Fix the format
      to: email, // Ensure email is valid and not undefined
      subject: "Reset Password",
      html: `
        <p>Click <a href="http://localhost:3000/forget-patient-password">here</a> to reset your password.</p>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        req.flash("error", "Something went wrong. Please try again later.");
        return res.redirect("/forget-patient-password");
      } else {
        // console.log("Email sent successfully:", info.response);
        req.flash("success", "A reset link has been sent to your email.");
        return res.redirect("/login"); // Redirect to login page or another appropriate page
      }
    });
  } catch (error) {
    console.error("Error in forget_pw function:", error);
    req.flash("error", "An unexpected error occurred. Please try again later.");
    return res.redirect("/forget-patient-password"); // Redirect to forgot-password page
  }
}





module.exports = { handleSignup, handleLogin  , doctorLogin ,updateUserInfo, changePassword, verifyOtp , forget_pw};
