import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Calendar, 
  Percent,
  Info,
  ChevronRight,
  Star,
  Target,
  Award
} from 'lucide-react';

const CreditScore = ({ userId }) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Mock credit score data - in real app, this would come from API
  const mockCreditData = {
    score: 742,
    maxScore: 850,
    grade: 'Good',
    lastUpdated: '2024-01-15',
    trend: 'up',
    change: 12,
    factors: [
      {
        id: 1,
        factor: 'Payment History',
        impact: 'positive',
        weight: 35,
        status: 'excellent',
        description: 'You have made all payments on time'
      },
      {
        id: 2,
        factor: 'Credit Utilization',
        impact: 'positive',
        weight: 30,
        status: 'good',
        description: 'Using 28% of available credit'
      },
      {
        id: 3,
        factor: 'Length of Credit History',
        impact: 'neutral',
        weight: 15,
        status: 'fair',
        description: '3.2 years average account age'
      },
      {
        id: 4,
        factor: 'Credit Mix',
        impact: 'positive',
        weight: 10,
        status: 'good',
        description: 'Good variety of credit accounts'
      },
      {
        id: 5,
        factor: 'New Credit',
        impact: 'negative',
        weight: 10,
        status: 'needs_attention',
        description: '2 new accounts opened recently'
      }
    ],
    recommendations: [
      {
        id: 1,
        title: 'Reduce Credit Utilization',
        description: 'Try to keep your credit utilization below 30% to improve your score',
        priority: 'high',
        impact: '+15-25 points'
      },
      {
        id: 2,
        title: 'Avoid New Credit Applications',
        description: 'Wait 6 months before applying for new credit to let recent inquiries age',
        priority: 'medium',
        impact: '+5-10 points'
      },
      {
        id: 3,
        title: 'Keep Old Accounts Open',
        description: 'Maintain your oldest credit accounts to improve credit history length',
        priority: 'low',
        impact: '+3-8 points'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setScore(mockCreditData);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-success-400';
    if (score >= 700) return 'text-accent-400';
    if (score >= 650) return 'text-warning-400';
    return 'text-error-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 750) return 'from-success-500 to-success-600';
    if (score >= 700) return 'from-accent-500 to-accent-600';
    if (score >= 650) return 'from-warning-500 to-warning-600';
    return 'from-error-500 to-error-600';
  };

  const getFactorIcon = (status) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-success-400" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-accent-400" />;
      case 'fair':
        return <Clock className="w-5 h-5 text-warning-400" />;
      case 'needs_attention':
        return <AlertCircle className="w-5 h-5 text-error-400" />;
      default:
        return <Info className="w-5 h-5 text-white/60" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error-400 bg-error-500/20 border-error-500/30';
      case 'medium':
        return 'text-warning-400 bg-warning-500/20 border-warning-500/30';
      case 'low':
        return 'text-success-400 bg-success-500/20 border-success-500/30';
      default:
        return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-white/20 rounded w-32"></div>
            <div className="h-4 bg-white/20 rounded w-20"></div>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="w-32 h-32 bg-white/20 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="glass-card p-6 text-center">
        <Shield className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white/90 mb-2">Credit Score Unavailable</h3>
        <p className="text-white/60">Your credit score information is not available at this time.</p>
      </div>
    );
  }

  const scorePercentage = (score.score / score.maxScore) * 100;

  return (
    <div className="space-y-6">
      {/* Main Credit Score Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white/90 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-accent-400" />
            <span>Credit Score</span>
          </h2>
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <Calendar className="w-4 h-4" />
            <span>Updated {new Date(score.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Visualization */}
          <div className="text-center">
            <div className="relative inline-block">
              {/* Circular Progress */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white/20"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${scorePercentage * 3.77} 377`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={`stop-color-${getScoreGradient(score.score).split(' ')[0].replace('from-', '')}`} />
                    <stop offset="100%" className={`stop-color-${getScoreGradient(score.score).split(' ')[1].replace('to-', '')}`} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-4xl font-bold ${getScoreColor(score.score)}`}>
                  {score.score}
                </div>
                <div className="text-white/60 text-sm">out of {score.maxScore}</div>
                <div className="text-white/90 font-medium mt-1">{score.grade}</div>
              </div>
            </div>

            {/* Score Change */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              {score.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-success-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-error-400" />
              )}
              <span className={`font-medium ${score.trend === 'up' ? 'text-success-400' : 'text-error-400'}`}>
                {score.change} points this month
              </span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Score Factors</h3>
            
            {score.factors.map((factor) => (
              <div key={factor.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getFactorIcon(factor.status)}
                    <span className="font-medium text-white/90">{factor.factor}</span>
                  </div>
                  <span className="text-white/60 text-sm">{factor.weight}%</span>
                </div>
                <p className="text-white/70 text-sm">{factor.description}</p>
                
                {/* Factor Weight Bar */}
                <div className="mt-3">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        factor.status === 'excellent' ? 'from-success-500 to-success-600' :
                        factor.status === 'good' ? 'from-accent-500 to-accent-600' :
                        factor.status === 'fair' ? 'from-warning-500 to-warning-600' :
                        'from-error-500 to-error-600'
                      }`}
                      style={{ width: `${factor.weight * 2.5}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
            >
              <span className="text-white/90">View Detailed Report</span>
              <ChevronRight className={`w-4 h-4 text-white/70 transition-transform duration-300 ${showDetails ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Target className="w-6 h-6 text-accent-400" />
          <h3 className="text-lg font-semibold text-white/90">Improvement Recommendations</h3>
        </div>

        <div className="space-y-4">
          {score.recommendations.map((rec) => (
            <div key={rec.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-white/90">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{rec.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-accent-400" />
                  <span className="text-accent-400 font-medium text-sm">Potential Impact: {rec.impact}</span>
                </div>
                <button className="text-accent-400 hover:text-accent-300 text-sm font-medium flex items-center space-x-1 transition-colors duration-300">
                  <span>Learn More</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Monitoring CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-accent-500/20 to-accent-600/20 rounded-xl border border-accent-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-accent-400" />
              <div>
                <h4 className="font-medium text-white/90">Free Credit Monitoring</h4>
                <p className="text-white/70 text-sm">Get alerts when your score changes</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium transition-colors duration-300">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScore;