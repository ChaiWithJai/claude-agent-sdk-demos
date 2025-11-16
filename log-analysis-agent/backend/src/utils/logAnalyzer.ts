import { query } from '@anthropic-ai/claude-agent-sdk';
import fs from 'fs/promises';
import path from 'path';

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

/**
 * Analyze a log file using Claude Agent SDK
 */
export async function analyzeLogFile(filePath: string, fileName: string): Promise<LogAnalysisResult> {
  const logContent = await fs.readFile(filePath, 'utf-8');
  return analyzeLogText(logContent, fileName);
}

/**
 * Analyze log text using Claude Agent SDK
 */
export async function analyzeLogText(logText: string, fileName: string): Promise<LogAnalysisResult> {
  console.log(`🔍 Starting log analysis for: ${fileName}`);

  // Create a temporary working directory for the agent
  const workDir = path.join(process.cwd(), '..', 'agent', 'output', Date.now().toString());
  await fs.mkdir(workDir, { recursive: true });

  // Write log file to the working directory
  const logFilePath = path.join(workDir, fileName);
  await fs.writeFile(logFilePath, logText, 'utf-8');

  try {
    const prompt = createAnalysisPrompt(fileName);

    let fullResponse = '';
    let currentThinking = '';

    const q = query({
      prompt,
      options: {
        maxTurns: 50,
        cwd: workDir,
        model: 'sonnet',
        executable: 'node',
        allowedTools: ['Read', 'Write', 'Grep', 'Glob', 'Bash'],
        hooks: {}
      }
    });

    // Collect all agent responses
    for await (const message of q) {
      if (message.type === 'assistant') {
        const content = message.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text') {
              fullResponse += block.text + '\n';
            } else if (block.type === 'thinking') {
              currentThinking = block.thinking || '';
            }
          }
        }
      }
    }

    console.log(`✅ Analysis complete for: ${fileName}`);

    // Parse the structured analysis from the agent's response
    const analysis = parseAnalysisResponse(fullResponse, fileName);

    // Clean up working directory
    await fs.rm(workDir, { recursive: true, force: true }).catch(console.error);

    return analysis;
  } catch (error) {
    console.error('Error during log analysis:', error);
    // Clean up on error
    await fs.rm(workDir, { recursive: true, force: true }).catch(console.error);
    throw error;
  }
}

/**
 * Create the analysis prompt for Claude
 */
function createAnalysisPrompt(fileName: string): string {
  return `You are an expert log analysis agent specialized in debugging and root cause analysis.

Your task is to analyze the log file "${fileName}" in the current directory and provide a comprehensive cognitive debugging analysis.

Please perform the following analysis:

1. **Read and Parse the Log File**
   - Read the log file: ${fileName}
   - Identify the log format and structure
   - Extract timestamps, log levels, and messages

2. **Timeline Analysis**
   - Create a timeline of significant events
   - Identify the sequence of events leading to errors
   - Note any unusual gaps or spikes in activity

3. **Error Detection and Categorization**
   - Find all errors, warnings, and critical messages
   - Group similar errors together
   - Count occurrences and identify patterns
   - Determine severity levels

4. **Pattern and Anomaly Detection**
   - Identify recurring patterns
   - Detect anomalies or unusual behaviors
   - Find correlations between different log entries
   - Identify performance issues or bottlenecks

5. **Root Cause Analysis**
   - Determine the root cause(s) of problems
   - Provide evidence from the logs
   - Explain the chain of events leading to failures
   - Rate confidence level for each root cause

6. **Recommendations and Action Items**
   - Provide specific, actionable recommendations
   - Prioritize fixes by impact and urgency
   - Suggest monitoring or prevention strategies
   - Estimate the impact of implementing each recommendation

Please structure your response in the following JSON format:

\`\`\`json
{
  "summary": "Brief 2-3 sentence overview of the log analysis",
  "timeline": [
    {
      "timestamp": "ISO timestamp or log timestamp",
      "type": "info|warning|error|critical",
      "message": "What happened",
      "context": "Additional context if relevant"
    }
  ],
  "errors": [
    {
      "timestamp": "First occurrence timestamp",
      "errorType": "Type/category of error",
      "message": "Error message",
      "stackTrace": "Stack trace if available",
      "severity": "low|medium|high|critical",
      "firstOccurrence": "Timestamp",
      "occurrenceCount": 5
    }
  ],
  "insights": [
    {
      "title": "Insight title",
      "description": "Detailed description",
      "category": "pattern|anomaly|correlation|metric",
      "confidence": "low|medium|high"
    }
  ],
  "rootCauses": [
    {
      "title": "Root cause title",
      "description": "Detailed explanation",
      "evidence": ["Evidence from logs", "More evidence"],
      "confidence": "low|medium|high",
      "relatedErrors": ["Error type 1", "Error type 2"]
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "priority": "low|medium|high|critical",
      "actionItems": ["Step 1", "Step 2"],
      "estimatedImpact": "Expected impact of this fix"
    }
  ]
}
\`\`\`

Be thorough, specific, and actionable in your analysis. Focus on helping developers quickly understand and fix the issues.`;
}

