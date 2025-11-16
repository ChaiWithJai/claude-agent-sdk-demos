import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ErrorEntry } from '../types';

interface ErrorsViewProps {
  errors: ErrorEntry[];
}

export function ErrorsView({ errors }: ErrorsViewProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };

  const getSeverityColor = (severity: ErrorEntry['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getSeverityBorder = (severity: ErrorEntry['severity']) => {
    switch (severity) {
      case 'low':
        return 'border-blue-200 bg-blue-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
    }
  };

  if (errors.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No errors detected in the logs</p>
        <p className="text-sm text-slate-400 mt-2">This is good news!</p>
      </div>
    );
  }

  // Group errors by severity
  const errorsBySeverity = errors.reduce((acc, error) => {
    if (!acc[error.severity]) acc[error.severity] = [];
    acc[error.severity].push(error);
    return acc;
  }, {} as Record<string, ErrorEntry[]>);

  const severityOrder: ErrorEntry['severity'][] = ['critical', 'high', 'medium', 'low'];
  const severityCounts = severityOrder.map(sev => ({
    severity: sev,
    count: errorsBySeverity[sev]?.length || 0
  }));

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        Errors Detected
      </h3>

      {/* Severity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {severityCounts.map(({ severity, count }) => (
          <div
            key={severity}
            className={`border rounded-lg p-3 ${getSeverityBorder(severity)}`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm capitalize">{severity}</div>
          </div>
        ))}
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {errors.map((error, index) => {
          const isExpanded = expandedErrors.has(index);
          return (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden ${getSeverityBorder(error.severity)}`}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/50 transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <span className="font-semibold text-slate-900">
                      {error.errorType}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-1">
                    {error.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>First: {error.firstOccurrence}</span>
                    <span>Count: {error.occurrenceCount}</span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && error.stackTrace && (
                <div className="px-4 pb-4 border-t bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 mt-3">
                    Stack Trace:
                  </h4>
                  <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto font-mono">
                    {error.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
