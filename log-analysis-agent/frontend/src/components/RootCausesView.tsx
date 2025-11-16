import { Target, CheckCircle2, Link } from 'lucide-react';
import type { RootCause } from '../types';

interface RootCausesViewProps {
  rootCauses: RootCause[];
}

export function RootCausesView({ rootCauses }: RootCausesViewProps) {
  const getConfidenceColor = (confidence: RootCause['confidence']) => {
    switch (confidence) {
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  if (rootCauses.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No root causes identified</p>
        <p className="text-sm text-slate-400 mt-2">This could mean no critical issues were found</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        Root Cause Analysis
      </h3>
      <p className="text-slate-600 mb-6">
        Identified root causes based on log analysis and evidence
      </p>

      <div className="space-y-6">
        {rootCauses.map((cause, index) => (
          <div
            key={index}
            className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-lg font-bold text-slate-900">
                    {cause.title}
                  </h4>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getConfidenceColor(cause.confidence)}`}>
                    {cause.confidence} confidence
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {cause.description}
                </p>
              </div>
            </div>

            {/* Evidence */}
            {cause.evidence.length > 0 && (
              <div className="mb-4 pl-14">
                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Evidence:
                </h5>
                <ul className="space-y-1">
                  {cause.evidence.map((evidence, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Errors */}
            {cause.relatedErrors.length > 0 && (
              <div className="pl-14">
                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Related Errors:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {cause.relatedErrors.map((error, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 border border-red-200 rounded"
                    >
                      {error}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
