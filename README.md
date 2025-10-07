# CourseMind - AI-Powered Course Generation Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/MontaCoder/CourseMind)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

<img src="https://i.postimg.cc/wBL9c9Vp/Gemini-Generated-Image-7fr1527fr1527fr1-Photoroom.png" alt="CourseMind Logo" width="200"/>

CourseMind is an AI-first course creation workspace that transforms raw ideas into premium learning experiences in minutes. Built with cutting-edge AI technology, it enables educators, content creators, and organizations to craft studio-grade courses with narrative structure, multimedia assets, and instant assessments.

## 📸 Screenshots

![CourseMind Dashboard](res/screenshot.png)
*CourseMind Dashboard - AI-powered course generation interface*

## ✨ Key Features

### AI-Orchestrated Course Generation
- Transform transcripts, briefs, and raw notes into structured course modules
- Generate visuals, labs, and comprehension checkpoints automatically
- AI-powered content creation that maintains educational quality

### Adaptive Modality Mixer
- Create theory-based or video-led lessons
- Auto-tune content to your brand voice and learner proficiency
- Support for cinematic image-led learning experiences

### Assessment Fabric
- Craft scenario-based quizzes and reflections
- Semantic depth evaluations that measure mastery
- Automated rubric generation

### Global Scale Support
- 23-language localization layer
- Native-quality translations with cultural nuance
- Built-in accessibility features

### Real-time AI Coach
- Context-aware mentor for learners
- Instant explanations and summaries
- Interactive support during learning

### Live Engagement Analytics
- Track completion rates and dwell time
- Identify knowledge gaps
- Integration with Slack and LMS platforms

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **React Query** - Data fetching and state management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Nodemailer** - Email service

### AI & Integrations
- **Google Generative AI** - AI content generation
- **Stripe, PayPal, Paystack, Flutterwave** - Payment processing
- **Google OAuth** - Social authentication
- **Facebook Login** - Social authentication

### Additional Libraries
- **TipTap** - Rich text editor
- **React YouTube** - Video embedding
- **React PDF** - PDF generation
- **PWA Support** - Progressive Web App features

## 🏗️ Project Structure

```
CourseMind/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── ...
├── backend/                # Backend server
│   └── server.js          # Express server with API routes
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/           # UI component library
│   │   ├── layouts/      # Layout components
│   │   └── ...           # Feature components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin panel pages
│   │   └── ...           # Public pages
│   ├── constants.tsx     # Application constants
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or bun
- MongoDB database

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
# Add other payment gateway keys as needed
```

4. Start the backend server:
```bash
node server.js
```

### Frontend Setup

1. Navigate to the root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Create a `.env` file in the root directory with:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:
```bash
npm run dev
# or
bun run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser.

## 📱 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `node server.js` - Start the Express server

## 🚀 Deployment

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. The built files will be in the `dist/` directory.

### Environment Setup for Production

Ensure your production environment has the following:

- Node.js runtime
- MongoDB database
- Environment variables configured (see `.env` examples above)

### Recommended Deployment Platforms

- **Vercel** - For frontend deployment
- **Railway** - For full-stack deployment
- **Heroku** - For backend deployment
- **AWS/DigitalOcean** - For custom deployments

### Docker Deployment (Optional)

If using Docker:

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "backend/server.js"]
```

## 📚 API Documentation

CourseMind provides a RESTful API for all core functionalities. The API base URL is `/api`.

### Authentication Endpoints

- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/social` - Social authentication (Google/Facebook)
- `POST /api/forgot` - Request password reset
- `POST /api/reset-password` - Reset password with token

### Course Management

- `POST /api/generate` - Generate course content using AI
- `POST /api/course` - Save a new course
- `GET /api/courses` - Retrieve user's courses
- `POST /api/update` - Update existing course
- `POST /api/deletecourse` - Delete a course
- `POST /api/finish` - Mark course as completed
- `GET /api/shareable` - Get shareable courses

### AI Features

- `POST /api/prompt` - Send custom AI prompts
- `POST /api/image` - Generate images
- `POST /api/yt` - Search YouTube videos
- `POST /api/transcript` - Get video transcripts

### Payment & Subscription

- `POST /api/paypal` - PayPal payment processing
- `POST /api/stripe` - Stripe payment processing (if implemented)
- `POST /api/flutterwave` - Flutterwave payment processing

### User Management

- `POST /api/profile` - Update user profile
- `POST /api/data` - Get user data

### Blog Management (Admin)

- `POST /api/createblog` - Create blog post
- `GET /api/getblogs` - Retrieve all blog posts
- `POST /api/updateblogs` - Update blog post
- `POST /api/deleteblogs` - Delete blog post

### Other

- `POST /api/sendcertificate` - Send course completion certificate
- `POST /api/courseshared` - Share course functionality

For detailed request/response formats, refer to the server.js file or use API testing tools like Postman.

## 🧪 Testing

### Running Tests

Currently, the project does not have automated tests configured. To add testing:

1. Install testing framework:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

2. Add test scripts to `package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

