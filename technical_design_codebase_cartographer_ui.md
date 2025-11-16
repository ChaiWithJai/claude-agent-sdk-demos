# Technical Design: Codebase Cartographer Interactive UI

**Status**: Draft  
**Author**: Jai Dhyani  
**Last Updated**: November 15, 2025

---

## Executive Summary

Build an interactive web UI that enables developers to engage with the Codebase Cartographer skill, visualize architectural analysis (particularly Mandala Charts), and receive actionable improvement plans—all within Claude's artifact system.

**The Job To Be Done**: When I inherit a legacy codebase or join a new team, I want to see a visual map of code health, knowledge silos, and technical debt, so that I can prioritize what to fix first and where to start learning.

---

## Problem Statement

The Codebase Cartographer skill produces powerful analysis (hotspots, knowledge silos, architectural planes, JTBD stories), but the output is scattered JSON files and terminal text. Developers must manually correlate these outputs and mentally model the system's health. This cognitive overhead means:

1. Analysis results sit unused because they're hard to interpret
2. Teams can't quickly align on what needs fixing first
3. Institutional knowledge about the codebase remains locked in senior developers' heads

The Mandala Chart pattern—a structured visualization showing core purpose surrounded by key components and actionable next steps—provides an ideal framework for making this analysis immediately useful.

---

## Solution Architecture

### Core Components

```
codebase-cartographer-ui/
├── SKILL.md                    # Enhanced skill with UI generation capability
├── scripts/
│   ├── analyze_hotspots.py     # (existing)
│   ├── git_archaeology.py      # (existing)
│   ├── analyze_data_flow.py    # (existing)
│   ├── map_jtbd_stories.py     # (existing)
│   └── build_dependency_graph.py # (existing)
├── references/
│   ├── mandala_chart_spec.md   # Mandala Chart data structure & rendering rules
│   └── action_plan_templates.md # Templates for generating actionable plans
└── assets/
    └── mandala_template.jsx    # React component template for Mandala rendering
```

### Data Flow

```
User Request → Run Analysis Scripts → Generate Mandala JSON → Render React Artifact → Interactive UI
```

**Detailed Flow**:

1. User provides repository path (or uploads project context)
2. Claude orchestrates analysis scripts, collecting outputs into structured JSON
3. JSON gets transformed into Mandala Chart data structure (center: core purpose, rings: architectural planes, segments: hotspots/silos)
4. React artifact renders interactive visualization
5. User clicks segments to drill down into action plans

---

## Mandala Chart Data Structure

The Mandala Chart transforms codebase analysis into a concentric visualization:

```typescript
interface MandalaCenterNode {
  core_purpose: string;           // "E-commerce Platform" or primary JTBD
  health_score: number;           // 0-100 aggregate score
  primary_language: string;
}

interface MandalaRing {
  name: string;                   // "Management Plane", "Control Plane", "Data Plane"
  segments: MandalaSegment[];
}

interface MandalaSegment {
  id: string;
  label: string;                  // Component or directory name
  health: "critical" | "warning" | "healthy";
  metrics: {
    complexity: number;           // LOC
    churn: number;                // commits in timeframe
    bus_factor: number;           // number of distinct authors
    coverage: number;             // test coverage percentage
  };
  hotspots: string[];             // File paths flagged as hotspots
  primary_owner: string;          // Git author with most commits
  action_items: ActionItem[];
}

interface ActionItem {
  priority: "high" | "medium" | "low";
  type: "refactor" | "document" | "test" | "knowledge-transfer";
  description: string;
  effort_estimate: "hours" | "days" | "weeks";
  files_affected: string[];
}

interface MandalaChart {
  center: MandalaCenterNode;
  rings: MandalaRing[];           // Inner to outer: Data Plane → Control Plane → Management Plane
  temporal_coupling: [string, string, number][]; // File pairs that change together
  knowledge_silos: string[];      // Directories with single-owner risk
}
```

---

## Test Specifications

Following test-first methodology, here are the acceptance criteria:

### Unit Tests: Data Transformation

