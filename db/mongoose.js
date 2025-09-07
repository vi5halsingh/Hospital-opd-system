const mongoose = require('mongoose');
const URI = process.env.MONGO_URI;

mongoose.connect(URI, {
    serverSelectionTimeoutMS: 30000 // 30 seconds
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

module.exports = mongoose;