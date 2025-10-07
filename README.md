#coursemind - AI-Powered Course Generation Platform

![CourseMind Logo](https://i.postimg.cc/wBL9c9Vp/Gemini-Generated-Image-7fr1527fr1527fr1-Photoroom.png)

CourseMind is an AI-first course creation workspace that transforms raw ideas into premium learning experiences in minutes. Built with cutting-edge AI technology, it enables educators, content creators, and organizations to craft studio-grade courses with narrative structure, multimedia assets, and instant assessments.

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
MindCourse/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── ...
├── server/                 # Backend server
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