```python
def test_hotspot_analysis_produces_valid_segments():
    """Hotspot JSON should transform into MandalaSegments with health ratings."""
    hotspots_json = load_fixture("sample_hotspots.json")
    segments = transform_hotspots_to_segments(hotspots_json)
    
    assert all(s["health"] in ["critical", "warning", "healthy"] for s in segments)
    assert all(s["metrics"]["churn"] >= 0 for s in segments)
    assert segments[0]["health"] == "critical"  # Highest churn = critical

def test_git_archaeology_identifies_knowledge_silos():
    """Directories with >70% single-author ownership flagged as silos."""
    archaeology_json = load_fixture("sample_archaeology.json")
    silos = extract_knowledge_silos(archaeology_json)
    
    assert "lib/payments" in silos  # 85% single owner
    assert "lib/utils" not in silos  # 40% distributed

def test_action_items_prioritized_by_risk():
    """Critical health segments get high-priority action items."""
    segment = create_segment(health="critical", bus_factor=1)
    actions = generate_action_items(segment)
    
    assert actions[0]["priority"] == "high"
    assert actions[0]["type"] == "knowledge-transfer"
```

### Integration Tests: Analysis Pipeline

```python
def test_full_analysis_produces_complete_mandala():
    """Running all scripts produces valid MandalaChart structure."""
    repo_path = "./fixtures/sample_repo"
    mandala = run_full_analysis(repo_path)
    
    assert mandala["center"]["core_purpose"]
    assert len(mandala["rings"]) == 3  # Three architectural planes
    assert all(ring["segments"] for ring in mandala["rings"])

def test_temporal_coupling_detected():
    """Files that change together are linked in the chart."""
    mandala = run_full_analysis("./fixtures/sample_repo")
    
    # Known coupling in fixture: models/user.py ↔ controllers/auth.py
    coupling_pairs = mandala["temporal_coupling"]
    assert any("user.py" in p[0] and "auth.py" in p[1] for p in coupling_pairs)
```

### UI Component Tests

```javascript
describe("MandalaChart", () => {
  test("renders all three rings", () => {
    const { getByText } = render(<MandalaChart data={mockMandala} />);
    expect(getByText("Data Plane")).toBeInTheDocument();
    expect(getByText("Control Plane")).toBeInTheDocument();
    expect(getByText("Management Plane")).toBeInTheDocument();
  });

  test("clicking segment reveals action plan", async () => {
    const { getByTestId, findByText } = render(<MandalaChart data={mockMandala} />);
    
    fireEvent.click(getByTestId("segment-payments"));
    
    expect(await findByText("Action Plan: lib/payments")).toBeInTheDocument();
    expect(await findByText("Schedule knowledge transfer")).toBeInTheDocument();
  });

  test("critical segments render in red", () => {
    const { getByTestId } = render(<MandalaChart data={mockMandala} />);
    const segment = getByTestId("segment-payments");
    
    expect(segment).toHaveClass("bg-red-500");
  });

  test("hovering segment shows metrics tooltip", async () => {
    const { getByTestId, findByText } = render(<MandalaChart data={mockMandala} />);
    
    fireEvent.mouseEnter(getByTestId("segment-payments"));
    
    expect(await findByText("Complexity: 2,450 LOC")).toBeInTheDocument();
    expect(await findByText("Churn: 127 commits")).toBeInTheDocument();
    expect(await findByText("Bus Factor: 1 (RISK)")).toBeInTheDocument();
  });
});

describe("ActionPlanPanel", () => {
  test("displays prioritized action items", () => {
    const { getAllByRole } = render(<ActionPlanPanel segment={mockSegment} />);
    const items = getAllByRole("listitem");
    
    // High priority items listed first
    expect(items[0]).toHaveTextContent("HIGH");
  });

  test("effort estimates are visible", () => {
    const { getByText } = render(<ActionPlanPanel segment={mockSegment} />);
    expect(getByText("~2-3 days")).toBeInTheDocument();
  });
});
```

### End-to-End Tests

