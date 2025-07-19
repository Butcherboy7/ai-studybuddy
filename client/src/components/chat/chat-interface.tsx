import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function ChatInterface() {
  const { 
    selectedTutor, 
    messages, 
    addMessage, 
    sessionId, 
    setLoading, 
    isLoading 
  } = useAppStore();
  
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Predefined prompts based on tutor type
  const getPredefinedPrompts = () => {
    const tutorName = selectedTutor?.name || "General";
    
    const promptSets = {
      "Math Tutor": [
        "Explain this concept step by step",
        "Show me an example problem",
        "What are the key formulas?",
        "Practice problems for this topic"
      ],
      "Science Tutor": [
        "Explain the scientific method",
        "Show me a diagram or experiment",
        "What are the real-world applications?",
        "Key terminology and definitions"
      ],
      "English Tutor": [
        "Help me analyze this text",
        "Grammar rules and examples",
        "Writing tips and techniques",
        "Vocabulary expansion exercises"
      ],
      "History Tutor": [
        "Timeline of important events",
        "Cause and effect relationships",
        "Key historical figures",
        "Compare different time periods"
      ],
      "Programming Tutor": [
        "Explain this code concept",
        "Show me a coding example",
        "Best practices and patterns",
        "Debug this problem"
      ],
      "General Tutor": [
        "Explain this concept simply",
        "Give me study tips",
        "Create a learning plan",
        "Test my understanding"
      ]
    };

    return promptSets[tutorName as keyof typeof promptSets] || promptSets["General Tutor"];
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or type your message.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Load existing messages for the session
  const { data: existingMessages } = useQuery({
    queryKey: ['/api/chat', sessionId, 'messages'],
    enabled: !!sessionId,
  });

  // Update local state when messages are loaded
  useEffect(() => {
    if (existingMessages && Array.isArray(existingMessages)) {
      // Only add messages that aren't already in the store
      existingMessages.forEach((msg: any) => {
        if (!messages.find(m => m.id === msg.id)) {
          addMessage({
            role: msg.role,
            content: msg.content,
            videoUrl: msg.videoUrl
          });
        }
      });
    }
  }, [existingMessages, messages, addMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const messageHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
        tutorPersona: selectedTutor?.name || "General Tutor",
        messageHistory
      });
      return response.json();
    },
    onSuccess: (data) => {
      addMessage({
        role: "assistant",
        content: data.textResponse,
        videoUrl: data.videoURL
      });
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId, 'messages'] });
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Voice recognition functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle predefined prompt selection
  const handlePredefinedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  // Typing indicator
  useEffect(() => {
    if (inputMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsTyping(false);
    
    // Add user message immediately
    addMessage({
      role: "user",
      content: messageText
    });

    setLoading(true);
    sendMessageMutation.mutate(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    // This would clear only the current chat, not the entire session
    // For now, we'll just show a toast
    toast({
      title: "Clear Chat",
      description: "Chat clearing functionality would be implemented here.",
    });
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : selectedTutor?.name || 'Tutor'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  if (!selectedTutor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Tutor Selected</h2>
          <p className="text-muted-foreground">Please select a tutor persona to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 bg-gradient-to-br ${selectedTutor.color} rounded-lg flex items-center justify-center mr-3`}>
              <i className={`${selectedTutor.icon} text-white`}></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedTutor.name}</h2>
              <p className="text-sm text-muted-foreground">Ready to help with your questions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="fas fa-trash"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="fas fa-download"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Predefined Prompts */}
      <div className="px-6 py-3 bg-muted/50 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {getPredefinedPrompts().map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handlePredefinedPrompt(prompt)}
              className="text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        {messages.length === 0 && (
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${selectedTutor.color} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className="fas fa-graduation-cap text-white text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="bg-card border border-border p-4 shadow-sm rounded-lg">
                <p className="text-foreground">
                  Hello! I'm your {selectedTutor.name}. I'm here to help you understand concepts step by step. 
                  What would you like to work on today?
                </p>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            tutorPersona={selectedTutor} 
          />
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${selectedTutor.color} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className="fas fa-graduation-cap text-white text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="bg-card border border-border p-4 shadow-sm rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-card border-t border-border p-4">
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
            <div className="animate-pulse flex space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-150"></div>
            </div>
            <span>Typing...</span>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask me anything about ${selectedTutor.specialization.split(' • ')[0].toLowerCase()}...`}
              className="min-h-[48px] max-h-32 resize-none bg-background border-border text-foreground placeholder:text-muted-foreground pr-12"
              rows={1}
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center font-medium min-h-[48px]"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Send
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>✨ AI responses include relevant videos when helpful</span>
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <Badge variant="secondary" className="text-xs">
                <i className="fas fa-microphone mr-1"></i>
                Voice input available
              </Badge>
            )}
          </div>
          <span>Press Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