/**
 * Parse the agent's response into structured analysis
 */
function parseAnalysisResponse(response: string, fileName: string): LogAnalysisResult {
  // Try to extract JSON from code blocks
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);

  let parsed: Partial<LogAnalysisResult> = {};

  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[1]);
    } catch (error) {
      console.warn('Failed to parse JSON from response, using fallback parsing');
    }
  }

  // Provide defaults for missing fields
  return {
    summary: parsed.summary || extractSummary(response),
    timeline: parsed.timeline || [],
    errors: parsed.errors || extractErrors(response),
    insights: parsed.insights || extractInsights(response),
    rootCauses: parsed.rootCauses || extractRootCauses(response),
    recommendations: parsed.recommendations || extractRecommendations(response),
    rawAnalysis: response
  };
}

/**
 * Fallback: Extract summary from response text
 */
function extractSummary(text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const firstParagraph = lines.slice(0, 3).join(' ').substring(0, 300);
  return firstParagraph || 'Log analysis completed. See detailed findings below.';
}

/**
 * Fallback: Extract errors from response text
 */
function extractErrors(text: string): ErrorEntry[] {
  const errors: ErrorEntry[] = [];
  const errorMatches = text.matchAll(/error[:\s]+(.+?)(?=\n|$)/gi);

  for (const match of errorMatches) {
    errors.push({
      timestamp: new Date().toISOString(),
      errorType: 'General Error',
      message: match[1].trim(),
      severity: 'medium',
      firstOccurrence: new Date().toISOString(),
      occurrenceCount: 1
    });
  }

  return errors.slice(0, 10); // Limit to first 10
}

/**
 * Fallback: Extract insights from response text
 */
function extractInsights(text: string): Insight[] {
  const insights: Insight[] = [];
  const insightPatterns = [
    /pattern[:\s]+(.+?)(?=\n|$)/gi,
    /anomaly[:\s]+(.+?)(?=\n|$)/gi,
    /correlation[:\s]+(.+?)(?=\n|$)/gi
  ];

  for (const pattern of insightPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      insights.push({
        title: match[1].trim().substring(0, 50),
        description: match[1].trim(),
        category: 'pattern',
        confidence: 'medium'
      });
    }
  }

  return insights.slice(0, 5);
}

/**
 * Fallback: Extract root causes from response text
 */
function extractRootCauses(text: string): RootCause[] {
  const causes: RootCause[] = [];
  const causeMatches = text.matchAll(/(?:root cause|cause)[:\s]+(.+?)(?=\n|$)/gi);

  for (const match of causeMatches) {
    causes.push({
      title: match[1].trim().substring(0, 60),
      description: match[1].trim(),
      evidence: [],
      confidence: 'medium',
      relatedErrors: []
    });
  }

  return causes.slice(0, 3);
}

/**
 * Fallback: Extract recommendations from response text
 */
function extractRecommendations(text: string): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const recMatches = text.matchAll(/(?:recommend|suggestion|fix)[:\s]+(.+?)(?=\n|$)/gi);

  for (const match of recMatches) {
    recommendations.push({
      title: match[1].trim().substring(0, 60),
      description: match[1].trim(),
      priority: 'medium',
      actionItems: [],
      estimatedImpact: 'Moderate improvement expected'
    });
  }

  return recommendations.slice(0, 5);
}
