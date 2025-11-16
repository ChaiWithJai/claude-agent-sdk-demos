# Log Analysis Agent

A powerful cognitive debugging canvas powered by Claude Agent SDK that helps you analyze logs, identify root causes, and get actionable recommendations for fixing issues.

![Log Analysis Agent](https://img.shields.io/badge/Claude-Agent%20SDK-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18.3-blue)

## Features

- **📁 Flexible Log Upload**: Upload log files or paste log content directly
- **🔍 Intelligent Analysis**: Claude-powered log parsing and pattern detection
- **⏱️ Timeline View**: Chronological visualization of events
- **🚨 Error Detection**: Automatic error categorization and severity assessment
- **💡 Insights Discovery**: Pattern, anomaly, and correlation detection
- **🎯 Root Cause Analysis**: AI-driven identification of underlying issues
- **✅ Actionable Recommendations**: Prioritized action items with specific steps
- **🎨 Cognitive Debugging Canvas**: Beautiful, intuitive UI for navigating analysis results

## Architecture

This application consists of three main components:

### Backend (Node.js + Express)
- Express server handling API requests
- Integration with Claude Agent SDK for log analysis
- File upload support via Multer
- RESTful API endpoints

### Frontend (React + TypeScript + Vite)
- Modern React application with TypeScript
- Tailwind CSS for styling
- Responsive cognitive debugging canvas
- Multiple visualization views

### Agent (Claude SDK)
- Uses Claude Agent SDK's `query()` function
- Specialized prompts for log analysis
- Tools: Read, Write, Grep, Glob, Bash
- Structured JSON output parsing

## Prerequisites

- **Node.js** 18+ (or Bun)
- **npm** or **bun** package manager
- **Anthropic API Key** (get one from [console.anthropic.com](https://console.anthropic.com))

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd log-analysis-agent
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

### 3. Install dependencies

#### Backend
```bash
cd backend
npm install
# or
bun install
```

#### Frontend
```bash
cd frontend
npm install
# or
bun install
```

## Running the Application

You'll need two terminal windows to run both the backend and frontend.

### Terminal 1: Start the Backend

```bash
cd backend
npm run dev
# or
bun run dev
```

The backend will start on `http://localhost:3001`

### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
# or
bun run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Open the application** in your browser at `http://localhost:3000`

2. **Upload or paste logs**:
   - **Upload Tab**: Drag and drop a log file or click to browse
   - **Paste Tab**: Copy and paste log content directly

3. **Wait for analysis**: Claude will analyze your logs (typically 10-30 seconds)

4. **Explore the results** in the Cognitive Debugging Canvas:
   - **Summary**: Overview and quick stats
   - **Timeline**: Chronological event view
   - **Errors**: Categorized errors with severity levels
   - **Insights**: Discovered patterns and anomalies
   - **Root Causes**: Identified root causes with evidence
   - **Actions**: Prioritized recommendations with action steps

## Supported Log Formats

The agent can analyze various log formats:

- **Application Logs**: Node.js, Python, Java, etc.
- **Server Logs**: Apache, Nginx, etc.
- **Error Logs**: Stack traces, exception logs
- **JSON Logs**: Structured JSON logging
- **Plain Text Logs**: Any text-based log format

Maximum file size: **50MB**

## API Endpoints

### `POST /api/analyze/upload`
Upload and analyze a log file

**Body**: `multipart/form-data`
- `logFile`: File to analyze

**Response**:
```json
{
  "success": true,
  "fileName": "app.log",
  "analysis": { /* LogAnalysisResult */ }
}
```

### `POST /api/analyze/text`
Analyze pasted log text

**Body**:
```json
{
  "logText": "log content...",
  "fileName": "optional-name.log"
}
```

**Response**:
```json
{
  "success": true,
  "fileName": "pasted-logs.txt",
  "analysis": { /* LogAnalysisResult */ }
}
```

### `GET /api/analyze/status`
Check if the API is configured

**Response**:
```json
{
  "configured": true,
  "ready": true,
  "message": "Log analysis agent is ready"
}
```

## Analysis Output Structure

The agent returns structured analysis in the following format:

```typescript
interface LogAnalysisResult {
  summary: string;                    // Brief overview
  timeline: TimelineEvent[];          // Chronological events
  errors: ErrorEntry[];               // Detected errors
  insights: Insight[];                // Patterns and anomalies
  rootCauses: RootCause[];           // Root cause analysis
  recommendations: Recommendation[];  // Action items
  rawAnalysis: string;               // Full agent response
}
```

See `frontend/src/types/index.ts` for complete type definitions.

## How It Works

1. **Upload/Paste**: User provides log content via web UI
2. **Transfer**: Frontend sends logs to backend API
3. **Agent Execution**: Backend uses Claude SDK's `query()` to analyze logs
4. **Analysis**: Claude agent:
   - Reads the log file
   - Parses log format and structure
   - Identifies errors and patterns
   - Determines root causes
   - Generates recommendations
5. **Response**: Agent returns structured JSON analysis
6. **Visualization**: Frontend displays results in cognitive debugging canvas

## Customization

### Adjust Analysis Prompt

Edit `backend/src/utils/logAnalyzer.ts` → `createAnalysisPrompt()` to customize:
- Analysis depth
- Output format
- Specific focus areas

### Change Model

In `backend/src/utils/logAnalyzer.ts`, change the model:

```typescript
model: 'haiku',  // Fast, cost-effective
// or
model: 'sonnet', // Balanced (default)
// or
model: 'opus',   // Most capable
```

### Modify UI Theme

Edit `frontend/tailwind.config.js` to customize colors and styling.

### Add More Tools

In `backend/src/utils/logAnalyzer.ts`, expand `allowedTools`:

```typescript
allowedTools: ['Read', 'Write', 'Grep', 'Glob', 'Bash', 'WebSearch'],
```

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"
- Make sure you created a `.env` file in the root directory
- Verify your API key is correctly set
- Restart the backend server

### Backend won't start
- Check if port 3001 is already in use
- Try changing `PORT` in `.env`
- Verify all dependencies are installed

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check proxy configuration in `frontend/vite.config.ts`
- Look for CORS errors in browser console

### Analysis takes too long
- Large log files (>10MB) may take 30-60 seconds
- Consider using Haiku model for faster analysis
- Try reducing `maxTurns` in the query options

### Agent returns incomplete analysis
- The agent may not always return perfect JSON
- Fallback parsers extract what they can from text
- Try rephrasing logs or providing more context

## Development

### Project Structure

```
log-analysis-agent/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express server
│   │   ├── api/
│   │   │   └── analyze.ts      # Analysis endpoints
│   │   └── utils/
│   │       └── logAnalyzer.ts  # Claude SDK integration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main application
│   │   ├── components/         # React components
│   │   ├── types/              # TypeScript types
│   │   └── hooks/              # Custom hooks
│   └── package.json
├── agent/
│   ├── logs/                   # Input logs
│   └── output/                 # Analysis outputs
├── .env                        # Environment variables
├── .gitignore
└── README.md
```

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- Powered by [Anthropic's Claude](https://www.anthropic.com/claude)
- UI components inspired by modern design patterns

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [Claude Agent SDK documentation](https://docs.anthropic.com/claude/docs/claude-agent-sdk)
- Visit [Anthropic documentation](https://docs.anthropic.com)

---

**Happy Debugging! 🐛🔍**
