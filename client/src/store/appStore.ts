import { create } from 'zustand';

export interface TutorPersona {
  id: string;
  name: string;
  specialization: string;
  description: string;
  icon: string;
  color: string;
  popularity?: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  videoUrl?: string | null;
  reactions?: string[];
  timestamp: Date;
}

export interface SessionItem {
  id: string;
  title: string;
  type: 'chat' | 'paper' | 'skill';
  timestamp: Date;
}

export interface AppState {
  // Current view state
  currentView: 'welcome' | 'chat' | 'paper-generator' | 'skills';
  
  // Session management
  sessionId: string;
  sessionItems: SessionItem[];
  
  // Chat state
  selectedTutor: TutorPersona | null;
  messages: Message[];
  isLoading: boolean;
  
  // UI state
  sidebarCollapsed: boolean;
  
  // Actions
  setCurrentView: (view: AppState['currentView']) => void;
  setSelectedTutor: (tutor: TutorPersona) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearSession: () => void;
  clearMessages: () => void;
  addSessionItem: (item: Omit<SessionItem, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  initializeSession: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// Generate a simple session ID
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'welcome',
  sessionId: generateSessionId(),
  sessionItems: [],
  selectedTutor: null,
  messages: [],
  isLoading: false,
  sidebarCollapsed: true, // Start collapsed on mobile by default

  setCurrentView: (view) => set({ currentView: view }),
  
  setSelectedTutor: (tutor) => {
    set({ selectedTutor: tutor, currentView: 'chat' });
    // Add session item for tutor selection
    get().addSessionItem({
      title: `${tutor.name} Chat`,
      type: 'chat'
    });
  },
  
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: Date.now(), // Using timestamp as number ID
      reactions: message.reactions || [],
      timestamp: new Date()
    };
    set(state => ({
      messages: [...state.messages, newMessage]
    }));
  },
  
  addSessionItem: (item) => {
    const newItem: SessionItem = {
      ...item,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    set(state => ({
      sessionItems: [...state.sessionItems, newItem]
    }));
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearSession: () => set({
    sessionId: generateSessionId(),
    sessionItems: [],
    selectedTutor: null,
    messages: [],
    currentView: 'welcome',
    isLoading: false
  }),
  
  clearMessages: () => set({ messages: [] }),
  
  initializeSession: () => {
    // This can be called to ensure session is properly initialized
    const state = get();
    if (!state.sessionId) {
      set({ sessionId: generateSessionId() });
    }
  },
  
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}));

export const tutorPersonas: TutorPersona[] = [
  {
    id: 'math',
    name: 'Math Tutor',
    specialization: 'Algebra • Calculus • Statistics',
    description: 'Expert guidance in mathematical concepts with step-by-step problem solving and visual explanations.',
    icon: 'fas fa-calculator',
    color: 'from-primary to-secondary',
    popularity: 'Most Popular'
  },
  {
    id: 'science',
    name: 'Science Tutor',
    specialization: 'Physics • Chemistry • Biology',
    description: 'Comprehensive science education with experiments, diagrams, and real-world applications.',
    icon: 'fas fa-flask',
    color: 'from-secondary to-pink-500',
    popularity: 'Highly Rated'
  },
  {
    id: 'english',
    name: 'English Tutor',
    specialization: 'Literature • Writing • Grammar',
    description: 'Improve your language skills with personalized writing feedback and literary analysis.',
    icon: 'fas fa-book',
    color: 'from-accent to-teal-500',
    popularity: 'Quick Response'
  },
  {
    id: 'history',
    name: 'History Tutor',
    specialization: 'World History • Timelines • Analysis',
    description: 'Explore historical events with context, timelines, and critical thinking exercises.',
    icon: 'fas fa-globe',
    color: 'from-orange-500 to-red-500',
    popularity: 'Expert Level'
  },
  {
    id: 'programming',
    name: 'Programming Tutor',
    specialization: 'Python • JavaScript • Algorithms',
    description: 'Learn coding fundamentals with hands-on exercises and debugging assistance.',
    icon: 'fas fa-code',
    color: 'from-purple-500 to-indigo-500',
    popularity: 'Fast Growing'
  },
  {
    id: 'general',
    name: 'General Tutor',
    specialization: 'All Subjects • Homework Help',
    description: 'Get help with any subject or topic with our versatile AI tutor.',
    icon: 'fas fa-brain',
    color: 'from-green-500 to-emerald-500',
    popularity: 'Unlimited Topics'
  }
];
