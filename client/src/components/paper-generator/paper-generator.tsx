import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';
import { marked } from 'marked';

interface PaperConfig {
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
  questionTypes: string[];
}

export default function PaperGenerator() {
  const { sessionId, addSessionItem } = useAppStore();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<PaperConfig>({
    subject: 'Mathematics',
    topic: '',
    difficulty: 'Intermediate',
    questionCount: 10,
    timeLimit: 60,
    questionTypes: ['Multiple Choice', 'Problem Solving']
  });

  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Download paper as PDF with enhanced formatting
  const downloadPaper = (paperData = generatedPaper) => {
    if (!paperData) return;
    
    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 6;
      let yPosition = margin;

      // Helper function to clean and format text
      const cleanText = (text: string) => {
        // Remove markdown and HTML formatting
        let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
        cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Italic
        cleaned = cleaned.replace(/`(.*?)`/g, '$1'); // Code
        cleaned = cleaned.replace(/<[^>]*>/g, ''); // HTML tags
        cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, ' '); // HTML entities
        return cleaned.trim();
      };

      // Enhanced helper function to add text with better formatting and strict margin control
      const addText = (text: string, fontSize = 10, isBold = false, isCenter = false, indent = 0) => {
        if (!text.trim()) {
          yPosition += lineHeight / 2;
          return;
        }

        // Check if we need a new page with more margin buffer
        if (yPosition > pageHeight - margin - 15) {
          pdf.addPage();
          yPosition = margin + 5; // Start with small buffer on new page
        }

        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const cleanedText = cleanText(text);
        // Ensure text stays within strict margins
        const maxWidth = pageWidth - 2 * margin - indent - 5; // Extra buffer
        const lines = pdf.splitTextToSize(cleanedText, maxWidth);
        
        lines.forEach((line: string, lineIndex: number) => {
          // Check page break for each line
          if (yPosition > pageHeight - margin - 15) {
            pdf.addPage();
            yPosition = margin + 5;
          }
          
          const xPosition = isCenter ? pageWidth / 2 : margin + indent;
          const align = isCenter ? 'center' : 'left';
          
          // Ensure xPosition stays within margins
          const safeXPosition = Math.max(margin, Math.min(xPosition, pageWidth - margin));
          
          pdf.text(line, safeXPosition, yPosition, { align });
          yPosition += lineHeight;
        });
        
        yPosition += 1; // Small spacing after each text block
      };

      // Add decorative border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Header with enhanced styling
      yPosition = 25;
      addText(`${config.subject.toUpperCase()} PRACTICE PAPER`, 18, true, true);
      yPosition += 3;
      addText(`Topic: ${config.topic}`, 13, true, true);
      yPosition += 3;
      addText(`Difficulty: ${config.difficulty} | Questions: ${paperData.questions?.length || config.questionCount} | Time: ${config.timeLimit} minutes`, 10, false, true);
      yPosition += 8;
      
      // Student info section
      addText('Student Information:', 11, true);
      yPosition += 2;
      addText('Name: ________________________________     Date: ________________', 10);
      yPosition += 2;
      addText('Class: _______________     Roll No: _______________     Score: ______ / ______', 10);
      yPosition += 8;
      
      // Separator line
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Instructions
      addText('INSTRUCTIONS:', 11, true);
      yPosition += 2;
      addText('• Read all questions carefully before answering', 9, false, false, 5);
      addText('• Answer all questions in the space provided', 9, false, false, 5);
      addText('• Show all working for calculation questions', 9, false, false, 5);
      addText('• Use clear handwriting and proper grammar', 9, false, false, 5);
      yPosition += 8;

      // Another separator
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Questions with enhanced formatting and strict margin control
      paperData.questions?.forEach((question: any, index: number) => {
        // Ensure question starts on a new line with proper spacing
        if (yPosition > pageHeight - margin - 30) {
          pdf.addPage();
          yPosition = margin + 5;
        }
        
        // Question header with proper alignment
        addText(`Question ${index + 1}`, 12, true, false, 0);
        yPosition += 2;
        
        // Question text with proper word wrapping and margin control
        const questionText = cleanText(question.question);
        addText(questionText, 11, false, false, 0);
        yPosition += 4;

        // Handle different question types with proper indentation
        if (question.options && question.options.length > 0) {
          // Multiple choice options with consistent spacing
          question.options.forEach((option: string, optIndex: number) => {
            const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
            const optionText = cleanText(option);
            addText(`${letter}) ${optionText}`, 10, false, false, 8);
            yPosition += 1; // Small space between options
          });
          yPosition += 4;
        } else {
          // Open-ended question - no answer space as requested
          yPosition += 2;
        }
        
        // Question separator with margin awareness
        if (index < paperData.questions.length - 1) {
          // Ensure separator doesn't go beyond margins
          pdf.setLineWidth(0.1);
          pdf.setDrawColor(200, 200, 200); // Light gray
          const lineStart = margin + 10;
          const lineEnd = pageWidth - margin - 10;
          pdf.line(lineStart, yPosition, lineEnd, yPosition);
          yPosition += 8;
        }
      });

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
        pdf.text(`${config.subject} - ${config.topic}`, margin, pageHeight - 5);
      }

      // Save the PDF
      const fileName = `${config.subject}_${config.topic.replace(/\s+/g, '_')}_Practice_Paper.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF Downloaded",
        description: `Practice paper saved as ${fileName}`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  // New simplified paper generation function
  const generatePaper = async () => {
    if (!config.topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic for the practice paper.",
        variant: "destructive"
      });
      return;
    }
    
    if (config.questionTypes.length === 0) {
      toast({
        title: "Missing Question Types",
        description: "Please select at least one question type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/practice-paper", {
        sessionId,
        subject: config.subject,
        topic: config.topic,
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        questionTypes: config.questionTypes
      });
      
      const data = await response.json();
      setGeneratedPaper(data);
      
      addSessionItem({
        title: `${config.subject}: ${config.topic}`,
        type: 'paper'
      });
      
      // Automatically download the PDF after generation
      setTimeout(() => {
        downloadPaper(data);
      }, 500);
      
      toast({
        title: "Success", 
        description: `Practice paper with ${data.questions?.length || 0} questions generated and downloaded!`,
      });
      
    } catch (error) {
      console.error("Paper generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate practice paper. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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
    'Multiple Choice',
    'Problem Solving', 
    'Short Answer',
    'True/False',
    'Essay Questions'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Practice Paper Generator</h1>
        <p className="text-muted-foreground">
          Generate AI-powered practice papers on any topic
        </p>
      </div>

      <div className="grid gap-6">
        {/* Topic Input - Compact Design */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Enter Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="topic" className="text-sm font-medium">What would you like to practice?</Label>
              <Input
                id="topic"
                value={config.topic}
                onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., Quadratic equations, Photosynthesis, World War II..."
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Paper Configuration - Compact Layout */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Paper Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Settings Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="subject" className="text-sm">Subject</Label>
                <Select value={config.subject} onValueChange={(value) => setConfig(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="difficulty" className="text-sm">Difficulty</Label>
                <Select value={config.difficulty} onValueChange={(value) => setConfig(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="questionCount" className="text-sm">Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="50"
                  value={config.questionCount}
                  onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="timeLimit" className="text-sm">Time (min)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="15"
                  max="300"
                  value={config.timeLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Question Types */}
            <div>
              <Label className="text-sm font-medium">Question Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {questionTypeOptions.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={config.questionTypes.includes(type)}
                      onCheckedChange={(checked) => updateQuestionTypes(type, checked as boolean)}
                    />
                    <Label htmlFor={type} className="text-xs">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate & Download Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={generatePaper}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90 px-8"
            size="lg"
          >
            {isGenerating ? (
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
          {generatedPaper && (
            <Button 
              variant="outline" 
              onClick={() => downloadPaper()}
              size="lg"
              className="px-8"
            >
              <i className="fas fa-download mr-2"></i>
              Download PDF
            </Button>
          )}
        </div>

        {/* Status */}
        {generatedPaper && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                  <i className="fas fa-check-circle"></i>
                  <span>Practice paper generated successfully!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {generatedPaper.questions?.length || 0} questions on {config.subject}: {config.topic}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}