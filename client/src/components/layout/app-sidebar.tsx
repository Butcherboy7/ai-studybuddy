import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const { currentView, setCurrentView, clearSession, sessionItems } = useAppStore();

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
    <div className="fixed inset-y-0 left-0 z-50 w-70 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo and Brand */}
      <div className="flex items-center h-16 px-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-900">EduTutor</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg group transition-colors",
                currentView === item.view
                  ? "text-primary bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <i className={cn(item.icon, "mr-3", currentView === item.view ? "text-primary" : "")}></i>
              {item.label}
            </button>
          ))}
        </div>

        {/* Current Session Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Session
          </h3>
          <div className="mt-3 space-y-1">
            {sessionItems.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">
                No session activity yet
              </div>
            ) : (
              sessionItems.slice(-5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <i className={cn(
                    "mr-3 text-slate-400 text-xs",
                    item.type === 'chat' ? "fas fa-message" : 
                    item.type === 'paper' ? "fas fa-file-lines" : 
                    "fas fa-chart-bar"
                  )}></i>
                  <span className="truncate flex-1">{item.title}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Session Controls */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={clearSession}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
        >
          <i className="fas fa-refresh mr-2"></i>
          Clear Session
        </button>
      </div>
    </div>
  );
}
