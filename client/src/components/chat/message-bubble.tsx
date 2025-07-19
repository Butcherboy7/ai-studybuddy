
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  videoUrl?: string | null;
  reactions?: string[];
  timestamp?: Date;
}

interface TutorPersona {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface MessageBubbleProps {
  message: Message;
  tutorPersona: TutorPersona;
  onExplainWithVideo?: (content: string) => void;
}

export default function MessageBubble({ message, tutorPersona, onExplainWithVideo }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleExplainWithVideo = () => {
    if (onExplainWithVideo && !isUser) {
      // Extract key concepts from the assistant's message for video search
      const searchQuery = message.content.replace(/[#*`]/g, '').substring(0, 200);
      onExplainWithVideo(searchQuery);
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 ${isUser ? 'bg-blue-500' : `bg-gradient-to-br ${tutorPersona.color}`} rounded-full flex items-center justify-center flex-shrink-0`}>
        <i className={`${isUser ? 'fas fa-user' : 'fas fa-graduation-cap'} text-white text-xs`}></i>
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`${isUser ? 'bg-blue-500 text-white ml-auto' : 'bg-card border border-border'} p-4 shadow-sm rounded-lg`}>
          {isUser ? (
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-foreground prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-2 bg-muted/50 py-2">
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-md font-medium mb-2">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Video embed */}
          {message.videoUrl && !isUser && (
            <div className="mt-4">
              {extractYouTubeId(message.videoUrl) ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(message.videoUrl)}`}
                    title="Educational Video"
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    📺 Related educational content available
                  </p>
                  <a
                    href={message.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Watch Video →
                  </a>
                </div>
              )}
              

            </div>
          )}
        </div>
        
        {/* Explain with Video Button - Only for assistant messages */}
        {!isUser && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExplainWithVideo}
              className="text-xs"
            >
              <Play className="w-3 h-3 mr-2 text-red-500" />
              Explain with Video
            </Button>
          </div>
        )}
        
        {/* Message metadata */}
        <div className={`mt-2 ${isUser ? 'text-right' : ''}`}>
          <div className="text-xs text-muted-foreground">
            {isUser ? 'You' : tutorPersona.name}
            {message.timestamp && (
              <span className="ml-2">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
