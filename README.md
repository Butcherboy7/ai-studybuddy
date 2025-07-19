# EduTutor - AI-Powered Educational Platform

A modern, responsive educational AI tutoring platform with session-based chat, practice paper generation, and multi-modal responses combining text and YouTube videos.

![EduTutor Preview](https://via.placeholder.com/800x400/3b82f6/ffffff?text=EduTutor+AI+Platform)

## 🌟 Features

- **AI-Powered Tutoring**: Multiple specialized AI personas for different subjects (Math, Science, English, etc.)
- **Interactive Chat Interface**: Real-time conversations with AI tutors using Google Gemini
- **YouTube Integration**: Automatic educational video suggestions for visual learning concepts
- **Practice Paper Generator**: AI-generated custom practice papers with explanations
- **Session Management**: No user accounts required - unique session-based interactions
- **Dark/Light Mode**: Professional theme switching with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Collapsible Sidebar**: Space-efficient navigation with smooth animations

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Bootstrap 5 + Custom CSS Variables
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: Wouter
- **UI Components**: Shadcn/ui + Radix UI
- **Backend**: Node.js + Express + TypeScript
- **AI Integration**: Google Gemini API
- **Video Content**: YouTube Data API v3
- **Icons**: Font Awesome

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Gemini API key
- YouTube Data API v3 key

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/edututor.git
   cd edututor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

   **Getting API Keys:**
   - **Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your free API key
   - **YouTube API**: Go to [Google Cloud Console](https://console.cloud.google.com/), enable YouTube Data API v3, and create credentials

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5000` to see the application running!

## 🎯 Usage

1. **Choose Your Tutor**: Select from 6 specialized AI tutors on the welcome screen
2. **Start Learning**: Ask questions and get detailed explanations with optional video content
3. **Generate Practice**: Create custom practice papers for any subject
4. **Track Progress**: View your session activity and learning history
5. **Switch Themes**: Use the dropdown menu in the top-right to toggle dark/light mode

## 🏗️ Project Structure

```
edututor/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and configurations
│   │   ├── store/          # Zustand state management
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── services/           # API service integrations
│   ├── routes.ts           # API routes
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Theme Customization

The app uses CSS custom properties for theming. You can customize colors in `client/src/index.css`:

```css
:root {
  --primary: #3b82f6;
  --background: #ffffff;
  /* ... other variables */
}

.dark {
  --primary: #3b82f6;
  --background: #111827;
  /* ... dark mode variables */
}
```

### Adding New Tutors

Add new tutor personas in `client/src/components/welcome/welcome-screen.tsx`:

```typescript
const tutorPersonas = [
  {
    id: 'new-tutor',
    name: 'New Subject Tutor',
    specialization: 'Your Subject',
    description: 'Description of expertise',
    icon: 'fas fa-icon',
    color: 'from-color-500 to-color-600',
    popularity: 'Expert Level'
  },
  // ... existing tutors
];
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### Environment Variables for Production

Set these environment variables in your production environment:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `YOUTUBE_API_KEY`: Your YouTube Data API v3 key
- `NODE_ENV=production`

### Deployment Platforms

The app can be deployed on:
- **Vercel**: Perfect for the frontend with serverless API routes
- **Netlify**: Great for static hosting with serverless functions
- **Railway**: Full-stack deployment with automatic builds
- **Docker**: Use the included Docker configuration for containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/your-username/edututor/issues) page
2. Create a new issue if your problem isn't listed
3. Join our community discussions

## 🔮 Roadmap

- [ ] User authentication and persistent sessions
- [ ] Advanced analytics and learning insights
- [ ] Offline mode support
- [ ] Mobile app (React Native)
- [ ] Integration with more AI models
- [ ] Collaborative learning features
- [ ] Advanced practice paper customization

---

Made with ❤️ by the EduTutor team. Star ⭐ this repository if you find it helpful!