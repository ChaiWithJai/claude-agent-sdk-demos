export function Processing() {
  return (
    <div className="processing">
      <div className="spinner"></div>
      <h2>Processing Your Meeting Notes</h2>
      <p>Extracting key information and generating documentation...</p>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "#a0aec0" }}>
        This may take a moment
      </p>
    </div>
  );
}
