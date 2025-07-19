import { useAppStore } from "@/store/appStore";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const { currentView, setCurrentView, clearSession, sessionItems, sidebarCollapsed, toggleSidebar } = useAppStore();
  const { isDark, toggleTheme } = useTheme();

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
      "fixed inset-y-0 left-0 z-50 flex flex-col sidebar-transition theme-transition border-r d-none d-md-flex",
      sidebarCollapsed ? "w-16" : "w-70",
      "bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700"
    )}>
      {/* Logo and Brand */}
      <div className={cn(
        "flex items-center h-16 border-b border-slate-200 dark:border-gray-700",
        sidebarCollapsed ? "px-3 justify-center" : "px-6"
      )}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">EduTutor</h1>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        )}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 -right-3 w-6 h-6 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 shadow-sm"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className={cn("flex-1 py-6 space-y-2", sidebarCollapsed ? "px-2" : "px-4")}>
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                "w-full flex items-center py-2 text-sm font-medium rounded-lg group transition-colors",
                sidebarCollapsed ? "px-2 justify-center" : "px-3",
                currentView === item.view
                  ? "text-primary bg-blue-50 dark:bg-blue-900/20"
                  : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <i className={cn(
                item.icon, 
                sidebarCollapsed ? "text-lg" : "mr-3", 
                currentView === item.view ? "text-primary" : ""
              )}></i>
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </div>

        {/* Current Session Section */}
        {!sidebarCollapsed && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Current Session
            </h3>
            <div className="mt-3 space-y-1">
              {sessionItems.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-400 dark:text-gray-500">
                  No session activity yet
                </div>
              ) : (
                sessionItems.slice(-5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center px-3 py-2 text-sm text-slate-600 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <i className={cn(
                      "mr-3 text-slate-400 dark:text-gray-500 text-xs",
                      item.type === 'chat' ? "fas fa-message" : 
                      item.type === 'paper' ? "fas fa-file-lines" : 
                      "fas fa-chart-bar"
                    )}></i>
                    <span className="truncate flex-1">{item.title}</span>
                    <span className="ml-auto text-xs text-slate-400 dark:text-gray-500">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Session Controls */}
      <div className={cn("border-t border-slate-200 dark:border-gray-700", sidebarCollapsed ? "p-2" : "p-4")}>
        <div className={cn("space-y-2", sidebarCollapsed ? "flex flex-col items-center" : "")}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 transition-colors",
              sidebarCollapsed ? "w-10 h-10 justify-center" : "w-full px-3 py-2 text-sm justify-center"
            )}
            title={sidebarCollapsed ? (isDark ? "Switch to Light Mode" : "Switch to Dark Mode") : undefined}
          >
            <i className={cn("fas", isDark ? "fa-sun" : "fa-moon", sidebarCollapsed ? "" : "mr-2")}></i>
            {!sidebarCollapsed && (isDark ? "Light Mode" : "Dark Mode")}
          </button>
          
          {/* Clear Session */}
          <button
            onClick={clearSession}
            className={cn(
              "flex items-center font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 transition-colors",
              sidebarCollapsed ? "w-10 h-10 justify-center" : "w-full px-3 py-2 text-sm justify-center"
            )}
            title={sidebarCollapsed ? "Clear Session" : undefined}
          >
            <i className={cn("fas fa-refresh", sidebarCollapsed ? "" : "mr-2")}></i>
            {!sidebarCollapsed && "Clear Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
