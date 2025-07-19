import { useAppStore } from "@/store/appStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const { currentView, setCurrentView, clearSession, sessionItems, sidebarCollapsed, toggleSidebar } = useAppStore();
  const { isDark, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const navItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: 'fas fa-comments',
      view: 'chat' as const
    },
    {
      id: 'paper-generator',
      label: 'Practice Paper Generator',
      icon: 'fas fa-file-alt',
      view: 'paper-generator' as const
    },
    {
      id: 'career-advisor',
      label: 'Career Advisor',
      icon: 'fas fa-briefcase',
      view: 'career-advisor' as const
    },
    {
      id: 'skills',
      label: 'Skills & Growth',
      icon: 'fas fa-chart-line',
      view: 'skills' as const
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col border-r hidden md:flex transition-all duration-500 ease-in-out",
      sidebarCollapsed ? "sidebar-width-collapsed" : "sidebar-width"
    )}
    style={{
      backgroundColor: 'var(--sidebar-bg)',
      borderColor: 'var(--sidebar-border)',
      boxShadow: 'var(--shadow)'
    }}>
      {/* Logo and Brand */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b",
        sidebarCollapsed ? "justify-center" : "justify-between"
      )}
      style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className="fas fa-graduation-cap text-white text-sm group-hover:rotate-12 transition-transform duration-300"></i>
          </button>
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-primary transition-all duration-300">EduTutor</h1>
          )}
        </div>
        
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800 dark:hover:to-purple-800 shadow-md hover:shadow-lg hover:scale-105 border border-slate-300 dark:border-slate-600"
            style={{ 
              color: 'var(--text-primary)'
            }}
            title="Collapse sidebar"
          >
            <i className="fas fa-chevron-left text-sm transition-transform duration-300 hover:-translate-x-0.5"></i>
          </button>
        )}
        

      </div>

      {/* Navigation Menu */}
      <nav className={cn("flex-1 py-6 space-y-1", sidebarCollapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              // Debounce navigation to prevent double-clicks and freezing
              if (currentView === item.view) {
                return; // Already on this view
              }
              
              // Update view state first
              setCurrentView(item.view);
              
              // Handle routing for specific pages
              if (item.view === 'career-advisor') {
                setLocation('/career-advisor');
              } else {
                // For all other views, navigate to home (which handles view switching internally)
                setLocation('/');
              }
            }}
            className={cn(
              "w-full flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative transform hover:scale-105",
              sidebarCollapsed ? "px-2 justify-center" : "px-4",
              currentView === item.view
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-primary shadow-lg border border-indigo-200 dark:border-indigo-700"
                : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-700 text-muted-foreground hover:text-foreground hover:shadow-md"
            )}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <i className={cn(
              item.icon, 
              "text-lg transition-all duration-300 group-hover:scale-110",
              sidebarCollapsed ? "" : "mr-3",
              currentView === item.view ? "icon-primary" : "icon"
            )}></i>
            {!sidebarCollapsed && (
              <span className="font-medium">{item.label}</span>
            )}
            {currentView === item.view && !sidebarCollapsed && (
              <div className="absolute right-3 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse shadow-sm"></div>
            )}
          </button>
        ))}
        
        {/* Divider */}
        {!sidebarCollapsed && (
          <div className="my-6 border-t" style={{ borderColor: 'var(--sidebar-border)' }}></div>
        )}

        {/* Recent Activity */}
        {!sidebarCollapsed && (
          <div className="px-1">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)' }}>
              Recent Activity
            </h3>
            <div className="space-y-1">
              {sessionItems.length === 0 ? (
                <div className="px-3 py-2 text-sm rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  No activity yet
                </div>
              ) : (
                sessionItems.slice(-3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all"
                  >
                    <i className={cn(
                      "mr-3 text-xs icon",
                      item.type === 'chat' ? "fas fa-comments" : 
                      item.type === 'paper' ? "fas fa-file-alt" : 
                      "fas fa-chart-line"
                    )}></i>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {item.title}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatTimeAgo(item.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Controls */}
      <div className={cn("border-t p-4", sidebarCollapsed ? "px-2" : "px-4")}
           style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className={cn("space-y-2")}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center font-medium rounded-xl transition-all duration-300 transform hover:scale-105",
              sidebarCollapsed 
                ? "w-12 h-12 justify-center hover:bg-gradient-to-r hover:from-amber-50 hover:to-blue-50 dark:hover:from-amber-900/20 dark:hover:to-blue-900/20" 
                : "w-full px-4 py-3 justify-center bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:from-amber-50 hover:to-blue-50 dark:hover:from-amber-900/30 dark:hover:to-blue-900/30 shadow-md hover:shadow-lg"
            )}
            style={{ color: 'var(--text-secondary)' }}
            title={sidebarCollapsed ? (isDark ? "Switch to Light Mode" : "Switch to Dark Mode") : undefined}
          >
            <i className={cn(
              "fas text-lg transition-all",
              isDark ? "fa-sun text-amber-500" : "fa-moon text-blue-500",
              sidebarCollapsed ? "" : "mr-3"
            )}></i>
            {!sidebarCollapsed && (
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>
          
          {/* Clear Session */}
          <button
            onClick={clearSession}
            className={cn(
              "flex items-center font-medium rounded-xl transition-all duration-300 transform hover:scale-105",
              sidebarCollapsed 
                ? "w-12 h-12 justify-center hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20" 
                : "w-full px-4 py-3 justify-center hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 border border-red-200 dark:border-red-700 shadow-md hover:shadow-lg"
            )}
            style={{ color: 'var(--text-secondary)' }}
            title={sidebarCollapsed ? "Clear Session" : undefined}
          >
            <i className={cn(
              "fas fa-refresh text-lg transition-all text-red-500",
              sidebarCollapsed ? "" : "mr-3"
            )}></i>
            {!sidebarCollapsed && (
              <span className="text-red-600 dark:text-red-400">Clear Session</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
