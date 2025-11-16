import express from "express";
import cors from "cors";
import { processMeetingNotes } from "./api/process.js";

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Process meeting notes endpoint
app.post("/api/process", async (req, res) => {
  try {
    const { meetingNotes } = req.body;

    if (!meetingNotes || typeof meetingNotes !== "string") {
      return res.status(400).json({ error: "Invalid input: meetingNotes (string) required" });
    }

    const result = await processMeetingNotes(meetingNotes);
    res.json(result);
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process meeting notes",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Meeting Notes API server running on http://localhost:${PORT}`);
});
