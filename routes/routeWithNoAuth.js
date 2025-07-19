const express = require('express')
const router = express.Router()
const Doctor = require('../models/doctorSchema');
const { AppointmentSchema } = require('../models/appintmentSchema');
const { Signupdetail } = require('../models/signupSchema');
const Review = require('../models/review');
const { ProfileImage } = require('../models/profileImageSchema');

router.get('/', async (req, res) => {
    try {
        // Fetch real data from database
        const [
            totalDoctors,
            totalPatients,
            totalAppointments,
            pendingAppointments,
            completedAppointments,
            featuredDoctors,
            recentReviews,
            specialtyStats
        ] = await Promise.all([
            // Total counts
            Doctor.countDocuments({ status: true }),
            Signupdetail.countDocuments({ userType: 'patient' }),
            AppointmentSchema.countDocuments(),
            AppointmentSchema.countDocuments({ status: 'new' }),
            AppointmentSchema.countDocuments({ status: 'completed' }),
            
            // Featured doctors (top 6 with most appointments)
            Doctor.aggregate([
                { $match: { status: true } },
                {
                    $lookup: {
                        from: 'appointments',
                        localField: '_id',
                        foreignField: 'doctor',
                        as: 'appointments'
                    }
                },
                {
                    $addFields: {
                        appointmentCount: { $size: '$appointments' }
                    }
                },
                { $sort: { appointmentCount: -1 } },
                { $limit: 6 }
            ]),
            
            // Recent reviews
            Review.find()
                .populate('createdBy', 'firstName lastName')
                .populate('doctorId', 'firstName lastName specialty')
                .sort({ createdAt: -1 })
                .limit(5),
            
            // Specialty statistics
            Doctor.aggregate([
                { $match: { status: true } },
                {
                    $group: {
                        _id: '$specialty',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 8 }
            ])
        ]);

        // Get profile images for featured doctors
        const featuredDoctorsWithImages = await Promise.all(
            featuredDoctors.map(async (doctor) => {
                const profileImage = await ProfileImage.findOne({ uploadedBy: doctor._id });
                const imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : null;
                return { ...doctor, imageUrl };
            })
        );

        // Get profile images for reviews
        const reviewsWithImages = await Promise.all(
            recentReviews.map(async (review) => {
                const profileImage = await ProfileImage.findOne({ uploadedBy: review.createdBy._id });
                const imageUrl = profileImage ? `/uploads/${profileImage.profileImage}` : null;
                return { ...review.toObject(), imageUrl };
            })
        );

        // Calculate success rate
        const successRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysAppointments = await AppointmentSchema.countDocuments({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Get top specialties
        const topSpecialties = specialtyStats.map(stat => stat._id);

        res.render('main-page/index', {
            // Statistics
            totalDoctors,
            totalPatients,
            totalAppointments,
            pendingAppointments,
            completedAppointments,
            todaysAppointments,
            successRate,
            
            // Featured content
            featuredDoctors: featuredDoctorsWithImages,
            recentReviews: reviewsWithImages,
            topSpecialties,
            
            // Categories (dynamic based on available specialties)
            categories: topSpecialties.length > 0 ? topSpecialties : [
                "Cardiologist", "Dermatologist", "Orthopedic Surgeon", "Pediatrician", 
                "Neurologist", "Gynecologist", "Psychiatrist", "Ophthalmologist", 
                "ENT Specialist", "Allergist", "Sexologist", "Dentist", "Oncologist", 
                "Gastroenterologist", "Endocrinologist", "Rheumatologist", "Urologist", 
                "Surgeon", "General Physician"
            ]
        });
    } catch (error) {
        console.error('Error fetching home page data:', error);
        // Fallback to static data if there's an error
        res.render('main-page/index', {
            totalDoctors: 0,
            totalPatients: 0,
            totalAppointments: 0,
            pendingAppointments: 0,
            completedAppointments: 0,
            todaysAppointments: 0,
            successRate: 0,
            featuredDoctors: [],
            recentReviews: [],
            topSpecialties: [],
            categories: [
                "Cardiologist", "Dermatologist", "Orthopedic Surgeon", "Pediatrician", 
                "Neurologist", "Gynecologist", "Psychiatrist", "Ophthalmologist", 
                "ENT Specialist", "Allergist", "Sexologist", "Dentist", "Oncologist", 
                "Gastroenterologist", "Endocrinologist", "Rheumatologist", "Urologist", 
                "Surgeon", "General Physician"
            ]
        });
    }
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/otp-varification', (req, res) => {
    const email = req.query.email; // Retrieve the email from query parameters
// console.log("email", email)
    // Check if email is provided in the query
    if (!email) {
        req.flash('error', 'Email is missing. Please try again.');
        return res.redirect('/signup'); // Redirect back if email is not provided
    }

    // Render the page and pass the email to the template
    res.render('otp_verification', { email });
});

router.get('/forget-patient-password',(req, res) =>{
res.render('forget_pw')
})

router.get('/login/patient', (req, res) => {
    res.render("login")
});

router.get('/login/doctor', (req, res) => {
    res.render("doctor-dashboard/doctorLogin")
});

router.get('/comming-soon', (req, res) => {
    res.status(404).render('ComingSoon');
});

router.get('/error', (req, res) => {
    res.status(404).render('error');
});

router.all('*',(req,res)=>{
    res.status(404).redirect('/error')
})

module.exports = router ;