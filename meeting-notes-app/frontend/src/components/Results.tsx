import { useState, useMemo } from "react";
import { ProcessResult } from "../types";

interface ResultsProps {
  result: ProcessResult;
  onReset: () => void;
}

type TabType = "summary" | "documentation" | "slides" | "actions";

export function Results({ result, onReset }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // Convert documentation markdown to HTML (simple version)
  const documentationHtml = useMemo(() => {
    return result.documentation
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$2</h2>')
      .replace(/^### (.*$)/gim, '<h3>$3</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  }, [result.documentation]);

  const handleDownloadDoc = () => {
    const blob = new Blob([result.documentation], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting-documentation.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSlides = () => {
    const blob = new Blob([result.slides], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "action-plan-slides.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadActions = () => {
    const actionsText = result.actionItems
      .map((item) => `[${item.priority.toUpperCase()}] ${item.task}\n  Owner: ${item.assignee}\n  Due: ${item.deadline}`)
      .join("\n\n");
    const blob = new Blob([actionsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "action-items.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create a blob URL for the slides iframe
  const slidesUrl = useMemo(() => {
    const blob = new Blob([result.slides], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [result.slides]);

  return (
    <div className="results">
      <div className="results-header">
        <h2>Results</h2>
        <button className="secondary-button" onClick={onReset}>
          Process New Notes
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="summary-box">
          <h3>Summary</h3>
          <p>{result.summary}</p>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={`tab ${activeTab === "documentation" ? "active" : ""}`}
          onClick={() => setActiveTab("documentation")}
        >
          Documentation
        </button>
        <button
          className={`tab ${activeTab === "slides" ? "active" : ""}`}
          onClick={() => setActiveTab("slides")}
        >
          Slides
        </button>
        <button
          className={`tab ${activeTab === "actions" ? "active" : ""}`}
          onClick={() => setActiveTab("actions")}
        >
          Action Items ({result.actionItems.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "summary" && (
          <div>
            <h3 style={{ marginBottom: "20px" }}>Quick Overview</h3>
            <p style={{ lineHeight: "1.8", color: "#4a5568" }}>
              Your meeting notes have been processed into structured documentation and presentation slides.
              Use the tabs above to view the full documentation, presentation slides, or detailed action items.
            </p>
            <div className="download-buttons" style={{ marginTop: "30px" }}>
              <button className="download-button" onClick={handleDownloadDoc}>
                Download Documentation
              </button>
              <button className="download-button" onClick={handleDownloadSlides}>
                Download Slides
              </button>
              <button className="download-button" onClick={handleDownloadActions}>
                Download Action Items
              </button>
            </div>
          </div>
        )}

        {activeTab === "documentation" && (
          <div>
            <div className="documentation">
              <div dangerouslySetInnerHTML={{ __html: documentationHtml }} />
            </div>
            <div style={{ marginTop: "20px" }}>
              <button className="download-button" onClick={handleDownloadDoc}>
                Download Documentation (Markdown)
              </button>
            </div>
          </div>
        )}

        {activeTab === "slides" && (
          <div>
            <div className="slides-container">
              <iframe src={slidesUrl} title="Action Plan Slides" />
            </div>
            <div style={{ marginTop: "20px" }}>
              <button className="download-button" onClick={handleDownloadSlides}>
                Download Slides (HTML)
              </button>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div>
            <div className="action-items-list">
              {result.actionItems.map((item, index) => (
                <div key={index} className={`action-item ${item.priority}`}>
                  <div className="action-item-header">
                    <span className="action-item-task">{item.task}</span>
                    <span className={`priority-badge ${item.priority}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="action-item-meta">
                    <span>
                      <strong>Owner:</strong> {item.assignee}
                    </span>
                    <span>
                      <strong>Due:</strong> {item.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px" }}>
              <button className="download-button" onClick={handleDownloadActions}>
                Download Action Items (Text)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
