// ---- Raw data shapes (match the JSON files) ----

export interface Job {
  name: string;
  status: "success" | "failure" | "skipped";
  duration_sec?: number;
  failure_message?: string;
}

export interface Run {
  id: string;
  repo: string;
  branch: string;
  trigger: string;
  actor: string;
  started_at: string;
  jobs: Job[];
}

export interface RunData {
  runs: Run[];
}

export interface WorkflowJob {
  name: string;
  avg_duration_sec: number;
}

export interface Workflow {
  repo: string;
  workflow: string;
  jobs: WorkflowJob[];
}

export interface WorkflowData {
  workflows: Workflow[];
}

export interface FeedbackEntry {
  author: string;
  team: string;
  comment: string;
}

export interface FeedbackData {
  feedback: FeedbackEntry[];
}

// ---- Analysis result types ----

export interface RepoHealth {
  repo: string;
  totalRuns: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgDurationSec: number;
  minDurationSec: number;
  maxDurationSec: number;
  bottleneckJob: string;
  bottleneckAvgSec: number;
}

export type FailureClass = "ephemeral" | "hard";

export interface FailureRecord {
  runId: string;
  repo: string;
  branch: string;
  actor: string;
  jobName: string;
  failureMessage: string;
  classification: FailureClass;
  durationSec: number;
}

export interface FlakyTest {
  testPattern: string;
  repo: string;
  jobName: string;
  failureCount: number;
  branches: string[];
  actors: string[];
  failedRunIds: string[];
  retriedRunIds: string[];
  estimatedWasteMin: number;
}

export interface RetryChain {
  repo: string;
  branch: string;
  actor: string;
  runIds: string[];
  failedRunIds: string[];
  wastedDurationSec: number;
  retryCount: number;
}

export interface TimeWastedSummary {
  retryChains: RetryChain[];
  totalWastedMin: number;
  totalContextSwitchMin: number;
  totalCombinedWasteMin: number;
  wasteByRepo: Record<string, number>;
}

export interface RepoMinutes {
  repo: string;
  totalMinutes: number;
  successfulMinutes: number;
  wastedMinutes: number;
  wastedPercent: number;
}

export interface FeedbackCorrelation {
  author: string;
  team: string;
  comment: string;
  evidence: string[];
}
