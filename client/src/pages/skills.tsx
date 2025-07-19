import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState<'resume' | 'survey'>('resume');
  const [resumeText, setResumeText] = useState('');
  const [surveyAnswers, setSurveyAnswers] = useState({
    experience: '',
    interests: '',
    goals: '',
    timeCommitment: '',
    learningStyle: ''
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setResumeText(result.extractedText);
      toast({
        title: "File uploaded successfully",
        description: `Text extracted from ${file.name}`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
      setUploadedFileName('');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResumeAnalysis = async () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call - in real implementation, this would send to backend
    setTimeout(() => {
      setRecommendations([
        {
          title: "Advanced React Development",
          platform: "Frontend Masters",
          duration: "8 hours",
          difficulty: "Intermediate",
          skills: ["React", "JavaScript", "Component Architecture"],
          match: 95
        },
        {
          title: "Python for Data Science",
          platform: "Coursera",
          duration: "40 hours",
          difficulty: "Beginner",
          skills: ["Python", "Data Analysis", "Machine Learning"],
          match: 88
        },
        {
          title: "UI/UX Design Fundamentals",
          platform: "Udemy",
          duration: "12 hours",
          difficulty: "Beginner",
          skills: ["Design", "Figma", "User Experience"],
          match: 82
        }
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleSurveySubmit = async () => {
    const allAnswered = Object.values(surveyAnswers).every(answer => answer.trim());
    if (!allAnswered) return;

    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setRecommendations([
        {
          title: "Full Stack Web Development",
          platform: "The Odin Project",
          duration: "100+ hours",
          difficulty: "Beginner to Advanced",
          skills: ["HTML", "CSS", "JavaScript", "Node.js", "React"],
          match: 92
        },
        {
          title: "Machine Learning Basics",
          platform: "Kaggle Learn",
          duration: "15 hours",
          difficulty: "Intermediate",
          skills: ["Python", "ML Algorithms", "Data Science"],
          match: 87
        }
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const surveyQuestions = [
    {
      key: 'experience',
      question: 'What is your current experience level with programming?',
      options: ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced']
    },
    {
      key: 'interests',
      question: 'Which areas interest you most?',
      options: ['Web Development', 'Mobile Apps', 'Data Science', 'AI/Machine Learning', 'Game Development']
    },
    {
      key: 'goals',
      question: 'What are your learning goals?',
      options: ['Career Change', 'Skill Enhancement', 'Personal Projects', 'Academic Requirements']
    },
    {
      key: 'timeCommitment',
      question: 'How much time can you dedicate per week?',
      options: ['1-3 hours', '4-7 hours', '8-15 hours', '15+ hours']
    },
    {
      key: 'learningStyle',
      question: 'What is your preferred learning style?',
      options: ['Video Tutorials', 'Reading Documentation', 'Hands-on Projects', 'Interactive Courses']
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">Skills & Growth</h1>
          <p className="text-muted-foreground">Track your learning progress and discover personalized course recommendations</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-muted/30 border-b border-border px-6 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'resume' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('resume')}
              className="px-4 py-2"
            >
              <i className="fas fa-file-alt mr-2"></i>
              Resume Analysis
            </Button>
            <Button
              variant={activeTab === 'survey' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('survey')}
              className="px-4 py-2"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Skills Survey
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {activeTab === 'resume' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-file-alt mr-2 text-primary"></i>
                  Resume Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your resume (PDF or image) or paste your CV text below to get personalized course recommendations based on your experience and skills. Our OCR technology can extract text from images automatically.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Section */}
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
                            Upload Resume (PDF or Image)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {uploadedFileName && !isUploading && (
                    <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <i className="fas fa-check-circle text-green-600 dark:text-green-400 mr-2"></i>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Successfully processed: {uploadedFileName}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Supported formats:</strong> PDF files and images (PNG, JPG, JPEG, GIF, BMP, TIFF)</p>
                    <p><strong>File size limit:</strong> 10MB maximum</p>
                    <p><strong>OCR Support:</strong> Text will be automatically extracted from images using advanced OCR technology</p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="px-3 text-sm text-muted-foreground bg-background">OR</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>
                </div>

                {/* Text Input Section */}
                <div className="space-y-4">
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here, or upload a file above..."
                    className="min-h-[200px] bg-background"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={handleResumeAnalysis}
                      disabled={!resumeText.trim() || isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Analyzing Resume...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search mr-2"></i>
                          Analyze & Get Recommendations
                        </>
                      )}
                    </Button>
                    
                    {resumeText && (
                      <Button 
                        onClick={() => {
                          setResumeText('');
                          setUploadedFileName('');
                          setRecommendations([]);
                        }}
                        variant="outline"
                        size="default"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'survey' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-question-circle mr-2 text-primary"></i>
                  Skills Assessment Survey
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Answer a few questions to help us recommend the best learning path for you.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {surveyQuestions.map((q, index) => (
                  <div key={q.key} className="space-y-3">
                    <h3 className="font-medium text-foreground">{index + 1}. {q.question}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((option) => (
                        <Button
                          key={option}
                          variant={surveyAnswers[q.key as keyof typeof surveyAnswers] === option ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSurveyAnswers(prev => ({ ...prev, [q.key]: option }))}
                          className="justify-start text-left h-auto py-2"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={handleSurveySubmit}
                  disabled={!Object.values(surveyAnswers).every(answer => answer.trim()) || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Get My Learning Path
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-graduation-cap mr-2 text-primary"></i>
                  Recommended Courses
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on your {activeTab === 'resume' ? 'resume analysis' : 'survey responses'}, here are the best courses for you.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((course, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.platform} • {course.duration}</p>
                        </div>
                        <Badge variant={course.match >= 90 ? 'default' : course.match >= 80 ? 'secondary' : 'outline'}>
                          {course.match}% match
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {course.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Difficulty: {course.difficulty}
                        </span>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          View Course
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-clock text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">24h</div>
                    <div className="text-sm text-muted-foreground">Study Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-trophy text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">8</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">78%</div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}