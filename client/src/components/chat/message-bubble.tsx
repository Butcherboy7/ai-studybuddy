
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "@/components/ui/button";

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  videoUrl?: string;
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
  onYouTubeSearch?: (query: string) => void;
}

export default function MessageBubble({ message, tutorPersona, onYouTubeSearch }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSearchMore = () => {
    if (onYouTubeSearch) {
      // Extract key concepts from the message for better search
      const searchQuery = message.content.length > 100 
        ? message.content.substring(0, 100) 
        : message.content;
      onYouTubeSearch(searchQuery);
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
              
              {/* Search for more videos button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchMore}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                <i className="fab fa-youtube mr-1"></i>
                Find more videos
              </Button>
            </div>
          )}
        </div>
        
        {/* Message metadata */}
        <div className={`mt-1 text-xs text-muted-foreground ${isUser ? 'text-right' : ''}`}>
          {isUser ? 'You' : tutorPersona.name}
        </div>
      </div>
    </div>
  );
}
