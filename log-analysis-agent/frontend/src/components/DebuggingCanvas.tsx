import { useState } from 'react';
import { ArrowLeft, FileText, Clock, AlertTriangle, Lightbulb, Target, CheckSquare } from 'lucide-react';
import type { LogAnalysisResult } from '../types';
import { TimelineView } from './TimelineView';
import { ErrorsView } from './ErrorsView';
import { InsightsView } from './InsightsView';
import { RootCausesView } from './RootCausesView';
import { RecommendationsView } from './RecommendationsView';

interface DebuggingCanvasProps {
  result: LogAnalysisResult;
  fileName: string;
  onReset: () => void;
}

type TabType = 'summary' | 'timeline' | 'errors' | 'insights' | 'rootcauses' | 'recommendations';

export function DebuggingCanvas({ result, fileName, onReset }: DebuggingCanvasProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs = [
    { id: 'summary' as const, label: 'Summary', icon: FileText, count: null },
    { id: 'timeline' as const, label: 'Timeline', icon: Clock, count: result.timeline.length },
    { id: 'errors' as const, label: 'Errors', icon: AlertTriangle, count: result.errors.length },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb, count: result.insights.length },
    { id: 'rootcauses' as const, label: 'Root Causes', icon: Target, count: result.rootCauses.length },
    { id: 'recommendations' as const, label: 'Actions', icon: CheckSquare, count: result.recommendations.length },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={onReset}
            className="mb-2 text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze Another Log
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            Analysis: {fileName}
          </h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-t-xl border-b border-slate-200 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-primary-600 border-primary-600 bg-primary-50'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl shadow-lg p-8 min-h-[500px]">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Analysis Summary
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {result.errors.length}
                </div>
                <div className="text-sm text-red-900">Errors Found</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {result.insights.length}
                </div>
                <div className="text-sm text-yellow-900">Insights</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {result.rootCauses.length}
                </div>
                <div className="text-sm text-purple-900">Root Causes</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {result.recommendations.length}
                </div>
                <div className="text-sm text-green-900">Actions</div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="mt-8">
              <h4 className="font-semibold text-slate-900 mb-3">Quick Navigation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('errors')}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-medium text-slate-900">View Errors</div>
                    <div className="text-sm text-slate-600">
                      {result.errors.length} error{result.errors.length !== 1 ? 's' : ''} detected
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('rootcauses')}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <Target className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-slate-900">Root Causes</div>
                    <div className="text-sm text-slate-600">
                      {result.rootCauses.length} root cause{result.rootCauses.length !== 1 ? 's' : ''} identified
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="font-medium text-slate-900">Insights</div>
                    <div className="text-sm text-slate-600">
                      {result.insights.length} insight{result.insights.length !== 1 ? 's' : ''} discovered
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <CheckSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-slate-900">Recommendations</div>
                    <div className="text-sm text-slate-600">
                      {result.recommendations.length} action{result.recommendations.length !== 1 ? 's' : ''} suggested
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && <TimelineView events={result.timeline} />}
        {activeTab === 'errors' && <ErrorsView errors={result.errors} />}
        {activeTab === 'insights' && <InsightsView insights={result.insights} />}
        {activeTab === 'rootcauses' && <RootCausesView rootCauses={result.rootCauses} />}
        {activeTab === 'recommendations' && <RecommendationsView recommendations={result.recommendations} />}
      </div>
    </div>
  );
}
