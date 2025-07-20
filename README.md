# EduTutor - AI-Powered Educational Platform

🎓 **EduTutor** is a comprehensive educational AI platform that provides personalized tutoring, practice paper generation, and career growth guidance powered by Google Gemini AI and YouTube API integration.

## ✨ Features

### 🤖 AI Chat Tutors
- **Multi-Subject Tutors**: Math, Science, English, History, Programming, and General tutoring
- **Personalized Learning**: Context-aware conversations that remember your learning progress
- **Smart Video Integration**: Automatic YouTube educational video suggestions for visual learners
- **Session Management**: Seamless navigation between different tutors while maintaining context

### 📝 Practice Paper Generator
- **Custom Question Generation**: AI-created practice papers based on subject, topic, and difficulty
- **Professional PDF Output**: Clean, formatted practice papers ready for printing
- **Flexible Configuration**: Choose question count, difficulty level, and specific topics
- **Instant Generation**: Fast PDF creation with proper formatting and layout

### 🚀 Career Growth Advisor
- **Resume Analysis**: Upload PDF or image resumes for AI-powered skill gap analysis
- **Career Roadmaps**: Personalized learning paths with timelines and actionable steps
- **YouTube Course Recommendations**: Curated educational content for skill development
- **Skill Scoring**: Visual progress tracking with career readiness scores
- **Multiple Career Goals**: Support for any career transition or advancement

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + Shadcn/ui components
- Vite for fast development and building
- TanStack Query for data management
- Wouter for lightweight routing

**Backend:**
- Node.js with Express.js
- TypeScript with ESM modules
- Drizzle ORM with PostgreSQL
- File upload handling with Multer
- PDF processing and OCR capabilities

**AI & APIs:**
- Google Gemini 2.5 Flash for chat and analysis
- YouTube Data API v3 for educational content
- Tesseract.js for OCR text extraction
- PDF2JSON for document processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Neon serverless)
- Google Gemini API key
- YouTube Data API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/edututor.git
cd edututor
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# AI Services
GEMINI_API_KEY="your_google_gemini_api_key"
YOUTUBE_API_KEY="your_youtube_data_api_key"

# Environment
NODE_ENV="development"
PORT=5000
```

4. **Database Setup**
```bash
npm run db:generate
npm run db:migrate
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:5000` to see the application.

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── lib/            # Utilities and configurations
│   │   └── store/          # Global state management
├── server/                 # Express backend
│   ├── services/           # AI and external API services
│   ├── utils/              # Server utilities
│   └── routes.ts           # API endpoints
├── shared/                 # Shared types and schemas
└── docs/                   # Documentation
```

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create credentials (API key)
4. Add to `.env` as `YOUTUBE_API_KEY`

## 🌐 Deployment

### Deploy on Render

1. **Prepare for deployment**
```bash
npm run build
```

2. **Create Render account** at [render.com](https://render.com)

3. **Connect your GitHub repository**

4. **Configure build settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Add your environment variables

5. **Add environment variables in Render dashboard:**
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `YOUTUBE_API_KEY`
   - `NODE_ENV=production`

### Deploy on Other Platforms

The application is configured for easy deployment on:
- Vercel
- Netlify
- Railway
- Heroku
- Any Node.js hosting platform

## 📊 Features in Detail

### AI Chat System
- **Context Awareness**: Maintains conversation history for coherent responses
- **Tutor Specialization**: Each tutor has specialized knowledge and teaching style
- **Visual Learning**: Automatic video suggestions for concepts that benefit from visual explanation
- **Study Mode**: Focused learning environment with minimized distractions

### Practice Paper Generation
- **Intelligent Question Creation**: AI generates relevant questions based on curriculum standards
- **Professional Formatting**: Clean PDF output with proper spacing and typography
- **Customizable Difficulty**: Adaptive question complexity based on student level
- **Topic Targeting**: Focus on specific areas that need improvement

### Career Growth Analysis
- **Comprehensive Resume Parsing**: Extracts skills and experience from PDF/image uploads
- **Industry-Standard Skill Mapping**: Compares current skills against job market requirements
- **Learning Path Generation**: Creates structured roadmaps with timelines and resources
- **Progress Tracking**: Visual indicators of career readiness and skill development

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- YouTube API for educational content integration
- Shadcn/ui for beautiful, accessible components
- The open-source community for amazing tools and libraries

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/yourusername/edututor/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Built with ❤️ for educators and learners worldwide**