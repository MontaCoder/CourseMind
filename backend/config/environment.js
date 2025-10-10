import dotenv from 'dotenv';

dotenv.config();

// Validate critical environment variables
const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'EMAIL',
    'PASSWORD',
    'API_KEY',
    'UNSPLASH_ACCESS_KEY',
    'WEBSITE_URL',
    'COMPANY',
    'LOGO'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`Warning: ${varName} environment variable is not set`);
    }
});

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI,
    
    email: {
        user: process.env.EMAIL,
        password: process.env.PASSWORD
    },
    
    api: {
        googleAI: process.env.API_KEY,
        unsplash: process.env.UNSPLASH_ACCESS_KEY
    },
    
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY
    },
    
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        secretKey: process.env.PAYPAL_APP_SECRET_KEY
    },
    
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET
    },
    
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY
    },
    
    flutterwave: {
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY
    },
    
    website: {
        url: process.env.WEBSITE_URL,
        company: process.env.COMPANY,
        logo: process.env.LOGO
    },
    
    pricing: {
        monthType: process.env.MONTH_TYPE,
        monthCost: parseFloat(process.env.MONTH_COST) || 0,
        yearType: process.env.YEAR_TYPE,
        yearCost: parseFloat(process.env.YEAR_COST) || 0
    }
};

