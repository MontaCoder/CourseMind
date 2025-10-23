import express from 'express';
import crypto from 'crypto';
import { User, Admin } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../utils/emailService.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { config } from '../config/environment.js';
import { USER_TYPES, ADMIN_TYPES, HTTP_STATUS } from '../config/constants.js';
import { validateRequired, validateEmailField } from '../middleware/validation.js';
import { generateToken, authenticateToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// SIGNUP
router.post('/signup', authLimiter, validateRequired(['email', 'mName', 'password', 'type']), validateEmailField, asyncHandler(async (req, res) => {
    const { email, mName, password, type } = req.body;

    const estimate = await User.estimatedDocumentCount();
    const existingUser = await User.findOne({ email });

    if (estimate > 0 && existingUser) {
        return ApiResponse.error(res, 'User with this email already exists', HTTP_STATUS.BAD_REQUEST);
    }

    const userType = estimate === 0 ? USER_TYPES.FOREVER : type;
    const newUser = new User({ email, mName, password, type: userType });
    await newUser.save();

    // Create admin for first user
    if (estimate === 0) {
        const newAdmin = new Admin({ email, mName, type: ADMIN_TYPES.MAIN });
        await newAdmin.save();
    }

    // Generate JWT token
    const token = generateToken(newUser._id);
    
    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    ApiResponse.success(res, { userId: newUser._id, user: userResponse, token }, 'Account created successfully');
}));

// SIGNIN
router.post('/signin', authLimiter, validateRequired(['email', 'password']), asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return ApiResponse.error(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // Use the comparePassword method
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
        return ApiResponse.error(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    ApiResponse.success(res, { userData: userResponse, token }, 'SignIn Successful');
}));

// SOCIAL LOGIN
router.post('/social', validateRequired(['email', 'name']), asyncHandler(async (req, res) => {
    const { email, name } = req.body;
    const mName = name;
    const password = crypto.randomBytes(20).toString('hex'); // Generate a random password for social login
    const type = USER_TYPES.FREE;

    let user = await User.findOne({ email });

    if (!user) {
        const estimate = await User.estimatedDocumentCount();
        user = new User({ email, mName, password, type });
        await user.save();

        // Create admin for first user
        if (estimate === 0) {
            const newAdmin = new Admin({ email, mName, type: ADMIN_TYPES.MAIN });
            await newAdmin.save();
        }
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    ApiResponse.success(res, { userData: userResponse, token }, user ? 'SignIn Successful' : 'Account created successfully');
}));

// FORGOT PASSWORD
router.post('/forgot', validateRequired(['email', 'name', 'company', 'logo']), asyncHandler(async (req, res) => {
    const { email, name, company, logo } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return ApiResponse.error(res, 'User not found', HTTP_STATUS.NOT_FOUND);
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${config.website.url}/reset-password/${token}`;
    const html = emailTemplates.passwordReset(email, resetLink, logo);

    await sendEmail(user.email, `${name} Password Reset`, html);

    ApiResponse.success(res, {}, 'Password reset link sent to your email');
}));

// RESET PASSWORD
router.post('/reset-password', validateRequired(['password', 'token']), asyncHandler(async (req, res) => {
    const { password, token } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return ApiResponse.error(res, 'Invalid or expired token', HTTP_STATUS.BAD_REQUEST);
    }

    user.password = password; // This will be hashed automatically by the pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    ApiResponse.success(res, { email: user.email, user: userResponse }, 'Password updated successfully');
}));

// UPDATE PROFILE
router.post('/profile', authenticateToken, validateRequired(['uid']), asyncHandler(async (req, res) => {
    const { email, mName, password, uid } = req.body;

    const updateData = { email, mName };
    if (password) {
        updateData.password = password; // This will be hashed automatically by the pre-save hook
    }

    const user = await User.findOneAndUpdate({ _id: uid }, { $set: updateData }, { new: true });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    ApiResponse.success(res, { user: userResponse }, 'Profile Updated');
}));

// DELETE USER
router.post('/deleteuser', authenticateToken, validateRequired(['userId']), asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const deletedUser = await User.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
        return ApiResponse.error(res, 'User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Import here to avoid circular dependency
    const { Course, Subscription } = await import('../models/index.js');
    await Course.deleteMany({ user: userId });
    await Subscription.deleteMany({ user: userId });

    ApiResponse.success(res, {}, 'Profile deleted successfully');
}));

export default router;