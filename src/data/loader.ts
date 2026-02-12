import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { RunData, WorkflowData, FeedbackData } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadJSON<T>(filename: string): T {
  const filePath = join(__dirname, filename);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function loadRuns(): RunData {
  return loadJSON<RunData>("ci-run-history.json");
}

export function loadWorkflows(): WorkflowData {
  return loadJSON<WorkflowData>("workflows.json");
}

export function loadFeedback(): FeedbackData {
  return loadJSON<FeedbackData>("developer-feedback.json");
}
