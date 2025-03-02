const Review = require('../models/review')

async function createReview(req, res){
    const {content }= req.body;
    
    
    await Review.create({
       content:content,
       doctorId:req.params.doctorId,
       createdBy:req.user._id
       })
}

module.exports ={createReview}