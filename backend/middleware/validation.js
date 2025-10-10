import { HTTP_STATUS } from '../config/constants.js';

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateRequired = (fields) => (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }
    
    next();
};

export const validateEmailField = (req, res, next) => {
    const { email } = req.body;
    
    if (email && !validateEmail(email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Invalid email format'
        });
    }
    
    next();
};

