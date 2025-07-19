import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/layout/app-sidebar";
import WelcomeScreen from "@/components/welcome/welcome-screen";
import ChatInterface from "@/components/chat/chat-interface";
import PaperGenerator from "@/components/paper-generator/paper-generator";
import SkillsTracking from "@/components/skills/skills-tracking";

export default function Home() {
  const { currentView, sidebarCollapsed, toggleSidebar } = useAppStore();

  const renderMainContent = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'chat':
        return <ChatInterface />;
      case 'paper-generator':
        return <PaperGenerator />;
      case 'skills':
        return <SkillsTracking />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-900">
      <AppSidebar />
      
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-gray-300 shadow-lg"
      >
        <i className="fas fa-bars"></i>
      </button>
      
      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Mobile sidebar - separate implementation */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-70 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Mobile header */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-gray-700 justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">EduTutor</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 rounded"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Mobile navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="space-y-1">
            {[
              { id: 'chat', label: 'Chat', icon: 'fas fa-comments', view: 'chat' as const },
              { id: 'paper-generator', label: 'Practice Paper Generator', icon: 'fas fa-file-alt', view: 'paper-generator' as const },
              { id: 'skills', label: 'Skills & Growth', icon: 'fas fa-chart-line', view: 'skills' as const }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  useAppStore.getState().setCurrentView(item.view);
                  toggleSidebar();
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  currentView === item.view
                    ? "text-primary bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800"
                )}
              >
                <i className={cn(item.icon, "mr-3", currentView === item.view ? "text-primary" : "")}></i>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden sidebar-transition",
        "md:ml-70 md:dark:ml-70",
        sidebarCollapsed ? "md:ml-16" : "md:ml-70",
        "pt-16 md:pt-0" // Add top padding on mobile for the menu button
      )}>
        {renderMainContent()}
      </div>
    </div>
  );
}
