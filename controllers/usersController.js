const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const crudRecFactory = require('../controllers/crudeRecFactory');
const AppError = require('../utils/AppError');


exports.getAllUsers = crudRecFactory.getAll(User);
exports.getUser = crudRecFactory.getOne(User);
exports.self = crudRecFactory.self(User);

exports.deleteUser = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.params.uid);
    console.log(user)
    if(!user) return next(new AppError('No user found by this id', 400))

    user.active = req.body.active;
    await user.save({
        validateBeforeSave: false
    });

    res.status(200).json({
        status: 'success',
        message: 'User has been deleted'
    })

    next();
});