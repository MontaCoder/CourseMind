import express from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../config/constants.js';
import { generateAccessToken } from '../middleware/authMiddleware.js';
import { TokenService } from '../services/tokenService.js';

const router = express.Router();

// Exchange refresh token for new access token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    // Verify refresh token signature & type
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid token type' });
    }

    // Check against DB and rotate
    const rotated = await TokenService.rotateRefreshToken(refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (!rotated) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(rotated.userId);

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: rotated.token,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
});

// Revoke a refresh token (logout)
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await TokenService.revokeRefreshToken(refreshToken);
  }

  return res.json({ success: true, message: 'Logged out' });
});

export default router;
