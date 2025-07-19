# EduTutor - Educational AI Chat Platform

## Overview

EduTutor is a session-based educational AI chat platform that provides personalized tutoring across multiple subjects. The application features an interactive chat interface with AI tutors, practice paper generation, skills tracking, and YouTube video integration for enhanced learning experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand for global application state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

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
- **Google Gemini API**: Text generation and chat responses
- **YouTube Data API v3**: Educational video search and metadata

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

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

The architecture is designed for easy transition from development to production, with clear separation of concerns and modular components that can be scaled independently.