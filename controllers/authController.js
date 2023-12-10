const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const sendEmail = require('../utils/email');

const assignToken = id => jwt.sign({
    id
}, process.env.USER_SECRET, {
    expiresIn: process.env.USER_TENURE
})



const createAndSendToken = (user, statusCode, res) => {
    const token = assignToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        secure: false,
        httpOnly: true
    }
    console.log(process.env.NODE_MODE)
    if(process.env.NODE_MODE === 'PRODUCTION') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: user
    })
}

exports.singup = catchAsync(async (req, res, next) => {

    const newUser = await User.create(req.body)
    createAndSendToken(newUser, 201, res)

});


exports.login = catchAsync( async (req, res, next) => {

    const { email, password } = req.body;

    if(!email || !password) {
        return next(new AppError('Either email or password is missing', 400))
    }

    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Password is wrong or user doesn not exist', 400))
    }

    createAndSendToken(user, 200, res)

});

exports.protect = catchAsync( async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('You are not logged in', 400));
    }

    

    const decoded = await promisify(jwt.verify)(token, process.env.USER_SECRET);

    const user = await User.findById(decoded.id);

    if(!user) return next(new AppError('User token has expired. Please log in again'));

    if(!user.ifPasswordChanged(decoded.iat)) return next(new AppError('User changed password', 401));

    req.user = user;

    next();

}); 

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Only users are allowed to perform this action'))
        }
        next()
    }
}

exports.forgottenPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({email});
    if(!user) return next(new AppError('There is no user with this email', 404));

    const resetToken = user.createPasswordResetToken();
    console.log(resetToken)
    await user.save({
        validateBeforeSave: false
    });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password${resetToken}`

    const message = `Follow the link to restore the password to ${resetUrl}`;
    try {
        // await sendEmail({
        //     message,
        //     email: user.email,
        //     subject: 'Password Reset-Token'
        // })
        console.log(resetToken)
        res.status(200).json({
            status: 'success',
            message: 'Token sent'
        })
    } catch(err) {
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        await user.save({
            validateBeforeSave: false
        })
        console.log(err)

        return next(new AppError('Error sending email...'))
    }
    
    next();
})

exports.resetPassword = catchAsync( async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');


    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires: {$gt: Date.now()}
    })


    if(!user) return next(new AppError('Invalid token or it has expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
        validateBeforeSave: false
    })

    res.status(200).json({
        status: 'success',
        message: 'Password has been updated'
    })
});

exports.updatePassword = catchAsync( async (req, res, next) => {

    const user = await User.findById(req.params.uid).select('+password');

   if(!(await user.correctPassword(req.body.currentPassword, user.password))) {
       return next(new AppError('Current password is wrong', 401))
   };

   user.password = req.body.newPassword;
   user.passwordConfirm = req.body.newPasswordConfirm;

   await user.save({
       validateBeforeSave: false
   })

    const token = assignToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        message: "Password has been successfully updated"
    });
    next();
});