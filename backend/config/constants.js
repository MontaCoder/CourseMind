// Constants for the application
export const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

export const USER_TYPES = {
    FREE: 'free',
    FOREVER: 'forever'
};

export const ADMIN_TYPES = {
    MAIN: 'main',
    NO: 'no'
};

export const SUBSCRIPTION_STATUS = {
    ACTIVE: true,
    INACTIVE: false
};

export const COURSE_TYPES = {
    VIDEO_TEXT: 'video & text course',
    THEORY_IMAGE: 'theory & image course'
};

export const PAYMENT_METHODS = {
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
    RAZORPAY: 'razorpay',
    PAYSTACK: 'paystack',
    FLUTTERWAVE: 'flutterwave'
};

export const EMAIL_CONFIG = {
    HOST: 'smtp.gmail.com',
    PORT: 465,
    SERVICE: 'gmail',
    SECURE: true
};

export const SUBSCRIPTION_EVENTS = {
    CANCELLED: 'BILLING.SUBSCRIPTION.CANCELLED',
    EXPIRED: 'BILLING.SUBSCRIPTION.EXPIRED',
    SUSPENDED: 'BILLING.SUBSCRIPTION.SUSPENDED',
    PAYMENT_FAILED: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
    PAYMENT_COMPLETED: 'PAYMENT.SALE.COMPLETED'
};

export const AI_MODEL = 'gemini-flash-latest';

export const SAFETY_SETTINGS = [
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
];

