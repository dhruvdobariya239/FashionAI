const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose ValidationError
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorHandler;
