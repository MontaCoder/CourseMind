# CourseMind - AI-Powered Course Generation Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/MontaCoder/CourseMind)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

<div align="center">
  <img src="https://i.postimg.cc/wBL9c9Vp/Gemini-Generated-Image-7fr1527fr1527fr1-Photoroom.png" alt="CourseMind Logo" width="200"/>
</div>

**CourseMind** is an intelligent course creation platform that transforms ideas into comprehensive learning experiences using advanced AI technology. Built for educators, content creators, and organizations, it enables rapid development of structured courses with multimedia content, assessments, and real-time progress tracking.

## ✨ Key Features

### 🤖 AI-Powered Course Generation
- **Smart Content Creation**: Generate structured course modules from simple prompts or topics
- **Multi-Language Support**: Create courses in 23+ languages with native-quality localization
- **Content Types**: Support for both text-based and video-enhanced courses
- **Automatic Assessments**: AI-generated quizzes and evaluation rubrics

### 📚 Learning Management
- **Course Builder**: Intuitive drag-and-drop course creation interface
- **Rich Text Editor**: TipTap-powered editor with advanced formatting options
- **Progress Tracking**: Real-time completion monitoring and analytics
- **Certificate Generation**: Automated course completion certificates
- **Social Sharing**: Share courses and achievements across platforms

### 🔐 User Management & Authentication
- **Secure Authentication**: JWT-based authentication with social login (Google)
- **User Profiles**: Comprehensive profile management and subscription tracking
- **Admin Panel**: Full-featured admin dashboard for platform management
- **Role-Based Access**: Admin, creator, and learner role management

### 💳 Subscription & Payments
- **Stripe Integration**: Secure payment processing with subscription management
- **Multiple Tiers**: Free and premium subscription plans
- **Usage Limits**: Tiered feature access based on subscription level

### 🌐 Modern Web Platform
- **Progressive Web App**: Installable web app with offline capabilities
- **Responsive Design**: Optimized for all device types
- **Dark Mode**: System-aware theme switching
- **Accessibility**: WCAG compliant interface design

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom animations
- **Radix UI** - Accessible, customizable component primitives
- **React Query** - Powerful data fetching and state management
- **React Router** - Client-side routing with nested layouts
- **React Hook Form** - Performant forms with validation

### Backend
- **Node.js** - Runtime environment with ES modules support
- **Express.js** - Robust web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **Security Middleware** - CORS, rate limiting, input sanitization

### AI & Integrations
- **Google Generative AI** - Advanced content generation and processing
- **Stripe** - Payment processing and subscription management
- **Nodemailer** - Email services for notifications and certificates
- **YouTube API** - Video content integration
- **Unsplash API** - High-quality image assets

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Vite PWA Plugin** - Progressive Web App functionality
- **React Helmet** - Dynamic meta tag management

## 🏗️ Project Structure

```
CourseMind/
├── 📁 public/                 # Static assets and PWA manifest
├── 📁 src/
│   ├── 📁 components/        # Reusable React components
│   │   ├── 📁 ui/           # Shadcn/ui component library
│   │   ├── 📁 layouts/      # Layout components (Dashboard, Admin)
│   │   └── 📁 minimal-tiptap/ # Rich text editor components
│   ├── 📁 pages/            # Route components
│   │   ├── 📁 admin/        # Admin panel pages
│   │   └── 📁 ...           # Public and dashboard pages
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 lib/              # Utility functions and API client
│   ├── 📁 contexts/         # React contexts (Theme, Auth)
│   └── 📁 constants.tsx     # Application constants and configuration
├── 📁 backend/              # Backend server
│   ├── 📁 config/          # Configuration files
│   ├── 📁 middleware/      # Express middleware
│   ├── 📁 models/          # MongoDB models
│   ├── 📁 routes/          # API route handlers
│   ├── 📁 services/        # Business logic services
│   └── 📁 utils/           # Utility functions and email templates
├── 📁 .github/             # GitHub workflows and templates
└── ⚙️ Configuration Files
    ├── vite.config.ts      # Vite build configuration
    ├── tailwind.config.ts  # Tailwind CSS configuration
    └── tsconfig.json       # TypeScript configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **MongoDB** database (local or cloud instance)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   # Database
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # AI Services
   API_KEY=your_google_ai_api_key

   # Payment Processing
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Email Service
   EMAIL=your_email@gmail.com
   PASSWORD=your_app_password

   # Social Authentication
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # External Services
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   WEBSITE_URL=http://localhost:8080
   COMPANY=CourseMind
   LOGO=https://your-logo-url.com/logo.png
   ```

