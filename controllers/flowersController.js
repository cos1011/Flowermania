const Flower = require('../models/Flower');
const crudeRecFactory = require('./crudeRecFactory');
const Order = require('../sql/models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllFlowers = crudeRecFactory.getAll(Flower);
exports.createFlower = crudeRecFactory.createOne(Flower);
exports.getFlower = crudeRecFactory.getOne(Flower);


exports.getFlowers = catchAsync(async (req, res, next) => {

    const [rows] = await Order.fetchData()

    console.log(rows)

    res.status(200).json({
        status: 'success',
        data: rows
    })
    next()
});

exports.createFlowerToSql = catchAsync(async(req, res, next) => {

    const flower = await Order.addDoc('Poppy', 1.3, 'Made in China', 'poppy.jpg')

    res.status(201).json({
        status: 'success',
        data: flower
    })

});

exports.getFlowerFromSQL = catchAsync(async(req, res, next) => {

    console.log(req.params.id)
    const [row] = await Order.getFlower(req.params.id)

    res.status(201).json({
        status: 'success',
        data: row
    })
})
// '/flower-location/:distance/center/:latlong/unit/:unit'

exports.getFlowerLocations = catchAsync(async (req, res, next) => {

    const { distance, latlong, unit  } = req.params;

    const [ lat, long ] = latlong.split(',');

    const radius = unit === 'km' ? distance / 6371 : distance / 3963.2;
    console.log(radius);

    if(!lat && !long) return next(new AppError('Please provide correct format of latitude and longitude'), 400);


    const flowers = await Flower.find({
        vLocations: { $geoWithin: { $centerSphere: [[long, lat], radius] } }
    });



    res.status(200).json({
        status: 'success',
        results: flowers.length,
        data: flowers
    })

});
