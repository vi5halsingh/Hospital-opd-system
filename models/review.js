const { Schema, model } = require('mongoose');
const reviewShcema = new Schema({
    content: {
        type: String,
        required: true
    },
   doctorId:
    {
        type: Schema.Types.ObjectId,
        ref: 'doctors',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'signupdetails',
        required: true
    },
},
    { timestamp: true }
)
const Review = model("reviews", reviewShcema)
module.exports = Review ;