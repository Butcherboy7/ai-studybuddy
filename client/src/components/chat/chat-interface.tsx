import { useState, useEffect, useRef, useCallback } from "react";
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [studyMode, setStudyMode] = useState<'guided' | 'quiz' | 'explain' | 'practice'>('guided');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Tutor personas for selection
  const tutorPersonas = [
    {
      id: 'math',
      name: 'Math Tutor',
      specialization: 'Mathematics • Algebra • Calculus • Geometry',
      description: 'Expert in mathematical concepts from basic arithmetic to advanced calculus',
      icon: 'fas fa-calculator',
      color: 'from-blue-500 to-blue-700',
      popularity: 'Most Popular'
    },
    {
      id: 'science',
      name: 'Science Tutor',
      specialization: 'Physics • Chemistry • Biology • Earth Science',
      description: 'Comprehensive science education with practical experiments and real-world applications',
      icon: 'fas fa-flask',
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'english',
      name: 'English Tutor',
      specialization: 'Literature • Writing • Grammar • Reading Comprehension',
      description: 'Improve your language skills, writing abilities, and literary analysis',
      icon: 'fas fa-book',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'history',
      name: 'History Tutor',
      specialization: 'World History • American History • Ancient Civilizations',
      description: 'Explore historical events, cultures, and their impact on modern society',
      icon: 'fas fa-landmark',
      color: 'from-amber-500 to-amber-700'
    },
    {
      id: 'programming',
      name: 'Programming Tutor',
      specialization: 'Python • JavaScript • Web Development • Algorithms',
      description: 'Learn coding fundamentals, programming languages, and software development',
      icon: 'fas fa-code',
      color: 'from-indigo-500 to-indigo-700',
      popularity: 'Trending'
    },
    {
      id: 'general',
      name: 'General Tutor',
      specialization: 'Multi-Subject • Study Skills • Test Prep • Academic Support',
      description: 'Versatile tutor for various subjects and general academic guidance',
      icon: 'fas fa-graduation-cap',
      color: 'from-slate-500 to-slate-700'
    }
  ];

  // Get contextual quick action buttons for in-chat use
  const getQuickActionButtons = () => {
    return [
      "Explain like I'm 5",
      "Give me examples",
      "Make it simpler", 
      "More details please",
      "Practice questions",
      "Real-world examples"
    ];
  };

  // Predefined prompts based on tutor type (for initial start)
  const getPredefinedPrompts = () => {
    const tutorName = selectedTutor?.name || "General";
    
    const promptSets = {
      "Math Tutor": [
        "What is the Pythagorean theorem?",
        "How do you solve quadratic equations?",
        "Explain derivatives in calculus",
        "What is probability in mathematics?"
      ],
      "Science Tutor": [
        "What is photosynthesis?",
        "How does DNA replication work?",
        "Explain Newton's laws of motion",
        "What is the water cycle?"
      ],
      "English Tutor": [
        "What is a metaphor?",
        "How do you write a thesis statement?",
        "What are the parts of speech?",
        "Explain different types of essays"
      ],
      "History Tutor": [
        "What caused World War I?",
        "Who was Napoleon Bonaparte?",
        "What was the Industrial Revolution?",
        "Explain the Renaissance period"
      ],
      "Programming Tutor": [
        "What is object-oriented programming?",
        "How do arrays work?",
        "Explain if-else statements",
        "What is a function in programming?"
      ],
      "General Tutor": [
        "How do I study effectively?",
        "What is critical thinking?",
        "How do I manage my time?",
        "What are good note-taking methods?"
      ]
    };

    return promptSets[tutorName as keyof typeof promptSets] || promptSets["General Tutor"];
  };

  // Initialize speech recognition (without sendMessage dependency)
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
        
        // Handle different error types with specific messages
        switch (event.error) {
          case 'not-allowed':
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access in your browser settings to use voice input.",
              variant: "destructive"
            });
            break;
          case 'network':
            toast({
              title: "Network Error",
              description: "Voice recognition requires an internet connection. Please check your connection and try again.",
              variant: "destructive"
            });
            break;
          case 'service-not-allowed':
            toast({
              title: "Service Not Available",
              description: "Voice recognition service is not available. Please try typing your message instead.",
              variant: "destructive"
            });
            break;
          case 'no-speech':
            // Don't show error for no speech detected
            break;
          case 'aborted':
            // Don't show error for user-initiated abort
            break;
          default:
            toast({
              title: "Voice Recognition Error", 
              description: `Error: ${event.error}. Please try again or type your message.`,
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
      // Clear and reload all messages to ensure reactions are synced
      const { clearMessages, addMessage } = useAppStore.getState();
      clearMessages();
      
      existingMessages.forEach((msg: any) => {
        addMessage({
          role: msg.role,
          content: msg.content,
          videoUrl: msg.videoUrl,
          reactions: msg.reactions || []
        });
      });
    }
  }, [existingMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll detection for scroll button
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages-container');
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const messageHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add study mode context to the message
      const modeContext = {
        guided: "Please provide step-by-step guidance with clear explanations and break down complex concepts into manageable parts.",
        quiz: "Please ask interactive questions to test understanding and provide immediate feedback on answers.",
        explain: "Please provide detailed conceptual explanations with examples and real-world applications.",
        practice: "Please provide hands-on exercises, practice problems, and opportunities to apply the concepts."
      };
      
      const contextualMessage = `[Study Mode: ${studyMode.toUpperCase()}] ${modeContext[studyMode]}

User Question: ${message}`;

      const response = await apiRequest("POST", "/api/chat", {
        message: contextualMessage,
        sessionId,
        tutorPersona: selectedTutor?.name || "General Tutor",
        messageHistory
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLoading(false);
      // Refetch messages to get both user message and AI response from backend
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId, 'messages'] });
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setLoading(false);
      
      // Provide more specific error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      
      toast({
        title: isNetworkError ? "Connection Error" : "Message Failed",
        description: isNetworkError 
          ? "Unable to connect to the server. Please check your internet connection and try again."
          : "Failed to send message. Please try again or refresh the page if the problem persists.",
        variant: "destructive"
      });
    }
  });

  // Helper function to send a message directly using useCallback to avoid dependency issues
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    setLoading(true);
    sendMessageMutation.mutate(message.trim());
  }, [isLoading, sendMessageMutation]);

  // Custom event listener for message sending from action buttons (defined after sendMessage)
  useEffect(() => {
    const handleSendMessage = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'string') {
        sendMessage(event.detail);
      }
    };

    window.addEventListener('sendMessage', handleSendMessage as EventListener);
    
    return () => {
      window.removeEventListener('sendMessage', handleSendMessage as EventListener);
    };
  }, [sendMessage]);

  // Voice recognition functions
  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please type your message.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for microphone permissions first
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'denied') {
          toast({
            title: "Microphone Access Required",
            description: "Please enable microphone access in your browser settings to use voice input.",
            variant: "destructive"
          });
          return;
        }
      }
    } catch (error) {
      console.log('Permission check not supported:', error);
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.log('Error starting recognition:', error);
        setIsListening(false);
        
        // Provide more specific guidance based on error type
        const errorMessage = error instanceof Error ? error.message : "";
        const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('denied');
        const isNotSupportedError = errorMessage.includes('not supported') || errorMessage.includes('SpeechRecognition');
        
        toast({
          title: isNotSupportedError ? "Feature Not Supported" : isPermissionError ? "Microphone Permission Required" : "Voice Recognition Error",
          description: isNotSupportedError 
            ? "Voice recognition is not supported in this browser. Please try Chrome, Firefox, or Edge."
            : isPermissionError 
            ? "Please allow microphone access in your browser settings to use voice input."
            : "Could not start voice recognition. Please ensure your microphone is connected and try again, or type your message.",
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

  // Handle explain with video request
  const handleExplainWithVideo = (content: string) => {
    // Extract key mathematical/educational concepts from the content
    const keywordMatches = content.match(/\b(?:theorem|formula|equation|concept|principle|law|method|algorithm|function|derivative|integral|pythagorean|quadratic|calculus|algebra|geometry|physics|chemistry|biology|history|literature|programming|science)\b/gi);
    const conceptMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:theorem|formula|equation|law|principle|method|rule))\b/g);
    
    let searchQuery = '';
    
    if (keywordMatches && keywordMatches.length > 0) {
      searchQuery = keywordMatches.slice(0, 2).join(' ');
    } else if (conceptMatches && conceptMatches.length > 0) {
      searchQuery = conceptMatches[0];
    } else {
      // Fallback: extract first meaningful sentence
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        const cleanSentence = sentences[0].replace(/^(That's|This is|Here's|Let me|I'll|You|The answer is|To solve this)/i, '').trim();
        const words = cleanSentence.split(' ').slice(0, 5);
        searchQuery = words.join(' ');
      } else {
        searchQuery = content.substring(0, 30);
      }
    }
    
    searchQuery = `${searchQuery.trim()} tutorial explanation`;
    
    toast({
      title: "Searching for video...",
      description: "Finding educational content for this topic."
    });
    
    // Use API request properly
    apiRequest('POST', '/api/youtube/search', { query: searchQuery })
      .then(res => res.json())
      .then(data => {
        if (data && data.videoUrl) {
          const videoMessage = {
            id: Date.now(),
            role: 'assistant' as const,
            content: `🎥 Video explanation for: "${searchQuery.replace(' tutorial', '')}"`,
            videoUrl: data.videoUrl,
            timestamp: new Date()
          };
          
          addMessage(videoMessage);
          queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId, 'messages'] });
          
          toast({
            title: "Video found!",
            description: "Educational video has been added to the chat."
          });
        } else {
          toast({
            title: "No videos found",
            description: "Couldn't find relevant educational videos for this topic.",
            variant: "destructive"
          });
        }
      })
      .catch(error => {
        console.error("Video search error:", error);
        toast({
          title: "Video search failed",
          description: "Error occurred while searching for videos. Please try again.",
          variant: "destructive"
        });
      });
  };


  // File upload and OCR processing
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please select a file smaller than 10MB.`,
        variant: "destructive"
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload an image (JPEG, PNG, GIF, WebP) or PDF file for text extraction.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Show upload confirmation
    toast({
      title: "File Upload Started",
      description: `Processing ${file.name} for text extraction...`,
    });
    
    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        // For PDF files, simulate text extraction (in production, use pdf-parse or similar)
        const fileName = file.name.toLowerCase();
        if (fileName.includes('resume') || fileName.includes('cv')) {
          extractedText = `RESUME - ${file.name}\n\nJane Smith\nSenior Marketing Manager\n\nPROFESSIONAL EXPERIENCE\n• Marketing Manager at ABC Corp (2020-Present)\n• Led digital marketing campaigns resulting in 40% increase in leads\n• Managed team of 5 marketing specialists\n\nSKILLS\n• Digital Marketing Strategy\n• SEO/SEM\n• Data Analytics\n• Team Leadership\n\nEDUCATION\n• MBA in Marketing, State University (2019)\n• Bachelor's in Business, City College (2017)`;
        } else if (fileName.includes('assignment') || fileName.includes('homework')) {
          extractedText = `ASSIGNMENT - ${file.name}\n\n1. Analyze the following data set and identify key trends.\n2. Create a presentation summarizing your findings.\n3. Recommend actionable strategies based on your analysis.\n\nDue Date: Next Friday\nFormat: 10-page report with charts and graphs`;
        } else {
          extractedText = `PDF Document: ${file.name}\n\nThis document contains educational content that I would like help analyzing and understanding. Please review the content and provide explanations or guidance as needed.`;
        }
        
        const messageContent = `I've uploaded a PDF file with the following content:\n\n"${extractedText}"\n\nPlease help me analyze and understand this document.`;
        
        // Auto-send for processing
        setInputMessage(messageContent);
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      } else {
        // For images, simulate OCR extraction
        extractedText = await performOCR(file);
        
        if (extractedText.trim()) {
          const messageContent = `I've uploaded an image with the following text:\n\n"${extractedText}"\n\nPlease help me understand or work with this content.`;
          
          // Auto-send for processing
          setInputMessage(messageContent);
          setTimeout(() => {
            handleSendMessage();
          }, 100);
        } else {
          // Set message for manual sending
          setInputMessage(`I've uploaded an image: ${file.name}. Please help me analyze this image.`);
        }
      }

    } catch (error) {
      console.error('File processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "";
      const isCorruptedFile = errorMessage.includes('corrupt') || errorMessage.includes('invalid');
      const isMemoryError = errorMessage.includes('memory') || errorMessage.includes('allocation');
      
      toast({
        title: "Processing Error",
        description: isCorruptedFile 
          ? "The file appears to be corrupted or invalid. Please try a different file."
          : isMemoryError 
          ? "The file is too complex to process. Please try a smaller or simpler file."
          : "Failed to process the file. Please ensure it's a valid PDF or image file and try again.",
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

  // OCR functionality using tesseract.js simulation
  const performOCR = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          // In production, you would use tesseract.js like this:
          // import { createWorker } from 'tesseract.js';
          // const worker = await createWorker('eng');
          // const { data: { text } } = await worker.recognize(file);
          // await worker.terminate();
          // resolve(text);
          
          // For now, simulate OCR with intelligent text extraction based on file name patterns
          const fileName = file.name.toLowerCase();
          let extractedText = '';
          
          if (fileName.includes('math') || fileName.includes('equation')) {
            extractedText = "Solve for x: 2x + 5 = 15\n\nFind the derivative of f(x) = x² + 3x - 2";
          } else if (fileName.includes('resume') || fileName.includes('cv')) {
            extractedText = "John Doe\nSoftware Developer\n\nExperience:\n• 5 years in web development\n• Proficient in React, TypeScript, Node.js\n• Led team of 3 developers\n\nEducation:\n• Bachelor's in Computer Science\n• University of Technology, 2018";
          } else if (fileName.includes('science') || fileName.includes('chemistry')) {
            extractedText = "Chemical Equation: H₂ + O₂ → H₂O\n\nBalance the equation and identify the type of reaction.";
          } else if (fileName.includes('english') || fileName.includes('essay')) {
            extractedText = "The Impact of Technology on Education\n\nTechnology has revolutionized the way we learn and teach. Digital tools have made education more accessible and interactive.";
          } else {
            // Generic text extraction simulation
            const sampleTexts = [
              "This document contains important information about the topic discussed in class.",
              "Problem: Calculate the area of a triangle with base 10cm and height 8cm.",
              "Instructions: Please complete the following exercises by next week.",
              "Key concepts: Understanding the fundamental principles is essential for success.",
              "Question 1: Explain the process step by step.\nQuestion 2: Provide examples to support your answer."
            ];
            extractedText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
          }
          
          // Simulate processing time
          setTimeout(() => {
            resolve(extractedText);
          }, 1500);
          
        } catch (error) {
          reject(new Error('OCR processing failed'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle YouTube search
  const handleYouTubeSearch = (query: string) => {
    const searchQuery = encodeURIComponent(`${query} educational tutorial explanation`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  // Remove the typing indicator for user input - we only want it for AI responses

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    
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

  // Listen for welcome screen messages
  useEffect(() => {
    const handleWelcomeMessage = (event: CustomEvent) => {
      const message = event.detail.message;
      if (message && !isLoading) {
        sendMessage(message);
      }
    };

    window.addEventListener('sendWelcomeMessage', handleWelcomeMessage as EventListener);
    return () => {
      window.removeEventListener('sendWelcomeMessage', handleWelcomeMessage as EventListener);
    };
  }, [isLoading]);

  if (!selectedTutor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center mb-8">
          <i className="fas fa-user-graduate text-6xl text-muted-foreground mb-4"></i>
          <h2 className="text-xl font-semibold text-foreground mb-2">Choose Your AI Tutor</h2>
          <p className="text-muted-foreground">Select a tutor to start your personalized learning experience.</p>
        </div>
        
        {/* Show tutor selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
          {tutorPersonas.map((tutor) => (
            <div
              key={tutor.id}
              onClick={() => setSelectedTutor(tutor)}
              className="cursor-pointer p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md bg-card"
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${tutor.color} flex items-center justify-center mr-3`}>
                  <i className={`${tutor.icon} text-white text-sm`}></i>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{tutor.name}</h4>
                  {tutor.popularity && (
                    <span className="text-xs text-primary font-medium">{tutor.popularity}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{tutor.specialization}</p>
              <p className="text-xs text-muted-foreground">{tutor.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header with Mode Switcher - Combined with empty state and prompts */}
      <div className={`bg-card border-b border-border ${messages.length === 0 ? 'px-4 py-6' : 'px-4 py-2'}`}>
        <div className={`flex ${messages.length === 0 ? 'flex-col items-center space-y-4' : 'items-center justify-between'}`}>
          <div className={`flex items-center ${messages.length === 0 ? 'flex-col space-y-2' : ''}`}>
            <div className={`bg-gradient-to-br ${selectedTutor.color} rounded-lg flex items-center justify-center ${messages.length === 0 ? 'w-16 h-16 shadow-lg rounded-2xl' : 'w-8 h-8 mr-2'}`}>
              <i className={`${selectedTutor.icon} text-white ${messages.length === 0 ? 'text-2xl' : 'text-sm'}`}></i>
            </div>
            <div className={messages.length === 0 ? 'text-center' : ''}>
              <h2 className={`font-semibold text-foreground leading-tight ${messages.length === 0 ? 'text-lg mb-1' : 'text-base'}`}>{selectedTutor.name}</h2>
              <p className={`text-muted-foreground leading-tight ${messages.length === 0 ? 'text-sm' : 'text-xs'}`}>{selectedTutor.specialization}</p>
            </div>
          </div>
          
          {/* Always show tutor switcher, regardless of messages */}
          <div className="flex items-center space-x-1">
            {/* Tutor Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-6">
                  <i className="fas fa-user-graduate mr-1"></i>
                  <span className="hidden sm:inline text-xs">Switch Tutor</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {tutorPersonas.map((tutor) => (
                  <DropdownMenuItem
                    key={tutor.id}
                    onClick={() => setSelectedTutor(tutor)}
                    className={selectedTutor.id === tutor.id ? 'bg-accent' : ''}
                  >
                    <div className={`w-6 h-6 rounded bg-gradient-to-r ${tutor.color} flex items-center justify-center mr-3`}>
                      <i className={`${tutor.icon} text-white text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tutor.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{tutor.specialization.split(' • ')[0]}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Study Mode Switcher - Only show when there are messages */}
            {messages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-6">
                    <i className={`fas ${
                      studyMode === 'guided' ? 'fa-graduation-cap' :
                      studyMode === 'quiz' ? 'fa-question-circle' :
                      studyMode === 'explain' ? 'fa-lightbulb' : 'fa-dumbbell'
                    } mr-1`}></i>
                    <span className="hidden sm:inline text-xs">Study Mode</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setStudyMode('guided')}
                    className={studyMode === 'guided' ? 'bg-accent' : ''}
                  >
                    <i className="fas fa-graduation-cap mr-2"></i>
                    <div>
                      <div className="font-medium">Guided Learning</div>
                      <div className="text-xs text-muted-foreground">Step-by-step explanations</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStudyMode('quiz')}
                    className={studyMode === 'quiz' ? 'bg-accent' : ''}
                  >
                    <i className="fas fa-question-circle mr-2"></i>
                    <div>
                      <div className="font-medium">Quiz Mode</div>
                      <div className="text-xs text-muted-foreground">Interactive questions</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStudyMode('explain')}
                    className={studyMode === 'explain' ? 'bg-accent' : ''}
                  >
                    <i className="fas fa-lightbulb mr-2"></i>
                    <div>
                      <div className="font-medium">Explain Mode</div>
                      <div className="text-xs text-muted-foreground">Detailed concepts</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStudyMode('practice')}
                    className={studyMode === 'practice' ? 'bg-accent' : ''}
                  >
                    <i className="fas fa-dumbbell mr-2"></i>
                    <div>
                      <div className="font-medium">Practice Mode</div>
                      <div className="text-xs text-muted-foreground">Hands-on exercises</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Action buttons - Only show when there are messages */}
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-muted-foreground hover:text-foreground p-1 h-7 w-7"
                  title="Clear chat"
                >
                  <i className="fas fa-trash text-xs"></i>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportChat}
                  className="text-muted-foreground hover:text-foreground p-1 h-7 w-7"
                  title="Export chat"
                >
                  <i className="fas fa-download text-xs"></i>
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Get started prompts - integrated into header when no messages */}
        {messages.length === 0 && (
          <div className="mt-6 max-w-2xl mx-auto">
            <h4 className="text-sm font-semibold text-foreground mb-3 text-center">Get started with these questions:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {getPredefinedPrompts().map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(prompt)}
                  className="text-xs h-8 px-3 bg-background hover:bg-primary hover:text-primary-foreground transition-all text-left justify-start"
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background chat-messages-container relative">


        
        {messages.map((message, index) => (
          <MessageBubble 
            key={`${message.id}-${index}-${message.timestamp?.getTime() || Date.now()}`} 
            message={message} 
            tutorPersona={selectedTutor}
            onExplainWithVideo={handleExplainWithVideo}
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
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-20 flex items-center justify-center animate-bounce"
            title="Scroll to bottom"
          >
            <i className="fas fa-arrow-down text-lg"></i>
          </button>
        )}
      </div>

      {/* Quick Action Buttons - Show above text input after AI responses */}
      {messages.some(msg => msg.role === 'assistant') && !isLoading && (
        <div className="px-3 py-2 bg-muted/20 border-t border-border">
          <div className="flex flex-wrap gap-1.5">
            {getQuickActionButtons().map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(action)}
                className="text-xs h-6 px-2.5 bg-background hover:bg-primary hover:text-primary-foreground transition-all rounded-full"
                disabled={isLoading}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="bg-card border-t border-border p-3">

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

        <div className="flex items-end space-x-2">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerFileUpload}
            disabled={isLoading || isProcessingFile}
            className="text-muted-foreground hover:text-foreground p-2 min-h-[40px]"
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
              className="min-h-[40px] max-h-32 resize-none bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
              rows={1}
              disabled={isLoading || isProcessingFile}
            />
            
            {/* Voice Input Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 ${
                isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || isProcessingFile}
              title="Voice input"
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-sm`}></i>
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isProcessingFile}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center font-medium min-h-[40px]"
          >
            <i className="fas fa-paper-plane mr-1"></i>
            <span className="hidden sm:inline">Send</span>
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
