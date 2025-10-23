import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { config } from '../config/environment.js';

// CORS Configuration with whitelist
export const corsMiddleware = () => {
    const allowedOrigins = process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',')
        : [
            'http://localhost:8080',
            'http://localhost:5173',
            'http://localhost:3000',
            config.website.url
        ].filter(Boolean);

    return cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    });
};

// Rate limiting for general API
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development
    skip: () => process.env.NODE_ENV === 'development'
});

// Stricter rate limiting for authentication routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    // Skip rate limiting in development
    skip: () => process.env.NODE_ENV === 'development'
});

// Helmet for security headers
export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// MongoDB injection prevention
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potentially malicious input: ${key}`);
    }
});

// Content-Type validation middleware
export const validateContentType = (req, res, next) => {
    // Skip GET requests
    if (req.method === 'GET') {
        return next();
    }
    
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
            success: false,
            message: 'Content-Type must be application/json'
        });
    }
    
    next();
};

// Request size validation (already handled by body-parser but good to be explicit)
export const requestSizeLimit = '50mb';
