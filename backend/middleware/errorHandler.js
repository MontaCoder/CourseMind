import { HTTP_STATUS } from '../config/constants.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(HTTP_STATUS.NOT_FOUND);
    next(error);
};

