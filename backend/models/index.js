import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Admin Schema
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

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mName: String,
    password: String,
    type: String,
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified
    if (!this.isModified('password')) return next();
    
    try {
        // Generate salt and hash the password
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Course Schema
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

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
    user: String,
    subscription: String,
    subscriberId: String,
    plan: String,
    method: String,
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

// Contact Schema
const contactSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    msg: String,
    date: { type: Date, default: Date.now },
});

// Notes Schema
const notesSchema = new mongoose.Schema({
    course: String,
    notes: String,
});

// Exam Schema
const examSchema = new mongoose.Schema({
    course: String,
    exam: String,
    marks: String,
    passed: { type: Boolean, default: false },
});

// Language Schema
const langSchema = new mongoose.Schema({
    course: String,
    lang: String,
});

// Blog Schema
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
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

// Export Models
export const User = mongoose.model('User', userSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export const Contact = mongoose.model('Contact', contactSchema);
export const Admin = mongoose.model('Admin', adminSchema);
export const Notes = mongoose.model('Notes', notesSchema);
export const Exam = mongoose.model('Exams', examSchema);
export const Lang = mongoose.model('Lang', langSchema);
export const Blog = mongoose.model('Blog', blogSchema);