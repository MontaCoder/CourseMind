import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AIService } from '../services/aiService.js';
import { MediaService } from '../services/mediaService.js';
import { validateRequired } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

const router = express.Router();

// Helper to handle AI generation requests
const handleAIGeneration = async (req, res, serviceMethod, successMessage) => {
    const { prompt } = req.body;
    const result = await serviceMethod(prompt);
    ApiResponse.success(res, { content: result }, successMessage);
};

// GENERATE AI CONTENT (RAW TEXT)
router.post('/prompt', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    await handleAIGeneration(req, res, AIService.generateContent.bind(AIService), 'AI content generated successfully');
}));

// GENERATE AI CONTENT (STREAMING VIA SSE)
router.post('/prompt-stream', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders?.();

    try {
        const stream = AIService.generateContentStream(prompt);
        
        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
            // Flush to ensure data is sent immediately
            if (res.flush) res.flush();
        }
        
        res.write('event: done\ndata: {}\n\n');
    } catch (error) {
        console.error('SSE error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message || 'Internal server error' })}\n\n`);
    } finally {
        res.end();
    }
}));

// GENERATE THEORY (HTML)
router.post('/generate', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    await handleAIGeneration(req, res, AIService.generateHTML.bind(AIService), 'AI HTML generated successfully');
}));

// CHAT
router.post('/chat', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    await handleAIGeneration(req, res, AIService.generateHTML.bind(AIService), 'AI chat response generated');
}));

// GET IMAGE
router.post('/image', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const url = await MediaService.searchImage(prompt);
    
    if (!url) {
        return ApiResponse.error(res, 'No images found', HTTP_STATUS.NOT_FOUND);
    }
    
    ApiResponse.success(res, { url }, 'Image located successfully');
}));

// GET VIDEO
router.post('/yt', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const url = await MediaService.searchVideo(prompt);
    ApiResponse.success(res, { url }, 'Video located successfully');
}));

// GET TRANSCRIPT
router.post('/transcript', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const url = await MediaService.getVideoTranscript(prompt);
    ApiResponse.success(res, { url }, 'Transcript generated successfully');
}));

export default router;

