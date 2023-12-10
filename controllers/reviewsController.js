const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const crudRecFactory = require('../controllers/crudeRecFactory');
const Review = require('../models/ReviewsFlower')


exports.generateReview = catchAsync(async (req, res, next) => {

    if(!req.body.flower) req.body.flower = req.params.flowerId;
    if(!req.body.user) req.body.user = req.user.id;
    // console.log(req.body)
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newReview
    });
});

exports.getReviews = crudRecFactory.getAll(Review);
exports.createReview = crudRecFactory.createOne(Review);

exports.getReview = crudRecFactory.getOne(Review);
exports.patchReview = crudRecFactory.patchOne(Review);
// exports.deleteReview = crudRecFactory.