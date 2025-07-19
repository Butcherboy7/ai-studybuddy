# EduTutor - Educational AI Chat Platform

## Overview

EduTutor is a session-based educational AI chat platform that provides personalized tutoring across multiple subjects. The application features an interactive chat interface with AI tutors, practice paper generation, skills tracking, and YouTube video integration for enhanced learning experiences.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred UI framework: Bootstrap 5 for responsive design with modern styling.
Preferred theme: Professional dark mode with dropdown menu in top right corner.
Preferred layout: Collapsible left sidebar with smooth animations.
Project setup: GitHub-friendly with proper documentation and easy deployment.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives + Bootstrap 5
- **Styling**: Tailwind CSS with professional CSS variables + Bootstrap responsive grid
- **State Management**: Zustand for global application state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Theme Management**: Custom ThemeContext with dropdown menu and smooth transitions
- **Components**: Professional dropdown, header with settings, elevated cards with hover effects

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with structured error handling
- **Development**: Hot reloading with Vite middleware integration

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (via Neon serverless)
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Session Management
- **Session-based Architecture**: No user accounts required - sessions are identified by unique session IDs
- **Memory Storage**: In-memory storage implementation for development with interface for database migration
- **State Persistence**: Session data maintained across navigation using Zustand store

### AI Integration
- **Primary AI**: Google Gemini 2.5 Flash model for chat responses
- **Context Management**: Maintains conversation history (last 10 messages) for coherent responses
- **Tutor Personas**: Multiple specialized AI personas (Math, Science, English, etc.) with tailored prompts

### YouTube Integration
- **Educational Content**: Automatic video suggestions for concepts that benefit from visual explanations
- **Content Filtering**: Safe search with educational query enhancement
- **Embedded Playback**: YouTube videos embedded directly in chat responses

### Practice Paper Generation
- **AI-Generated Questions**: Custom practice papers based on subject, topic, difficulty, and question count
- **Question Types**: Support for multiple choice, problem solving, and other formats
- **Session Tracking**: Generated papers are saved and tracked within user sessions

## Data Flow

1. **Session Initialization**: App generates unique session ID on first visit
2. **Chat Flow**: User message → Context building → Gemini API → Video analysis → Response with optional video
3. **State Updates**: Local Zustand store updated → UI re-renders → Background API calls for persistence
4. **Navigation**: View switching maintains session context and chat history

## External Dependencies

### AI Services
- **Google Gemini API**: Text generation and chat responses (GEMINI_API_KEY)
- **YouTube Data API v3**: Educational video search and metadata (YOUTUBE_API_KEY)

### UI/UX Libraries
- **Bootstrap 5**: Responsive CSS framework and mobile-first design
- **Radix UI**: Accessible component primitives
- **Shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first styling with dark mode support
- **Font Awesome**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static files served from build output

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **APIs**: Secure API key storage via environment variables
- **Session Management**: In-memory storage with database upgrade path

### Production Considerations
- **Database Migration**: Memory storage can be replaced with PostgreSQL implementation
- **API Rate Limiting**: Consider implementing for Gemini and YouTube APIs
- **Session Persistence**: Database-backed sessions for production scaling
- **Error Handling**: Comprehensive error boundaries and API error handling

### Replit Integration
- **Development Mode**: Vite dev server with HMR
- **Runtime Error Overlay**: Replit-specific development tools
- **Cartographer**: Development-only code navigation assistance

## Recent Changes (January 2025)

### Latest Updates - UI Optimization & Quick Actions (January 19, 2025)
- **Compact Tutor Cards**: Optimized layout to save vertical space by moving subject tags into small pills and popularity badges to header row
- **Contextual Quick Actions**: Replaced static quick actions with dynamic buttons like "Explain like I'm 5", "Give me examples", "Make it simpler" that appear above chat input after AI responses
- **Smart UI Flow**: Quick start options now disappear after tutor selection and first message to reduce clutter
- **Enhanced Chat UX**: Improved space efficiency throughout the interface for better mobile and desktop experience

## Recent Changes (January 2025)

### Migration to Standard Replit Environment (Latest)
- **Platform Migration**: Successfully migrated from Replit Agent to standard Replit environment
- **API Integration**: Configured GEMINI_API_KEY and YOUTUBE_API_KEY for full functionality
- **UI Optimization**: Redesigned tutor cards for more compact, space-efficient layout
- **Responsive Design**: Subject specializations now displayed as compact tags instead of long text
- **Performance**: Express server running cleanly on port 5000 with Vite HMR integration

### Compact UI Improvements
- **Tutor Card Layout**: Consolidated header elements into single row for better space utilization
- **Tag System**: Converted specialization text to small, visually appealing subject tags
- **Reduced Padding**: Optimized spacing throughout cards for more content per screen
- **Enhanced Visual Hierarchy**: Better organization of information with improved readability

### Major UI/UX Overhaul
- **Professional Dark Mode**: Complete redesign with proper contrast ratios and beautiful color palette
- **Dropdown Settings Menu**: Added professional dropdown in top-right corner for theme switching and settings
- **Smooth Animations**: Added professional transitions and hover effects throughout the interface
- **Icon Compatibility**: Fixed all icons to work properly in both dark and light modes
- **Card Design**: Modern elevated cards with scale animations and proper shadows
- **Responsive Layout**: Improved mobile experience with better sidebar and overlay handling

### GitHub Deployment Preparation
- **Documentation**: Added comprehensive README.md with setup instructions and features
- **Environment Setup**: Created .env.example with proper API key configuration
- **License & Contributing**: Added MIT license and contribution guidelines
- **Cleanup**: Removed Replit-specific files and dependencies for clean GitHub deployment
- **Professional Styling**: CSS variables system for consistent theming across all components

### Technical Improvements
- **Header Component**: New header with session indicators and settings dropdown
- **Theme System**: Improved dark/light mode switching with better color management
- **Bootstrap Integration**: Professional styling that works with existing component system
- **File Structure**: Organized components for better maintainability

The architecture is designed for easy transition from development to production, with clear separation of concerns and modular components that can be scaled independently. Now fully GitHub-ready for easy cloning and deployment.