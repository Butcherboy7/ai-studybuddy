import { type Message, type TutorPersona } from "@/store/appStore";

interface MessageBubbleProps {
  message: Message;
  tutorPersona: TutorPersona;
}

export default function MessageBubble({ message, tutorPersona }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 ${isUser ? 'bg-slate-200' : `bg-gradient-to-br ${tutorPersona.color}`} rounded-full flex items-center justify-center flex-shrink-0`}>
        <i className={`${isUser ? 'fas fa-user text-slate-600' : 'fas fa-graduation-cap text-white'} text-xs`}></i>
      </div>
      <div className="flex-1">
        <div className={`${isUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'} rounded-lg border p-4 shadow-sm`}>
          <p className="text-slate-900 whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* YouTube Video Integration */}
        {message.videoUrl && (
          <div className="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="aspect-video bg-slate-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
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
                      <i className="fas fa-play-circle text-4xl text-slate-400 mb-2"></i>
                      <a 
                        href={message.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-blue-700 underline"
                      >
                        Watch Educational Video
                      </a>
                    </div>
                  );
                }
              })()}
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Educational Video</h4>
            <p className="text-sm text-slate-600">A helpful video to supplement the explanation above</p>
          </div>
        )}
      </div>
    </div>
  );
}
