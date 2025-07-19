import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--main-bg)' }}>
      <AppSidebar />
      
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all"
        style={{ 
          backgroundColor: 'var(--card)', 
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        }}
      >
        <i className="fas fa-bars text-lg"></i>
      </button>
      
      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 sidebar-width transform transition-all duration-300 ease-out md:hidden flex flex-col border-r",
        sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
      )}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)'
      }}>
        {/* Mobile header */}
        <div className="flex items-center h-16 px-6 border-b justify-between"
             style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>EduTutor</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Mobile navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: 'welcome', label: 'Welcome', icon: 'fas fa-home', view: 'welcome' as const },
            { id: 'chat', label: 'Chat', icon: 'fas fa-comments', view: 'chat' as const },
            { id: 'paper-generator', label: 'Practice Papers', icon: 'fas fa-file-alt', view: 'paper-generator' as const },
            { id: 'skills', label: 'Skills & Growth', icon: 'fas fa-chart-line', view: 'skills' as const }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                useAppStore.getState().setCurrentView(item.view);
                toggleSidebar();
              }}
              className={cn(
                "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all",
                currentView === item.view
                  ? "bg-primary/10 dark:bg-primary/10 shadow-sm text-primary"
                  : "hover:bg-muted dark:hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <i className={cn(item.icon, "mr-3 text-lg")}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-sidebar",
        sidebarCollapsed ? "sidebar-margin-collapsed" : "sidebar-margin",
        "pt-16 md:pt-0"
      )}>
        <Header />
        {renderMainContent()}
      </div>
    </div>
  );
}
