const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again', 401)
const handleExpiredError = () => new AppError('Your token has expired. Please log in again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {

    // Operational, trusted error: send message to client
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // Programming or other unknown error: don't leak error details
    } else {

        console.error('Error', err);
        res.status(500).json({
            status: 'error',
            message: "Something went wrong"
        });
    };
};


module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'fail';


    if(process.env.ERROR_MODE === 'DEVELOPMENT') sendErrorDev(err, res);
    if(process.env.ERROR_MODE === 'PRODUCTION') {
        let error = { ...err }

        if(err.name === 'CastError') error = handleCastErrorDB(error)

        if(error.name === 'JsonWebTokenError') handleJWTError()
        if(error.name === 'TokenExpiredError') handleExpiredError()

        sendErrorProd(err, res);
    }

};