import { useAppStore } from "@/store/appStore";
import TutorCard from "./tutor-card";

// Enhanced tutor personas with better prompt engineering
export const tutorPersonas = [
  {
    id: 'math',
    name: 'Math Tutor',
    specialization: 'Mathematics • Algebra • Calculus • Geometry',
    description: 'Expert in mathematical concepts from basic arithmetic to advanced calculus',
    icon: 'fas fa-calculator',
    color: 'from-blue-500 to-blue-700',
    popularity: 'Most Popular'
  },
  {
    id: 'science',
    name: 'Science Tutor',
    specialization: 'Physics • Chemistry • Biology • Earth Science',
    description: 'Comprehensive science education with practical experiments and real-world applications',
    icon: 'fas fa-flask',
    color: 'from-green-500 to-green-700'
  },
  {
    id: 'english',
    name: 'English Tutor',
    specialization: 'Literature • Writing • Grammar • Reading Comprehension',
    description: 'Improve your language skills, writing abilities, and literary analysis',
    icon: 'fas fa-book',
    color: 'from-purple-500 to-purple-700'
  },
  {
    id: 'history',
    name: 'History Tutor',
    specialization: 'World History • American History • Ancient Civilizations',
    description: 'Explore historical events, cultures, and their impact on modern society',
    icon: 'fas fa-landmark',
    color: 'from-amber-500 to-amber-700'
  },
  {
    id: 'programming',
    name: 'Programming Tutor',
    specialization: 'Python • JavaScript • Web Development • Algorithms',
    description: 'Learn coding fundamentals, programming languages, and software development',
    icon: 'fas fa-code',
    color: 'from-indigo-500 to-indigo-700',
    popularity: 'Trending'
  },
  {
    id: 'general',
    name: 'General Tutor',
    specialization: 'Multi-Subject • Study Skills • Test Prep • Academic Support',
    description: 'Versatile tutor for various subjects and general academic guidance',
    icon: 'fas fa-graduation-cap',
    color: 'from-slate-500 to-slate-700'
  }
];

export default function WelcomeScreen() {
  const { setCurrentView, setSelectedTutor, selectedTutor, messages } = useAppStore();

  const handleStartGeneralChat = () => {
    // Set general tutor and switch to chat
    const generalTutor = tutorPersonas.find(t => t.id === 'general');
    if (generalTutor) {
      setSelectedTutor(generalTutor);
    }
  };

  const handleGeneratePractice = () => {
    setCurrentView('paper-generator');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b px-4 sm:px-8 py-8"
           style={{ 
             backgroundColor: 'var(--header-bg)', 
             borderColor: 'var(--border)' 
           }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i className="fas fa-graduation-cap text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}>
              Welcome to EduTutor
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
               style={{ color: 'var(--text-secondary)' }}>
              Choose your AI tutor and start learning with personalized guidance across multiple subjects
            </p>
          </div>
        </div>
      </div>

      {/* Tutor Persona Selection */}
      <div className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3"
                  style={{ color: 'var(--text-primary)' }}>
                Select Your AI Tutor
              </h2>
              <p className="text-lg"
                 style={{ color: 'var(--text-secondary)' }}>
                Each tutor is specialized for different subjects and learning styles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tutorPersonas.map((persona) => (
                <TutorCard key={persona.id} persona={persona} />
              ))}
            </div>
          </div>

          {/* Quick Actions - Only show when no tutor selected or no messages */}
          {(!selectedTutor || messages.length === 0) && (
            <div className="card-elevated p-6 sm:p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 text-center"
                  style={{ color: 'var(--text-primary)' }}>
                Quick Start Options
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <button
                  onClick={handleStartGeneralChat}
                  className="btn-primary flex items-center p-6 rounded-2xl group hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <i className="fas fa-rocket text-xl"></i>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Start Chat Now</div>
                    <div className="opacity-90">Begin with our general AI tutor</div>
                  </div>
                </button>
                <button
                  onClick={handleGeneratePractice}
                  className="btn-secondary flex items-center p-6 rounded-2xl group hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <i className="fas fa-file-contract text-xl text-blue-600"></i>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Generate Practice</div>
                    <div style={{ color: 'var(--text-muted)' }}>Create custom practice papers</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
