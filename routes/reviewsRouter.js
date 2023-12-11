const express = require('express');
const authController = require('../controllers/authController');
const reviewsFlowerController = require('../controllers/reviewsController')
const {restrictTo} = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewsFlowerController.getReviews)
    .post(authController.protect, restrictTo('user'), reviewsFlowerController.generateReview)

router
    .route('/reviews-flowers/:id')
    .get(authController.protect, reviewsFlowerController.getReview)
    // .delete(authController.protect, restrictTo('user', 'admin'))
    .patch(authController.protect, restrictTo('user'), reviewsFlowerController.patchReview)

module.exports = router;