import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../utils/emailService.js';
import { validateRequired } from '../middleware/validation.js';

const router = express.Router();

// SEND GENERIC EMAIL
router.post('/data', validateRequired(['to', 'subject', 'html']), asyncHandler(async (req, res) => {
    const { to, subject, html } = req.body;

    const data = await sendEmail(to, subject, html);

    res.status(200).json(data);
}));

export default router;

