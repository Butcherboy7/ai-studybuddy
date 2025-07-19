import { useAppStore } from "@/store/appStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SkillsTracking() {
  const { sessionItems } = useAppStore();
  const { toast } = useToast();

  // Calculate session statistics
  const sessionStats = {
    questionsAnswered: sessionItems.filter(item => item.type === 'chat').length * 4, // Rough estimate
    accuracy: 78, // Mock data - would be calculated from actual performance
    timeSpent: Math.round(sessionItems.length * 0.5 * 10) / 10 // Rough estimate in hours
  };

  const subjectPerformance = [
    {
      id: 'math',
      name: 'Mathematics',
      lastTopic: 'Quadratic Equations',
      progress: 85,
      score: 85,
      questionsCount: 12,
      icon: 'fas fa-calculator',
      color: 'from-primary to-secondary'
    },
    {
      id: 'physics',
      name: 'Physics',
      lastTopic: "Newton's Laws",
      progress: 72,
      score: 72,
      questionsCount: 8,
      icon: 'fas fa-flask',
      color: 'from-secondary to-pink-500'
    },
    {
      id: 'english',
      name: 'English',
      lastTopic: 'Essay Structure',
      progress: 91,
      score: 91,
      questionsCount: 4,
      icon: 'fas fa-book',
      color: 'from-accent to-teal-500'
    }
  ];

  const recommendations = [
    {
      id: 'physics-fundamentals',
      title: 'Focus on Physics Fundamentals',
      description: 'Your physics scores suggest reviewing basic concepts like force and motion before advancing to complex problems.',
      type: 'improvement',
      icon: 'fas fa-lightbulb',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'english-advanced',
      title: 'Excellent English Progress',
      description: "You're excelling in English! Consider tackling more advanced literature analysis or creative writing exercises.",
      type: 'advancement',
      icon: 'fas fa-star',
      color: 'bg-green-50 border-green-200'
    }
  ];

  const handleFollowRecommendation = (recommendationId: string) => {
    toast({
      title: "Recommendation",
      description: "This would create a targeted practice session based on the recommendation.",
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Skills & Growth</h2>
        <p className="text-slate-600">Track your learning progress and identify areas for improvement</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">{sessionStats.questionsAnswered}</span>
                  </div>
                  <h4 className="font-medium text-slate-900">Questions Answered</h4>
                  <p className="text-sm text-slate-600">This session</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">{sessionStats.accuracy}%</span>
                  </div>
                  <h4 className="font-medium text-slate-900">Accuracy Rate</h4>
                  <p className="text-sm text-slate-600">Overall performance</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">{sessionStats.timeSpent}h</span>
                  </div>
                  <h4 className="font-medium text-slate-900">Time Spent</h4>
                  <p className="text-sm text-slate-600">Active learning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 bg-gradient-to-br ${subject.color} rounded-lg flex items-center justify-center mr-3`}>
                        <i className={`${subject.icon} text-white`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{subject.name}</h4>
                        <p className="text-sm text-slate-600">Last: {subject.lastTopic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <div className="w-24 bg-slate-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${subject.id === 'math' ? 'bg-primary' : subject.id === 'physics' ? 'bg-secondary' : 'bg-accent'}`}
                            style={{ width: `${subject.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{subject.score}%</span>
                      </div>
                      <p className="text-xs text-slate-500">{subject.questionsCount} questions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className={`flex items-start p-4 ${rec.color} rounded-lg`}>
                    <div className={`w-8 h-8 ${rec.type === 'improvement' ? 'bg-primary' : 'bg-accent'} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                      <i className={`${rec.icon} text-white text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                      <Button 
                        variant="link" 
                        className={`p-0 h-auto text-sm font-medium ${rec.type === 'improvement' ? 'text-primary hover:text-blue-700' : 'text-accent hover:text-emerald-700'}`}
                        onClick={() => handleFollowRecommendation(rec.id)}
                      >
                        {rec.type === 'improvement' ? 'Start focused practice' : 'Explore advanced topics'} →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