```javascript
describe("Codebase Cartographer UI E2E", () => {
  test("user can analyze repository and view mandala", async () => {
    // 1. Start with analysis data (simulating skill execution)
    const analysisResult = await loadMockAnalysis();
    
    // 2. Render the artifact
    render(<CodebaseCartographerUI analysisData={analysisResult} />);
    
    // 3. Verify mandala chart appears
    await waitFor(() => {
      expect(screen.getByTestId("mandala-center")).toBeInTheDocument();
    });
    
    // 4. Click on a hotspot segment
    fireEvent.click(screen.getByTestId("segment-hotspot-1"));
    
    // 5. Verify action plan appears
    expect(await screen.findByText("Recommended Actions")).toBeInTheDocument();
    
    // 6. Verify file paths are clickable/visible
    expect(screen.getByText("lib/payments/processor.py")).toBeInTheDocument();
  });

  test("health score updates when drilling into components", async () => {
    render(<CodebaseCartographerUI analysisData={mockAnalysis} />);
    
    const centerScore = screen.getByTestId("health-score");
    expect(centerScore).toHaveTextContent("73/100");
    
    // Filter to critical components only
    fireEvent.click(screen.getByText("Show Critical Only"));
    
    // Score should reflect only critical components
    await waitFor(() => {
      expect(centerScore).toHaveTextContent("45/100");
    });
  });
});
```

---

## Implementation Plan

### Phase 1: Data Transformation Layer (Week 1)

**Deliverable**: Python module that transforms existing script outputs into MandalaChart JSON.

**Files to create**:
- `scripts/transform_to_mandala.py` - Core transformation logic
- `tests/test_transform_to_mandala.py` - Unit tests for transformation

**Key functions**:
```python
def aggregate_analysis_results(hotspots_path, archaeology_path, dataflow_path, jtbd_path):
    """Load all analysis JSON files and merge into unified structure."""
    
def calculate_segment_health(metrics: dict) -> str:
    """Determine health status based on metrics thresholds."""
    
def generate_action_items_for_segment(segment: dict) -> list:
    """Create prioritized action items based on segment health and metrics."""
    
def build_mandala_chart(aggregated_data: dict) -> dict:
    """Construct final MandalaChart data structure."""
```

**Exit Criteria**: All unit tests pass, transformation produces valid MandalaChart JSON for 3 different sample repositories.

### Phase 2: React Component Foundation (Week 2)

**Deliverable**: Standalone React component that renders a static Mandala Chart.

**Files to create**:
- `assets/mandala_template.jsx` - Core visualization component
- `assets/action_plan_panel.jsx` - Drill-down panel for action items

**Technical constraints**:
- Must render in Claude's artifact environment (single-file JSX)
- Use Tailwind CSS utilities only (no external CSS)
- No browser storage APIs (localStorage blocked)
- State management via React hooks only

**Visual specification**:
```
                    [Management Plane - Outer Ring]
                   /                              \
          [Control Plane - Middle Ring]
         /                              \
    [Data Plane - Inner Ring]
   /                          \
        [CORE PURPOSE]
        Health Score: XX
   \                          /
    [Data Plane Segments]
         \                              /
          [Control Plane Segments]
                   \                              /
                    [Management Plane Segments]
```

Each segment is:
- A clickable SVG path
- Colored by health (red/yellow/green)
- Shows tooltip on hover
- Opens action panel on click

**Exit Criteria**: Component renders mock data correctly, segment clicks work, tooltips display, all UI tests pass.

### Phase 3: Integration & Skill Enhancement (Week 3)

**Deliverable**: Enhanced SKILL.md that orchestrates analysis and UI generation.

**Updates to SKILL.md**:
```markdown
## New Capability: Interactive Visualization

When user requests visual analysis or Mandala Chart:

1. Run all analysis scripts against target repository
2. Execute `transform_to_mandala.py` to generate chart data
3. Embed chart JSON into React template
4. Output complete artifact to user

### Example Workflow

User: "Generate a Mandala Chart for my repository at /path/to/repo"

Claude:
1. `python scripts/analyze_hotspots.py /path/to/repo`
2. `python scripts/git_archaeology.py /path/to/repo`
3. `python scripts/analyze_data_flow.py /path/to/repo`
4. `python scripts/transform_to_mandala.py --all-outputs`
5. Inject JSON into React template
6. Return artifact with interactive UI
```

**Exit Criteria**: End-to-end flow works in Claude artifact environment, user can interact with generated chart.

### Phase 4: Action Plan Intelligence (Week 4)

**Deliverable**: Smart action plan generation based on analysis patterns.

**Files to create**:
- `references/action_plan_templates.md` - Template library for different scenarios

**Action plan logic**:

