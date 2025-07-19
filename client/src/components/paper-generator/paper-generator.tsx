import { useState } from "react";
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

  const generatePaperMutation = useMutation({
    mutationFn: async (paperConfig: PaperConfig) => {
      const response = await apiRequest("POST", "/api/practice-paper", {
        sessionId,
        subject: paperConfig.subject,
        topic: paperConfig.topic,
        difficulty: paperConfig.difficulty,
        questionCount: paperConfig.questionCount,
        questionTypes: paperConfig.questionTypes
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
      toast({
        title: "Error",
        description: "Failed to generate practice paper. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGeneratePaper = () => {
    if (!config.topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic for the practice paper.",
        variant: "destructive"
      });
      return;
    }
    generatePaperMutation.mutate(config);
  };

  const handlePreview = () => {
    toast({
      title: "Preview",
      description: "Preview functionality would show sample questions.",
    });
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
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Practice Paper Generator</h2>
        <p className="text-slate-600">Create custom practice papers tailored to your learning needs</p>
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
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handlePreview}>
              Preview
            </Button>
            <Button 
              onClick={handleGeneratePaper}
              disabled={generatePaperMutation.isPending}
              className="bg-primary hover:bg-blue-700"
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

          {/* Generated Paper Display */}
          {generatedPaper && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Practice Paper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{config.subject}: {config.topic}</h3>
                      <p className="text-sm text-slate-600">
                        {config.questionCount} questions • {config.timeLimit} minutes • {config.difficulty}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Download",
                        description: "Download functionality would be implemented here.",
                      });
                    }}>
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
