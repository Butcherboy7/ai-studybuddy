import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { tutorPersonas } from "@/components/welcome/welcome-screen";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatInterface() {
  const { 
    selectedTutor, 
    messages, 
    addMessage, 
    sessionId, 
    setLoading, 
    isLoading,
    setSelectedTutor
  } = useAppStore();
  
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        
        if (transcript) {
          setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.log('Voice recognition error:', event.error);
        setIsListening(false);
        
        // Only show toast for actual errors, not for "no-speech" or "aborted"
        if (event.error !== 'no-speech' && event.error !== 'aborted' && event.error !== 'not-allowed') {
          toast({
            title: "Voice Recognition Error", 
            description: `Error: ${event.error}. Please try again or type your message.`,
            variant: "destructive"
          });
        } else if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive"
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };
    } else {
      console.log('Speech recognition not supported in this browser');
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
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please type your message.",
        variant: "destructive"
      });
      return;
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.log('Error starting recognition:', error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle predefined prompt selection (just set input)
  const handlePredefinedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  // Handle predefined prompt auto-send
  const handleSendPredefinedPrompt = async (prompt: string) => {
    if (isLoading) return;
    
    // Add user message immediately
    addMessage({
      role: "user",
      content: prompt
    });

    setLoading(true);
    sendMessageMutation.mutate(prompt);
  };

  // File upload and OCR processing
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported File Type",
          description: "Please upload an image (JPEG, PNG) or PDF file.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        // For PDF files, we'll create a placeholder for now
        // In production, you'd integrate with a PDF text extraction library
        extractedText = `[PDF File: ${file.name}] - PDF text extraction would be implemented here.`;
        
        // Add a message showing the file was uploaded
        addMessage({
          role: "user",
          content: `I've uploaded a PDF file: ${file.name}. Please help me analyze this document.`
        });
      } else {
        // For images, simulate OCR extraction
        extractedText = await performOCR(file);
        
        if (extractedText.trim()) {
          const messageContent = `I've uploaded an image with the following text:\n\n"${extractedText}"\n\nPlease help me understand or work with this content.`;
          
          addMessage({
            role: "user", 
            content: messageContent
          });

          // Auto-send for processing
          setLoading(true);
          sendMessageMutation.mutate(messageContent);
        } else {
          addMessage({
            role: "user",
            content: `I've uploaded an image: ${file.name}. Please help me analyze this image.`
          });
        }
      }

    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingFile(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Simple OCR simulation (in production, you'd use a real OCR service)
  const performOCR = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a placeholder for OCR functionality
        // In production, you'd send the image to an OCR service like Google Vision API
        const sampleTexts = [
          "This is sample extracted text from the image.",
          "Mathematical equation: x² + 2x + 1 = 0",
          "The quick brown fox jumps over the lazy dog.",
          "Please solve this problem step by step.",
        ];
        
        // Simulate OCR processing delay
        setTimeout(() => {
          resolve(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
        }, 1500);
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Remove the typing indicator for user input - we only want it for AI responses

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
      {/* Chat Header with Mode Switcher */}
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
            {/* Mode Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-sm">
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Switch Mode
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {tutorPersonas.map((tutor) => (
                  <DropdownMenuItem
                    key={tutor.id}
                    onClick={() => setSelectedTutor(tutor)}
                    className="flex items-center"
                  >
                    <div className={`w-6 h-6 bg-gradient-to-br ${tutor.color} rounded flex items-center justify-center mr-3`}>
                      <i className={`${tutor.icon} text-white text-xs`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{tutor.name}</div>
                      <div className="text-xs text-muted-foreground">{tutor.specialization.split(' • ')[0]}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
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



      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        {messages.length === 0 && (
          <div className="space-y-4">
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
            
            {/* Initial predefined questions */}
            <div className="px-4 py-2 bg-muted/30 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">Quick start questions:</p>
              <div className="flex flex-wrap gap-2">
                {getPredefinedPrompts().map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendPredefinedPrompt(prompt)}
                    className="text-xs h-7 px-3 bg-background hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {prompt}
                  </Button>
                ))}
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

      {/* Predefined Prompts - Show only after first AI response and hide when loading */}
      {messages.some(msg => msg.role === 'assistant') && !isLoading && (
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {getPredefinedPrompts().map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSendPredefinedPrompt(prompt)}
                className="text-xs h-7 px-3 bg-background hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="bg-card border-t border-border p-4">

        {/* File processing indicator */}
        {isProcessingFile && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedFile?.type === 'application/pdf' ? 'Processing PDF...' : 'Extracting text from image...'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-3">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerFileUpload}
            disabled={isLoading || isProcessingFile}
            className="text-muted-foreground hover:text-foreground px-3 py-3 min-h-[48px]"
            title="Upload image or PDF"
          >
            <i className="fas fa-paperclip"></i>
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask me anything about ${selectedTutor.specialization.split(' • ')[0].toLowerCase()}...`}
              className="min-h-[48px] max-h-32 resize-none bg-background border-border text-foreground placeholder:text-muted-foreground pr-12"
              rows={1}
              disabled={isLoading || isProcessingFile}
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
              disabled={isLoading || isProcessingFile}
              title="Voice input"
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isProcessingFile}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center font-medium min-h-[48px]"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Send
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
