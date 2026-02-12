import type { Run, FailureRecord, FailureClass } from "../types.js";

const EPHEMERAL_PATTERNS = [
  /Connection refused/i,
  /Timed out retrying/i,
  /TimeoutError/i,
  /Retries exhausted/i,
  /timed out after \d+ms/i,
  /ECONNREFUSED/i,
];

/**
 * Extract all failures from runs and classify each as hard or ephemeral.
 */
export function analyzeFailures(runs: Run[]): FailureRecord[] {
  const failures: FailureRecord[] = [];

  for (const run of runs) {
    for (const job of run.jobs) {
      if (job.status === "failure" && job.failure_message) {
        failures.push({
          runId: run.id,
          repo: run.repo,
          branch: run.branch,
          actor: run.actor,
          jobName: job.name,
          failureMessage: job.failure_message,
          classification: classifyFailure(job.failure_message),
          durationSec: job.duration_sec ?? 0,
        });
      }
    }
  }

  return failures;
}

export function classifyFailure(message: string): FailureClass {
  for (const pattern of EPHEMERAL_PATTERNS) {
    if (pattern.test(message)) {
      return "ephemeral";
    }
  }
  return "hard";
}
