import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../config/constants.js';
import { User, Admin } from '../models/index.js';

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set');
    }
    return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not set');
    }
    return process.env.JWT_REFRESH_SECRET;
};

// Generate short-lived access token
export const generateAccessToken = (userId) => {
    return jwt.sign({ userId, type: 'access' }, getJwtSecret(), { expiresIn: '15m' });
};

// Generate refresh token (longer-lived)
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, getRefreshSecret(), { expiresIn: '7d' });
};

// Verify access token middleware (attaches full user)
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

// Verify JWT token from query parameter (for SSE endpoints)
export const authenticateTokenQuery = async (req, res, next) => {
    try {
        const token = req.query.token;

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).write(`event: error\ndata: ${JSON.stringify({ message: 'Access token required' })}\n\n`);
        }

        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        
        // Attach user info to request
        req.userId = decoded.userId;
        
        // Optionally fetch and attach full user object
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).write(`event: error\ndata: ${JSON.stringify({ message: 'User not found' })}\n\n`);
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).write(`event: error\ndata: ${JSON.stringify({ message: 'Token expired' })}\n\n`);
        }
        
        return res.status(HTTP_STATUS.UNAUTHORIZED).write(`event: error\ndata: ${JSON.stringify({ message: 'Invalid token' })}\n\n`);
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

// Lightweight token check (no DB lookup) for performance-critical routes
export const authenticateTokenLite = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Access token required',
            });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        if (decoded.type !== 'access') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid token type' });
        }
        req.userId = decoded.userId;
        return next();
    } catch (error) {
        const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message });
    }
};
