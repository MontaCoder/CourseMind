import { HTTP_STATUS } from '../config/constants.js';

export class ApiResponse {
    static success(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
        return res.status(statusCode).json({
            success: true,
            message,
            ...data
        });
    }

    static error(res, message = 'Error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, data = {}) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...data
        });
    }
}