```markdown
# Action Plan Templates

## Knowledge Silo (Bus Factor = 1)

**Priority**: HIGH
**Type**: knowledge-transfer

### Immediate Actions (This Week)
1. Schedule 2-hour pairing session between {primary_owner} and another team member
2. Document implicit knowledge in {affected_directory}/README.md
3. Record video walkthrough of {hotspot_files}

### Medium-term Actions (This Month)
1. Assign co-ownership on next feature in this area
2. Add comprehensive comments to {critical_functions}
3. Create architectural decision records (ADRs) for non-obvious patterns

---

## High-Churn Hotspot

**Priority**: MEDIUM
**Type**: refactor

### Immediate Actions
1. Identify primary change reasons (feature additions vs. bug fixes)
2. Extract stable logic into separate modules
3. Add test coverage for unstable areas

### Medium-term Actions
1. Refactor to reduce cyclomatic complexity below {threshold}
2. Consider splitting into smaller, focused files
3. Document edge cases and business rules inline

---

## Temporal Coupling

**Priority**: LOW (but flag for awareness)
**Type**: document

### Immediate Actions
1. Document the coupling relationship in both files
2. Consider extracting shared dependency into separate module
3. Add integration tests that exercise both files together
```

**Exit Criteria**: Action plans are contextually relevant, prioritization makes sense, effort estimates are reasonable.

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SVG rendering complexity in artifact environment | Medium | High | Start with simple concentric circles, enhance progressively |
| Large analysis JSON causing artifact lag | Medium | Medium | Implement data pagination, summarize at top level |
| Different repository structures break analysis | High | Medium | Add error handling and graceful degradation |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Users misinterpret health scores as absolute judgments | Medium | High | Add clear explanations that scores are relative indicators |
| Action plans too generic to be useful | Medium | High | Provide specific file paths and concrete steps |
| Visualization overwhelming for large codebases | Medium | Medium | Add filtering and zoom capabilities |

---

## Success Metrics

### Functional Success
- [ ] Mandala Chart renders correctly for repositories with 10-1000 files
- [ ] All three architectural planes are represented
- [ ] Clicking any segment reveals relevant action plan
- [ ] Health scores correlate with known problem areas in test repositories

### User Value Success
- [ ] User can identify top 3 risk areas within 30 seconds of viewing chart
- [ ] Action plans contain at least one immediately actionable item
- [ ] Visualization reduces time-to-first-fix for new team members
- [ ] Teams report improved alignment on technical debt priorities

---

## Open Questions

1. **Color accessibility**: Should we use patterns in addition to colors for health indicators? (Answer: Yes, add hatching for colorblind support)

2. **Repository size limits**: What's the maximum repository size this should handle? (Proposal: Target 10,000 files, with graceful sampling above that)

3. **Historical comparison**: Should we support comparing Mandala Charts over time to show improvement? (Defer to Phase 2 of product evolution)

4. **Team attribution**: How do we handle repositories with 100+ contributors? (Proposal: Show top 5 contributors per segment, aggregate others)

---

## References

- Codebase Cartographer SKILL.md: `/mnt/skills/user/codebase-cartographer/SKILL.md`
- Web Artifacts Builder: `/mnt/skills/examples/web-artifacts-builder/SKILL.md`
- Documentation Templates: `/mnt/skills/user/codebase-cartographer/references/documentation_templates.md`
- Architectural Planes: `/mnt/skills/user/codebase-cartographer/references/architectural_planes.md`

---

## Appendix: Mandala Chart Visual Reference

The Mandala Chart borrows from the Japanese "Mandala" or "Mandara" chart used for goal planning, adapted for codebase health visualization:

**Center**: Core purpose/primary JTBD of the codebase
**Inner Ring (Data Plane)**: Components that process and transform data—the business logic layer
**Middle Ring (Control Plane)**: Components that route and orchestrate—the decision layer
**Outer Ring (Management Plane)**: Components that configure and deploy—the orchestration layer

Each ring is divided into segments representing actual directories/modules from the codebase, colored by health status, and sized by relative importance (LOC or usage frequency).

This creates a holistic "at a glance" view where:
- Red segments demand immediate attention
- Yellow segments need monitoring
- Green segments are stable and healthy
- Clustering of red/yellow indicates systemic issues rather than isolated problems

The action plan that accompanies each segment transforms the visualization from "interesting diagram" into "actionable roadmap."
