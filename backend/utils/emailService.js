import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
import { EMAIL_CONFIG } from '../config/constants.js';

// Create a singleton transporter instance
let transporterInstance = null;

export const getEmailTransporter = () => {
    if (!transporterInstance) {
        transporterInstance = nodemailer.createTransport({
            host: EMAIL_CONFIG.HOST,
            port: EMAIL_CONFIG.PORT,
            service: EMAIL_CONFIG.SERVICE,
            secure: EMAIL_CONFIG.SECURE,
            auth: {
                user: config.email.user,
                pass: config.email.password,
            },
        });
    }
    return transporterInstance;
};

export const sendEmail = async (to, subject, html) => {
    const transporter = getEmailTransporter();
    const options = {
        from: config.email.user,
        to,
        subject,
        html,
    };
    return await transporter.sendMail(options);
};

