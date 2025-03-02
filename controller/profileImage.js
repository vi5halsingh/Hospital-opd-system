const { response } = require('express');
const { ProfileImage } = require('../models/profileImageSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

// const upload = multer({ storage: storage }).single('profileImage');
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024  },
 // Limit to 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
    }
  }
}).single('profileImage');

async function uploadFile(req, res ) {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error during file upload:', err);
      return res.status(500).json({ error: 'Error uploading file' });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
 const user = req.user || req.doctor
    if (!user || !user._id) {
      console.error('User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      
      const existingImage = await ProfileImage.findOne({ uploadedBy:user._id });

      if (existingImage) {
      
        const existingFilePath = path.join(__dirname, '../public/uploads/', existingImage.profileImage);
        fs.unlink(existingFilePath, (err) => {
          if (err) {
            console.error('Error deleting old file:', err);
          }
        });

     
        await ProfileImage.deleteOne({ uploadedBy:user._id });
      }

      const DP = new ProfileImage({
        profileImage: req.file.filename,
        uploadedBy: user._id,
      });

      await DP.save();

      // res.status(200).send(null);
      
      if (user.userType === 'admin') {
        res.redirect('/api/super-admin');
      } else if (user.userType ==='staff') {
        res.redirect('/api/staff');
      } else {
        res.redirect('/api/patient');
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      res.status(500).json({ error: 'Error saving to database', details: error.message });
    }
  });
}

module.exports = {
  uploadFile
};
