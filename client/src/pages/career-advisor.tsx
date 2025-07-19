import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Target, BookOpen, ExternalLink, Clock, User, Star, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function CareerAdvisor() {
  const { sidebarCollapsed, toggleSidebar, setCurrentView } = useAppStore();
  
  // Ensure currentView is synced when component mounts
  useEffect(() => {
    setCurrentView('career-advisor');
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

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/resume', {
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
    },
    onError: (error: Error) => {
      setUploadError(error.message);
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
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--main-bg)' }}>
      <AppSidebar />
      
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all"
        style={{ 
          backgroundColor: 'var(--card)', 
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        }}
      >
        <i className="fas fa-bars text-lg"></i>
      </button>
      
      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "sidebar-margin-collapsed" : "sidebar-margin"
      )}>
        <Header />
        
        <div className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Career Advisor
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Upload your resume and get personalized career guidance with skill gap analysis and YouTube course recommendations
              </p>
            </div>

            {/* Upload and Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume Upload
                  </CardTitle>
                  <CardDescription>
                    Upload your PDF resume or paste the text directly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span> your resume
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
              </label>
                  </div>

                  {uploadMutation.isPending && (
                    <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                      Processing your resume...
                    </div>
                  )}

                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="text-sm text-gray-500 text-center">Or paste text below</div>
                  
                  <Textarea
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

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
                  <div>
                    <Label htmlFor="career-goal">Career Goal *</Label>
                    <Input
                      id="career-goal"
                      placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target-role">Target Role (Optional)</Label>
                    <Input
                      id="target-role"
                      placeholder="e.g., Senior React Developer, ML Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleAnalyze}
                    disabled={!resumeText.trim() || !careerGoal.trim() || analyzeMutation.isPending}
                    className="w-full"
                  >
                    {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze My Resume'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Career Readiness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold ${getScoreColor(analysisResult.analysis.overallScore)}`}>
                        {analysisResult.analysis.overallScore}%
                      </div>
                      <div className="flex-1">
                        <Progress value={analysisResult.analysis.overallScore} className="h-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          {analysisResult.analysis.experience}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                    Current Skills ({analysisResult.analysis.currentSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.analysis.currentSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                    Skill Gaps ({analysisResult.analysis.skillGaps.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.analysis.skillGaps.map((skill, index) => (
                      <Badge key={index} variant="destructive">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{rec.skill}</h5>
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {rec.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {rec.description}
                      </p>
                      
                      {rec.courses && rec.courses.length > 0 && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-medium flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            Recommended Courses
                          </h6>
                          {rec.courses.map((course, courseIndex) => (
                            <div key={courseIndex} className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <a 
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                  >
                                    {course.title}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {course.channel}
                                    </span>
                                    {course.duration && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {course.duration}
                                      </span>
                                    )}
                                  </div>
                                  {course.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {course.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Development Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skills Development Plan
              </CardTitle>
              <CardDescription>
                Focus areas and learning resources to bridge your skill gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* High Priority Skills */}
                {analysisResult.analysis.recommendations.filter(rec => rec.priority === 'High').length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      High Priority Skills (Start Here!)
                    </h4>
                    <div className="grid gap-4">
                      {analysisResult.analysis.recommendations
                        .filter(rec => rec.priority === 'High')
                        .map((rec, index) => (
                          <div key={index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-r-lg">
                            <h5 className="font-semibold text-lg mb-2">{rec.skill}</h5>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{rec.description}</p>
                            
                            {rec.courses && rec.courses.length > 0 && (
                              <div className="mt-4">
                                <h6 className="font-medium mb-3 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Recommended YouTube Courses
                                </h6>
                                <div className="grid gap-3">
                                  {rec.courses.map((course, courseIndex) => (
                                    <div key={courseIndex} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                            <i className="fab fa-youtube text-red-600 text-xl"></i>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <a 
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 font-medium block mb-1 hover:underline"
                                          >
                                            {course.title}
                                          </a>
                                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                            <span className="flex items-center gap-1">
                                              <User className="h-3 w-3" />
                                              {course.channel}
                                            </span>
                                            {course.duration && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {course.duration}
                                              </span>
                                            )}
                                          </div>
                                          {course.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                              {course.description}
                                            </p>
                                          )}
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Medium Priority Skills */}
                {analysisResult.analysis.recommendations.filter(rec => rec.priority === 'Medium').length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Medium Priority Skills (Next Phase)
                    </h4>
                    <div className="grid gap-4">
                      {analysisResult.analysis.recommendations
                        .filter(rec => rec.priority === 'Medium')
                        .map((rec, index) => (
                          <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r-lg">
                            <h5 className="font-semibold mb-2">{rec.skill}</h5>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">{rec.description}</p>
                            
                            {rec.courses && rec.courses.length > 0 && (
                              <div className="mt-3">
                                <h6 className="font-medium mb-2 text-sm">Recommended Courses:</h6>
                                <div className="space-y-2">
                                  {rec.courses.slice(0, 2).map((course, courseIndex) => (
                                    <a 
                                      key={courseIndex}
                                      href={course.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                                    >
                                      <div className="flex items-center gap-2">
                                        <i className="fab fa-youtube text-red-600"></i>
                                        <span className="text-blue-600 hover:text-blue-800 font-medium text-sm">{course.title}</span>
                                        <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {course.channel} {course.duration && `• ${course.duration}`}
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Low Priority Skills */}
                {analysisResult.analysis.recommendations.filter(rec => rec.priority === 'Low').length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Low Priority Skills (Future Enhancement)
                    </h4>
                    <div className="grid gap-3">
                      {analysisResult.analysis.recommendations
                        .filter(rec => rec.priority === 'Low')
                        .map((rec, index) => (
                          <div key={index} className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded-r-lg">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{rec.skill}</h5>
                              {rec.courses && rec.courses.length > 0 && (
                                <a 
                                  href={rec.courses[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                >
                                  <i className="fab fa-youtube"></i>
                                  View Course
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Career Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Personal Career Roadmap
              </CardTitle>
              <CardDescription>
                A step-by-step guide to achieving your career goal: {careerGoal}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysisResult.roadmap}
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}