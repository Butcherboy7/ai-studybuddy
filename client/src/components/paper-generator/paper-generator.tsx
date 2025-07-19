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

  // Download paper as PDF
  const downloadPaper = (paperData = generatedPaper) => {
    if (!paperData) return;
    
    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize = 10, isBold = false, isCenter = false) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const xPosition = isCenter ? pageWidth / 2 : margin;
          const align = isCenter ? 'center' : 'left';
          
          pdf.text(line, xPosition, yPosition, { align });
          yPosition += lineHeight;
        });
        
        yPosition += 2; // Extra spacing after each text block
      };

      // Header
      addText(`${config.subject.toUpperCase()} PRACTICE PAPER`, 16, true, true);
      addText(`Topic: ${config.topic}`, 12, false, true);
      addText(`Difficulty: ${config.difficulty} | Questions: ${config.questionCount} | Time: ${config.timeLimit} minutes`, 10, false, true);
      addText('');
      addText('Name: ___________________________     Date: _______________     Score: ___/___', 10);
      addText('');
      addText('═'.repeat(50), 12);
      addText('');
      
      // Questions
      paperData.questions?.forEach((question: any, index: number) => {
        addText(`QUESTION ${index + 1}                                    [${question.points || 5} points]`, 12, true);
        addText('-'.repeat(50));
        addText('');
        addText(question.question, 11);
        addText('');

        if (question.options && question.options.length > 0) {
          question.options.forEach((option: string, optIndex: number) => {
            const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
            addText(`${letter}) ${option}`, 10);
          });
          addText('');
          addText('Answer: ______', 10);
        } else {
          // For problem-solving questions, provide space for work
          addText('Solution:', 10, true);
          addText('');
          for (let i = 0; i < 6; i++) {
            addText('_'.repeat(80), 10);
          }
        }
        
        addText('');
        addText('');
      });

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
        {/* Topic Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Topic</CardTitle>
            <p className="text-sm text-muted-foreground">
              Specify the topic you want to practice
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Textarea
                  id="topic"
                  value={config.topic}
                  onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Quadratic equations, Photosynthesis, World War II, etc."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paper Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Paper Settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure your practice paper preferences
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label htmlFor="difficulty">Difficulty</Label>
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
                  min="1"
                  max="50"
                  value={config.questionCount}
                  onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                />
              </div>

              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="15"
                  max="300"
                  value={config.timeLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                />
              </div>
            </div>

            <div className="mt-6">
              <Label>Question Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
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