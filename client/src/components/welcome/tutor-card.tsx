import { useAppStore, type TutorPersona } from "@/store/appStore";
import { cn } from "@/lib/utils";

interface TutorCardProps {
  persona: TutorPersona;
}

export default function TutorCard({ persona }: TutorCardProps) {
  const setSelectedTutor = useAppStore(state => state.setSelectedTutor);

  const getHoverColor = (color: string) => {
    if (color.includes('primary')) return 'hover:border-primary';
    if (color.includes('secondary')) return 'hover:border-secondary';
    if (color.includes('accent')) return 'hover:border-accent';
    if (color.includes('orange')) return 'hover:border-orange-500';
    if (color.includes('purple')) return 'hover:border-purple-500';
    if (color.includes('green')) return 'hover:border-green-500';
    return 'hover:border-primary';
  };

  const getTextColor = (color: string) => {
    if (color.includes('primary')) return 'group-hover:text-primary';
    if (color.includes('secondary')) return 'group-hover:text-secondary';
    if (color.includes('accent')) return 'group-hover:text-accent';
    if (color.includes('orange')) return 'group-hover:text-orange-500';
    if (color.includes('purple')) return 'group-hover:text-purple-500';
    if (color.includes('green')) return 'group-hover:text-green-500';
    return 'group-hover:text-primary';
  };

  return (
    <div
      onClick={() => setSelectedTutor(persona)}
      className={cn(
        "group cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-all duration-200",
        getHoverColor(persona.color)
      )}
    >
      <div className="flex items-center mb-4">
        <div className={cn("w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br rounded-xl flex items-center justify-center flex-shrink-0", persona.color)}>
          <i className={cn(persona.icon, "text-white text-base sm:text-lg")}></i>
        </div>
        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
          <h3 className={cn("font-semibold text-slate-900 dark:text-white text-sm sm:text-base", getTextColor(persona.color))}>
            {persona.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 truncate">{persona.specialization}</p>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mb-4 line-clamp-2">{persona.description}</p>
      <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
        <i className={cn(
          "mr-1 flex-shrink-0",
          persona.popularity === 'Most Popular' ? "fas fa-users" :
          persona.popularity === 'Highly Rated' ? "fas fa-star" :
          persona.popularity === 'Quick Response' ? "fas fa-clock" :
          persona.popularity === 'Expert Level' ? "fas fa-graduation-cap" :
          persona.popularity === 'Fast Growing' ? "fas fa-trending-up" :
          "fas fa-infinity"
        )}></i>
        <span className="truncate">{persona.popularity}</span>
      </div>
    </div>
  );
}
