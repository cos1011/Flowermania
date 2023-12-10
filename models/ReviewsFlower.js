const mongoose = require('mongoose');
const Flower = require('./Flower');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        minlength: 3,
        maxlength: 430,
        required: [true, 'Please leave your review - it is very important for us to improve our services']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must be related to the user']
    },
    flower: {
        type: mongoose.Schema.ObjectId,
        ref: 'Flower',
        require: [true, 'Review must be related to the flower']
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Please rate the flower'],
      // enum: {
      //     values: [1,2,3,4,5,6,7,8,9,10],
      //     message: 'Incorrect value.Valid rating value is between 0 - 10'
      // }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    changedAt: [Date],
})


reviewSchema.statics.calcAverageRating = async function(flowerId) {
    const stats = await this.aggregate([
        {
            $match: { flower: flowerId }
        },
        {
            $group: {
                _id: '$flower',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    await Flower.findByIdAndUpdate(flowerId, {
        avgRating: stats[0].avgRating,
        nRatings: stats[0].nRating
    });
};


reviewSchema.post('save', function(next) {
   this.constructor.calcAverageRating(this.flower)

    next();
});

// reviewSchema.pre(/^findOneAnd/,  async function(next) {
//
//     const review = await this.findOne();
//     console.log(review);
//     console.log('Hello')
//     next();
// });


reviewSchema.index({ user: 1 }, {unique: true});

reviewSchema.pre(/^find/, function(next) {
   this.populate({
       path: 'user',
       select: 'name'
   })

    next();
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;