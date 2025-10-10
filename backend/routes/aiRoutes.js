import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AIService } from '../services/aiService.js';
import { MediaService } from '../services/mediaService.js';
import { validateRequired } from '../middleware/validation.js';

const router = express.Router();

// GENERATE AI CONTENT (RAW TEXT)
router.post('/prompt', validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const generatedText = await AIService.generateContent(prompt);

    res.status(200).json({ generatedText });
}));

// GENERATE THEORY (HTML)
router.post('/generate', validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const text = await AIService.generateHTML(prompt);

    res.status(200).json({ text });
}));

// CHAT
router.post('/chat', validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const text = await AIService.generateHTML(prompt);

    res.status(200).json({ text });
}));

// GET IMAGE
router.post('/image', validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const url = await MediaService.searchImage(prompt);

    if (!url) {
        return res.status(404).json({ success: false, message: 'No images found' });
    }

    res.status(200).json({ url });
}));

// GET VIDEO
router.post('/yt', validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const url = await MediaService.searchVideo(prompt);

    res.status(200).json({ url });
}));

// GET TRANSCRIPT
router.post('/transcript', validateRequired(['prompt']), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    const url = await MediaService.getVideoTranscript(prompt);

    res.status(200).json({ url });
}));

export default router;

