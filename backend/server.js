// IMPORTS
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from './config/environment.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// ROUTE IMPORTS
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

// INITIALIZE APP
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// DATABASE CONNECTION
mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB connected successfully');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ROUTES
app.use('/api', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', paymentRoutes);
app.use('/api', aiRoutes);
app.use('/api', adminRoutes);
app.use('/api', emailRoutes);

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

