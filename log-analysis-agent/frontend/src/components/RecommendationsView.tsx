import { CheckSquare, ArrowRight, TrendingUp } from 'lucide-react';
import type { Recommendation } from '../types';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
}

export function RecommendationsView({ recommendations }: RecommendationsViewProps) {
  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getPriorityBg = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'low':
        return 'from-white to-blue-50 border-blue-200';
      case 'medium':
        return 'from-white to-yellow-50 border-yellow-200';
      case 'high':
        return 'from-white to-orange-50 border-orange-200';
      case 'critical':
        return 'from-white to-red-50 border-red-200';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No recommendations available</p>
      </div>
    );
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        Recommended Actions
      </h3>
      <p className="text-slate-600 mb-6">
        Prioritized action items to resolve identified issues
      </p>

      <div className="space-y-5">
        {sortedRecommendations.map((rec, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 bg-gradient-to-br ${getPriorityBg(rec.priority)} hover:shadow-lg transition-shadow`}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-lg font-bold text-slate-900">
                    {rec.title}
                  </h4>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>

            {/* Action Items */}
            {rec.actionItems.length > 0 && (
              <div className="mb-4 pl-14">
                <h5 className="text-sm font-semibold text-slate-900 mb-3">
                  Action Steps:
                </h5>
                <div className="space-y-2">
                  {rec.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <span className="text-sm text-slate-700 pt-0.5">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Impact */}
            <div className="pl-14 pt-3 border-t border-slate-200">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-slate-600 uppercase">
                    Estimated Impact:
                  </span>
                  <p className="text-sm text-slate-700 mt-1">
                    {rec.estimatedImpact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps Banner */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <ArrowRight className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Ready to implement these fixes?
            </h4>
            <p className="text-sm text-slate-700">
              Start with critical and high priority items first. Each recommendation includes
              specific action steps to help you resolve the issues efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
