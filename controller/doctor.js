const Doctor = require("../models/doctorSchema");
const bcrypt = require("bcrypt");

async function addDoctors(req, res) {
  try {
    const { 
      firstName, 
      lastName, 
      title, 
      specialty, 
      email, 
      phoneNumber, 
      address, 
      medicalSchool, 
      degree, 
      licensureNumber, 
      certification, 
      hospital, 
      department, 
      experience, 
      days, 
      startTime, 
      endTime, 
      userName, 
      password 
    } = req.body;

    // Validate required fields
    if (
      !firstName || 
      !lastName || 
      !title || 
      !specialty || 
      !email || 
      !phoneNumber || 
      !licensureNumber || 
      !certification || 
      !userName || 
      !password
    ) {
      req.flash("error", "Please fill in all the required fields.");
      return res.status(400).send("All required fields must be filled.");
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      $or: [{ "contactInfo.phoneNumber": phoneNumber }, { "qualifications.licensureNumber": licensureNumber }],
    });

    if (existingDoctor) {
      req.flash("error", "This doctor already exists.");
      return res.status(400).redirect("admin/add-doctor");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new doctor instance
    const newDoctor = new Doctor({
      firstName,
      lastName,
      title,
      specialty,
      contactInfo: {
        email,
        phoneNumber,
        address,
      },
      qualifications: {
        medicalSchool,
        degree,
        licensureNumber,
        certification,
      },
      workInfo: {
        hospital,
        department,
        experience,
      },
      availability: {
        days,
        startTime,
        endTime,
      },
      authentication_Information: {
        userName,
        password: hashedPassword,
      },
    });

    // Save the new doctor to the database
    await newDoctor.save();
    req.flash("sucess","Doctor saved successfully.");
  } catch (error) {
    console.error("Error saving doctor:", error.message);
    res.status(500).send(`Error saving doctor: ${error.message}`);
  }
}

module.exports = { addDoctors };
