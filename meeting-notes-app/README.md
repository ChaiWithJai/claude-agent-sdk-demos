# Meeting Notes Processor

A web application that transforms raw meeting notes into structured team documentation and professional action plan slides using Claude Agent SDK.

## What It Does

The Meeting Notes Processor takes unstructured meeting notes and automatically generates:

1. **Team Documentation** (Markdown format):
   - Executive summary
   - Key discussion points organized by topic
   - Decisions made with rationale
   - Action items with owners and deadlines
   - Follow-up items and next steps

2. **Action Plan Slides** (HTML presentation):
   - Professional presentation slides
   - Visual timeline and roadmap
   - Action items with priorities
   - Next steps clearly outlined

3. **Structured Action Items**:
   - Extracted tasks with owners
   - Deadlines and priorities
   - Easy to track and download

## Project Structure

```
meeting-notes-app/
├── frontend/              # React TypeScript SPA
│   ├── src/
│   │   ├── components/   # UI components
│   │   │   ├── Upload.tsx       # Upload/input component
│   │   │   ├── Processing.tsx   # Loading state
│   │   │   ├── Results.tsx      # Results display
│   │   │   └── Error.tsx        # Error handling
│   │   ├── types.ts      # TypeScript types
│   │   ├── App.tsx       # Main app component
│   │   ├── App.css       # Styling
│   │   └── main.tsx      # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/               # Express API with Claude Agent SDK
│   ├── src/
│   │   ├── api/
│   │   │   └── process.ts    # Meeting notes processor
│   │   └── server.ts         # Express server
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Claude API key (for full Claude Agent SDK integration)
- npm, yarn, or bun

### Installation

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the App

1. **Start the backend** (in one terminal):
   ```bash
   cd backend
   npm run dev
   ```
   The API will start on `http://localhost:3002`

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   The UI will start on `http://localhost:3000`

3. **Open your browser to `http://localhost:3000`**

## Usage

### Basic Workflow

1. **Upload Notes**: Paste or type your meeting notes in the text area
2. **Process**: Click "Process Notes" to analyze the content
3. **Review Results**: View the generated documentation and slides
4. **Download**: Save documentation, slides, or action items

### Input Format

The app accepts meeting notes in any format. For best results, include:

- **Discussion topics** and key points
- **Decisions** that were made
- **Action items** with responsible parties
- **Blockers** or issues
- **Next steps** and deadlines

Example:
```
# Team Standup - Nov 16, 2025

## Discussion
- Reviewed Q4 roadmap
- Discussed API performance issues
- Planned holiday coverage

## Decisions
- Moving to microservices architecture
- Extending current sprint by 3 days

## Action Items
- John: Complete API docs by Wed
- Sarah: Schedule stakeholder demo
- Team: Update Jira tickets daily
```

### Example Output

The app will generate:

**Documentation** (`meeting-documentation.md`):
- Structured markdown document
- Professional formatting
- Clear sections and hierarchy
- Ready to share with team

**Slides** (`action-plan-slides.html`):
- Beautiful HTML presentation
- Visual timeline
- Color-coded priorities
- Print-ready format

**Action Items** (`action-items.txt`):
- Plain text list
- Priorities and owners
- Easy to copy/paste

## Features

✅ **Smart Extraction**: Automatically identifies key points, decisions, and action items
✅ **Multiple Outputs**: Documentation, slides, and action items in one click
✅ **Professional Format**: Clean, presentation-ready slides
✅ **Easy Downloads**: Export all formats with one click
✅ **Example Loader**: Try with sample meeting notes
✅ **Error Handling**: Graceful failures with retry capability
✅ **Responsive Design**: Works on desktop and tablet

## Architecture

### Frontend (React + TypeScript + Vite)

The frontend is a single-page application with state management for:
- Input: Upload/paste meeting notes
- Processing: Loading state while backend processes
- Results: Tabbed interface for viewing outputs
- Error: Error handling with retry

**Key Technologies**:
- React 18 with TypeScript
- Vite for fast development
- CSS for styling (no dependencies)

