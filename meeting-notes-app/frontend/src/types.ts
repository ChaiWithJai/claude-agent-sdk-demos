export interface ActionItem {
  task: string;
  assignee: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

export interface ProcessResult {
  documentation: string;
  slides: string;
  actionItems: ActionItem[];
  summary: string;
}

export type AppState = "input" | "processing" | "results" | "error";

export interface AppData {
  meetingNotes: string;
  result?: ProcessResult;
  error?: string;
}
