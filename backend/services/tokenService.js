import crypto from 'crypto';
import { RefreshToken } from '../models/index.js';

export class TokenService {
  static async saveRefreshToken({ userId, token, expiresAt, ip, userAgent }) {
    return RefreshToken.create({
      user: userId,
      token,
      expiresAt,
      ip,
      userAgent,
    });
  }

  static async rotateRefreshToken(oldToken, { ip, userAgent }) {
    const existing = await RefreshToken.findOne({ token: oldToken, revokedAt: { $exists: false } });
    if (!existing) return null;

    existing.revokedAt = new Date();
    await existing.save();

    const newToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const created = await RefreshToken.create({
      user: existing.user,
      token: newToken,
      expiresAt,
      ip,
      userAgent,
    });

    return { userId: existing.user, token: created.token };
  }

  static async revokeRefreshToken(token) {
    const existing = await RefreshToken.findOne({ token });
    if (!existing) return;
    existing.revokedAt = new Date();
    await existing.save();
  }
}
