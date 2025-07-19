import { useState, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';

interface PaperConfig {
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
  questionTypes: string[];
  uploadedContent?: string;
}

export default function PaperGenerator() {
  const { sessionId, addSessionItem } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState<PaperConfig>({
    subject: 'Mathematics',
    topic: '',
    difficulty: 'Intermediate',
    questionCount: 10,
    timeLimit: 60,
    questionTypes: ['Multiple Choice', 'Problem Solving']
  });

  const [generatedPaper, setGeneratedPaper] = useState<any>(null);

  // Download paper as PDF
  const downloadPaper = () => {
    if (!generatedPaper) return;
    
    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 6;
      let currentY = margin;
      
      // Helper function to add text with wrapping
      const addText = (text: string, fontSize = 10, isBold = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont(undefined, 'bold');
        else pdf.setFont(undefined, 'normal');
        
        const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        const textHeight = splitText.length * lineHeight;
        
        // Check if we need a new page
        if (currentY + textHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text(splitText, margin, currentY);
        currentY += textHeight + 3;
      };
      
      // Header
      addText('EDUTUTOR PRACTICE PAPER', 16, true);
      addText('═'.repeat(50), 12);
      addText('');
      
      // Paper information
      addText(`Subject: ${config.subject}`, 12, true);
      addText(`Topic: ${config.topic}`, 12, true);
      addText(`Difficulty Level: ${config.difficulty}`, 10);
      addText(`Total Questions: ${config.questionCount}`, 10);
      addText(`Time Limit: ${config.timeLimit} minutes`, 10);
      addText(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 10);
      addText('');
      
      // Instructions
      addText('Instructions:', 12, true);
      addText('• Answer all questions to the best of your ability');
      addText('• Show your work for problem-solving questions');
      addText('• Multiple choice questions have only one correct answer');
      addText('• Manage your time effectively');
      addText('');
      addText('═'.repeat(50), 12);
      addText('');
      
      // Questions
      generatedPaper.questions?.forEach((question: any, index: number) => {
        addText(`QUESTION ${index + 1}                                    [${question.points || 5} points]`, 12, true);
        addText('-'.repeat(50));
        addText('');
        
        addText(question.question, 11);
        addText('');
        
        if (question.options) {
          question.options.forEach((option: string, optIndex: number) => {
            addText(`${String.fromCharCode(65 + optIndex)}) ${option}`, 10);
          });
          addText('');
        }
        
        if (question.type === 'Short Answer' || question.type === 'Essay') {
          addText('Answer:');
          addText('_'.repeat(50));
          addText('_'.repeat(50));
          addText('_'.repeat(50));
          addText('');
        }
        
        if (question.type === 'Problem Solving') {
          addText('Solution Steps:');
          addText('');
          addText('1. _'.repeat(45));
          addText('');
          addText('2. _'.repeat(45));
          addText('');
          addText('3. _'.repeat(45));
          addText('');
          addText('Final Answer: _'.repeat(35));
          addText('');
        }
        
        addText('');
      });
      
      // Footer
      addText('═'.repeat(50), 12);
      addText('END OF PRACTICE PAPER', 12, true);
      addText('');
      addText('Generated using EduTutor AI - Your Personalized Learning Platform', 9);
      
      // Save PDF
      const fileName = `${config.subject.replace(/\s+/g, '_')}_${config.topic.replace(/\s+/g, '_')}_Practice_Paper_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Practice Paper Downloaded",
        description: `${fileName} saved successfully as PDF!`
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/extract', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedText(data.extractedText || '');
      setConfig(prev => ({ 
        ...prev, 
        uploadedContent: data.extractedText || '',
        topic: prev.topic || 'Content from uploaded file'
      }));
      toast({
        title: "File Processed",
        description: "Text extracted successfully from your file!",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      const isFileSizeError = errorMessage.includes('size') || errorMessage.includes('large');
      const isFileTypeError = errorMessage.includes('type') || errorMessage.includes('format');
      
      toast({
        title: "Upload Failed",
        description: isFileSizeError 
          ? "File is too large. Please use a file smaller than 10MB."
          : isFileTypeError 
          ? "Unsupported file format. Please upload a PDF or image file."
          : "Failed to process the file. Please check the file and try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const generatePaperMutation = useMutation({
    mutationFn: async (paperConfig: PaperConfig) => {
      const response = await apiRequest("POST", "/api/practice-paper", {
        sessionId,
        subject: paperConfig.subject,
        topic: paperConfig.topic,
        difficulty: paperConfig.difficulty,
        questionCount: paperConfig.questionCount,
        questionTypes: paperConfig.questionTypes,
        uploadedContent: paperConfig.uploadedContent
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPaper(data);
      addSessionItem({
        title: `${config.subject}: ${config.topic}`,
        type: 'paper'
      });
      toast({
        title: "Success",
        description: "Practice paper generated successfully!",
      });
    },
    onError: (error) => {
      console.error("Paper generation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      const isValidationError = errorMessage.includes('validation') || errorMessage.includes('invalid');
      
      toast({
        title: isNetworkError ? "Connection Error" : isValidationError ? "Invalid Input" : "Generation Failed",
        description: isNetworkError 
          ? "Unable to connect to the AI service. Please check your internet connection."
          : isValidationError 
          ? "Please check your inputs and try again."
          : "Failed to generate practice paper. Please verify your inputs and try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (PNG, JPG, JPEG, GIF, BMP, TIFF).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);
    uploadFileMutation.mutate(file);
  };

  const handleGeneratePaper = () => {
    if (!config.topic.trim() && !extractedText.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter a topic or upload a file for the practice paper.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure we have at least one question type selected
    if (config.questionTypes.length === 0) {
      toast({
        title: "Missing Question Types",
        description: "Please select at least one question type.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Generating paper with config:", config);
    generatePaperMutation.mutate(config);
  };



  const clearUploadedFile = () => {
    setExtractedText('');
    setUploadedFileName('');
    setConfig(prev => ({ ...prev, uploadedContent: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateQuestionTypes = (type: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: checked 
        ? [...prev.questionTypes, type]
        : prev.questionTypes.filter(t => t !== type)
    }));
  };

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Mixed'];

  const questionTypeOptions = [
    'Multiple Choice', 'Short Answer', 'Problem Solving', 'Essay'
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Practice Paper Generator</h2>
        <p className="text-muted-foreground">Create custom practice papers tailored to your learning needs</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">
          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Subject & Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={config.subject} onValueChange={(value) => setConfig(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={config.topic}
                    onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Quadratic Equations"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Study Material</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload PDF documents or images to generate questions based on your study material
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="outline"
                      className="w-full h-12 border-dashed border-2 hover:border-primary/50"
                    >
                      {isUploading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing {uploadedFileName}...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload mr-2"></i>
                          Upload PDF or Image
                        </>
                      )}
                    </Button>
                  </div>
                  {uploadedFileName && !isUploading && (
                    <Button
                      onClick={clearUploadedFile}
                      variant="outline"
                      size="sm"
                      className="self-start"
                    >
                      <i className="fas fa-times mr-1"></i>
                      Clear
                    </Button>
                  )}
                </div>
                
                {uploadedFileName && !isUploading && (
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <i className="fas fa-check-circle text-green-600 dark:text-green-400 mr-2"></i>
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Successfully processed: {uploadedFileName}
                    </span>
                  </div>
                )}

                {extractedText && (
                  <div className="space-y-2">
                    <Label htmlFor="extracted-text">Extracted Content:</Label>
                    <Textarea
                      id="extracted-text"
                      value={extractedText}
                      onChange={(e) => {
                        setExtractedText(e.target.value);
                        setConfig(prev => ({ ...prev, uploadedContent: e.target.value }));
                      }}
                      placeholder="Extracted text will appear here..."
                      className="min-h-[100px] max-h-[200px] text-sm"
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can edit the extracted text before generating questions
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Supported formats:</strong> PDF files and images (PNG, JPG, JPEG, GIF, BMP, TIFF)</p>
                  <p><strong>File size limit:</strong> 10MB maximum</p>
                  <p><strong>OCR Support:</strong> Text will be automatically extracted from images and PDFs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paper Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Paper Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={config.difficulty} onValueChange={(value) => setConfig(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Input
                    id="questionCount"
                    type="number"
                    value={config.questionCount}
                    onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                    min="5"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={config.timeLimit}
                    onChange={(e) => setConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="180"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Types */}
          <Card>
            <CardHeader>
              <CardTitle>Question Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {questionTypeOptions.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={config.questionTypes.includes(type)}
                      onCheckedChange={(checked) => updateQuestionTypes(type, checked as boolean)}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {extractedText && (
                <span className="flex items-center">
                  <i className="fas fa-file-alt mr-1"></i>
                  Content ready: {extractedText.length} characters extracted
                </span>
              )}
            </div>
            <div className="flex space-x-3">

              {generatedPaper && (
                <Button variant="outline" onClick={downloadPaper}>
                  <i className="fas fa-download mr-2"></i>
                  Download PDF
                </Button>
              )}
              <Button 
                onClick={handleGeneratePaper}
                disabled={generatePaperMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {generatePaperMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Generate Paper
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Paper Display */}
          {generatedPaper && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Practice Paper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{config.subject}: {config.topic}</h3>
                      <p className="text-sm text-muted-foreground">
                        {config.questionCount} questions • {config.timeLimit} minutes • {config.difficulty}
                      </p>
                    </div>
                    <Button variant="outline" onClick={downloadPaper}>
                      <i className="fas fa-download mr-2"></i>
                      Download
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedPaper.questions?.slice(0, 3).map((question: any, index: number) => (
                      <div key={index} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <span className="text-sm text-slate-500">{question.points} pts</span>
                        </div>
                        <p className="text-slate-900 mb-2">{question.question}</p>
                        {question.options && (
                          <div className="space-y-1">
                            {question.options.map((option: string, optIndex: number) => (
                              <div key={optIndex} className="text-sm text-slate-600">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {generatedPaper.questions?.length > 3 && (
                      <div className="text-center p-4 text-slate-500">
                        ... and {generatedPaper.questions.length - 3} more questions
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
