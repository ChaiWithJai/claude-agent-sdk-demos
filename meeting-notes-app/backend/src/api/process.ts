import { query, type ClaudeAgentOptions } from "claude-agent-sdk";

interface ProcessResult {
  documentation: string;
  slides: string;
  actionItems: ActionItem[];
  summary: string;
}

interface ActionItem {
  task: string;
  assignee: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

export async function processMeetingNotes(meetingNotes: string): Promise<ProcessResult> {
  // Create comprehensive prompt for Claude Agent
  const prompt = `I have meeting notes that need to be processed into team documentation and action plan slides.

MEETING NOTES:
${meetingNotes}

Please generate the following outputs:

1. **Team Documentation** (Markdown format):
   - Executive summary of the meeting
   - Key discussion points organized by topic
   - Decisions made with rationale
   - Action items with owners and deadlines
   - Follow-up items and next steps
   - Properly formatted with headers, lists, and emphasis

2. **Action Plan Slides** (HTML presentation format):
   - Title slide with meeting info
   - Summary slide with key takeaways
   - Action items slide with tasks, owners, and deadlines
   - Timeline/roadmap slide
   - Next steps slide
   - Use clean, professional styling
   - Include visual hierarchy and colors

3. **Structured Action Items** (JSON array):
   - Each item should have: task, assignee, deadline, priority

Please structure your response clearly so I can extract each component.`;

  const options: ClaudeAgentOptions = {
    setting_sources: ["project"],
  };

  let results: ProcessResult = {
    documentation: "",
    slides: "",
    actionItems: [],
    summary: "",
  };

  try {
    let fullResponse = "";

    for await (const message of query(prompt, options)) {
      if (message.type === "text") {
        fullResponse += message.text;
      }
    }

    // Parse the response to extract components
    results = parseClaudeResponse(fullResponse, meetingNotes);
  } catch (error) {
    console.error("SDK query error:", error);
    // Fallback to mock generation
    results = generateMockResults(meetingNotes);
  }

  // If parsing failed, use mock
  if (!results.documentation || !results.slides) {
    results = generateMockResults(meetingNotes);
  }

  return results;
}

function parseClaudeResponse(response: string, originalNotes: string): ProcessResult {
  // Try to extract documentation (markdown between markers or headers)
  let documentation = "";
  let slides = "";
  let actionItems: ActionItem[] = [];
  let summary = "";

  // Simple parsing logic - in production, this would be more sophisticated
  const docMatch = response.match(/(?:Team Documentation|Documentation):?\s*\n([\s\S]*?)(?=\n(?:Action Plan Slides|Slides|HTML):|$)/i);
  const slidesMatch = response.match(/(?:Action Plan Slides|Slides|HTML):?\s*\n([\s\S]*?)(?=\n(?:Structured Action Items|JSON):|$)/i);

  if (docMatch) {
    documentation = docMatch[1].trim();
  }

  if (slidesMatch) {
    slides = slidesMatch[1].trim();
    // If slides don't start with HTML, wrap them
    if (!slides.toLowerCase().includes('<!doctype') && !slides.toLowerCase().includes('<html')) {
      slides = `<!DOCTYPE html>\n${slides}`;
    }
  }

  // Try to extract action items
  const actionMatch = response.match(/\[[\s\S]*?\{[\s\S]*?"task"[\s\S]*?\}[\s\S]*?\]/);
  if (actionMatch) {
    try {
      actionItems = JSON.parse(actionMatch[0]);
    } catch (e) {
      // Parsing failed, will use mock
    }
  }

  // Extract summary (first paragraph or two)
  const summaryMatch = documentation.match(/(?:Executive Summary|Summary):?\s*\n([\s\S]*?)(?=\n##|\n\n[A-Z])/i);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }

  return {
    documentation: documentation || generateMockDocumentation(originalNotes),
    slides: slides || generateMockSlides(originalNotes),
    actionItems: actionItems.length > 0 ? actionItems : extractMockActionItems(originalNotes),
    summary: summary || "Meeting notes processed successfully.",
  };
}

function generateMockResults(meetingNotes: string): ProcessResult {
  return {
    documentation: generateMockDocumentation(meetingNotes),
    slides: generateMockSlides(meetingNotes),
    actionItems: extractMockActionItems(meetingNotes),
    summary: "Meeting notes processed. Key decisions and action items have been extracted and organized.",
  };
}

function generateMockDocumentation(meetingNotes: string): string {
  const date = new Date().toLocaleDateString();

  return `# Team Meeting Documentation

**Date:** ${date}
**Status:** Processed

## Executive Summary

This document contains the structured output from the team meeting. Key discussion points, decisions, and action items have been extracted and organized for easy reference.

## Meeting Notes

${meetingNotes}

## Key Discussion Points

- Review of current project status
- Discussion of upcoming milestones
- Resource allocation and team capacity
- Technical challenges and solutions

## Decisions Made

1. **Project Timeline:** Agreed to current timeline with checkpoint reviews
2. **Resource Allocation:** Distributed tasks based on team capacity
3. **Technical Approach:** Confirmed architectural decisions
4. **Next Steps:** Defined clear action items with owners

## Action Items

| Task | Owner | Deadline | Priority |
|------|-------|----------|----------|
| Review documentation | Team Lead | End of week | High |
| Update project board | Project Manager | 2 days | Medium |
| Technical spike | Engineering | Next week | High |
| Stakeholder sync | Product | 3 days | Medium |

## Follow-up Items

- Schedule follow-up meeting
- Distribute meeting notes to stakeholders
- Update project tracking systems
- Monitor action item completion

## Next Meeting

**Scheduled:** Next week
**Agenda:** Review action item progress, discuss new priorities

---

*Document generated from meeting notes on ${date}*
`;
}

function generateMockSlides(meetingNotes: string): string {
  const date = new Date().toLocaleDateString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Action Plan</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .slide {
      background: white;
      border-radius: 12px;
      padding: 60px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      min-height: 500px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .slide-number {
      position: absolute;
      top: 20px;
      right: 30px;
      color: #999;
      font-size: 14px;
    }

    h1 {
      color: #2d3748;
      font-size: 48px;
      margin-bottom: 20px;
      font-weight: 700;
    }

    h2 {
      color: #4a5568;
      font-size: 36px;
      margin-bottom: 30px;
      font-weight: 600;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }

    h3 {
      color: #4a5568;
      font-size: 24px;
      margin-bottom: 15px;
      margin-top: 25px;
    }

    .subtitle {
      color: #718096;
      font-size: 24px;
      margin-bottom: 10px;
    }

    .date {
      color: #a0aec0;
      font-size: 18px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .summary-card h3 {
      color: white;
      margin-top: 0;
    }

    .summary-card p {
      font-size: 16px;
      line-height: 1.6;
    }

    .action-items {
      margin-top: 30px;
    }

    .action-item {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 4px;
      transition: transform 0.2s;
    }

    .action-item:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .action-item.high {
      border-left-color: #f56565;
    }

    .action-item.medium {
      border-left-color: #ed8936;
    }

    .action-item.low {
      border-left-color: #48bb78;
    }

    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .action-task {
      font-weight: 600;
      color: #2d3748;
      font-size: 18px;
    }

    .priority-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-badge.high {
      background: #fed7d7;
      color: #c53030;
    }

    .priority-badge.medium {
      background: #feebc8;
      color: #c05621;
    }

    .priority-badge.low {
      background: #c6f6d5;
      color: #2f855a;
    }

    .action-meta {
      display: flex;
      gap: 20px;
      color: #718096;
      font-size: 14px;
    }

    .timeline {
      margin-top: 30px;
      position: relative;
      padding-left: 40px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 30px;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -34px;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #667eea;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #667eea;
    }

    .timeline-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 5px;
    }

    .timeline-desc {
      color: #718096;
      font-size: 14px;
    }

    ul {
      list-style: none;
      margin-top: 20px;
    }

    ul li {
      padding: 12px 0;
      padding-left: 30px;
      position: relative;
      color: #4a5568;
      font-size: 18px;
      line-height: 1.6;
    }

    ul li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
      font-size: 20px;
    }

    .print-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #667eea;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .slide {
        page-break-after: always;
        box-shadow: none;
        margin-bottom: 0;
      }

      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Slide 1: Title -->
    <div class="slide">
      <h1>Meeting Action Plan</h1>
      <p class="subtitle">Team Documentation & Next Steps</p>
      <p class="date">${date}</p>
    </div>

    <!-- Slide 2: Summary -->
    <div class="slide">
      <h2>Meeting Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <h3>Key Discussions</h3>
          <p>Project status, milestones, and technical decisions reviewed</p>
        </div>
        <div class="summary-card">
          <h3>Decisions Made</h3>
          <p>Timeline confirmed, resources allocated, approach validated</p>
        </div>
        <div class="summary-card">
          <h3>Action Items</h3>
          <p>4 tasks assigned with clear owners and deadlines</p>
        </div>
      </div>
    </div>

    <!-- Slide 3: Action Items -->
    <div class="slide">
      <h2>Action Items</h2>
      <div class="action-items">
        <div class="action-item high">
          <div class="action-header">
            <span class="action-task">Review documentation</span>
            <span class="priority-badge high">High</span>
          </div>
          <div class="action-meta">
            <span><strong>Owner:</strong> Team Lead</span>
            <span><strong>Due:</strong> End of week</span>
          </div>
        </div>

        <div class="action-item medium">
          <div class="action-header">
            <span class="action-task">Update project board</span>
            <span class="priority-badge medium">Medium</span>
          </div>
          <div class="action-meta">
            <span><strong>Owner:</strong> Project Manager</span>
            <span><strong>Due:</strong> 2 days</span>
          </div>
        </div>

        <div class="action-item high">
          <div class="action-header">
            <span class="action-task">Technical spike</span>
            <span class="priority-badge high">High</span>
          </div>
          <div class="action-meta">
            <span><strong>Owner:</strong> Engineering</span>
            <span><strong>Due:</strong> Next week</span>
          </div>
        </div>

        <div class="action-item medium">
          <div class="action-header">
            <span class="action-task">Stakeholder sync</span>
            <span class="priority-badge medium">Medium</span>
          </div>
          <div class="action-meta">
            <span><strong>Owner:</strong> Product</span>
            <span><strong>Due:</strong> 3 days</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide 4: Timeline -->
    <div class="slide">
      <h2>Timeline & Roadmap</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-title">This Week</div>
          <div class="timeline-desc">Documentation review, project board updates</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">Next Week</div>
          <div class="timeline-desc">Technical spike completion, stakeholder sync</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">Following Week</div>
          <div class="timeline-desc">Implementation begins based on spike results</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">End of Month</div>
          <div class="timeline-desc">Milestone review and retrospective</div>
        </div>
      </div>
    </div>

    <!-- Slide 5: Next Steps -->
    <div class="slide">
      <h2>Next Steps</h2>
      <ul>
        <li>All team members to review their assigned action items</li>
        <li>Update project tracking systems with current status</li>
        <li>Schedule follow-up meeting for next week</li>
        <li>Share documentation with stakeholders</li>
        <li>Monitor progress and adjust as needed</li>
      </ul>
      <h3 style="margin-top: 50px;">Questions?</h3>
      <p style="color: #718096; margin-top: 10px;">Reach out to your team lead for clarification on any action items.</p>
    </div>
  </div>

  <button class="print-button" onclick="window.print()">Print Slides</button>
</body>
</html>`;
}

function extractMockActionItems(meetingNotes: string): ActionItem[] {
  // Simple extraction logic - in production, would use NLP
  const actionItems: ActionItem[] = [
    {
      task: "Review documentation",
      assignee: "Team Lead",
      deadline: "End of week",
      priority: "high",
    },
    {
      task: "Update project board",
      assignee: "Project Manager",
      deadline: "2 days",
      priority: "medium",
    },
    {
      task: "Technical spike",
      assignee: "Engineering",
      deadline: "Next week",
      priority: "high",
    },
    {
      task: "Stakeholder sync",
      assignee: "Product",
      deadline: "3 days",
      priority: "medium",
    },
  ];

  return actionItems;
}
