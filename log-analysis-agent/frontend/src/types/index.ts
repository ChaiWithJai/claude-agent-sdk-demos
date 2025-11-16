export interface LogAnalysisResult {
  summary: string;
  timeline: TimelineEvent[];
  errors: ErrorEntry[];
  insights: Insight[];
  rootCauses: RootCause[];
  recommendations: Recommendation[];
  rawAnalysis: string;
}

export interface TimelineEvent {
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context?: string;
}

export interface ErrorEntry {
  timestamp: string;
  errorType: string;
  message: string;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstOccurrence: string;
  occurrenceCount: number;
}

export interface Insight {
  title: string;
  description: string;
  category: 'pattern' | 'anomaly' | 'correlation' | 'metric';
  confidence: 'low' | 'medium' | 'high';
}

export interface RootCause {
  title: string;
  description: string;
  evidence: string[];
  confidence: 'low' | 'medium' | 'high';
  relatedErrors: string[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  estimatedImpact: string;
}

export type AnalysisState =
  | { type: 'idle' }
  | { type: 'uploading' }
  | { type: 'analyzing' }
  | { type: 'success'; result: LogAnalysisResult; fileName: string }
  | { type: 'error'; message: string };
