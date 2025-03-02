const mongoose = require('mongoose');
const URL = process.env.mongo_Url

mongoose.connect(URL, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

module.exports = mongoose;
