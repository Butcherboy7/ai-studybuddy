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
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

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
      setAnalysisProgress('');
    },
    onError: () => {
      setAnalysisProgress('');
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
    setAnalysisProgress('Starting analysis...');
    
    // Simulate progress updates
    setTimeout(() => setAnalysisProgress('Analyzing your skills with AI...'), 1000);
    setTimeout(() => setAnalysisProgress('Finding skill gaps...'), 3000);
    setTimeout(() => setAnalysisProgress('Searching for relevant courses...'), 8000);
    setTimeout(() => setAnalysisProgress('Generating your career roadmap...'), 15000);
    
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
          <div className="container max-w-7xl mx-auto p-6 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Career Advisor
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Transform your career with intelligent analysis. Upload your resume, set your goals, and get personalized skill recommendations with curated YouTube courses.
                </p>
              </div>
              
              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12">
                <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Smart Upload</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI extracts skills from PDF or text</p>
                </div>
                
                <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Skill Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Identifies gaps vs career goals</p>
                </div>
                
                <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">YouTube Courses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Curated learning resources</p>
                </div>
                
                <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Career Roadmap</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step development plan</p>
                </div>
              </div>
            </div>

            {/* Main Input Section */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold">Start Your Career Analysis</CardTitle>
                <CardDescription className="text-blue-100">
                  Upload your resume and define your goals to receive personalized guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {/* Resume Upload Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        Resume Upload
                      </h3>
                      
                      <div className="border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-blue-50/50 dark:bg-blue-900/10">
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer">
                          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Upload className="h-10 w-10 text-blue-600" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Drop your resume here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            PDF, JPG, PNG • Max 10MB
                          </p>
                        </label>
                      </div>

                      {uploadMutation.isPending && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="font-medium text-blue-800 dark:text-blue-400">
                              Extracting text from your resume...
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedFile && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                              <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-800 dark:text-green-400">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-500">
                                {Math.round(selectedFile.size / 1024)} KB • Upload successful
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadError && (
                        <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{uploadError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-3">
                        <div className="text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border">
                            or paste text below
                          </span>
                        </div>
                        <Textarea
                          placeholder="Paste your complete resume content here..."
                          className="min-h-[140px] resize-none border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500"
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Career Goals Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-purple-600" />
                        </div>
                        Career Goals
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="career-goal" className="text-base font-medium mb-2 block">
                            What's your target career? *
                          </Label>
                          <Input
                            id="career-goal"
                            placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
                            value={careerGoal}
                            onChange={(e) => setCareerGoal(e.target.value)}
                            className="h-12 text-base border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="target-role" className="text-base font-medium mb-2 block">
                            Specific role (optional)
                          </Label>
                          <Input
                            id="target-role"
                            placeholder="e.g., Senior React Developer, ML Engineer"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="h-12 text-base border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500"
                          />
                        </div>

                        <div className="pt-6">
                          <Button 
                            onClick={handleAnalyze}
                            disabled={!resumeText.trim() || !careerGoal.trim() || analyzeMutation.isPending}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            size="lg"
                          >
                            {analyzeMutation.isPending ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  Analyzing Your Career Path...
                                </div>
                                {analysisProgress && (
                                  <div className="text-sm text-blue-100 font-normal">
                                    {analysisProgress}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <Star className="h-6 w-6" />
                                Analyze My Career Path
                              </div>
                            )}
                          </Button>
                        </div>

                        {/* What You'll Get Preview */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                          <h4 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                            What you'll receive:
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium">Comprehensive skill gap analysis</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-sm font-medium">Curated YouTube courses for each skill</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Target className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="text-sm font-medium">Personal career development roadmap</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                              </div>
                              <span className="text-sm font-medium">Priority-based learning recommendations</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results Section */}
            {analysisResult && analysisResult.analysis && (
              <div className="space-y-8">
                {/* Career Readiness Score */}
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Star className="h-6 w-6" />
                      </div>
                      Career Readiness Assessment
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      AI-powered analysis of your current skills vs career goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Overall Score */}
                      <div className="text-center">
                        <div className={`text-6xl font-bold mb-4 ${getScoreColor(analysisResult.analysis.overallScore || 0)}`}>
                          {analysisResult.analysis.overallScore || 0}%
                        </div>
                        <div className="space-y-3">
                          <Progress value={analysisResult.analysis.overallScore || 0} className="h-4" />
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {analysisResult.analysis.experience || 'Assessment complete'}
                          </p>
                        </div>
                      </div>

                      {/* Current Skills */}
                      <div>
                        <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Current Skills ({(analysisResult.analysis.currentSkills || []).length})
                        </h4>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {(analysisResult.analysis.currentSkills || []).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Skill Gaps */}
                      <div>
                        <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Skills to Develop ({(analysisResult.analysis.skillGaps || []).length})
                        </h4>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {(analysisResult.analysis.skillGaps || []).map((skill, index) => (
                            <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Path with YouTube Courses */}
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      Personalized Learning Path
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Priority-based skill development with curated YouTube courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      {/* High Priority Skills */}
                      {(analysisResult.analysis.recommendations || []).filter(rec => rec.priority === 'High').length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            High Priority Skills (Start Here!)
                          </h3>
                          <div className="grid gap-6">
                            {(analysisResult.analysis.recommendations || [])
                              .filter(rec => rec.priority === 'High')
                              .map((rec, index) => (
                                <div key={index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 rounded-r-xl p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <h4 className="text-xl font-bold text-red-800 dark:text-red-300">{rec.skill}</h4>
                                    <Badge variant="destructive" className="text-sm font-semibold">
                                      HIGH PRIORITY
                                    </Badge>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                    {rec.description}
                                  </p>
                                  
                                  {rec.courses && rec.courses.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <i className="fab fa-youtube text-red-600 text-xl"></i>
                                        Recommended YouTube Courses
                                      </h5>
                                      <div className="grid gap-4">
                                        {rec.courses.map((course, courseIndex) => (
                                          <a
                                            key={courseIndex}
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group"
                                          >
                                            <div className="flex items-start gap-4">
                                              <div className="flex-shrink-0">
                                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                                  <i className="fab fa-youtube text-red-600 text-2xl"></i>
                                                </div>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h6 className="font-semibold text-lg text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 line-clamp-2 mb-2">
                                                  {course.title}
                                                </h6>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                  <span className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {course.channel}
                                                  </span>
                                                  {course.duration && (
                                                    <span className="flex items-center gap-1">
                                                      <Clock className="h-4 w-4" />
                                                      {course.duration}
                                                    </span>
                                                  )}
                                                </div>
                                                {course.description && (
                                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {course.description}
                                                  </p>
                                                )}
                                              </div>
                                              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
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

                      {/* Medium Priority Skills */}
                      {(analysisResult.analysis.recommendations || []).filter(rec => rec.priority === 'Medium').length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            Medium Priority Skills (Next Phase)
                          </h3>
                          <div className="grid gap-4">
                            {(analysisResult.analysis.recommendations || [])
                              .filter(rec => rec.priority === 'Medium')
                              .map((rec, index) => (
                                <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 rounded-r-xl p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">{rec.skill}</h4>
                                    <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                                      MEDIUM PRIORITY
                                    </Badge>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 mb-4">{rec.description}</p>
                                  
                                  {rec.courses && rec.courses.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-3">Recommended courses:</p>
                                      <div className="grid gap-3">
                                        {rec.courses.slice(0, 2).map((course, courseIndex) => (
                                          <a
                                            key={courseIndex}
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                                          >
                                            <i className="fab fa-youtube text-red-600"></i>
                                            <span className="font-medium text-blue-600 dark:text-blue-400 flex-1">{course.title}</span>
                                            <ExternalLink className="h-4 w-4 text-gray-400" />
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
                      {(analysisResult.analysis.recommendations || []).filter(rec => rec.priority === 'Low').length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            Low Priority Skills (Future Enhancement)
                          </h3>
                          <div className="grid gap-3">
                            {(analysisResult.analysis.recommendations || [])
                              .filter(rec => rec.priority === 'Low')
                              .map((rec, index) => (
                                <div key={index} className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10 rounded-r-xl p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold text-green-800 dark:text-green-300">{rec.skill}</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                                    </div>
                                    {rec.courses && rec.courses.length > 0 && (
                                      <a 
                                        href={rec.courses[0].url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1 font-medium"
                                      >
                                        <i className="fab fa-youtube"></i>
                                        View Course
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Career Roadmap */}
                {analysisResult.roadmap && (
                  <Card className="overflow-hidden border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Target className="h-6 w-6" />
                        </div>
                        Your Personal Career Roadmap
                      </CardTitle>
                      <CardDescription className="text-purple-100">
                        Step-by-step guide to achieving your career goal: {careerGoal}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                          {analysisResult.roadmap}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}