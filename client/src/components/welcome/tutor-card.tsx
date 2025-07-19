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
      className="card-elevated cursor-pointer p-5 rounded-2xl group hover:scale-105 transition-all duration-300"
    >
      {/* Compact header with icon, title, and popularity in one row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={cn("w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform", persona.color)}>
            <i className={cn(persona.icon, "text-white text-lg")}></i>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3 className="font-bold text-base mb-0 group-hover:text-blue-600 transition-colors"
                style={{ color: 'var(--text-primary)' }}>
              {persona.name}
            </h3>
          </div>
        </div>
        
        {persona.popularity && (
          <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-primary/10 ml-2 flex-shrink-0">
            <i className={cn(
              "mr-1 text-primary",
              persona.popularity === 'Most Popular' ? "fas fa-users" :
              persona.popularity === 'Highly Rated' ? "fas fa-star" :
              persona.popularity === 'Quick Response' ? "fas fa-clock" :
              persona.popularity === 'Expert Level' ? "fas fa-graduation-cap" :
              persona.popularity === 'Trending' ? "fas fa-trending-up" :
              "fas fa-infinity"
            )}></i>
            <span className="text-primary text-xs">{persona.popularity}</span>
          </div>
        )}
      </div>
      
      {/* Compact specialization as smaller tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {persona.specialization.split(' • ').map((subject, index) => (
          <span 
            key={index}
            className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground font-medium"
          >
            {subject}
          </span>
        ))}
      </div>
      
      <p className="text-sm leading-relaxed mb-3 line-clamp-2"
         style={{ color: 'var(--text-secondary)' }}>
        {persona.description}
      </p>
      
      <div className="flex items-center justify-end">
        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="fas fa-arrow-right text-primary text-xs"></i>
        </div>
      </div>
    </div>
  );
}
