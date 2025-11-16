import { useState } from "react";
import { Upload } from "./components/Upload";
import { Processing } from "./components/Processing";
import { Results } from "./components/Results";
import { Error } from "./components/Error";
import { AppState, ProcessResult } from "./types";
import "./App.css";

function App() {
  const [state, setState] = useState<AppState>("input");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleProcess = async (meetingNotes: string) => {
    setState("processing");
    setError("");

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingNotes }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data: ProcessResult = await response.json();
      setResult(data);
      setState("results");
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "Failed to process meeting notes");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("input");
    setResult(null);
    setError("");
  };

  const handleRetry = () => {
    setState("input");
    setError("");
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Meeting Notes Processor</h1>
        <p>Transform meeting notes into team documentation and action plans</p>
      </div>

      <div className="container">
        {state === "input" && <Upload onProcess={handleProcess} />}
        {state === "processing" && <Processing />}
        {state === "results" && result && <Results result={result} onReset={handleReset} />}
        {state === "error" && <Error message={error} onRetry={handleRetry} />}
      </div>
    </div>
  );
}

export default App;
