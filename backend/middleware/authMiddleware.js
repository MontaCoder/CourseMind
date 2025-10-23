import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../config/constants.js';
import { User, Admin } from '../models/index.js';

// Generate JWT token
export const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Access token required'
            });
        }

        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        
        // Attach user info to request
        req.userId = decoded.userId;
        
        // Optionally fetch and attach full user object
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not found'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Check if user is admin
export const checkAdminAccess = async (req, res, next) => {
    try {
        const userEmail = req.user.email;
        
        const admin = await Admin.findOne({ email: userEmail });
        
        if (!admin) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error checking admin access'
        });
    }
};
