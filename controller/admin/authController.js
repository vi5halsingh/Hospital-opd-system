const jwt = require('jsonwebtoken');
const { Signupdetail } = require('../../models/signupSchema');
const bcrypt = require('bcrypt');

// POST /admin/login
async function adminLogin(req, res) {
  const { email, password } = req.body;
  try {
    const admin = await Signupdetail.findOne({ email, userType: 'admin' });
    console.log(admin)
    if (!admin) {
      return res.render('admin/admin-login', { errorMessage: 'Invalid credentials or not an admin.' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('admin/admin-login', { errorMessage: 'Invalid credentials.' });
    }
  //  const token =await jwt.sign(admin, 10)
    // req.cookie("token" , token)
    req.session.adminId = admin._id;
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.render('admin/admin-login', { errorMessage: 'Server error. Please try again.' });
  }
}

module.exports = { adminLogin }; 