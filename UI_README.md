# Codebase Cartographer & Code Review Tools UI

A comprehensive web-based interface for analyzing codebases and performing high-quality code reviews.

## Overview

This UI provides intuitive access to:

### 🧭 **Codebase Cartographer Tools** (5 Analysis Scripts)
1. **Hotspot Analysis** - Identify high-complexity, high-churn files needing refactoring
2. **Git Archaeology** - Extract institutional knowledge from version control history
3. **Dependency Graph** - Visualize module relationships and architecture
4. **Data Flow Mapping** - Map architectural planes (Management/Control/Data)
5. **JTBD Story Extraction** - Extract user journeys from code patterns

### 🔍 **Code Review Tool**
- 4-stage review process (Pre-Review → Understanding → Code Review → Feedback)
- 80+ comprehensive checklist items
- High standards for code quality and documentation

## Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Install API server dependencies:**
```bash
pip install -r ui-requirements.txt
```

2. **Extract the skill files (if not already extracted):**
The API server will automatically extract the `.skill` files on first run.

### Running the Application

1. **Start the API server:**
```bash
python api_server.py
```

You should see:
```
============================================================
Codebase Cartographer & Code Review Tools API Server
============================================================

Server starting...
Access the UI at: http://localhost:5000
```

2. **Open your browser:**
Navigate to http://localhost:5000

3. **Start analyzing!**
   - Enter a repository path
   - Select a tool from Cartographer or Code Review
   - Run analysis and view results

## Architecture

```
┌─────────────────────────────────────────┐
│  Web UI (React + Tailwind CSS)         │
│  - codebase-tools-ui.html               │
└─────────────────────────────────────────┘
                 ↓ HTTP/JSON
┌─────────────────────────────────────────┐
│  API Server (Flask)                     │
│  - api_server.py                        │
│  - REST endpoints for tools             │
└─────────────────────────────────────────┘
                 ↓ Subprocess
┌─────────────────────────────────────────┐
│  Analysis Scripts (Python)              │
│  - codebase-cartographer.skill          │
│  - code-review-skill.skill              │
└─────────────────────────────────────────┘
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

### List Available Tools
```bash
GET /api/list-tools
```

### Run Cartographer Analysis
```bash
POST /api/cartographer/analyze
Content-Type: application/json

{
  "tool": "hotspots|archaeology|dependencies|dataflow|jtbd",
  "repo_path": "/path/to/repository",
  "config": {
    "months": 6,
    "extensions": [".py", ".js"]
  }
}
```

### Run Full Analysis (All Tools)
```bash
POST /api/cartographer/full-analysis
Content-Type: application/json

{
  "repo_path": "/path/to/repository",
  "config": {}
}
```

### Code Review Analysis
```bash
POST /api/code-review/analyze
Content-Type: application/json

{
  "pr_url": "https://github.com/user/repo/pull/123",
  "stage": "pre-review|understanding|code-review|feedback"
}
```

## Features

### 🎨 Modern UI
- Responsive design with Tailwind CSS
- Dark gradient theme with purple/indigo accents
- Interactive cards and smooth transitions
- Font Awesome icons throughout

### 🔧 Codebase Cartographer Panel
- Select from 5 different analysis tools
- Configure analysis parameters (time range, file extensions, etc.)
- View real-time output in terminal-style display
- Export results in JSON format

### ✅ Code Review Panel
- 4-stage review workflow
- Interactive checklists for each stage
- Quality score calculation
- Feedback templates (Blocking/Important/Nitpick)

### 📊 Mandala Chart Preview
- Placeholder for upcoming interactive visualization
- Will show codebase health in concentric rings
- Based on architectural planes (Management/Control/Data)

## Tool Details

### Hotspot Analysis
**Purpose:** Find files that are both complex and frequently changed

**Metrics:**
- Commit Frequency
- Lines of Code (LOC)
- Risk Score = (commits × LOC) / 1000

**Configuration:**
- `months`: How many months of history to analyze (default: 6)
- `top_n`: Number of top hotspots to return (default: 20)
- `extensions`: File extensions to include

### Git Archaeology
**Purpose:** Extract knowledge about authorship and coupling

**Metrics:**
- File authorship breakdown
- Knowledge silos (>70% single-author ownership)
- Temporal coupling (files that change together)
- Bus factor per directory

**Output:**
- Primary owner per file
- Contribution percentages
- Risky single-owner areas

### Dependency Graph
**Purpose:** Visualize module relationships

**Features:**
- Categorizes Core vs Infrastructure components
- Generates Mermaid diagrams
- Supports Python, JavaScript, TypeScript, Go, Ruby

**Output Formats:**
- Text dependency list
- Mermaid flowchart syntax

### Data Flow Mapping
**Purpose:** Map architectural planes

**Three Planes:**
1. **Management Plane:** Configuration, orchestration (YAML, Docker, Terraform)
2. **Control Plane:** Routing, state management, validators
3. **Data Plane:** Business logic, data transformation

**Pattern-Based Classification:**
- Uses regex to identify plane membership
- Maps data flow through the system

### JTBD Story Extraction
**Purpose:** Extract user journeys from code

**Mapping:**
- Frontstage: UI components, pages
- Boundary: API endpoints, routes
- Backstage: Business logic, data access

**Supported Frameworks:**
- Express.js, Flask, FastAPI, Django, Rails

### Code Review Tool
**Philosophy:** "The bar is high" - code should be indistinguishable from the best engineer's work

**4 Stages:**

1. **Pre-Code Review**
   - PR description quality
   - Screenshots/demos included
   - AI disclosure
   - Tests passing

2. **Understanding the Why**
   - Root cause analysis
   - Historical context
   - System-wide impact

3. **Code Review**
   - Architecture correctness
   - Pattern consistency
   - Code quality (DRY, naming, etc.)
   - Testing coverage

4. **Feedback**
   - Blocking issues
   - Important improvements
   - Nitpicks

## Usage Examples

### Example 1: Analyze Repository Hotspots

1. Start the server: `python api_server.py`
2. Open http://localhost:5000
3. Enter repository path: `/path/to/my-project`
4. Click "Cartographer" tab
5. Select "Hotspot Analysis"
6. Configure: Set "Time Range" to 12 months
7. Click "Run Analysis"
8. View results showing top 20 files by risk score

### Example 2: Full Codebase Analysis

Using the API directly:
```bash
curl -X POST http://localhost:5000/api/cartographer/full-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "repo_path": "/path/to/repo",
    "config": {
      "months": 6
    }
  }'