3. Example test structure:
```
src/
  components/
    Button.test.tsx
  __tests__/
    utils.test.ts
```

### Manual Testing

- Use the development server to test UI components
- Test API endpoints using Postman or curl
- Verify payment flows in staging environment
- Test course generation with various inputs

## 🎯 Usage

### For Content Creators
1. **Sign Up/Login** - Create an account or log in with Google/Facebook
2. **Generate Course** - Use the AI-powered course generator to create content
3. **Customize** - Edit and refine generated content with the rich text editor
4. **Add Assessments** - Create quizzes and assessments automatically
5. **Publish** - Share your courses with learners

### For Learners
1. **Browse Courses** - Explore available courses
2. **Enroll** - Sign up for courses
3. **Learn** - Access course content and materials
4. **Take Quizzes** - Complete assessments
5. **Get Certificate** - Earn certificates upon completion

### For Administrators
1. **Access Admin Panel** - Log in to `/admin`
2. **Manage Users** - View and manage user accounts
3. **Manage Courses** - Oversee course content
4. **Handle Payments** - Monitor subscriptions and payments
5. **Create Blog Posts** - Publish blog content

## 💳 Payment Integration

CourseMind supports multiple payment gateways:
- **Stripe** (Primary)
- **PayPal**
- **Paystack**
- **Flutterwave**

### Pricing Plans
- **Free Plan** - Basic features
- **Monthly Plan** - $5/month
- **Yearly Plan** - $49/year

## 🌐 Supported Languages

CourseMind supports 23 languages for course localization:
Arabic, Chinese, Dutch, English, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Spanish, Swedish, Turkish, and more.

## ❓ FAQ

### General Questions

**Q: What is CourseMind?**  
A: CourseMind is an AI-powered platform that helps educators and content creators generate high-quality courses quickly using advanced AI technology.

**Q: How does the AI course generation work?**  
A: Simply input your course topic, and our AI analyzes the content to create structured modules, assessments, and multimedia assets automatically.

**Q: Is CourseMind free?**  
A: CourseMind offers a free tier with basic features. Premium plans start at $5/month with advanced AI capabilities.

### Technical Questions

**Q: What technologies does CourseMind use?**  
A: Frontend: React, TypeScript, Vite, Tailwind CSS. Backend: Node.js, Express, MongoDB. AI: Google Generative AI.

**Q: Can I self-host CourseMind?**  
A: Yes, the codebase is available for self-hosting. Follow the installation instructions above.

**Q: Does CourseMind support multiple languages?**  
A: Yes, CourseMind supports 23 languages for course content localization.

### Account & Billing

**Q: What payment methods are accepted?**  
A: We accept Stripe, PayPal, Paystack, and Flutterwave payments.

**Q: Can I cancel my subscription anytime?**  
A: Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.

**Q: Do you offer refunds?**  
A: Please refer to our refund policy for details on eligibility and process.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly

## 📄 License

This project is proprietary software owned by MontaCoder.

## 📞 Contact

- **Company**: MontaCoder
- **Website**: [coursemind.com](http://localhost:8080)
- **Email**: contact@montacoder.com
- **GitHub**: [MontaCoder](https://github.com/MontaCoder)

## 🏆 Acknowledgments

- Built with modern web technologies
- Powered by Google's Generative AI
- UI components from Radix UI
- Icons from Lucide React

---

**CourseMind** - Revolutionizing online education with AI-powered course creation.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app development (React Native)
- [ ] Advanced AI models integration
- [ ] Real-time collaboration tools
- [ ] Enhanced analytics dashboard
- [ ] API rate limiting and optimization
- [ ] Multi-tenant architecture
- [ ] Integration with popular LMS platforms
- [ ] Advanced customization options

### Recent Updates
- ✅ AI-powered course generation
- ✅ Multi-language support
- ✅ Payment gateway integrations
- ✅ PWA implementation
- ✅ Admin panel and blog management

---

**CourseMind** - Revolutionizing online education with AI-powered course creation. 🤖📚
