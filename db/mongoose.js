const mongoose = require('mongoose')
const URI = process.env.MONGO_URI

mongoose.connect(URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

module.exports = mongoose;
