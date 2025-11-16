import { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import type { AnalysisState } from '../types';

interface LogUploaderProps {
  onAnalyze: (source: File | string) => void;
  state: AnalysisState;
}

export function LogUploader({ onAnalyze, state }: LogUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = state.type === 'uploading' || state.type === 'analyzing';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    onAnalyze(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      alert('Please paste some log content');
      return;
    }
    onAnalyze(pastedText);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Upload Log File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'paste'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            Paste Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'upload' && (
            <div>
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-slate-100'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".log,.txt,.json"
                  disabled={isLoading}
                />

                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="text-lg font-medium text-slate-700">
                      {state.type === 'uploading' ? 'Uploading...' : 'Analyzing logs...'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Claude is examining your logs and identifying issues
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-700 mb-2">
                      Drop your log file here
                    </p>
                    <p className="text-slate-500 mb-4">
                      or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Select File
                    </button>
                    <p className="text-xs text-slate-400 mt-4">
                      Supports .log, .txt, .json files up to 50MB
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Tip:</p>
                    <p>
                      Upload application logs, error logs, server logs, or any text-based log files.
                      The agent will analyze patterns, identify errors, and suggest fixes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your log content here..."
                className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim() || isLoading}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {state.type === 'uploading' ? 'Uploading...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      Analyze Logs
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Tip:</p>
                    <p>
                      Copy and paste logs from your terminal, application output, or log viewer.
                      The agent will process it the same way as uploaded files.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Root Cause Analysis</h3>
          <p className="text-sm text-slate-600">
            Automatically identify the root causes of errors and failures in your logs
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Pattern Detection</h3>
          <p className="text-sm text-slate-600">
            Discover patterns, anomalies, and correlations that may not be obvious
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Actionable Insights</h3>
          <p className="text-sm text-slate-600">
            Get specific recommendations and action items to fix identified issues
          </p>
        </div>
      </div>
    </div>
  );
}
