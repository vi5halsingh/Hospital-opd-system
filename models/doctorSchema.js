const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const doctorSchema = new mongoose.Schema({
  userType: {
    type: String,
    default: 'doctor'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
   status: {
    type: Boolean,
    default: true,
    index: true // Add index here
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  qualifications: {
    medicalSchool: {
      type: String,
      
    },
    degree: {
      type: String,
      required: true
    },
    licensureNumber: {
      type: String,
    
    },
    certification: {
      type: String,
     
    }
  },
  workInfo: {
    hospital: {
      type: String,
      required: true
    },
    department: {
      type: String,
       
    },
    experience: {
      type: Number,
      required: true  
    }
  },
  availability: {
    days: {
      type: String,
      required: true
    },
   startTime:  {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  authentication_Information: {
    userName: {
      type: String,
     
    },
    password: {
      type: String,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to hash password before saving
doctorSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.authentication_Information.password = await bcrypt.hash(this.authentication_Information.password, salt);
  }
  next();
});

const Doctor = mongoose.model('doctors', doctorSchema);

module.exports = Doctor;
