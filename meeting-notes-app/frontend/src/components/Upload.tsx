import { useState } from "react";

interface UploadProps {
  onProcess: (notes: string) => void;
}

export function Upload({ onProcess }: UploadProps) {
  const [notes, setNotes] = useState("");

  const handleProcess = () => {
    if (notes.trim()) {
      onProcess(notes);
    }
  };

  const handleLoadExample = () => {
    const example = `# Team Standup - November 16, 2025

## Attendees
- Sarah (Product Manager)
- Mike (Engineering Lead)
- Jessica (UX Designer)
- Tom (Backend Engineer)
- Lisa (Frontend Engineer)

## Discussion Points

### Project Status
- Backend API development is 80% complete
- Frontend components for user dashboard need refinement
- Database migration scheduled for next Tuesday
- Current sprint ends Friday

### Key Decisions
1. **Timeline**: We agreed to extend the current sprint by 3 days to ensure quality
2. **Architecture**: Going with microservices approach for the new feature
3. **Testing**: Implementing automated E2E tests before launch
4. **Design**: Final UI mockups approved, ready for implementation

### Action Items
- Mike: Complete API documentation by Wednesday
- Tom: Finish database migration script by Monday
- Lisa: Refactor user dashboard components by Thursday
- Jessica: Provide final design assets by tomorrow
- Sarah: Schedule stakeholder demo for next Friday

### Blockers
- Need access to staging environment (escalated to DevOps)
- Waiting for legal review of new terms of service
- Third-party API integration showing intermittent failures

### Next Steps
- Daily standups continue at 9 AM
- Code review session scheduled for Wednesday afternoon
- Planning meeting for next sprint on Friday at 2 PM

## Notes
- Great progress this week!
- Team morale is high
- Remember to update Jira tickets daily`;

    setNotes(example);
  };

  return (
    <div className="upload-section">
      <h2>Upload Meeting Notes</h2>
      <p>
        Paste or type your meeting notes below. The system will automatically extract key points,
        decisions, and action items, then generate comprehensive documentation and presentation slides.
      </p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste your meeting notes here...

You can include:
- Discussion topics
- Decisions made
- Action items with owners
- Blockers or issues
- Next steps

The more detail you provide, the better the output will be!"
      />

      <div className="button-group">
        <button className="secondary-button" onClick={handleLoadExample}>
          Load Example
        </button>
        <button
          className="primary-button"
          onClick={handleProcess}
          disabled={!notes.trim()}
        >
          Process Notes
        </button>
      </div>
    </div>
  );
}
