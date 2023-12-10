const express = require('express');
const flowersController = require('../controllers/flowersController');
const authController = require('../controllers/authController');
const path = require('path');
const rootDir = require('../utils/path');
const reviewController = require("../controllers/reviewsController");
const reviewsRouter = require('./reviewsRouter');

const router = express.Router();

const flowers = ['Roses'];

router.get('/sqlflowers/:id', flowersController.getFlowerFromSQL);
router.post('/sqlflowers', flowersController.createFlowerToSql);

router
    .route('/')
    .get((req, res, next) => {
        // res.sendFile(path.join(rootDir, 'views'))
        // flowers.push({name: req.body.flower})
        
        res.render('index', {flowers, flower: "Iris"});
    })
    .post((req, res, next) => {

        flowers.push({flower: req.body.flower})
    })



router
    .route('/store')
    .get((req, res, next) => {
        res.render('store')
    })

router
    .route('/all-flowers')
    .get(flowersController.getAllFlowers)
    .post(authController.protect,
        // authController.restrictTo('admin'),
        flowersController.createFlower)

router
    .route('/:id')
    .get(flowersController.getFlower)

// router
//     .route('/:flowerId/reviews')
//     .post(authController.protect,
//         authController.restrictTo('user'),
//         reviewController.generateReview
//     )

router.use('/:flowerId/reviews', reviewsRouter);

router
    .route('/flower-location/:distance/position/:latlong/unit/:unit')
    .get(flowersController.getFlowerLocations)

module.exports = router;
