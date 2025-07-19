import { type Message, type TutorPersona } from "@/store/appStore";

interface MessageBubbleProps {
  message: Message;
  tutorPersona: TutorPersona;
}

export default function MessageBubble({ message, tutorPersona }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 ${isUser ? 'bg-primary' : `bg-gradient-to-br ${tutorPersona.color}`} rounded-full flex items-center justify-center flex-shrink-0`}>
        <i className={`${isUser ? 'fas fa-user text-primary-foreground' : 'fas fa-graduation-cap text-white'} text-xs`}></i>
      </div>
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border-border'} rounded-lg ${!isUser ? 'border' : ''} p-4 shadow-sm ${isUser ? 'max-w-[80%]' : ''}`}>
          <p className={`${isUser ? 'text-primary-foreground' : 'text-foreground'} whitespace-pre-wrap`}>{message.content}</p>
        </div>
        
        {/* YouTube Video Integration */}
        {message.videoUrl && (
          <div className="mt-3 bg-muted dark:bg-muted rounded-lg p-4 border border-border dark:border-border">
            <div className="aspect-video bg-muted dark:bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
              {/* Extract video ID from YouTube URL and create embed */}
              {(() => {
                const videoId = message.videoUrl.split('v=')[1]?.split('&')[0];
                if (videoId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Educational Video"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <div className="text-center">
                      <i className="fas fa-play-circle text-4xl text-muted-foreground mb-2"></i>
                      <a 
                        href={message.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline"
                      >
                        Watch Educational Video
                      </a>
                    </div>
                  );
                }
              })()}
            </div>
            <h4 className="font-medium text-foreground dark:text-foreground mb-1">Educational Video</h4>
            <p className="text-sm text-muted-foreground">A helpful video to supplement the explanation above</p>
          </div>
        )}
      </div>
    </div>
  );
}
