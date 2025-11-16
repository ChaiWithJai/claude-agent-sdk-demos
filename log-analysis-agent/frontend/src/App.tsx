import { useState } from 'react';
import { LogUploader } from './components/LogUploader';
import { DebuggingCanvas } from './components/DebuggingCanvas';
import { FileText } from 'lucide-react';
import type { AnalysisState } from './types';

function App() {
  const [state, setState] = useState<AnalysisState>({ type: 'idle' });

  const handleAnalyze = async (source: File | string) => {
    setState({ type: 'uploading' });

    try {
      let response: Response;

      if (typeof source === 'string') {
        // Analyze pasted text
        response = await fetch('/api/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logText: source })
        });
      } else {
        // Analyze uploaded file
        const formData = new FormData();
        formData.append('logFile', source);

        response = await fetch('/api/analyze/upload', {
          method: 'POST',
          body: formData
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      setState({ type: 'analyzing' });

      const data = await response.json();

      setState({
        type: 'success',
        result: data.analysis,
        fileName: data.fileName
      });
    } catch (error: any) {
      setState({
        type: 'error',
        message: error.message || 'Failed to analyze logs'
      });
    }
  };

  const handleReset = () => {
    setState({ type: 'idle' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Log Analysis Agent
              </h1>
              <p className="text-sm text-slate-600">
                Cognitive Debugging Canvas powered by Claude
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(state.type === 'idle' || state.type === 'uploading' || state.type === 'analyzing') && (
          <LogUploader
            onAnalyze={handleAnalyze}
            state={state}
          />
        )}

        {state.type === 'success' && (
          <DebuggingCanvas
            result={state.result}
            fileName={state.fileName}
            onReset={handleReset}
          />
        )}

        {state.type === 'error' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Analysis Failed
              </h3>
              <p className="text-red-700 mb-4">{state.message}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            Powered by Claude Agent SDK | Upload logs to get intelligent debugging insights
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