4. **Start the backend server:**
   ```bash
   node server.js
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:8080](http://localhost:8080)

## 📱 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run backend      # Start backend server only
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📚 API Documentation

CourseMind provides a comprehensive REST API for all core functionalities.

### Authentication Endpoints
- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/social` - Social authentication (Google)
- `POST /api/forgot` - Password reset request
- `POST /api/reset-password` - Password reset with token

### Course Management
- `POST /api/generate` - Generate course content using AI
- `POST /api/course` - Save a new course
- `GET /api/courses` - Retrieve user's courses
- `POST /api/update` - Update existing course
- `POST /api/deletecourse` - Delete a course
- `POST /api/finish` - Mark course as completed

### AI Features
- `POST /api/prompt` - Send custom AI prompts
- `POST /api/image` - Generate images
- `POST /api/yt` - Search YouTube videos
- `POST /api/transcript` - Get video transcripts

### Payment & Subscription
- `POST /api/stripepayment` - Stripe payment processing
- `POST /api/subscriptiondetail` - Get subscription details
- `POST /api/stripecancel` - Cancel Stripe subscription

### Admin Management
- `POST /api/checkadmin` - Verify admin status
- `GET /api/getusers` - Retrieve user list
- `POST /api/createblog` - Create blog post
- `GET /api/getblogs` - Retrieve blog posts

## 🎯 User Guide

### For Content Creators
1. **Sign Up/Login** - Create account or login with Google
2. **Generate Course** - Use AI-powered course generator
3. **Customize Content** - Edit with rich text editor
4. **Add Assessments** - Create AI-generated quizzes
5. **Publish & Share** - Share courses with learners

### For Learners
1. **Browse Courses** - Explore available courses
2. **Enroll & Learn** - Access course content
3. **Track Progress** - Monitor completion status
4. **Take Assessments** - Complete quizzes and evaluations
5. **Earn Certificates** - Receive completion certificates

### For Administrators
1. **Access Admin Panel** - Navigate to `/admin`
2. **Manage Users** - View and manage user accounts
3. **Monitor Courses** - Oversee course content and usage
4. **Handle Subscriptions** - Manage payment and billing
5. **Content Management** - Create and manage blog posts

## 💳 Subscription Plans

### Free Plan
- Generate up to 5 subtopics per course
- Basic course creation features
- Standard support

### Premium Plans
- **Monthly** ($5/month) - Unlimited course generation
- **Yearly** ($49/year) - All premium features with savings

### Payment Methods
- **Stripe** (Credit/Debit Cards, Digital Wallets)

## 🌐 Supported Languages

CourseMind supports course creation in 23 languages including:
- English, Spanish, French, German, Italian
- Portuguese, Russian, Japanese, Korean, Chinese
- Arabic, Hindi, Bengali, and many more

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Rate Limiting** to prevent abuse
- **Input Sanitization** against XSS and injection attacks
- **CORS Protection** with strict origin policies
- **Helmet.js** security headers
- **MongoDB Sanitization** for database security

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
Ensure production environment includes:
- Node.js runtime (v18+)
- MongoDB database
- All required environment variables
- SSL certificate for HTTPS

### Recommended Platforms
- **Vercel** - Frontend deployment
- **Railway** - Full-stack deployment
- **DigitalOcean** - Custom infrastructure
- **AWS** - Enterprise deployment

## 🧪 Development

### Code Quality
- **ESLint** configuration for code consistency
- **TypeScript** strict mode enabled
- **Prettier** formatting (via ESLint)

### Testing Setup
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test scripts
"test": "vitest",
"test:ui": "vitest --ui"
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'Add your feature'`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Test changes thoroughly
- Update documentation as needed

## 📄 License

This project is proprietary software owned by **MontaCoder**. All rights reserved.

## 📞 Contact & Support

- **Company**: MontaCoder
- **Website**: [CourseMind Platform](http://localhost:8080)
- **Email**: contact@montacoder.com
- **GitHub**: [MontaCoder](https://github.com/MontaCoder)

## 🏆 Acknowledgments

- **Google Generative AI** for powering content creation
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **TipTap** for rich text editing capabilities
- **Lucide React** for beautiful icons
- **Vercel** for deployment platform

---

<div align="center">

**CourseMind** - Revolutionizing online education with AI-powered course creation.

*Built with ❤️ by the MontaCoder team*

[⭐ Star us on GitHub](https://github.com/MontaCoder/CourseMind) | [🐛 Report Issues](https://github.com/MontaCoder/CourseMind/issues) | [💬 Join Discussion](https://github.com/MontaCoder/CourseMind/discussions)

</div>
