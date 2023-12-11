const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};

    if(req.params.flowerId) filter = { flower: req.params.flowerId }

    const features = new APIFeatures(Model.find(filter), req.query)
        .filterData()
        .sortData()
        .limitFields()
        .paginate()

    const docs = await features.query;

    res.status(200).json({
        status: 'success',
        data: docs
    })
});

exports.createOne = Model => catchAsync(async (req, res, next) => {

    if(!req.body) {
        return next(new AppError('No data provided to create a document', 400))
    }

    if(!req.body.flower) req.body.flower = req.params.flowerId;

    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: doc
    });

    next();
});

exports.patchOne = Model => catchAsync(async(req, res, next) => {

    if(!req.body || !req.params.id) {
        return next(new AppError('No ID or Data to patch found', 400))
    };
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, {...req.body})
    // const updatedDoc = Model.findOneAndUpdate({_id: req.params.id}, {...req.body});

    res.status(200).json({
        status: 'success',
        message: `${updatedDoc.name} has been uccessfully updated`
    })

    next();

});

exports.getOne = Model => catchAsync(async (req, res, next) => {
   if(!req.params.id) return next(new AppError('Provide doc id'))

    const doc = await Model.findOne({_id: req.params.id})
        // .populate('reviews')

    if(!doc) return next(new AppError('No document found by this id', 401));

    res.status(200).json({
        status: 'success',
        data: doc
    })

    next();
});


exports.self = Model => catchAsync( (req, res, next) => {

    const doc = req.user

    if(!doc) return next(new AppError('No document found by this id', 401));

    res.status(200).json({
        status: 'success',
        data: doc
    })

    next();


});

exports.deleteOne = Model => catchAsync( async(req, res, next) => {
    const doc = await Model.findById(req.params.id);

    doc.active = false;

    res.status(200).json({
       status: 'success',
       data: doc
    });
    next();
} )