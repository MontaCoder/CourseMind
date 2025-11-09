// IMPORTS
import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/environment.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { 
    corsMiddleware, 
    helmetMiddleware, 
    mongoSanitizeMiddleware, 
    validateContentType,
    requestSizeLimit,
    apiLimiter,
} from './middleware/securityMiddleware.js';

// ROUTE IMPORTS
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';

// INITIALIZE APP
const app = express();

// SECURITY & OBSERVABILITY MIDDLEWARE
import { requestLogger } from './middleware/requestLogger.js';
app.use(requestLogger);
app.use(helmetMiddleware);
app.use(corsMiddleware());
app.use(mongoSanitizeMiddleware);
app.use(validateContentType);

// BODY PARSING MIDDLEWARE (express.json replaces body-parser)
app.use(express.json({ limit: requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: requestSizeLimit }));

// DATABASE CONNECTION
mongoose.connect(config.mongoUri).then(() => {
    console.log('✅ MongoDB connected successfully');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ROUTES (rate-limited & secured)
app.use('/api', apiLimiter, authRoutes);
app.use('/api', apiLimiter, courseRoutes);
app.use('/api', apiLimiter, paymentRoutes);
app.use('/api', apiLimiter, aiRoutes);
app.use('/api', apiLimiter, adminRoutes);
app.use('/api', apiLimiter, emailRoutes);
app.use('/api', apiLimiter, tokenRoutes);

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

// START SERVER
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

// HANDLE UNHANDLED REJECTIONS
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    mongoose.connection.close(() => {
        process.exit(1);
    });
});

export default app;

