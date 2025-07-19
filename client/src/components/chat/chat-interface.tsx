import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";
import { useToast } from "@/hooks/use-toast";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Tutor Selected</h2>
          <p className="text-slate-600">Please select a tutor persona to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 bg-gradient-to-br ${selectedTutor.color} rounded-lg flex items-center justify-center mr-3`}>
              <i className={`${selectedTutor.icon} text-white`}></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedTutor.name}</h2>
              <p className="text-sm text-slate-500">Ready to help with your questions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <i className="fas fa-trash"></i>
            </button>
            <button
              onClick={handleExportChat}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${selectedTutor.color} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className="fas fa-graduation-cap text-white text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <p className="text-slate-900">
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
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask me anything about ${selectedTutor.specialization.split(' • ')[0].toLowerCase()}...`}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[48px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Send
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
          <span>✨ AI responses include relevant videos when helpful</span>
          <span>Press Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
