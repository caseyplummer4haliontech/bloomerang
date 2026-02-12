import type {
  FeedbackEntry,
  FailureRecord,
  FlakyTest,
  FeedbackCorrelation,
} from "../types.js";

/**
 * Correlate developer survey feedback with data-backed evidence
 * from failure analysis and flaky test detection.
 */
export function analyzeFeedback(
  feedback: FeedbackEntry[],
  failures: FailureRecord[],
  flakyTests: FlakyTest[],
): FeedbackCorrelation[] {
  return feedback.map((entry) => {
    const evidence: string[] = [];

    // Look for keyword matches between comment and failure data
    for (const flaky of flakyTests) {
      if (commentMatchesFlaky(entry.comment, flaky)) {
        evidence.push(
          `Flaky test "${flaky.testPattern}" in ${flaky.repo}: ` +
            `${flaky.failureCount} failures across ${flaky.branches.length} branches. ` +
            `Estimated ${flaky.estimatedWasteMin} min wasted.`,
        );
      }
    }

    // Match against specific failure patterns
    for (const failure of failures) {
      if (commentMatchesFailure(entry.comment, failure)) {
        // Avoid duplicating evidence already captured by flaky match
        const snippet = `${failure.repo} ${failure.jobName} failure in ${failure.runId}: "${truncate(failure.failureMessage, 80)}" [${failure.classification}]`;
        if (!evidence.some((e) => e.includes(failure.runId))) {
          evidence.push(snippet);
        }
      }
    }

    // Add generic observations if no specific match
    if (evidence.length === 0) {
      evidence.push("No direct match to failure data — qualitative feedback.");
    }

    return {
      author: entry.author,
      team: entry.team,
      comment: entry.comment,
      evidence,
    };
  });
}

function commentMatchesFlaky(comment: string, flaky: FlakyTest): boolean {
  const lower = comment.toLowerCase();

  // stripe-mock ↔ payment_gateway failures
  if (
    lower.includes("stripe") &&
    flaky.testPattern.includes("payment_gateway")
  )
    return true;

  // volunteer-signup ↔ volunteer-signup e2e
  if (
    lower.includes("volunteer-signup") &&
    flaky.testPattern.includes("volunteer-signup")
  )
    return true;
  if (lower.includes("volunteer") && lower.includes("e2e") && flaky.testPattern.includes("volunteer-signup"))
    return true;

  // receipt dedup ↔ receipt.test.ts
  if (lower.includes("receipt") && flaky.testPattern.includes("receipt"))
    return true;

  return false;
}

function commentMatchesFailure(
  comment: string,
  failure: FailureRecord,
): boolean {
  const lower = comment.toLowerCase();

  if (lower.includes("stripe") && failure.failureMessage.includes("stripe"))
    return true;
  if (
    lower.includes("integration test") &&
    failure.jobName === "integration-tests"
  )
    return true;
  if (lower.includes("e2e") && failure.jobName === "e2e-tests") return true;
  if (
    lower.includes("receipt") &&
    failure.failureMessage.includes("receipt")
  )
    return true;

  return false;
}

function truncate(s: string, maxLen: number): string {
  // Replace newlines for display
  const clean = s.replace(/\\n/g, " ").replace(/\n/g, " ");
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}