### Backend (Express + Claude Agent SDK)

The backend provides a single REST API endpoint:

**POST /api/process**
- Input: `{ meetingNotes: string }`
- Output: `{ documentation, slides, actionItems, summary }`
- Uses Claude Agent SDK for AI processing
- Falls back to mock generation if SDK unavailable

**Key Technologies**:
- Express.js for REST API
- Claude Agent SDK for AI processing
- TypeScript for type safety

### Data Flow

```
User Input (Frontend)
  ↓
POST /api/process
  ↓
Claude Agent SDK
  ↓
Parse & Extract (Backend)
  ↓
Return JSON Results
  ↓
Display & Download (Frontend)
```

## API Reference

### Process Meeting Notes

**Endpoint**: `POST /api/process`

**Request**:
```json
{
  "meetingNotes": "string"
}
```

**Response**:
```json
{
  "documentation": "string (markdown)",
  "slides": "string (HTML)",
  "actionItems": [
    {
      "task": "string",
      "assignee": "string",
      "deadline": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "summary": "string"
}
```

**Error Response**:
```json
{
  "error": "string"
}
```

## Customization

### Styling

Edit `frontend/src/App.css` to customize:
- Colors and themes
- Layout and spacing
- Typography

### API Processing

Modify `backend/src/api/process.ts` to customize:
- Prompt engineering for Claude
- Output format and structure
- Parsing logic
- Mock data generation

### Frontend Components

Each component is in `frontend/src/components/`:
- `Upload.tsx`: Customize input UI
- `Results.tsx`: Modify results display
- `Processing.tsx`: Change loading animation
- `Error.tsx`: Update error messages

## Development

### Build Commands

**Frontend**:
```bash
cd frontend
npm run build    # Build for production
npm run preview  # Preview production build
npm run dev      # Development server
```

**Backend**:
```bash
cd backend
npm run build    # Compile TypeScript
npm run dev      # Development with hot reload
npm start        # Run compiled version
```

### Environment Variables

The backend can use environment variables:
- `PORT`: Server port (default: 3002)
- `ANTHROPIC_API_KEY`: Claude API key (from Claude Agent SDK config)

## Integration with Claude Agent SDK

The backend uses the Claude Agent SDK to:

1. **Load project settings** via `setting_sources: ["project"]`
2. **Send structured prompts** with meeting notes
3. **Stream responses** from Claude
4. **Parse outputs** into structured data

See `backend/src/api/process.ts` for implementation details.

## Testing

### Manual Testing

1. Click "Load Example" to test with sample data
2. Try different note formats
3. Test error handling by stopping the backend
4. Verify downloads work correctly

### Integration Testing

The app includes fallback mock generation for testing without Claude API:
- Structured markdown documentation
- Professional HTML slides
- Sample action items

## Troubleshooting

**Backend won't start**:
- Check if port 3002 is available
- Verify dependencies are installed (`npm install`)
- Check Node.js version (18+ required)

**Frontend won't start**:
- Check if port 3000 is available
- Verify dependencies are installed
- Clear Vite cache: `rm -rf node_modules/.vite`

**API errors**:
- Check backend is running on port 3002
- Verify network connectivity
- Check browser console for errors

**Claude SDK errors**:
- Verify API key is configured
- Check Claude Agent SDK documentation
- App will fall back to mock generation

## Future Enhancements

Potential improvements:
- [ ] File upload support (.txt, .md, .docx)
- [ ] Multiple note formats (Google Docs, Notion, etc.)
- [ ] Custom templates for different meeting types
- [ ] Integration with Slack/Teams
- [ ] Calendar integration for scheduling
- [ ] Real-time collaboration
- [ ] Meeting recording transcription

## License

MIT - This is sample code for demonstration purposes.

## Support

For issues or questions:
1. Check this README for troubleshooting
2. Review [Claude Agent SDK documentation](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview)
3. Create an issue in the repository

## Author

Created as a demonstration of the Claude Agent SDK capabilities.
