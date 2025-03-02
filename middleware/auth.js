const { getuser } = require('../services/auth');

function checkForAuthentication(req, res, next) {
    const tokenCookie = req.cookies?.token;
    req.user = null;
    if (!tokenCookie) return next()
    const token = tokenCookie;
    const user = getuser(token);
    req.user = user;
    // console.log("req.user from midd:",req.user)
    return next();
}

function doctorAuthentication(req, res, next) {
    const tokenCookie = req.cookies?.token;
    req.doctor = null;
    if (!tokenCookie) return next()
    const token = tokenCookie;
    const doctor = getuser(token);
    req.doctor = doctor;
    // console.log("req.doctor from midd:",req.doctor)
    return next();

} 

function restrictTo(roles = []) {
    return function (req, res, next) {
        const user = req.user || req.doctor;
        if (!user){
            return res.redirect('/')
            // if (user.userType === "patient") return res.redirect('/login/patient') 
            // if (user.userType === "staff") return res.redirect('/login/doctor') 
        }
        // if (!req.doctor) return res.redirect('/')

        if (!roles.includes(req.user.userType)) return res.redirect("/")
        next();
    }
}

function checkForAuth(req, res, next) {
    const tokenCookie = req.cookies?.token;
    req.user = null;
    if (!tokenCookie) return next()
    const token = tokenCookie;
    const user = getuser(token);
    req.user = user;
    // console.log("req.user from midd:",req.user)
    return next();
}
module.exports = { checkForAuthentication, restrictTo , doctorAuthentication};
