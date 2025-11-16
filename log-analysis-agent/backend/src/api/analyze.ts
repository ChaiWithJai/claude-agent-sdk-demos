import express from 'express';
import { upload } from '../server.js';
import { analyzeLogFile, analyzeLogText } from '../utils/logAnalyzer.js';
import fs from 'fs/promises';

export const analyzeLogsRouter = express.Router();

/**
 * POST /api/analyze/upload
 * Upload and analyze a log file
 */
analyzeLogsRouter.post('/analyze/upload', upload.single('logFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📁 Analyzing uploaded file: ${req.file.originalname}`);

    const analysis = await analyzeLogFile(req.file.path, req.file.originalname);

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(console.error);

    res.json({
      success: true,
      fileName: req.file.originalname,
      analysis
    });
  } catch (error: any) {
    console.error('Error analyzing uploaded file:', error);
    res.status(500).json({
      error: 'Failed to analyze log file',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze/text
 * Analyze log text directly
 */
analyzeLogsRouter.post('/analyze/text', async (req, res) => {
  try {
    const { logText, fileName = 'pasted-logs.txt' } = req.body;

    if (!logText || typeof logText !== 'string') {
      return res.status(400).json({ error: 'logText is required and must be a string' });
    }

    console.log(`📝 Analyzing pasted log text (${logText.length} characters)`);

    const analysis = await analyzeLogText(logText, fileName);

    res.json({
      success: true,
      fileName,
      analysis
    });
  } catch (error: any) {
    console.error('Error analyzing log text:', error);
    res.status(500).json({
      error: 'Failed to analyze log text',
      message: error.message
    });
  }
});

/**
 * GET /api/analyze/status
 * Check if the API key is configured
 */
analyzeLogsRouter.get('/analyze/status', (req, res) => {
  const isConfigured = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    configured: isConfigured,
    ready: isConfigured,
    message: isConfigured
      ? 'Log analysis agent is ready'
      : 'ANTHROPIC_API_KEY not configured'
  });
});