```

### Example 3: Code Review Checklist

1. Click "Code Review" tab
2. Enter PR URL or local path
3. Click "Load PR"
4. Progress through stages:
   - Check Pre-Review items
   - Answer "Understanding Why" questions
   - Review code against checklist
   - Generate feedback

## Troubleshooting

### API Server Won't Start

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
pip install -r ui-requirements.txt
```

### Can't Connect to API

**Error in UI:** "Error connecting to API server!"

**Solution:**
- Make sure `api_server.py` is running
- Check console for server output
- Verify server is on http://localhost:5000

### Script Not Found Errors

**Error:** `Script not found: /path/to/script.py`

**Solution:**
The API server will automatically extract `.skill` files. Make sure these files exist:
- `codebase-cartographer.skill`
- `code-review-skill.skill`

### Analysis Timeout

**Error:** "Analysis timed out after 5 minutes"

**Solution:**
- For large repositories, increase the timeout in `api_server.py`
- Or run the script manually and import results

## Development

### Project Structure
```
.
├── codebase-tools-ui.html       # Main web interface
├── api_server.py                # Flask API server
├── ui-requirements.txt          # Python dependencies
├── UI_README.md                 # This file
├── codebase-cartographer.skill  # Cartographer scripts (ZIP)
└── code-review-skill.skill      # Code review tool (ZIP)
```

### Adding a New Analysis Tool

1. **Add script to cartographer skill:**
   - Extract `codebase-cartographer.skill`
   - Add new Python script to `scripts/`
   - Re-zip into `.skill` file

2. **Update API server:**
   - Add script mapping in `api_server.py`
   - Add endpoint handler if needed

3. **Update UI:**
   - Add tool definition in `tools.cartographer` array
   - Provide icon, description, metrics

### Customizing the UI

The UI is a single HTML file with embedded React. To customize:

1. **Change colors:** Update Tailwind CSS classes
2. **Add features:** Modify React components
3. **Change layout:** Edit JSX structure

## Roadmap

### Phase 1: Current Release ✅
- [x] Web UI with React
- [x] Flask API server
- [x] Integration with cartographer scripts
- [x] Code review checklist interface

### Phase 2: Enhanced Visualization
- [ ] Mandala Chart interactive visualization
- [ ] SVG-based concentric ring display
- [ ] Clickable segments for drill-down
- [ ] Color-coded health indicators

### Phase 3: Advanced Features
- [ ] Historical comparison (track improvements over time)
- [ ] Export reports as PDF
- [ ] Integration with GitHub API
- [ ] Automated PR review bot

### Phase 4: Team Collaboration
- [ ] Save and share analysis results
- [ ] Team dashboards
- [ ] Slack/Discord notifications
- [ ] Action plan tracking

## Contributing

This is a demo project showing how to build UIs for the Claude Agent SDK tools.

To contribute:
1. Test with your own repositories
2. Report issues or suggestions
3. Share your customizations

## License

Part of the Claude Agent SDK demos repository.

## Support

For questions or issues:
- Check the troubleshooting section above
- Review the API documentation
- Test with the sample commands

---

**Built with:** React, Tailwind CSS, Flask, Python
**Powered by:** Claude Agent SDK
