import { useAppStore } from "@/store/appStore";
import { tutorPersonas } from "@/store/appStore";
import TutorCard from "./tutor-card";

export default function WelcomeScreen() {
  const { setCurrentView, setSelectedTutor, selectedTutor } = useAppStore();

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
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-4 sm:px-8 py-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to EduTutor</h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300">Choose your AI tutor and start learning with personalized guidance</p>
        </div>
      </div>

      {/* Tutor Persona Selection */}
      <div className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Select Your Tutor Persona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {tutorPersonas.map((persona) => (
                <TutorCard key={persona.id} persona={persona} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleStartGeneralChat}
                className="flex items-center p-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <i className="fas fa-rocket mr-3"></i>
                <div className="text-left">
                  <div className="font-medium">Start Chat Now</div>
                  <div className="text-sm opacity-90">Begin with general tutor</div>
                </div>
              </button>
              <button
                onClick={handleGeneratePractice}
                className="flex items-center p-4 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <i className="fas fa-file-contract mr-3 text-slate-600 dark:text-gray-400"></i>
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-white">Generate Practice</div>
                  <div className="text-sm text-slate-600 dark:text-gray-400">Create custom worksheets</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
