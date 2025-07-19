import { useTheme } from '@/contexts/ThemeContext';
import { useAppStore } from '@/store/appStore';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { clearSession, sessionItems } = useAppStore();

  return (
    <header className="h-16 border-b px-4 flex items-center justify-between"
            style={{ 
              backgroundColor: 'var(--header-bg)', 
              borderColor: 'var(--border)' 
            }}>
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          EduTutor AI Platform
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Session indicator */}
        {sessionItems.length > 0 && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {sessionItems.length} activities
            </span>
          </div>
        )}

        {/* Settings dropdown */}
        <Dropdown
          trigger={
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <i className="fas fa-cog text-lg icon icon-hover"></i>
            </button>
          }
        >
          <DropdownItem
            icon={isDark ? "fas fa-sun" : "fas fa-moon"}
            onClick={toggleTheme}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </DropdownItem>
          
          <DropdownSeparator />
          
          <DropdownItem
            icon="fas fa-chart-bar"
            onClick={() => console.log('View analytics')}
          >
            Session Analytics
          </DropdownItem>
          
          <DropdownItem
            icon="fas fa-download"
            onClick={() => console.log('Export data')}
          >
            Export Session
          </DropdownItem>
          
          <DropdownSeparator />
          
          <DropdownItem
            icon="fas fa-refresh"
            onClick={clearSession}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Clear Session
          </DropdownItem>
          
          <DropdownSeparator />
          
          <DropdownItem
            icon="fas fa-info-circle"
            onClick={() => console.log('About')}
          >
            About EduTutor
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}