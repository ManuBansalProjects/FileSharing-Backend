const errorMiddleware = (err, req, res, next) =>{
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    return res.status(statusCode).json({
        message : message,
        success : false,
        data : null,
        error : err
    })
}

module.exports = {errorMiddleware}