const express = require("express");
const router = express.Router();
const { restrictTo, checkForAuthentication, doctorAuthentication } = require("../middleware/auth");
const { AppointmentSchema } = require("../models/appintmentSchema");
const { Signupdetail } = require("../models/signupSchema");
const Doctor = require("../models/doctorSchema");
const { ProfileImage } = require("../models/profileImageSchema");
const { getAppointments } = require("../controller/appointment");
const { QueueStatus, getPatientAppointmentDetails } = require("../controller/UserRoutes");
const { populate } = require("../models/review");
const Review = require("../models/review");
const Staff = require("../models/addStaff");

async function renderDashboard(req, res, template, additionalData = {}) {
  const user = req.user || req.doctor;

  if (!user || !user._id) {
    return res.redirect("/");
  }

  try {
    const profileImage = await ProfileImage.findOne({ uploadedBy: user._id });
    const imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : null;
    res.render(template, { user, imageUrl, ...additionalData });
  } catch (error) {
    console.error("Error in multer:", error);
  }
}

router.get("/patient", checkForAuthentication, restrictTo(["staff", "patient", "admin"]), async (req, res) => {
  const allAppointments = await AppointmentSchema.find({ createdBy: req.user._id });
  renderDashboard(req, res, "user-dashboard/index1", { allAppointments });
});

router.get("/profile-picture", checkForAuthentication, restrictTo(["staff", "patient", "admin"]), (req, res) => {
  renderDashboard(req, res, "user-dashboard/profilePicture");
});

router.get("/appointment-booking", checkForAuthentication, restrictTo(["staff", "patient", "admin"]), async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const allAppointments = await AppointmentSchema.find({ createdBy: req.user._id, status: "new" });
    renderDashboard(req, res, "user-dashboard/index2", { allAppointments, doctors });
  } catch (error) {
    console.error("Error fetching appointments or doctors:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/Medical-Records", checkForAuthentication, restrictTo(["staff", "patient", "admin"]), async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const allAppointments = await AppointmentSchema.find({ createdBy: req.user._id });
    renderDashboard(req, res, "user-dashboard/index7", { allAppointments, doctors });
  } catch (error) {
    console.error("Error fetching appointments or doctors:", error);
    res.status(500).send("Server Error");
  }
});

const userRoutes = [
  { path: "/Doctor-Interaction", template: "user-dashboard/index3" },
  { path: "/Notifications", template: "user-dashboard/index6" },
  { path: "/Settings", template: "user-dashboard/index8" }
];

userRoutes.forEach(route => {
  router.get(route.path, checkForAuthentication, restrictTo(["staff", "patient", "admin"]), async (req, res) => {
    if (route.path === "/Doctor-Interaction") {
      try {
        const doctors = await Doctor.find({});
        renderDashboard(req, res, route.template, { doctors });
      } catch (err) {
        res.status(500).json({ message: 'Server error, unable to fetch doctors' });
      }
    } else {
      renderDashboard(req, res, route.template);
    }
  });
});

router.get("/Queue-Status", checkForAuthentication, async (req, res) => {
  try {
    const patient = req.user;
    if (!patient) {
      req.flash("error", "You are not logged in. Please login first.");
      return res.redirect("/login/patient");
    }

    const patientId = req.user._id;
    if (!patientId) {
      req.flash("error", "You are not logged in. Please login first.");
      return res.redirect("/login/patient");
    }

    const appointments = await AppointmentSchema.find({
      createdBy: patientId,
      status: "new",
    });
    const appointforPandD = await Promise.all(
      appointments.map(async (appoint) => {
        const doctorID = appoint.doctor;
        const appointfordoctor = await AppointmentSchema.find({
          doctor: doctorID,
          status: "new",
        });
        return { appoint, appointfordoctor };
      })
    );

    renderDashboard(req, res, "user-dashboard/index4", {
      patient,
      appointments,
      appointforPandD,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/staff", doctorAuthentication, restrictTo(["doctor", "staff", "admin"]), async (req, res) => {
  try {
    const doctor = await req.doctor;
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }

    const doctorId = doctor._id;
    const allAppointments = await AppointmentSchema.find({ doctor: doctorId });
    const newAppoint = allAppointments.filter(appointment =>
      appointment.status === "new"
    );
    const reviews = await Review.find({ doctorId }).populate("createdBy");
    const reviewInfo = await Promise.all(reviews.map(async (review) => {
      const IdForImage = review.createdBy._id;
      if (!IdForImage) {
        res.redirect("/login/patient");
      }

      const profileImage = await ProfileImage.findOne({ uploadedBy: IdForImage });
      const review_imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : null;
      return { review_imageUrl, review };
    }));

    renderDashboard(req, res, "doctor-dashboard/admin", { allAppointments, doctor, newAppoint, reviewInfo });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/New-Appointments", doctorAuthentication, restrictTo(["doctor", "staff", "admin"]), async (req, res) => {
  try {
    const doctor = await req.doctor;
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }

    const doctorId = doctor._id;
    const allAppointments = await AppointmentSchema.find({
      doctor: doctorId,
      status: "new",
    });

    renderDashboard(req, res, "doctor-dashboard/newAppointments", { allAppointments, doctor }, doctorAuthentication, getAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/patient-record", doctorAuthentication, restrictTo(["doctor", "staff", "admin"]), async (req, res) => {
  try {
    const doctor = await req.doctor;
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }

    const doctorId = doctor._id;
    const allAppointments = await AppointmentSchema.find({ doctor: doctorId }).sort({ updatedAt: -1 });
    const newAppoint = allAppointments.filter(appointment =>
      appointment.status === "new"
    );
    renderDashboard(req, res, "doctor-dashboard/patientRecord", { allAppointments, doctor, newAppoint }, doctorAuthentication, getAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Server Error");
  }
});

router.get('/patient-appointment-details/:appointmentId', doctorAuthentication, restrictTo(["doctor", "staff"]), getPatientAppointmentDetails);

router.get("/doctor/add-staff", doctorAuthentication, restrictTo(["doctor", "staff", "admin"]), async (req, res) => {
  try {
    const doctor = req.doctor;
    if (!doctor) {
      return res.redirect("/login/doctor");
    }

    const staffMembers = await Staff.find({ doctorId: doctor._id })
      .populate("UserId", "firstName lastName phoneNumber");

    const staffList = staffMembers.map(staff => ({
      _id: staff._id,
      name: `${staff.UserId.firstName} ${staff.UserId.lastName}`,
      mobile: staff.UserId.phoneNumber,
      post: staff.post || "Staff",
      status: staff.status
    }));

    res.render("doctor-dashboard/addStaff", {
      doctor,
      staffList
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
