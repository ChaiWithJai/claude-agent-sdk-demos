import { Lightbulb, TrendingUp, AlertCircle, Link2, BarChart3 } from 'lucide-react';
import type { Insight } from '../types';

interface InsightsViewProps {
  insights: Insight[];
}

export function InsightsView({ insights }: InsightsViewProps) {
  const getCategoryIcon = (category: Insight['category']) => {
    switch (category) {
      case 'pattern':
        return <TrendingUp className="w-5 h-5" />;
      case 'anomaly':
        return <AlertCircle className="w-5 h-5" />;
      case 'correlation':
        return <Link2 className="w-5 h-5" />;
      case 'metric':
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: Insight['category']) => {
    switch (category) {
      case 'pattern':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'anomaly':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'correlation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'metric':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getConfidenceBadge = (confidence: Insight['confidence']) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-green-100 text-green-800'
    };
    return colors[confidence];
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No insights generated</p>
        <p className="text-sm text-slate-400 mt-2">Try analyzing a log file with more content</p>
      </div>
    );
  }

  // Group by category
  const byCategory = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) acc[insight.category] = [];
    acc[insight.category].push(insight);
    return acc;
  }, {} as Record<string, Insight[]>);

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        Insights & Patterns
      </h3>
      <p className="text-slate-600 mb-6">
        Discovered patterns, anomalies, and correlations in your logs
      </p>

      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['pattern', 'anomaly', 'correlation', 'metric'] as const).map(category => (
          <div
            key={category}
            className={`border rounded-lg p-3 ${getCategoryColor(category)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {getCategoryIcon(category)}
              <span className="text-sm font-semibold capitalize">{category}</span>
            </div>
            <div className="text-2xl font-bold">
              {byCategory[category]?.length || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${getCategoryColor(insight.category)}`}>
                {getCategoryIcon(insight.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-slate-900">
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(insight.category)}`}>
                      {insight.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getConfidenceBadge(insight.confidence)}`}>
                      {insight.confidence} confidence
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
