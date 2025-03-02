const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {return res.render('main-page/index')})

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

// router.all('*',(req,res)=>{
//     res.status(404).redirect('/error')
// })

module.exports = router ;