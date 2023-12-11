const Flower = require('../models/Flower');
const catchAsync = require('../utils/catchAsync');



exports.getMainPage = (req, res) => {
    res.status(200).render('base', {
       flower: 'Iris',
       head: 'Peter'
    });
 };


 exports.getOverview = catchAsync( async (req, res) => {

    const flowers = await Flower.find();


    res.status(200).render('overview', {
        flowers
    })

});