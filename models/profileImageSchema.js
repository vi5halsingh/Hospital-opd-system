const mongoose = require('mongoose');

const profileImageSchema = mongoose.Schema({
  profileImage: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId,
  ref: 'signupdetails' , required:true } 

});

const ProfileImage = mongoose.model('ProfileImage', profileImageSchema);

module.exports = {
  ProfileImage
};
