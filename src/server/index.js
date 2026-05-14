// IMPORT
import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { z } from 'zod';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const clientDistDir = path.join(rootDir, 'dist');
const clientIndexFile = path.join(clientDistDir, 'index.html');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

// Initialize services that need config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

//INITIALIZE
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:5000'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, try again later' }
});
const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100
});
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many AI/media requests, try again later' }
});
app.use('/api/', generalLimiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

// Email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const paragraph = (content) =>
    `<p style="font-size:14px;line-height:24px;margin:16px 0;color:#000">${content}</p>`;

const emailTemplate = ({ title, body, buttonHref, buttonText, preview = title, logo = process.env.LOGO, company = process.env.COMPANY }) => {
    const action = buttonHref && buttonText
        ? `<table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin:32px 0;text-align:center"><tbody><tr><td><a href="${buttonHref}" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color:#007BFF;text-align:center;font-size:12px;font-weight:600;color:#fff">${buttonText}</a></td></tr></tbody></table>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
  <head><meta http-equiv="Content-Type" content="text/html charset=UTF-8" /></head>
  <body style="padding:20px;background-color:#f6f9fc;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${preview}</div>
    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:465px;margin:80px auto;border:1px solid #e5e7eb;border-radius:0.25rem;background-color:#fff;padding:20px">
      <tr><td>
        <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px"><tbody><tr><td>
          <img alt="${company}" src="${logo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" />
        </td></tr></tbody></table>
        <h1 style="margin:30px 0;padding:0;text-align:center;font-size:24px;font-weight:400;color:#000">${title}</h1>
        ${body}
        ${action}
        <p style="font-size:14px;line-height:24px;margin:16px 0;color:#000">Best,<br />The <strong>${company}</strong> Team</p>
      </td></tr>
    </table>
  </body>
</html>`;
};

const sendMail = ({ to, subject, html }) => transporter.sendMail({ from: process.env.EMAIL, to, subject, html });

const sendWelcomeEmail = (email, name) => sendMail({
    to: email,
    subject: `Welcome to ${process.env.COMPANY || 'CourseMind'}`,
    html: emailTemplate({
        title: 'Welcome',
        body: paragraph(`${name}, welcome to ${process.env.COMPANY || 'CourseMind'}.`),
    }),
});

const sendPasswordUpdatedEmail = (email) => sendMail({
    to: email,
    subject: `${process.env.COMPANY || 'CourseMind'} Password Updated`,
    html: emailTemplate({
        title: 'Password Updated',
        body: paragraph('Your password has been updated successfully.'),
        buttonHref: process.env.WEBSITE_URL,
        buttonText: 'Sign In',
    }),
});

// AI, media, and provider helpers
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CACHE_LIMIT = 500;
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;
const TRANSCRIPT_TIMEOUT_MS = Number(process.env.TRANSCRIPT_TIMEOUT_MS) || 5000;
const providerCache = new Map();

const escapeHtml = (text = '') => String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const inlineMarkdown = (text) => escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

const markdownToHtml = (markdown = '') => {
    const cleanMarkdown = String(markdown).replace(/^```(?:markdown|md)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const lines = cleanMarkdown.split(/\r?\n/);
    const html = [];
    let listType = null;

    const closeList = () => {
        if (listType) html.push(`</${listType}>`);
        listType = null;
    };

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
            closeList();
            return;
        }

        const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            closeList();
            const level = heading[1].length;
            html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
            return;
        }

        const unordered = trimmed.match(/^[-*]\s+(.+)$/);
        if (unordered) {
            if (listType !== 'ul') {
                closeList();
                listType = 'ul';
                html.push('<ul>');
            }
            html.push(`<li>${inlineMarkdown(unordered[1])}</li>`);
            return;
        }

        const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
        if (ordered) {
            if (listType !== 'ol') {
                closeList();
                listType = 'ol';
                html.push('<ol>');
            }
            html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
            return;
        }

        closeList();
        html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
    });

    closeList();
    return html.join('');
};

const cacheKey = (...parts) => crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex');
const cached = async (key, ttlMs, loader) => {
    const now = Date.now();
    const hit = providerCache.get(key);
    if (hit && hit.expires > now) return hit.value;
    const value = await loader();
    providerCache.set(key, { value, expires: now + ttlMs });
    if (providerCache.size > CACHE_LIMIT) providerCache.delete(providerCache.keys().next().value);
    return value;
};

const extractJsonText = (text) => text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

const withTimeout = (promise, ms, message = 'Request timed out') => {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

const openRouterText = async (prompt, { json = false, maxTokens = 1200, temperature = 0.35, system } = {}) => {
    if (!process.env.OPENROUTER_API_KEY) {
        const error = new Error('OPENROUTER_API_KEY is not configured');
        error.status = 503;
        throw error;
    }

    const response = await axios.post(OPENROUTER_URL, {
        model: OPENROUTER_MODEL,
        messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
    }, {
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.WEBSITE_URL || 'http://localhost',
            'X-Title': process.env.COMPANY || 'CourseMind',
        },
        timeout: 60000,
    });

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned an empty response');
    return text;
};

const cachedOpenRouterText = (scope, prompt, options = {}) =>
    cached(`openrouter:${scope}:${cacheKey(prompt, options)}`, DEFAULT_CACHE_TTL, () => openRouterText(prompt, options));

const defaultCourseImage = () => process.env.DEFAULT_COURSE_IMAGE_URL || process.env.LOGO || '';

const findPexelsPhoto = async (query) => cached(`pexels:${cacheKey(query)}`, 24 * 60 * 60 * 1000, async () => {
    if (!process.env.PEXELS_API_KEY) return defaultCourseImage();

    try {
        const response = await axios.get('https://api.pexels.com/v1/search', {
            params: { query, page: 1, per_page: 1, orientation: 'landscape' },
            headers: { Authorization: process.env.PEXELS_API_KEY },
            timeout: 10000,
        });
        const photo = response.data?.photos?.[0];
        return photo?.src?.large2x || photo?.src?.large || photo?.src?.landscape || photo?.src?.original || defaultCourseImage();
    } catch (error) {
        console.error('Pexels lookup failed:', error.message);
        return defaultCourseImage();
    }
});

const verifyGoogleCredential = async (credential) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        const error = new Error('GOOGLE_CLIENT_ID is not configured');
        error.status = 503;
        throw error;
    }

    const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: credential },
        timeout: 10000,
    });
    const profile = response.data;
    if (profile.aud !== process.env.GOOGLE_CLIENT_ID || !profile.email) {
        const error = new Error('Invalid Google credential');
        error.status = 401;
        throw error;
    }
    return { email: profile.email, name: profile.name || profile.email.split('@')[0] };
};

const verifyFacebookAccessToken = async (accessToken) => {
    const response = await axios.get('https://graph.facebook.com/me', {
        params: { fields: 'id,name,email', access_token: accessToken },
        timeout: 10000,
    });
    const profile = response.data;
    if (!profile.email) {
        const error = new Error('Facebook account did not return an email');
        error.status = 401;
        throw error;
    }
    return { email: profile.email, name: profile.name || profile.email.split('@')[0] };
};

// Admin cache for fast lookups
let adminCache = { emails: new Set(), lastUpdate: 0 };
const ADMIN_CACHE_TTL = 5 * 60 * 1000;

const refreshAdminCache = async () => {
    try {
        const admins = await Admin.find().select('email').lean();
        adminCache = { emails: new Set(admins.map(a => a.email)), lastUpdate: Date.now() };
    } catch (e) { console.error('Admin cache error:', e); }
};

// Auth Middleware (~1ms overhead)
const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        clearAuthCookie(res);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Admin Middleware (cached)
const adminMiddleware = async (req, res, next) => {
    if (Date.now() - adminCache.lastUpdate > ADMIN_CACHE_TTL) await refreshAdminCache();
    if (!adminCache.emails.has(req.user?.email)) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Validation schemas
const schemas = {
    signup: z.object({ email: z.string().email(), mName: z.string().min(1).max(100), password: z.string().min(9), type: z.string().optional() }),
    signin: z.object({ email: z.string().email(), password: z.string().min(1) }),
    prompt: z.object({ prompt: z.string().min(1).max(50000) })
};
const validate = (name) => (req, res, next) => {
    const result = schemas[name]?.safeParse(req.body);
    if (!result?.success) return res.status(400).json({ success: false, message: 'Invalid input' });
    req.validated = result.data;
    next();
};

// Helpers
const generateToken = (user) => jwt.sign({ userId: user._id.toString(), email: user.email, type: user.type }, JWT_SECRET, { expiresIn: '7d' });
const setAuthCookie = (res, token) => res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
const clearAuthCookie = (res) => res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
const sanitizeUser = (user) => ({ _id: user._id, email: user.email, mName: user.mName, type: user.type });

//SCHEMA
const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mName: String,
    type: { type: String, required: true },
    total: { type: Number, default: 0 },
    terms: { type: String, default: '' },
    privacy: { type: String, default: '' },
    cancel: { type: String, default: '' },
    refund: { type: String, default: '' },
    billing: { type: String, default: '' }
});
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mName: String,
    password: String,
    type: String,
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
});
const courseSchema = new mongoose.Schema({
    user: String,
    content: { type: String, required: true },
    type: String,
    mainTopic: String,
    photo: String,
    date: { type: Date, default: Date.now },
    end: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false }
});
const subscriptionSchema = new mongoose.Schema({
    user: String,
    subscription: String,
    subscriberId: String,
    plan: String,
    method: String,
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});
const contactSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    msg: String,
    date: { type: Date, default: Date.now },
});
const notesSchema = new mongoose.Schema({
    course: String,
    notes: String,
});
const examSchema = new mongoose.Schema({
    course: String,
    exam: String,
    marks: String,
    passed: { type: Boolean, default: false },
});
const langSchema = new mongoose.Schema({
    course: String,
    lang: String,
});
const blogSchema = new mongoose.Schema({
    title: { type: String, unique: true, required: true },
    excerpt: String,
    category: String,
    tags: String,
    content: String,
    image: {
        type: Buffer,
        required: true
    },
    imageContentType: { type: String, default: 'image/jpeg' },
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

//MODEL
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Admin = mongoose.model('Admin', adminSchema);
const NotesSchema = mongoose.model('Notes', notesSchema);
const ExamSchema = mongoose.model('Exams', examSchema);
const LangSchema = mongoose.model('Lang', langSchema);
const BlogSchema = mongoose.model('Blog', blogSchema);

const toBuffer = (value) => {
    if (!value) return null;
    if (Buffer.isBuffer(value)) return value;
    if (Array.isArray(value)) return Buffer.from(value);
    if (Array.isArray(value.data)) return Buffer.from(value.data);
    if (Array.isArray(value.data?.data)) return Buffer.from(value.data.data);
    return null;
};

const blogResponse = (blog) => {
    const doc = blog.toObject ? blog.toObject() : blog;
    const imageBuffer = toBuffer(doc.image);
    const imageUrl = imageBuffer ? `data:${doc.imageContentType || 'image/jpeg'};base64,${imageBuffer.toString('base64')}` : '';
    delete doc.image;
    return { ...doc, imageUrl };
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ''));

const findOwnedCourse = (courseId, userId) => {
    if (!isValidId(courseId)) return null;
    return Course.findOne({ _id: courseId, user: userId });
};

const requireOwnedCourse = async (req, res, courseId) => {
    const course = await findOwnedCourse(courseId, req.user?.userId);
    if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return null;
    }
    return course;
};

const findOwnedSubscription = (req, query = {}) => Subscription.findOne({ ...query, user: req.user?.userId });

const planCost = (plan) => Number(plan === process.env.MONTH_TYPE ? process.env.MONTH_COST : process.env.YEAR_COST) || 0;

const persistSubscription = async ({ userId, subscription, subscriberId, plan, method }) => {
    const existingSubscription = await Subscription.findOne({ user: userId });
    const shouldRecordRevenue = !existingSubscription || existingSubscription.active === false;
    if (existingSubscription) {
        await Subscription.findOneAndUpdate(
            { _id: existingSubscription._id },
            { $set: { subscription, subscriberId, plan, method, active: true } }
        );
    } else {
        await new Subscription({ user: userId, subscription, subscriberId, plan, method }).save();
    }

    if (shouldRecordRevenue) {
        await Admin.findOneAndUpdate({ type: 'main' }, { $inc: { total: planCost(plan) / 4 } });
    }

    await User.findOneAndUpdate({ _id: userId }, { $set: { type: plan } });
};

const reserveSubscription = ({ userId, subscription, subscriberId, plan, method }) =>
    Subscription.findOneAndUpdate(
        { user: userId, subscription },
        { $set: { subscriberId, plan, method, active: false } },
        { upsert: true, new: true }
    );

const cancelOwnedSubscription = async (req, lookup) => {
    const subscriptionDetails = await findOwnedSubscription(req, lookup);
    if (!subscriptionDetails) return null;

    const userDetails = await User.findOneAndUpdate(
        { _id: req.user.userId },
        { $set: { type: 'free' } },
        { new: true }
    );
    await Subscription.findOneAndDelete({ _id: subscriptionDetails._id });
    if (userDetails) {
        await sendCancelEmail(userDetails.email, userDetails.mName, 'Cancelled');
    }
    return subscriptionDetails;
};

const shouldBootstrapAdmin = (isFirstUser, bootstrapToken) => {
    if (!isFirstUser) return false;
    if (process.env.NODE_ENV !== 'production') return true;
    return Boolean(process.env.ADMIN_BOOTSTRAP_TOKEN && bootstrapToken === process.env.ADMIN_BOOTSTRAP_TOKEN);
};

const paypalAuthHeader = () => {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
    return 'Basic ' + Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
};

const verifyPayPalWebhook = async (req) => {
    if (!process.env.PAYPAL_WEBHOOK_ID) return process.env.NODE_ENV !== 'production';

    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            Authorization: paypalAuthHeader(),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return false;

    const verifyResponse = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            auth_algo: req.get('paypal-auth-algo'),
            cert_url: req.get('paypal-cert-url'),
            transmission_id: req.get('paypal-transmission-id'),
            transmission_sig: req.get('paypal-transmission-sig'),
            transmission_time: req.get('paypal-transmission-time'),
            webhook_id: process.env.PAYPAL_WEBHOOK_ID,
            webhook_event: req.body,
        }),
    });
    const verification = await verifyResponse.json();
    return verifyResponse.ok && verification.verification_status === 'SUCCESS';
};

//REQUEST

//CURRENT SESSION
app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.userId });
        if (!user) {
            clearAuthCookie(res);
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }

        const token = generateToken(user);
        setAuthCookie(res, token);
        res.json({ success: true, token, userData: sanitizeUser(user) });
    } catch (error) {
        console.error('Session hydration error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//LOGOUT
app.post('/api/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
});

//SIGNUP
app.post('/api/signup', authLimiter, validate('signup'), async (req, res) => {
    const { email, mName, password, type } = req.validated;
    const { bootstrapToken } = req.body;

    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.json({ success: false, message: 'User with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const estimate = await User.estimatedDocumentCount();
        const isFirstUser = estimate === 0;
        const makeFirstUserAdmin = shouldBootstrapAdmin(isFirstUser, bootstrapToken);
        const userType = makeFirstUserAdmin ? 'forever' : (type || 'free');
        const newUser = new User({ email, mName, password: hashedPassword, type: userType });
        await newUser.save();
        if (makeFirstUserAdmin) {
            const newAdmin = new Admin({ email, mName, type: 'main' });
            await newAdmin.save();
            await refreshAdminCache();
        }
        sendWelcomeEmail(email, mName).catch(error => console.error('Welcome email failed:', error.message));
        const token = generateToken(newUser);
        setAuthCookie(res, token);
        res.json({ success: true, message: 'Account created successfully', userId: newUser._id, token, userData: sanitizeUser(newUser) });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SIGNIN
app.post('/api/signin', authLimiter, validate('signin'), async (req, res) => {
    const { email, password } = req.validated;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        // Support both hashed and legacy plaintext passwords
        let isValid = false;
        if (user.password && user.password.startsWith('$2')) {
            isValid = await bcrypt.compare(password, user.password);
        } else {
            isValid = password === user.password;
            // Migrate to hashed password on successful login
            if (isValid && password) {
                user.password = await bcrypt.hash(password, SALT_ROUNDS);
                await user.save();
            }
        }

        if (isValid) {
            const token = generateToken(user);
            setAuthCookie(res, token);
            return res.json({ success: true, message: 'SignIn Successful', token, userData: sanitizeUser(user) });
        }

        res.json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error('Signin error:', error.message);
        res.status(500).json({ success: false, message: 'Invalid email or password' });
    }
});
//SIGNINSOCIAL
app.post('/api/social', authLimiter, async (req, res) => {
    const { provider, credential, accessToken, bootstrapToken } = req.body;

    try {
        let profile;
        if (provider === 'google') {
            if (!credential) return res.status(400).json({ success: false, message: 'Google credential required' });
            profile = await verifyGoogleCredential(credential);
        } else if (provider === 'facebook') {
            if (!accessToken) return res.status(400).json({ success: false, message: 'Facebook access token required' });
            profile = await verifyFacebookAccessToken(accessToken);
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported social provider' });
        }

        const email = profile.email;
        const name = profile.name;
        let user = await User.findOne({ email });

        if (!user) {
            const estimate = await User.estimatedDocumentCount();
            const isFirstUser = estimate === 0;
            const makeFirstUserAdmin = shouldBootstrapAdmin(isFirstUser, bootstrapToken);
            user = new User({ email, mName: name, password: '', type: makeFirstUserAdmin ? 'forever' : 'free' });
            await user.save();

            if (makeFirstUserAdmin) {
                const newAdmin = new Admin({ email, mName: name, type: 'main' });
                await newAdmin.save();
                await refreshAdminCache();
            }
            sendWelcomeEmail(email, name).catch(error => console.error('Welcome email failed:', error.message));
        }

        const token = generateToken(user);
        setAuthCookie(res, token);
        res.json({ success: true, message: 'SignIn Successful', token, userData: sanitizeUser(user) });
    } catch (error) {
        console.error('Social login error:', error.message);
        res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Internal Server Error' });
    }
});
//SEND MAIL
app.post('/api/data', authMiddleware, adminMiddleware, async (req, res) => {
    const receivedData = req.body;

    try {
        const data = await sendMail({
            to: receivedData.to,
            subject: receivedData.subject,
            html: receivedData.html,
        });
        res.status(200).json(data);
    } catch (error) {
        console.log('Error', error);
        res.status(400).json(error);
    }
});

//FOROGT PASSWORD
app.post('/api/forgot', authLimiter, async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `${process.env.WEBSITE_URL}/reset-password/${token}`;

        await sendMail({
            to: user.email,
            subject: `${process.env.COMPANY || 'CourseMind'} Password Reset`,
            html: emailTemplate({ title: 'Password Reset', body: paragraph('Click on the button below to reset the password for your account ' + user.email + '.'), buttonHref: resetLink, buttonText: 'Reset' }),
        });

        res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//FOROGT PASSWORD
app.post('/api/reset-password', authLimiter, async (req, res) => {
    const { password, token } = req.body;

    try {
        if (!password || password.length < 9) {
            return res.json({ success: false, message: 'Password must be at least 9 characters' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.json({ success: false, message: 'Invalid or expired token' });
        }

        // Hash the new password
        user.password = await bcrypt.hash(password, SALT_ROUNDS);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();
        sendPasswordUpdatedEmail(user.email).catch(error => console.error('Password update email failed:', error.message));

        res.json({ success: true, message: 'Password updated successfully', email: user.email });

    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET DATA FROM MODEL
app.post('/api/prompt', authMiddleware, aiLimiter, validate('prompt'), async (req, res) => {
    try {
        const generatedText = await cachedOpenRouterText('prompt', req.validated.prompt, { json: true, maxTokens: 2400, temperature: 0.2 });
        res.status(200).json({ generatedText });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Internal server error' });
    }
});

//GET GENERATE THEORY
app.post('/api/generate', authMiddleware, aiLimiter, validate('prompt'), async (req, res) => {
    try {
        const markdownText = await cachedOpenRouterText('generate', req.validated.prompt, {
            maxTokens: 1100,
            temperature: 0.3,
            system: 'Write concise, well-structured lessons in clean Markdown. Return only the lesson content.',
        });
        const text = markdownToHtml(markdownText);
        res.status(200).json({ text });
    } catch (error) {
        console.log('Error', error);
        res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Internal server error' });
    }
});

//GET IMAGE
app.post('/api/image', authMiddleware, aiLimiter, validate('prompt'), async (req, res) => {
    try {
        const url = await findPexelsPhoto(req.validated.prompt);
        if (!url) return res.status(503).json({ success: false, message: 'Image provider unavailable' });
        res.status(200).json({ url });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

//GET VIDEO 
app.post('/api/yt', authMiddleware, aiLimiter, validate('prompt'), async (req, res) => {
    try {
        const videoId = await cached(`yt:${cacheKey(req.validated.prompt)}`, DEFAULT_CACHE_TTL, async () => {
            const video = await youtubesearchapi.GetListByKeyword(req.validated.prompt, [false], [1], [{ type: 'video' }]);
            return video.items?.[0]?.id;
        });
        if (!videoId) return res.status(404).json({ success: false, message: 'No videos found' });
        res.status(200).json({ url: videoId });

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET TRANSCRIPT 
app.post('/api/transcript', authMiddleware, aiLimiter, validate('prompt'), async (req, res) => {
    cached(`transcript:${cacheKey(req.validated.prompt)}`, DEFAULT_CACHE_TTL, () =>
        withTimeout(YoutubeTranscript.fetchTranscript(req.validated.prompt), TRANSCRIPT_TIMEOUT_MS, 'Transcript timed out')
    ).then(video => {
        res.status(200).json({ url: Array.isArray(video) ? video : [] });
    }).catch(error => {
        console.log('Error', error);
        res.status(200).json({ url: [] });
    })
});

//STORE COURSE
app.post('/api/course', authMiddleware, async (req, res) => {
    const { content, type, mainTopic, lang } = req.body;

    try {
        const photo = await findPexelsPhoto(mainTopic);
        const newCourse = new Course({ user: req.user.userId, content, type, mainTopic, photo });
        await newCourse.save();
        const newLang = new LangSchema({ course: newCourse._id, lang: lang });
        await newLang.save();
        res.json({ success: true, message: 'Course created successfully', courseId: newCourse._id, completed: newCourse.completed });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//STORE COURSE SHARED
app.post('/api/courseshared', authMiddleware, async (req, res) => {
    const { content, type, mainTopic } = req.body;

    try {
        const photo = await findPexelsPhoto(mainTopic);
        const newCourse = new Course({ user: req.user.userId, content, type, mainTopic, photo });
        await newCourse.save();
        res.json({ success: true, message: 'Course created successfully', courseId: newCourse._id });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE COURSE
app.post('/api/update', authMiddleware, async (req, res) => {
    const { content, courseId } = req.body;
    try {
        if (!isValidId(courseId)) return res.status(400).json({ success: false, message: 'Invalid course id' });
        if (typeof content !== 'string' || !content.trim()) return res.status(400).json({ success: false, message: 'Invalid course content' });
        try {
            JSON.parse(content);
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid course content' });
        }

        const course = await requireOwnedCourse(req, res, courseId);
        if (!course) return;

        await Course.findOneAndUpdate({ _id: course._id }, { $set: { content } });
        res.json({ success: true, message: 'Course updated successfully' });
    } catch (error) {
        console.error('Course update error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DELETE COURSE
app.post('/api/deletecourse', authMiddleware, async (req, res) => {
    const { courseId } = req.body;
    try {
        const course = await requireOwnedCourse(req, res, courseId);
        if (!course) return;
        await Course.findOneAndDelete({ _id: course._id });
        await NotesSchema.deleteMany({ course: String(course._id) });
        await ExamSchema.deleteMany({ course: String(course._id) });
        await LangSchema.deleteMany({ course: String(course._id) });
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/api/finish', authMiddleware, async (req, res) => {
    const { courseId } = req.body;
    try {
        const course = await requireOwnedCourse(req, res, courseId);
        if (!course) return;

        await Course.findOneAndUpdate(
            { _id: course._id },
            { $set: { completed: true, end: Date.now() } }
        ).then(result => {
            res.json({ success: true, message: 'Course completed successfully' });
        }).catch(error => {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        })

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//SEND CERTIFICATE
app.post('/api/sendcertificate', authMiddleware, async (req, res) => {
    const { html, courseId } = req.body;

    try {
        const course = await requireOwnedCourse(req, res, courseId);
        if (!course) return;
        await sendMail({
            to: req.user.email,
            subject: 'Certification of completion',
            html,
        });
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

// Backend: Modify API to handle pagination
app.get('/api/courses', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 9 } = req.query;
        const skip = (page - 1) * limit;

        const courses = await Course.find({ user: req.user.userId })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.json(courses);
    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//GET SHARED COURSE
app.get('/api/shareable', async (req, res) => {
    try {
        const { id } = req.query;
        if (!isValidId(id)) return res.json([]);
        await Course.find({ _id: id }).then((result) => {
            res.json(result);
        });
    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//GET PROFILE DETAILS
app.post('/api/profile', authMiddleware, async (req, res) => {
    const { email, mName, password } = req.body;

    try {
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } }).lean();
            if (existingUser) return res.json({ success: false, message: 'User with this email already exists' });
        }
        const updateData = { email, mName };
        
        // Hash password if provided
        if (password && password.length > 0) {
            if (password.length < 9) {
                return res.json({ success: false, message: 'Password must be at least 9 characters' });
            }
            updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.userId },
            { $set: updateData },
            { new: true }
        );

        const token = generateToken(updatedUser);
        setAuthCookie(res, token);
        res.json({ success: true, message: 'Profile Updated', token, userData: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error('Profile update error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//PAYPAL PAYMENT
app.post('/api/paypal', authMiddleware, async (req, res) => {
    const { planId, planName, name, lastName, post, address, country, brand, admin } = req.body;
    try {
        const firstLine = address.split(',').slice(0, -1).join(',');
        const secondLine = address.split(',').pop();

        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
        const setSubscriptionPayload = (subscriptionPlanID) => {
            let subscriptionPayload = {
                "plan_id": subscriptionPlanID,
                "subscriber": { "name": { "given_name": name, "surname": lastName }, "email_address": req.user.email, "shipping_address": { "name": { "full_name": name }, "address": { "address_line_1": firstLine, "address_line_2": secondLine, "admin_area_2": admin, "admin_area_1": country, "postal_code": post, "country_code": country } } },
                "application_context": {
                    "brand_name": process.env.COMPANY,
                    "locale": "en-US",
                    "shipping_preference": "SET_PROVIDED_ADDRESS",
                    "user_action": "SUBSCRIBE_NOW",
                    "payment_method": {
                        "payer_selected": "PAYPAL",
                        "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    "return_url": `${process.env.WEBSITE_URL}/payment-success/${planId}`,
                    "cancel_url": `${process.env.WEBSITE_URL}/payment-failed`
                }
            }
            return subscriptionPayload

        }

        let subscriptionPlanID = planId;
        const response = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
            method: 'POST',
            body: JSON.stringify(setSubscriptionPayload(subscriptionPlanID)),
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
        });
        const session = await response.json();
        if (response.ok && session.id) {
            await reserveSubscription({
                userId: req.user.userId,
                subscription: session.id,
                subscriberId: req.user.email,
                plan: planName || planId,
                method: 'paypal',
            });
        }
        res.send(session)
    } catch (error) {
        console.log('Error', error);
    }
});

//GET SUBSCRIPTION DETAILS
app.post('/api/subscriptiondetail', authMiddleware, async (req, res) => {

    try {
        const userDetails = await findOwnedSubscription(req);
        if (!userDetails || userDetails.active === false) return res.json({ success: false, message: 'Subscription not found', session: null, method: null });
        if (userDetails.method === 'stripe') {
            const subscription = await stripe.subscriptions.retrieve(
                userDetails.subscriberId
            );

            res.json({ session: subscription, method: userDetails.method });
        } else if (userDetails.method === 'paypal') {
            const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
            const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
            const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
            const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${userDetails.subscription}`, {
                headers: {
                    'Authorization': 'Basic ' + auth,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const session = await response.json();
            res.json({ session: session, method: userDetails.method });
        }
        else if (userDetails.method === 'flutterwave') {
            const payload = { "email": req.user.email };
            const response = await flw.Subscription.get(payload);
            res.json({ session: response['data'][0], method: userDetails.method });
        }
        else if (userDetails.method === 'paystack') {
            const authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
            const response = await axios.get(`https://api.paystack.co/subscription/${userDetails.subscriberId}`, {
                headers: {
                    Authorization: authorization
                }
            });

            let subscriptionDetails = null;
            subscriptionDetails = {
                subscription_code: response.data.data.subscription_code,
                createdAt: response.data.data.createdAt,
                updatedAt: response.data.data.updatedAt,
                customer_code: userDetails.subscription,
                email_token: response.data.data.email_token,
            };

            res.json({ session: subscriptionDetails, method: userDetails.method });
        }
        else {
            const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
            const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
            const SUBSCRIPTION_ID = userDetails.subscription;

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: YOUR_KEY_ID,
                    password: YOUR_KEY_SECRET
                }
            };

            const response = await axios.get(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}`, config);
            res.json({ session: response.data, method: userDetails.method });

        }

    } catch (error) {
        console.error('Subscription detail error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//GET PAYPAL DETAILS
app.post('/api/paypaldetails', authMiddleware, async (req, res) => {

    const { subscriberId, plan } = req.body;

    try {
        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
        const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscriberId}`, {
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const session = await response.json();
        if (!response.ok) return res.status(400).send(session);
        const ownedPending = await findOwnedSubscription(req, { subscription: subscriberId });
        const providerEmail = session.subscriber?.email_address;
        if (!ownedPending && providerEmail && providerEmail !== req.user.email) {
            return res.status(403).json({ success: false, message: 'Subscription does not belong to this user' });
        }
        await persistSubscription({ userId: req.user.userId, subscription: session.id || subscriberId, subscriberId: req.user.email, plan, method: 'paypal' });
        res.send(session);
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//DOWNLOAD RECEIPT
app.post('/api/downloadreceipt', authMiddleware, async (req, res) => {
    const { html } = req.body;

    try {
        await sendMail({ to: req.user.email, subject: 'Subscription Receipt', html });
        res.json({ success: true, message: 'Receipt sent to your mail' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Failed to send receipt' });
    }

});

//SEND RECEIPT
app.post('/api/sendreceipt', authMiddleware, async (req, res) => {
    const { html, plan, subscriberId, method, subscription } = req.body;

    try {
        const existingSubscription = await findOwnedSubscription(req);
        if (!existingSubscription) {
            await persistSubscription({ userId: req.user.userId, subscription, subscriberId, plan, method });
        }
        await sendMail({ to: req.user.email, subject: 'Subscription Payment', html });
        res.json({ success: true, message: 'Receipt sent to your mail' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Failed to send receipt' });
    }
});


//PAYPAL WEBHOOKS
app.post('/api/paypalwebhooks', async (req, res) => {
    try {
        const verified = await verifyPayPalWebhook(req);
        if (!verified) return res.status(401).json({ success: false, message: 'Invalid PayPal webhook signature' });
    } catch (error) {
        console.log('PayPal webhook verification error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid PayPal webhook signature' });
    }

    const body = req.body;
    const event_type = body.event_type;

    switch (event_type) {
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            const id = body['resource']['id'];
            updateSubscription(id, "Cancelled");
            break;
        case 'BILLING.SUBSCRIPTION.EXPIRED':
            const id2 = body['resource']['id'];
            updateSubscription(id2, "Expired");
            break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
            const id3 = body['resource']['id'];
            updateSubscription(id3, "Suspended");
            break;
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
            const id4 = body['resource']['id'];
            updateSubscription(id4, "Disabled Due To Payment Failure");
            break;
        case 'PAYMENT.SALE.COMPLETED':
            const id5 = body['resource']['billing_agreement_id'];
            sendRenewEmail(id5);
            break;

        default:
        //DO NOTHING
    }

    res.sendStatus(200);
});

//SEND RENEW EMAIL
async function sendRenewEmail(id) {
    try {
        const subscriptionDetails = await Subscription.findOne({ subscription: id });
        if (!subscriptionDetails) return;
        const userId = subscriptionDetails.user;
        const userDetails = await User.findOne({ _id: userId });
        if (!userDetails) return;

        const mailOptions = {
            from: process.env.EMAIL,
            to: userDetails.email,
            subject: `${userDetails.mName} Your Subscription Plan Has Been Renewed`,
            html: emailTemplate({ title: 'Subscription Renewed', body: paragraph(userDetails.mName + ', your subscription plan has been Renewed.') }),
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error', error);
    }
}

//UPDATE SUBSCRIPTION DETAILS
async function updateSubscription(id, subject) {
    try {
        const subscriptionDetails = await Subscription.findOne({ subscription: id });
        if (!subscriptionDetails) return;
        const userId = subscriptionDetails.user;

        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: 'free' } }
        );

        const userDetails = await User.findOne({ _id: userId });
        if (!userDetails) return;
        await Subscription.findOneAndDelete({ subscription: id });

        sendCancelEmail(userDetails.email, userDetails.mName, subject);
    } catch (error) {
        console.log('Error', error);
    }
}

//SEND CANCEL EMAIL
async function sendCancelEmail(email, name, subject) {
    const Reactivate = process.env.WEBSITE_URL + "/pricing";

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `${name} Your Subscription Plan Has Been ${subject}`,
        html: emailTemplate({ title: 'Subscription ' + subject, body: paragraph(name + ', your subscription plan has been ' + subject + '. Reactivate your plan by clicking on the button below.'), buttonHref: Reactivate, buttonText: 'Reactivate' }),
    };

    await transporter.sendMail(mailOptions);
}

//CANCEL PAYPAL SUBSCRIPTION
app.post('/api/paypalcancel', authMiddleware, async (req, res) => {
    const { id } = req.body;

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
    try {
        const subscriptionDetails = await findOwnedSubscription(req, { subscription: id });
        if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

        const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ "reason": "Not satisfied with the service" })

        });
        if (!response.ok) return res.status(400).json({ success: false, message: 'Unable to cancel subscription' });

        await cancelOwnedSubscription(req, { _id: subscriptionDetails._id });
        res.json({ success: true, message: '' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//UPDATE SUBSCRIPTION
app.post('/api/paypalupdate', authMiddleware, async (req, res) => {
    const { id, idPlan } = req.body;
    const subscriptionDetails = await findOwnedSubscription(req, { subscription: id });
    if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");

    try {
        const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${id}/revise`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "plan_id": idPlan, "application_context": { "brand_name": process.env.COMPANY, "locale": "en-US", "payment_method": { "payer_selected": "PAYPAL", "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED" }, "return_url": `${process.env.WEBSITE_URL}/payment-success/${idPlan}`, "cancel_url": `${process.env.WEBSITE_URL}/payment-failed` } })
        });
        const session = await response.json();
        if (!response.ok) return res.status(response.status).send(session);
        res.send(session)
    } catch (error) {
        console.error('PayPal update error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//UPDATE SUBSCRIPTION AND USER DETAILS
app.post('/api/paypalupdateuser', authMiddleware, async (req, res) => {
    const { id, plan } = req.body;

    try {
        const user = await User.findOne({ _id: req.user.userId });
        const existingSubscription = await findOwnedSubscription(req, { subscription: id });
        if (!user || !existingSubscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        await persistSubscription({
            userId: req.user.userId,
            subscription: id,
            subscriberId: existingSubscription.subscriberId,
            plan,
            method: existingSubscription.method,
        });

        await sendMail({
            to: user.email,
            subject: `${user.mName} Your Subscription Plan Has Been Modifed`,
            html: emailTemplate({ title: 'Subscription Modifed', body: paragraph(user.mName + ', your subscription plan has been Modifed.') }),
        });
        res.json({ success: true, message: 'Subscription updated successfully' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//CREATE RAZORPAY SUBSCRIPTION
app.post('/api/razorpaycreate', authMiddleware, async (req, res) => {
    const { plan, planName, fullAddress } = req.body;
    try {
        const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
        const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

        const requestBody = {
            plan_id: plan,
            total_count: 12,
            quantity: 1,
            customer_notify: 1,
            notes: {
                notes_key_1: fullAddress,
            },
            notify_info: {
                notify_email: req.user.email
            }
        };

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: YOUR_KEY_ID,
                password: YOUR_KEY_SECRET
            }
        };

        const requestData = JSON.stringify(requestBody);

        const response = await axios.post('https://api.razorpay.com/v1/subscriptions', requestData, config);
        await reserveSubscription({
            userId: req.user.userId,
            subscription: response.data.id,
            subscriberId: req.user.email,
            plan: planName || plan,
            method: 'razorpay',
        });
        res.send(response.data);

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//GET RAZORPAY SUBSCRIPTION DETAILS
app.post('/api/razorapydetails', authMiddleware, async (req, res) => {

    const { subscriberId, plan } = req.body;

    try {
        const ownedPending = await findOwnedSubscription(req, { subscription: subscriberId });
        if (!ownedPending) return res.status(403).json({ success: false, message: 'Subscription does not belong to this user' });

        const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
        const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
        const SUBSCRIPTION_ID = subscriberId;

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: YOUR_KEY_ID,
                password: YOUR_KEY_SECRET
            }
        };

        const response = await axios.get(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}`, config);
        await persistSubscription({ userId: req.user.userId, subscription: response.data.id || subscriberId, subscriberId: req.user.email, plan, method: 'razorpay' });
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//RAZORPAY PENDING
app.post('/api/razorapypending', authMiddleware, async (req, res) => {

    const { sub } = req.body;
    const subscriptionDetails = await findOwnedSubscription(req, { subscription: sub });
    if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const SUBSCRIPTION_ID = sub;

    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: YOUR_KEY_ID,
            password: YOUR_KEY_SECRET
        }
    };

    axios.get(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}`, config)
        .then(response => {
            res.send(response.data);
        })
        .catch(error => {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });

});

//RAZORPAY CANCEL SUBSCRIPTION 
app.post('/api/razorpaycancel', authMiddleware, async (req, res) => {
    const { id } = req.body;

    const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const SUBSCRIPTION_ID = id;
    const subscriptionDetails = await findOwnedSubscription(req, { subscription: id });
    if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const requestBody = {
        cancel_at_cycle_end: 0
    };

    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: YOUR_KEY_ID,
            password: YOUR_KEY_SECRET
        }
    };

    axios.post(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}/cancel`, requestBody, config)
        .then(async resp => {
            try {
                await cancelOwnedSubscription(req, { _id: subscriptionDetails._id });
                res.json({ success: true, message: '' });

            } catch (error) {
                console.log('Error', error);
            }
        })
        .catch(error => {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
});

//CONTACT
app.post('/api/contact', async (req, res) => {
    const { fname, lname, email, phone, msg } = req.body;
    try {
        const newContact = new Contact({ fname, lname, email, phone, msg });
        await newContact.save();
        res.json({ success: true, message: 'Submitted' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//ADMIN PANEL

//DASHBOARD
app.post('/api/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.estimatedDocumentCount();
        const courses = await Course.estimatedDocumentCount();
        const admin = await Admin.findOne({ type: 'main' });
        const total = admin?.total || 0;
        const monthlyPlanCount = await User.countDocuments({ type: process.env.MONTH_TYPE });
        const yearlyPlanCount = await User.countDocuments({ type: process.env.YEAR_TYPE });
        let monthCost = monthlyPlanCount * process.env.MONTH_COST;
        let yearCost = yearlyPlanCount * process.env.YEAR_COST;
        let sum = monthCost + yearCost;
        let paid = yearlyPlanCount + monthlyPlanCount;
        const videoType = await Course.countDocuments({ type: 'video & text course' });
        const textType = await Course.countDocuments({ type: 'theory & image course' });
        let free = users - paid;
        res.json({ users: users, courses: courses, total: total, sum: sum, paid: paid, videoType: videoType, textType: textType, free: free, admin: admin });
    } catch (error) {
        console.error('Dashboard error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET USERS
app.get('/api/getusers', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET COURES
app.get('/api/getcourses', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET PAID USERS
app.get('/api/getpaid', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const paidUsers = await User.find({ type: { $ne: 'free' } });
        res.json(paidUsers);
    } catch (error) {
        console.error('Get paid users error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET ADMINS
app.get('/api/getadmins', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({ email: { $nin: await getEmailsOfAdmins() } });
        const admins = await Admin.find({});
        res.json({ users: users, admins: admins });
    } catch (error) {
        console.error('Get admins error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

async function getEmailsOfAdmins() {
    const admins = await Admin.find({});
    return admins.map(admin => admin.email);
}

//ADD ADMIN
app.post('/api/addadmin', authMiddleware, adminMiddleware, async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const paidUser = await Subscription.findOne({ user: user._id });
        if (!paidUser) {
            await User.findOneAndUpdate(
                { email: email },
                { $set: { type: 'forever' } }
            );
        }
        const newAdmin = new Admin({ email: user.email, mName: user.mName, type: 'no' });
        await newAdmin.save();
        res.json({ success: true, message: 'Admin added successfully' });
    } catch (error) {
        console.error('Add admin error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//REMOVE ADMIN
app.post('/api/removeadmin', authMiddleware, adminMiddleware, async (req, res) => {
    const { email } = req.body;
    try {
        await Admin.findOneAndDelete({ email: email });
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.type === 'forever') {
            await User.findOneAndUpdate(
                { email: email },
                { $set: { type: 'free' } }
            );
        }
        res.json({ success: true, message: 'Admin removed successfully' });
    } catch (error) {
        console.error('Remove admin error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET CONTACTS
app.get('/api/getcontact', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SAVE ADMIN
app.post('/api/saveadmin', authMiddleware, adminMiddleware, async (req, res) => {
    const { data, type } = req.body;
    try {
        const allowedTypes = new Set(['terms', 'privacy', 'cancel', 'refund', 'billing']);
        if (!allowedTypes.has(type)) return res.status(400).json({ success: false, message: 'Invalid policy type' });
        await Admin.findOneAndUpdate(
            { type: 'main' },
            { $set: { [type]: data } }
        );
        res.json({ success: true, message: 'Saved successfully' });
    } catch (error) {
        console.error('Save admin policy error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET POLICIES
app.get('/api/policies', async (req, res) => {
    try {
        const admins = await Admin.find({});
        res.json(admins);
    } catch (error) {
        console.error('Get policies error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//STRIPE PAYMENT
app.post('/api/stripepayment', authMiddleware, async (req, res) => {
    const { planId, planName } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.WEBSITE_URL}/payment-success/${planId}`,
            cancel_url: `${process.env.WEBSITE_URL}/payment-failed`,
            customer_email: req.user.email,
            line_items: [
                {
                    price: planId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
        });

        await reserveSubscription({
            userId: req.user.userId,
            subscription: session.id,
            subscriberId: session.id,
            plan: planName || planId,
            method: 'stripe',
        });
        res.json({ url: session.url, id: session.id })
    } catch (e) {
        console.log('Error', e);
        res.status(500).json({ error: e.message })
    }

});

app.post('/api/stripedetails', authMiddleware, async (req, res) => {
    const { subscriberId, plan } = req.body;

    try {
        const ownedPending = await findOwnedSubscription(req, { subscription: subscriberId });
        const session = await stripe.checkout.sessions.retrieve(subscriberId);
        const providerEmail = session.customer_details?.email || session.customer_email;
        if (!ownedPending && providerEmail && providerEmail !== req.user.email) {
            return res.status(403).json({ success: false, message: 'Subscription does not belong to this user' });
        }
        await persistSubscription({
            userId: req.user.userId,
            subscription: session.subscription || subscriberId,
            subscriberId: session.subscription || subscriberId,
            plan,
            method: 'stripe',
        });
        res.send(session);
    } catch (error) {
        console.error('Stripe details error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

app.post('/api/stripecancel', authMiddleware, async (req, res) => {
    const { id } = req.body;
    const subscriptionDetails = await findOwnedSubscription(req, { subscriberId: id });
    if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

    try {
        await stripe.subscriptions.cancel(id);
        await cancelOwnedSubscription(req, { _id: subscriptionDetails._id });
        res.json({ success: true, message: '' });

    } catch (error) {
        console.error('Stripe cancel error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//PAYSTACK PAYMENT
app.post('/api/paystackpayment', authMiddleware, async (req, res) => {
    const { planId, amountInZar } = req.body;
    try {

        const data = {
            email: req.user.email,
            amount: amountInZar,
            plan: planId
        };

        axios.post('https://api.paystack.co/transaction/initialize', data, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.data.status) {
                    const authorizationUrl = response.data.data.authorization_url;
                    res.json({ url: authorizationUrl });
                } else {
                    res.status(500).json({ error: 'Internal Server Error' })
                }
            })
            .catch(error => {
                res.status(500).json({ error: 'Internal Server Error' })
            });
    } catch (e) {
        console.log('Error', e);
        res.status(500).json({ error: e.message })
    }

});

//PAYSTACK GET DETAIL
app.post('/api/paystackfetch', authMiddleware, async (req, res) => {
    const { plan } = req.body;
    try {

        const searchEmail = req.user.email;
        const url = "https://api.paystack.co/subscription";
        const authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;

        axios.get(url, {
            headers: {
                'Authorization': authorization
            }
        })
            .then(async response => {
                const jsonData = response.data;
                let subscriptionDetails = null;
                jsonData.data.forEach(subscription => {
                    if (subscription.customer.email === searchEmail) {
                        subscriptionDetails = {
                            subscription_code: subscription.subscription_code,
                            createdAt: subscription.createdAt,
                            updatedAt: subscription.updatedAt,
                            customer_code: subscription.customer.customer_code
                        };
                    }
                });

                if (subscriptionDetails) {
                    await persistSubscription({
                        userId: req.user.userId,
                        subscription: subscriptionDetails.customer_code,
                        subscriberId: subscriptionDetails.subscription_code,
                        plan,
                        method: 'paystack',
                    });
                    res.json({ details: subscriptionDetails });

                } else {
                    res.status(500).json({ error: 'Internal Server Error' })
                }
            })
            .catch(error => {
                console.log('Error', error);
                res.status(500).json({ error: 'Internal Server Error' })
            });


    } catch (e) {
        console.log('Error', e);
        res.status(500).json({ error: 'Internal Server Error' })
    }

});

//PAYSTACK PAYMENT
app.post('/api/paystackcancel', authMiddleware, async (req, res) => {
    const { code, token } = req.body;
    const subscriptionDetails = await findOwnedSubscription(req, { subscriberId: code });
    if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const url = "https://api.paystack.co/subscription/disable";
    const authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
    const contentType = "application/json";
    const data = {
        code: code,
        token: token
    };

    axios.post(url, data, {
        headers: {
            Authorization: authorization,
            'Content-Type': contentType
        }
    }).then(async response => {
        await cancelOwnedSubscription(req, { _id: subscriptionDetails._id });
        res.json({ success: true, message: '' });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })

});


//FLUTTERWAVE PAYMENT
app.post('/api/flutterwavecancel', authMiddleware, async (req, res) => {
    const { code, token } = req.body;
    const subscriptionDetails = await findOwnedSubscription(req, { subscriberId: token });
    if (!subscriptionDetails) return res.status(404).json({ success: false, message: 'Subscription not found' });

    try {
        const payload = { "id": code };
        const response = await flw.Subscription.cancel(payload)
        if (!response) return res.status(500).json({ success: false, message: 'Internal server error' });
        await cancelOwnedSubscription(req, { _id: subscriptionDetails._id });
        res.json({ success: true, message: '' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


//CHAT
app.post('/api/chat', authMiddleware, aiLimiter, validate('prompt'), async (req, res) => {
    try {
        const markdownText = await cachedOpenRouterText('chat', req.validated.prompt, { maxTokens: 600, temperature: 0.35 });
        const text = markdownToHtml(markdownText);
        res.status(200).json({ text });
    } catch (error) {
        console.log('Error', error);
        res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Internal server error' });
    }

});


//FLUTTERWAVE GET DETAILS
app.post('/api/flutterdetails', authMiddleware, async (req, res) => {
    const { plan } = req.body;
    try {
        const payload = { "email": req.user.email };
        const response = await flw.Subscription.get(payload);
        const session = response['data'][0];
        await persistSubscription({
            userId: req.user.userId,
            subscription: session?.plan || session?.id,
            subscriberId: session?.plan || session?.id,
            plan,
            method: 'flutterwave',
        });
        res.send(session);
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET NOTES
app.post('/api/getnotes', authMiddleware, async (req, res) => {
    const { course } = req.body;
    try {
        const ownedCourse = await requireOwnedCourse(req, res, course);
        if (!ownedCourse) return;
        const existingNotes = await NotesSchema.findOne({ course: course });
        if (existingNotes) {
            res.json({ success: true, message: existingNotes.notes });
        } else {
            res.json({ success: false, message: '' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SAVE NOTES
app.post('/api/savenotes', authMiddleware, async (req, res) => {
    const { course, notes } = req.body;
    try {
        const ownedCourse = await requireOwnedCourse(req, res, course);
        if (!ownedCourse) return;
        const existingNotes = await NotesSchema.findOne({ course: course });

        if (existingNotes) {
            await NotesSchema.findOneAndUpdate(
                { course: course },
                { $set: { notes: notes } }
            );
            res.json({ success: true, message: 'Notes updated successfully' });
        } else {
            const newNotes = new NotesSchema({ course: course, notes: notes });
            await newNotes.save();
            res.json({ success: true, message: 'Notes created successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GENERATE EXAMS
app.post('/api/aiexam', authMiddleware, aiLimiter, async (req, res) => {
    const { courseId, mainTopic, subtopicsString, lang } = req.body;

    const ownedCourse = await requireOwnedCourse(req, res, courseId);
    if (!ownedCourse) return;

    const existingNotes = await ExamSchema.findOne({ course: courseId });
    if (existingNotes) {
        res.json({ success: true, message: existingNotes.exam });
    } else {

        const prompt = `Strictly in ${lang},
        generate a strictly 10 question MCQ quiz on title ${mainTopic} based on each topics :- ${subtopicsString}, Atleast One question per topic. Add options A, B, C, D and only one correct answer. Give your repones Strictly inJSON format like this :-
        {
          "${mainTopic}": [
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            },
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            },
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            }
          ]
        }
        `;

        try {
            const txt = await cachedOpenRouterText('aiexam', prompt, { json: true, maxTokens: 2600, temperature: 0.2 });
            const output = extractJsonText(txt);

            const newNotes = new ExamSchema({ course: courseId, exam: output, marks: "0", passed: false });
            await newNotes.save();
            res.json({ success: true, message: output });

        } catch (error) {
            console.log(error);
            res.json({ success: false });
        }

    }

});

//UPDATE RESULT
app.post('/api/updateresult', authMiddleware, async (req, res) => {
    const { courseId, marksString } = req.body;
    try {
        const course = await requireOwnedCourse(req, res, courseId);
        if (!course) return;

        await ExamSchema.findOneAndUpdate(
            { course: courseId },
            [{ $set: { marks: marksString, passed: true } }]
        ).then(result => {
            res.json({ success: true });
        }).catch(error => {
            res.json({ success: false });
        })

    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//SEND EXAM
app.post('/api/sendexammail', authMiddleware, async (req, res) => {
    const { html, subjects } = req.body;

    try {
        await sendMail({ to: req.user.email, subject: '' + subjects, html });
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

//GET RESULT
app.post('/api/getmyresult', authMiddleware, async (req, res) => {
    const { courseId } = req.body;
    try {
        const course = await requireOwnedCourse(req, res, courseId);
        if (!course) return;

        const existingNotes = await ExamSchema.findOne({ course: courseId });
        const lang = await LangSchema.findOne({ course: courseId });
        if (existingNotes) {
            if (lang) {
                res.json({ success: true, message: existingNotes.passed, lang: lang.lang });
            } else {
                res.json({ success: true, message: existingNotes.passed, lang: 'English' });
            }
        } else {
            if (lang) {
                res.json({ success: false, message: false, lang: lang.lang });
            } else {
                res.json({ success: false, message: false, lang: 'English' });
            }
        }

    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//DELETE
app.post('/api/deleteuser', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const deletedUser = await User.findOneAndDelete({ _id: userId });

        if (!deletedUser) {
            return res.json({ success: false, message: 'Internal Server Error' });
        }

        const ownedCourses = await Course.find({ user: userId }).select('_id').lean();
        const courseIds = ownedCourses.map(course => String(course._id));
        await Course.deleteMany({ user: userId });
        await Subscription.deleteMany({ user: userId });
        if (courseIds.length) {
            await NotesSchema.deleteMany({ course: { $in: courseIds } });
            await ExamSchema.deleteMany({ course: { $in: courseIds } });
            await LangSchema.deleteMany({ course: { $in: courseIds } });
        }

        clearAuthCookie(res);
        return res.json({ success: true, message: 'Profile deleted successfully' });

    } catch (error) {
        console.log('Error', error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

//CREATE Blog
app.post('/api/createblog', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, excerpt, content, image, category, tags } = req.body;
        if (!title || !excerpt || !content || !category || !image) {
            return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
        }

        const imageMatch = String(image).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!imageMatch) return res.status(400).json({ success: false, message: 'Please upload a valid cover image' });

        const buffer = Buffer.from(imageMatch[2], 'base64');
        if (!buffer.length) return res.status(400).json({ success: false, message: 'Please upload a valid cover image' });

        const blogs = new BlogSchema({ title: title.trim(), excerpt: excerpt.trim(), content, image: buffer, imageContentType: imageMatch[1], category: category.trim(), tags: String(tags || '').trim() });
        await blogs.save();
        res.json({ success: true, message: 'Blog created successfully' });

    } catch (error) {
        console.error('Create blog error:', error.message);
        if (error.code === 11000) return res.status(409).json({ success: false, message: 'A blog with this title already exists' });
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//DELETE Blog
app.post('/api/deleteblogs', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.body;
        await BlogSchema.findOneAndDelete({ _id: id });
        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});


//UPDATE Blog
app.post('/api/updateblogs', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id, type, value } = req.body;
        const booleanValue = value === 'true' ? true : false;
        if (type === 'popular') {
            await BlogSchema.findOneAndUpdate({ _id: id },
                { $set: { popular: booleanValue } }
            );
        } else {
            await BlogSchema.findOneAndUpdate({ _id: id },
                { $set: { featured: booleanValue } }
            );
        }
        res.json({ success: true, message: 'Blog updated successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

//GET Blog
app.get('/api/getblogs', async (req, res) => {
    try {
        const blogs = await BlogSchema.find({}).sort({ date: -1 });
        res.json(blogs.map(blogResponse));
    } catch (error) {
        console.error('Get blogs error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/api/getblog/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid blog id' });
        const blog = await BlogSchema.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json(blogResponse(blog));
    } catch (error) {
        console.error('Get blog error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

if (fs.existsSync(clientIndexFile)) {
    app.use(express.static(clientDistDir));
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        res.sendFile(clientIndexFile);
    });
} else {
    app.get('/', (req, res) => {
        res.json({ success: true, message: 'CourseMind API server is running. Build the client with npm run build to serve the website from this process.' });
    });
}

//LISTEN
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
