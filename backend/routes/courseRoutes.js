import express from 'express';
import { Course, Lang, Notes, Exam } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { MediaService } from '../services/mediaService.js';
import { AIService } from '../services/aiService.js';
import { sendEmail } from '../utils/emailService.js';
import { validateRequired } from '../middleware/validation.js';
import { HTTP_STATUS } from '../config/constants.js';

const router = express.Router();

// STORE COURSE
router.post('/course', validateRequired(['user', 'content', 'type', 'mainTopic', 'lang']), asyncHandler(async (req, res) => {
    const { user, content, type, mainTopic, lang } = req.body;

    const photo = await MediaService.searchImage(mainTopic);

    const newCourse = new Course({ user, content, type, mainTopic, photo });
    await newCourse.save();

    const newLang = new Lang({ course: newCourse._id, lang });
    await newLang.save();

    ApiResponse.success(res, { courseId: newCourse._id }, 'Course created successfully');
}));

// STORE SHARED COURSE
router.post('/courseshared', validateRequired(['user', 'content', 'type', 'mainTopic']), asyncHandler(async (req, res) => {
    const { user, content, type, mainTopic } = req.body;

    const photo = await MediaService.searchImage(mainTopic);

    const newCourse = new Course({ user, content, type, mainTopic, photo });
    await newCourse.save();

    ApiResponse.success(res, { courseId: newCourse._id }, 'Course created successfully');
}));

// UPDATE COURSE
router.post('/update', validateRequired(['content', 'courseId']), asyncHandler(async (req, res) => {
    const { content, courseId } = req.body;

    await Course.findOneAndUpdate(
        { _id: courseId },
        { $set: { content } }
    );

    ApiResponse.success(res, {}, 'Course updated successfully');
}));

// DELETE COURSE
router.post('/deletecourse', validateRequired(['courseId']), asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    await Course.findOneAndDelete({ _id: courseId });

    ApiResponse.success(res, {}, 'Course deleted successfully');
}));

// FINISH COURSE
router.post('/finish', validateRequired(['courseId']), asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    await Course.findOneAndUpdate(
        { _id: courseId },
        { $set: { completed: true, end: Date.now() } }
    );

    ApiResponse.success(res, {}, 'Course completed successfully');
}));

// GET COURSES WITH PAGINATION
router.get('/courses', asyncHandler(async (req, res) => {
    const { userId, page = 1, limit = 9 } = req.query;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ user: userId })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

    res.json(courses);
}));

// GET SHARED COURSE
router.get('/shareable', asyncHandler(async (req, res) => {
    const { id } = req.query;

    const course = await Course.find({ _id: id });

    res.json(course);
}));

// SEND CERTIFICATE
router.post('/sendcertificate', validateRequired(['html', 'email']), asyncHandler(async (req, res) => {
    const { html, email } = req.body;

    await sendEmail(email, 'Certification of completion', html);

    ApiResponse.success(res, {}, 'Email sent successfully');
}));

// GET NOTES
router.post('/getnotes', validateRequired(['course']), asyncHandler(async (req, res) => {
    const { course } = req.body;

    const existingNotes = await Notes.findOne({ course });

    if (existingNotes) {
        return ApiResponse.success(res, { message: existingNotes.notes }, '');
    }

    return ApiResponse.error(res, '', HTTP_STATUS.NOT_FOUND);
}));

// SAVE NOTES
router.post('/savenotes', validateRequired(['course', 'notes']), asyncHandler(async (req, res) => {
    const { course, notes } = req.body;

    const existingNotes = await Notes.findOne({ course });

    if (existingNotes) {
        await Notes.findOneAndUpdate({ course }, { $set: { notes } });
        return ApiResponse.success(res, {}, 'Notes updated successfully');
    }

    const newNotes = new Notes({ course, notes });
    await newNotes.save();

    ApiResponse.success(res, {}, 'Notes created successfully');
}));

// GENERATE EXAM
router.post('/aiexam', validateRequired(['courseId', 'mainTopic', 'subtopicsString', 'lang']), asyncHandler(async (req, res) => {
    const { courseId, mainTopic, subtopicsString, lang } = req.body;

    const existingExam = await Exam.findOne({ course: courseId });

    if (existingExam) {
        return ApiResponse.success(res, { message: existingExam.exam }, '');
    }

    const examContent = await AIService.generateExam(courseId, mainTopic, subtopicsString, lang);

    const newExam = new Exam({ course: courseId, exam: examContent, marks: "0", passed: false });
    await newExam.save();

    ApiResponse.success(res, { message: examContent }, '');
}));

// UPDATE EXAM RESULT
router.post('/updateresult', validateRequired(['courseId', 'marksString']), asyncHandler(async (req, res) => {
    const { courseId, marksString } = req.body;

    await Exam.findOneAndUpdate(
        { course: courseId },
        { $set: { marks: marksString, passed: true } }
    );

    ApiResponse.success(res, {}, '');
}));

// SEND EXAM MAIL
router.post('/sendexammail', validateRequired(['html', 'email', 'subjects']), asyncHandler(async (req, res) => {
    const { html, email, subjects } = req.body;

    await sendEmail(email, subjects, html);

    ApiResponse.success(res, {}, 'Email sent successfully');
}));

// GET EXAM RESULT
router.post('/getmyresult', validateRequired(['courseId']), asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    const existingExam = await Exam.findOne({ course: courseId });
    const lang = await Lang.findOne({ course: courseId });

    const langValue = lang ? lang.lang : 'English';

    if (existingExam) {
        return ApiResponse.success(res, { message: existingExam.passed, lang: langValue }, '');
    }

    return ApiResponse.error(res, '', HTTP_STATUS.NOT_FOUND, { message: false, lang: langValue });
}));

export default router;

