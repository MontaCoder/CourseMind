import express from 'express';
import { User, Course, Admin, Contact, Subscription, Blog } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/environment.js';
import { validateRequired } from '../middleware/validation.js';
import { ADMIN_TYPES, COURSE_TYPES, USER_TYPES } from '../config/constants.js';
import { authenticateToken, checkAdminAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// DASHBOARD
router.post('/dashboard', authenticateToken, checkAdminAccess, asyncHandler(async (req, res) => {
    const users = await User.estimatedDocumentCount();
    const courses = await Course.estimatedDocumentCount();
    const admin = await Admin.findOne({ type: ADMIN_TYPES.MAIN });
    const total = admin.total;

    const monthlyPlanCount = await User.countDocuments({ type: config.pricing.monthType });
    const yearlyPlanCount = await User.countDocuments({ type: config.pricing.yearType });

    const monthCost = monthlyPlanCount * config.pricing.monthCost;
    const yearCost = yearlyPlanCount * config.pricing.yearCost;
    const sum = monthCost + yearCost;
    const paid = yearlyPlanCount + monthlyPlanCount;

    const videoType = await Course.countDocuments({ type: COURSE_TYPES.VIDEO_TEXT });
    const textType = await Course.countDocuments({ type: COURSE_TYPES.THEORY_IMAGE });
    const free = users - paid;

    res.json({
        users,
        courses,
        total,
        sum,
        paid,
        videoType,
        textType,
        free,
        admin
    });
}));

// GET USERS
router.get('/getusers', authenticateToken, checkAdminAccess, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
}));

// GET COURSES
router.get('/getcourses', authenticateToken, checkAdminAccess, asyncHandler(async (req, res) => {
    const courses = await Course.find({});
    res.json(courses);
}));

// GET PAID USERS
router.get('/getpaid', authenticateToken, checkAdminAccess, asyncHandler(async (req, res) => {
    const paidUsers = await User.find({ type: { $ne: USER_TYPES.FREE } });
    res.json(paidUsers);
}));

// GET ADMINS
router.get('/getadmins', authenticateToken, checkAdminAccess, asyncHandler(async (req, res) => {
    const admins = await Admin.find({});
    const adminEmails = admins.map(admin => admin.email);
    const users = await User.find({ email: { $nin: adminEmails } });

    res.json({ users, admins });
}));

// ADD ADMIN
router.post('/addadmin', authenticateToken, checkAdminAccess, validateRequired(['email']), asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return ApiResponse.error(res, 'User not found');
    }

    const paidUser = await Subscription.findOne({ user: user._id });

    if (!paidUser) {
        await User.findOneAndUpdate({ email }, { $set: { type: USER_TYPES.FOREVER } });
    }

    const newAdmin = new Admin({ email: user.email, mName: user.mName, type: ADMIN_TYPES.NO });
    await newAdmin.save();

    ApiResponse.success(res, {}, 'Admin added successfully');
}));

// REMOVE ADMIN
router.post('/removeadmin', authenticateToken, checkAdminAccess, validateRequired(['email']), asyncHandler(async (req, res) => {
    const { email } = req.body;

    await Admin.findOneAndDelete({ email });

    const user = await User.findOne({ email });

    if (user && user.type === USER_TYPES.FOREVER) {
        await User.findOneAndUpdate({ email }, { $set: { type: USER_TYPES.FREE } });
    }

    ApiResponse.success(res, {}, 'Admin removed successfully');
}));

// GET CONTACTS
router.get('/getcontact', authenticateToken, checkAdminAccess, asyncHandler(async (req, res) => {
    const contacts = await Contact.find({});
    res.json(contacts);
}));

// SAVE ADMIN SETTINGS
router.post('/saveadmin', authenticateToken, checkAdminAccess, validateRequired(['data', 'type']), asyncHandler(async (req, res) => {
    const { data, type } = req.body;

    const updateField = {};
    updateField[type] = data;

    await Admin.findOneAndUpdate(
        { type: ADMIN_TYPES.MAIN },
        { $set: updateField }
    );

    ApiResponse.success(res, {}, 'Saved successfully');
}));

// GET POLICIES
router.get('/policies', asyncHandler(async (req, res) => {
    const admins = await Admin.find({});
    res.json(admins);
}));

// CONTACT
router.post('/contact', validateRequired(['fname', 'lname', 'email', 'phone', 'msg']), asyncHandler(async (req, res) => {
    const { fname, lname, email, phone, msg } = req.body;

    const newContact = new Contact({ fname, lname, email, phone, msg });
    await newContact.save();

    ApiResponse.success(res, {}, 'Submitted');
}));

// BLOG ROUTES

// CREATE BLOG
router.post('/createblog', authenticateToken, checkAdminAccess, validateRequired(['title', 'excerpt', 'content', 'image', 'category', 'tags']), asyncHandler(async (req, res) => {
    const { title, excerpt, content, image, category, tags } = req.body;

    const buffer = Buffer.from(image.split(',')[1], 'base64');
    const blog = new Blog({ title, excerpt, content, image: buffer, category, tags });
    await blog.save();

    ApiResponse.success(res, {}, 'Blog created successfully');
}));

// DELETE BLOG
router.post('/deleteblogs', authenticateToken, checkAdminAccess, validateRequired(['id']), asyncHandler(async (req, res) => {
    const { id } = req.body;

    await Blog.findOneAndDelete({ _id: id });

    ApiResponse.success(res, {}, 'Blog deleted successfully');
}));

// UPDATE BLOG
router.post('/updateblogs', authenticateToken, checkAdminAccess, validateRequired(['id', 'type', 'value']), asyncHandler(async (req, res) => {
    const { id, type, value } = req.body;

    const booleanValue = value === 'true';
    const updateField = {};
    updateField[type] = booleanValue;

    await Blog.findOneAndUpdate({ _id: id }, { $set: updateField });

    ApiResponse.success(res, {}, 'Blog updated successfully');
}));

// GET BLOGS
router.get('/getblogs', asyncHandler(async (req, res) => {
    const blogs = await Blog.find({});
    res.json(blogs);
}));

export default router;

