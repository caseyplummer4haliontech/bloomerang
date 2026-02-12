import type { Run, FlakyTest, FailureRecord } from "../types.js";
import { CONTEXT_SWITCH_PENALTY_MIN } from "../constants.js";

/**
 * Detect flaky tests by finding failure patterns that:
 * 1. Appear across multiple branches or actors (not one person's bug)
 * 2. Have a subsequent successful run on the same branch (pass on retry)
 * 3. Share an ephemeral failure classification
 *
 * Groups failures by a normalized test pattern (file + test name) and
 * returns ranked results.
 */
export function analyzeFlaky(
  runs: Run[],
  failures: FailureRecord[],
): FlakyTest[] {
  // Group ephemeral failures by a signature: repo + test file path
  const groups = new Map<string, FailureRecord[]>();

  for (const f of failures) {
    if (f.classification !== "ephemeral") continue;
    const testFile = extractTestFile(f.failureMessage);
    const key = `${f.repo}::${testFile}`;
    const existing = groups.get(key) ?? [];
    existing.push(f);
    groups.set(key, existing);
  }

  const results: FlakyTest[] = [];

  for (const [key, records] of groups) {
    // Must appear across multiple branches or actors to be considered flaky
    const branches = [...new Set(records.map((r) => r.branch))];
    const actors = [...new Set(records.map((r) => r.actor))];
    if (branches.length < 2 && actors.length < 2) continue;

    // Find retry runs that succeeded on the same branch
    const retriedRunIds: string[] = [];
    for (const f of records) {
      const retryRun = findSuccessfulRetry(runs, f);
      if (retryRun) {
        retriedRunIds.push(retryRun.id);
      }
    }

    // Estimate wasted time: sum of all job durations in failed runs up to failure
    const wastedSec = records.reduce((sum, r) => sum + r.durationSec, 0);
    // Add context-switch penalty per failure occurrence
    const contextSwitchMin = records.length * CONTEXT_SWITCH_PENALTY_MIN;

    results.push({
      testPattern: extractTestFile(records[0].failureMessage),
      repo: records[0].repo,
      jobName: records[0].jobName,
      failureCount: records.length,
      branches,
      actors,
      failedRunIds: records.map((r) => r.runId),
      retriedRunIds,
      estimatedWasteMin:
        Math.round((wastedSec / 60) * 10) / 10 + contextSwitchMin,
    });
  }

  // Sort by failure count descending
  results.sort((a, b) => b.failureCount - a.failureCount);
  return results;
}

/**
 * Extract the test file path from a failure message.
 * Handles both JS/TS style (FAIL path/to/file.test.ts) and Python style
 * (FAILED path/to/test_file.py::test_name).
 */
function extractTestFile(message: string): string {
  // JS/TS: "FAIL cypress/e2e/volunteer-signup.cy.ts > ..."
  const jsMatch = message.match(/FAIL\s+(\S+)/);
  if (jsMatch) return jsMatch[1];

  // Python: "FAILED tests/integration/test_event_batch.py::test_name"
  const pyMatch = message.match(/FAILED\s+(\S+?)(?:::|$)/);
  if (pyMatch) return pyMatch[1];

  return message.slice(0, 60);
}

/**
 * Find a successful run on the same branch by the same actor that happened
 * after the failed run.
 */
function findSuccessfulRetry(runs: Run[], failure: FailureRecord): Run | null {
  const failedRun = runs.find((r) => r.id === failure.runId);
  if (!failedRun) return null;

  const failedTime = new Date(failedRun.started_at).getTime();

  return (
    runs.find(
      (r) =>
        r.repo === failure.repo &&
        r.branch === failure.branch &&
        r.actor === failure.actor &&
        new Date(r.started_at).getTime() > failedTime &&
        r.jobs.every(
          (j) => j.status === "success" || j.status === "skipped",
        ),
    ) ?? null
  );
}
