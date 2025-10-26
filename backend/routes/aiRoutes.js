import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AIService } from '../services/aiService.js';
import { MediaService } from '../services/mediaService.js';
import { validateRequired } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

const router = express.Router();

// GENERATE AI CONTENT (RAW TEXT)
router.post('/prompt', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const generatedText = await AIService.generateContent(prompt);

    ApiResponse.success(res, { content: generatedText }, 'AI content generated successfully');
}));

// GENERATE THEORY (HTML)
router.post('/generate', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const text = await AIService.generateHTML(prompt);

    ApiResponse.success(res, { content: text }, 'AI HTML generated successfully');
}));

// CHAT
router.post('/chat', authenticateToken, validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const text = await AIService.generateHTML(prompt);

    ApiResponse.success(res, { content: text }, 'AI chat response generated');
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

