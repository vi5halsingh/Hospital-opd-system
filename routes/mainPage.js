const Express = require("express");
const router = Express.Router();
const Doctor = require('../models/doctorSchema');
const Review = require('../models/review');
const { ProfileImage } = require("../models/profileImageSchema");
const { checkForAuthentication } = require("../middleware/auth");
const { Signupdetail } = require("../models/signupSchema");

router.get("/nearest-doctors", async (req, res) => {
  try {

    const doctors = await Doctor.find({});
    // console.log("doctors:",doctors)

    if (!doctors || doctors.length === 0) {
      return res.status(404).send("Doctors not found");
    }

    const doctorData = await Promise.all(doctors.map(async (doctor) => {
      const profileImage = await ProfileImage.findOne({ uploadedBy: doctor._id });
      const imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : null;

      return { doctor, imageUrl };
    }
    ));
    res.render("main-page/Doctors", { doctorData });
  } catch (error) {
    console.error("Error fetching doctors or profile images:", error);
    res.status(500).send("Server Error");
  }
});


router.post('/reviews/:doctorId',checkForAuthentication, async (req, res) => {
  console.log("req.user:",req.user)
  await Review.create({
    content: req.body.content,    
    doctorId: req.params.doctorId,
    createdBy: req.user._id
  })
    req.flash('error', 'There are some issue pleas try again');
  return res.status(200).redirect(`/doctor-details/${req.params.doctorId}`)
})

router.get('/doctor-details/:id', async (req, res) => {

  const doctorId = req.params.id;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      const profileImage = await ProfileImage.findOne({ uploadedBy: doctorId });
      const image = profileImage ? `/uploads/${profileImage.profileImage}` : null;
      

      const reviews = await Review.find({ doctorId }).populate("createdBy");
      const reviewInfo = await Promise.all(reviews.map(async (review) => {
        const IdForImage = review.createdBy._id;
        if(!IdForImage){
          res.redirect('/login/patient')
        }
       
        const profileImage = await ProfileImage.findOne({ uploadedBy:IdForImage });
        const review_imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : null;
       
        return { review_imageUrl ,review};
      }
    ));
      res.render('partials/doctor-detail', { doctor, image, reviews ,reviewInfo});
    } else {
      res.status(404).send('Doctor not found');
    }
  } catch (error) {
    res.json('Server Error');
    console.log("Error:", error);
  }
});


const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/specialty/:specialty', async (req, res) => {
  const { specialty } = req.params;
  try {
   const Specialty = specialty.toLowerCase()
    const doctors = await Doctor.find({ specialty:Specialty });

    // Fetch doctor and image data concurrently
    const data = await Promise.all(
      doctors.map(async (doctor) => {
        const image = await ProfileImage.findOne({ uploadedBy: doctor._id });
        const imageUrl = image ? `/uploads/${image.profileImage}` : null;
        return {doctor , imageUrl};
      })
    );
  

    res.render('main-page/doctorsBySpecialty', { specialty, data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
