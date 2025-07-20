import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Target, BookOpen, ExternalLink, Clock, User, Star, TrendingUp, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { SkillGapAnalysis } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';

export default function CareerGrowth() {
  const { sidebarCollapsed, toggleSidebar, setCurrentView } = useAppStore();
  const { toast } = useToast();
  
  // Ensure currentView is synced when component mounts
  useEffect(() => {
    setCurrentView('career-growth');
  }, [setCurrentView]);

  const [resumeText, setResumeText] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: SkillGapAnalysis;
    roadmap: string;
  } | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/extract', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResumeText(data.extractedText);
      setUploadError('');
      toast({
        title: "File uploaded successfully",
        description: `Text extracted from ${selectedFile?.name}`,
      });
    },
    onError: (error: Error) => {
      setUploadError(error.message);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Resume analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/analyze-resume', {
        resumeText: resumeText.trim(),
        careerGoal: careerGoal.trim(),
        targetRole: targetRole.trim() || undefined
      });
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setAnalysisProgress('');
      toast({
        title: "Analysis complete!",
        description: "Your personalized career growth plan is ready.",
      });
    },
    onError: (error: any) => {
      setAnalysisProgress('');
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again with a shorter resume or simpler career goal.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/tiff'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please upload a PDF or image file');
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError('File too large. Please upload a file smaller than 10MB');
        return;
      }

      setSelectedFile(file);
      setUploadError('');
      uploadMutation.mutate(file);
    }
  };

  const handleAnalyze = () => {
    if (!resumeText.trim() || !careerGoal.trim()) {
      setUploadError('Please provide both resume text and career goal');
      return;
    }
    
    setAnalysisProgress('Starting AI analysis...');
    
    // Simulate progress updates
    setTimeout(() => setAnalysisProgress('Extracting your current skills...'), 1000);
    setTimeout(() => setAnalysisProgress('Identifying skill gaps for your goal...'), 3000);
    setTimeout(() => setAnalysisProgress('Finding relevant YouTube courses...'), 6000);
    setTimeout(() => setAnalysisProgress('Creating your personalized roadmap...'), 10000);
    
    analyzeMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--main-bg)' }}>
      <AppSidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-64"
      )}>
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Career Growth Advisor
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Upload your resume and get personalized career growth recommendations with YouTube courses
              </p>
            </div>

            {!analysisResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resume Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Your Resume
                    </CardTitle>
                    <CardDescription>
                      Upload a PDF or image file of your resume for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF or Image files (MAX. 10MB)
                          </p>
                        </div>
                        <input 
                          id="resume-upload" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,image/*"
                          onChange={handleFileSelect}
                          disabled={uploadMutation.isPending}
                        />
                      </label>
                    </div>

                    {uploadMutation.isPending && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Processing file...</span>
                      </div>
                    )}

                    {selectedFile && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        ✓ Uploaded: {selectedFile.name}
                      </div>
                    )}

                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="resume-text">Or paste your resume text:</Label>
                      <Textarea
                        id="resume-text"
                        placeholder="Paste your resume content here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Career Goals Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Career Goals
                    </CardTitle>
                    <CardDescription>
                      Tell us about your career aspirations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="career-goal">Career Goal *</Label>
                      <Textarea
                        id="career-goal"
                        placeholder="e.g., Become a Senior Software Engineer specializing in AI/ML..."
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-role">Target Job Role (Optional)</Label>
                      <Input
                        id="target-role"
                        placeholder="e.g., Senior Frontend Developer, Data Scientist, Product Manager"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={handleAnalyze}
                      disabled={!resumeText.trim() || !careerGoal.trim() || analyzeMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Analyze & Get Recommendations
                        </>
                      )}
                    </Button>

                    {analysisProgress && (
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>{analysisProgress}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Analysis Results */
              <div className="space-y-6">
                {/* Header with Score */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Your Career Analysis</h2>
                        <p className="text-muted-foreground">Based on your resume and career goals</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(analysisResult.analysis.overallScore)}`}>
                          {analysisResult.analysis.overallScore}%
                        </div>
                        <p className="text-sm text-muted-foreground">Career Readiness</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={analysisResult.analysis.overallScore} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skills Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Skills Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Current Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.currentSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Skills to Learn</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.skillGaps.map((skill, index) => (
                            <Badge key={index} variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Experience Level</h4>
                        <p className="text-sm text-muted-foreground">{analysisResult.analysis.experience}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Learning Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Priority Learning Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysisResult.analysis.recommendations.map((rec, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{rec.skill}</h4>
                              <Badge variant={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                            
                            {rec.courses && rec.courses.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400">Recommended Courses:</h5>
                                {rec.courses.map((course, courseIndex) => (
                                  <a
                                    key={courseIndex}
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    <Play className="h-4 w-4 text-red-600" />
                                    <span className="flex-1">{course.title}</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Career Roadmap */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Your Personalized Career Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm">{analysisResult.roadmap}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Start Over Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={() => {
                      setAnalysisResult(null);
                      setResumeText('');
                      setCareerGoal('');
                      setTargetRole('');
                      setSelectedFile(null);
                      setUploadError('');
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Start New Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}