import { describe, it, expect, afterAll } from "vitest";
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { generateReports } from "./index.js";
import { loadRuns, loadWorkflows, loadFeedback } from "./data/loader.js";
import { analyzeHealth } from "./analyzers/health.js";
import { analyzeFailures, classifyFailure } from "./analyzers/failures.js";
import { analyzeFlaky } from "./analyzers/flaky.js";
import { analyzeTimeWasted } from "./analyzers/time-wasted.js";
import { analyzeCIMinutes } from "./analyzers/ci-minutes.js";
import { analyzeFeedback } from "./analyzers/feedback.js";
import { prioritize, WEIGHT_FREQUENCY, WEIGHT_COST, WEIGHT_BLAST_RADIUS } from "./analyzers/prioritize.js";
import type { Run, FlakyTest, FailureRecord, RepoHealth, FeedbackEntry, TimeWastedSummary } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const REPORTS_DIR = join(tmpdir(), "bloomerang-test-reports");

// ---- Report structure tests ----

describe("CI Health Reports", () => {
  const reports = generateReports();

  // Write files so we can verify disk output
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(join(REPORTS_DIR, "pipeline-health.md"), reports.pipelineHealth, "utf-8");
  writeFileSync(join(REPORTS_DIR, "flaky-tests.md"), reports.flakyTests, "utf-8");
  writeFileSync(join(REPORTS_DIR, "recommendations.md"), reports.recommendations, "utf-8");

  afterAll(() => {
    if (existsSync(REPORTS_DIR)) {
      rmSync(REPORTS_DIR, { recursive: true });
    }
  });

  it("should produce non-empty strings for all 3 reports", () => {
    expect(reports.pipelineHealth.length).toBeGreaterThan(0);
    expect(reports.flakyTests.length).toBeGreaterThan(0);
    expect(reports.recommendations.length).toBeGreaterThan(0);
  });

  it("pipeline-health.md should contain its expected sections", () => {
    expect(reports.pipelineHealth).toContain("# Pipeline Health Summary");
    expect(reports.pipelineHealth).toContain("## Pipeline Health Summary");
    expect(reports.pipelineHealth).toContain("## Failure Analysis");
    expect(reports.pipelineHealth).toContain("## CI Minutes Burned");
  });

  it("flaky-tests.md should contain its expected sections", () => {
    expect(reports.flakyTests).toContain("# Flaky Tests");
    expect(reports.flakyTests).toContain("## Flaky Test Detection");
    expect(reports.flakyTests).toContain("## Time Wasted on Retries");
  });

  it("recommendations.md should contain its expected sections", () => {
    expect(reports.recommendations).toContain("# Recommendations");
    expect(reports.recommendations).toContain("## Prioritized Issues");
    expect(reports.recommendations).toContain("## Developer Feedback Correlation");
  });

  it("should write valid files to disk", () => {
    expect(existsSync(join(REPORTS_DIR, "pipeline-health.md"))).toBe(true);
    expect(existsSync(join(REPORTS_DIR, "flaky-tests.md"))).toBe(true);
    expect(existsSync(join(REPORTS_DIR, "recommendations.md"))).toBe(true);

    const ph = readFileSync(join(REPORTS_DIR, "pipeline-health.md"), "utf-8");
    expect(ph).toBe(reports.pipelineHealth);
  });

  it("each report should include a generated timestamp", () => {
    const tsRegex = /Generated: \d{4}-\d{2}-\d{2}T/;
    expect(reports.pipelineHealth).toMatch(tsRegex);
    expect(reports.flakyTests).toMatch(tsRegex);
    expect(reports.recommendations).toMatch(tsRegex);
  });
});

// ---- Data loader tests ----

describe("Data Loader", () => {
  it("should load runs", () => {
    const { runs } = loadRuns();
    expect(runs.length).toBe(40);
    expect(runs[0].id).toBe("run-001");
  });

  it("should load workflows", () => {
    const { workflows } = loadWorkflows();
    expect(workflows.length).toBe(6);
  });

  it("should load feedback", () => {
    const { feedback } = loadFeedback();
    expect(feedback.length).toBe(6);
  });
});

// ---- Health analyzer tests ----

describe("Health Analyzer", () => {
  const { runs } = loadRuns();
  const { workflows } = loadWorkflows();
  const health = analyzeHealth(runs, workflows);

  it("should produce results for all 6 repos", () => {
    expect(health.length).toBe(6);
  });

  it("should identify giving-api bottleneck as integration-tests", () => {
    const givingApi = health.find((h) => h.repo === "bloomerang/giving-api");
    expect(givingApi).toBeDefined();
    expect(givingApi!.bottleneckJob).toBe("integration-tests");
  });

  it("should identify volunteer-portal bottleneck as e2e-tests", () => {
    const vp = health.find((h) => h.repo === "bloomerang/volunteer-portal");
    expect(vp).toBeDefined();
    expect(vp!.bottleneckJob).toBe("e2e-tests");
  });

  it("should calculate success rates between 0 and 1", () => {
    for (const h of health) {
      expect(h.successRate).toBeGreaterThanOrEqual(0);
      expect(h.successRate).toBeLessThanOrEqual(1);
    }
  });

  it("should have admin-console and notification-service at 100% success", () => {
    const admin = health.find((h) => h.repo === "bloomerang/admin-console");
    const notif = health.find(
      (h) => h.repo === "bloomerang/notification-service",
    );
    expect(admin!.successRate).toBe(1);
    expect(notif!.successRate).toBe(1);
  });
});

// ---- Failure analyzer tests ----

describe("Failure Analyzer", () => {
  const { runs } = loadRuns();
  const failures = analyzeFailures(runs);

  it("should extract all failures from the data", () => {
    expect(failures.length).toBeGreaterThan(0);
  });

  it("should classify stripe-mock errors as ephemeral", () => {
    const stripeFailures = failures.filter((f) =>
      f.failureMessage.includes("stripe-mock"),
    );
    expect(stripeFailures.length).toBeGreaterThanOrEqual(4);
    for (const f of stripeFailures) {
      expect(f.classification).toBe("ephemeral");
    }
  });

  it("should classify TypeScript type errors as hard", () => {
    const tsErrors = failures.filter((f) =>
      f.failureMessage.includes("error TS"),
    );
    expect(tsErrors.length).toBeGreaterThanOrEqual(1);
    for (const f of tsErrors) {
      expect(f.classification).toBe("hard");
    }
  });

  it("should classify timeout-based test failures as ephemeral", () => {
    expect(classifyFailure("Timed out retrying after 10000ms")).toBe(
      "ephemeral",
    );
    expect(classifyFailure("Test timed out after 5000ms")).toBe("ephemeral");
  });

  it("should classify assertion errors without timeout as hard", () => {
    expect(classifyFailure("AssertionError: expected 5 to be 6")).toBe("hard");
  });
});

// ---- Flaky test detection tests ----

describe("Flaky Test Detection", () => {
  const { runs } = loadRuns();
  const failures = analyzeFailures(runs);
  const flakyTests = analyzeFlaky(runs, failures);

  it("should detect the volunteer-signup e2e as flaky", () => {
    const vsFlaky = flakyTests.find((ft) =>
      ft.testPattern.includes("volunteer-signup"),
    );
    expect(vsFlaky).toBeDefined();
    expect(vsFlaky!.failureCount).toBeGreaterThanOrEqual(5);
    expect(vsFlaky!.branches.length).toBeGreaterThanOrEqual(3);
  });

  it("should detect the stripe-mock / payment_gateway as flaky", () => {
    const pgFlaky = flakyTests.find((ft) =>
      ft.testPattern.includes("payment_gateway"),
    );
    expect(pgFlaky).toBeDefined();
    expect(pgFlaky!.failureCount).toBeGreaterThanOrEqual(4);
  });

  it("should rank flaky tests by failure count descending", () => {
    for (let i = 1; i < flakyTests.length; i++) {
      expect(flakyTests[i].failureCount).toBeLessThanOrEqual(
        flakyTests[i - 1].failureCount,
      );
    }
  });

  it("should estimate wasted time > 0 for each flaky test", () => {
    for (const ft of flakyTests) {
      expect(ft.estimatedWasteMin).toBeGreaterThan(0);
    }
  });
});

// ---- Time wasted tests ----

describe("Time Wasted Analyzer", () => {
  const { runs } = loadRuns();
  const tw = analyzeTimeWasted(runs);

  it("should detect retry chains", () => {
    expect(tw.retryChains.length).toBeGreaterThan(0);
  });

  it("should calculate positive waste totals", () => {
    expect(tw.totalWastedMin).toBeGreaterThan(0);
    expect(tw.totalCombinedWasteMin).toBeGreaterThan(tw.totalWastedMin);
  });

  it("should include giving-api in waste by repo", () => {
    expect(tw.wasteByRepo["bloomerang/giving-api"]).toBeGreaterThan(0);
  });
});

// ---- CI minutes tests ----

describe("CI Minutes Analyzer", () => {
  const { runs } = loadRuns();
  const ciMinutes = analyzeCIMinutes(runs);

  it("should produce results for all repos", () => {
    expect(ciMinutes.length).toBe(6);
  });

  it("should have total = successful + wasted for each repo", () => {
    for (const m of ciMinutes) {
      expect(m.totalMinutes).toBeCloseTo(
        m.successfulMinutes + m.wastedMinutes,
        0,
      );
    }
  });

  it("should show giving-api as having wasted minutes", () => {
    const ga = ciMinutes.find((m) => m.repo === "bloomerang/giving-api");
    expect(ga).toBeDefined();
    expect(ga!.wastedMinutes).toBeGreaterThan(0);
  });
});

// ---- Feedback correlation tests ----

describe("Feedback Correlation", () => {
  const { runs } = loadRuns();
  const { feedback } = loadFeedback();
  const failures = analyzeFailures(runs);
  const flakyTests = analyzeFlaky(runs, failures);
  const correlations = analyzeFeedback(feedback, failures, flakyTests);

  it("should produce a correlation for each feedback entry", () => {
    expect(correlations.length).toBe(feedback.length);
  });

  it("should match schen's stripe-mock complaint to data", () => {
    const schen = correlations.find((c) => c.author === "schen");
    expect(schen).toBeDefined();
    expect(schen!.evidence.length).toBeGreaterThan(0);
    expect(schen!.evidence.some((e) => e.includes("payment_gateway") || e.includes("stripe"))).toBe(true);
  });

  it("should match klee's volunteer-signup complaint to data", () => {
    const klee = correlations.find(
      (c) => c.author === "klee" && c.comment.includes("volunteer-signup"),
    );
    expect(klee).toBeDefined();
    expect(klee!.evidence.length).toBeGreaterThan(0);
    expect(klee!.evidence.some((e) => e.includes("volunteer-signup"))).toBe(
      true,
    );
  });
});

// ---- Prioritization tests ----

describe("Prioritization Analyzer", () => {
  const { runs } = loadRuns();
  const { workflows } = loadWorkflows();
  const { feedback } = loadFeedback();
  const health = analyzeHealth(runs, workflows);
  const failures = analyzeFailures(runs);
  const flakyTests = analyzeFlaky(runs, failures);
  const timeWasted = analyzeTimeWasted(runs);
  const issues = prioritize(flakyTests, failures, health, timeWasted, runs, feedback);

  it("should produce at least one issue", () => {
    expect(issues.length).toBeGreaterThan(0);
  });

  it("should normalize scores between 0 and 1", () => {
    for (const issue of issues) {
      expect(issue.frequencyScore).toBeGreaterThanOrEqual(0);
      expect(issue.frequencyScore).toBeLessThanOrEqual(1);
      expect(issue.costScore).toBeGreaterThanOrEqual(0);
      expect(issue.costScore).toBeLessThanOrEqual(1);
      expect(issue.blastRadiusScore).toBeGreaterThanOrEqual(0);
      expect(issue.blastRadiusScore).toBeLessThanOrEqual(1);
    }
  });

  it("should sort issues by priority score descending", () => {
    for (let i = 1; i < issues.length; i++) {
      expect(issues[i].priorityScore).toBeLessThanOrEqual(
        issues[i - 1].priorityScore,
      );
    }
  });

  it("should compute composite score from weighted dimensions", () => {
    for (const issue of issues) {
      const expected =
        WEIGHT_FREQUENCY * issue.frequencyScore +
        WEIGHT_COST * issue.costScore +
        WEIGHT_BLAST_RADIUS * issue.blastRadiusScore;
      expect(issue.priorityScore).toBeCloseTo(expected, 1);
    }
  });

  it("should flag hard failures as pipeline working as intended", () => {
    const hardIssues = issues.filter((i) => i.category === "hard-failure");
    for (const issue of hardIssues) {
      expect(issue.flag).toContain("Pipeline working as intended");
      expect(issue.costScore).toBe(0);
    }
  });

  it("should include flaky-test, slow-pipeline, and hard-failure categories", () => {
    const categories = new Set(issues.map((i) => i.category));
    expect(categories.has("flaky-test")).toBe(true);
    expect(categories.has("slow-pipeline")).toBe(true);
    expect(categories.has("hard-failure")).toBe(true);
  });

  it("should rank flaky tests above hard failures", () => {
    const topFlaky = issues.find((i) => i.category === "flaky-test");
    const topHard = issues.find((i) => i.category === "hard-failure");
    if (topFlaky && topHard) {
      expect(topFlaky.priorityScore).toBeGreaterThan(topHard.priorityScore);
    }
  });
});

// ---- Edge-case & branch-coverage tests ----

describe("Failure Classifier — all ephemeral patterns", () => {
  it("should classify TimeoutError as ephemeral", () => {
    expect(classifyFailure("TimeoutError: navigation timeout")).toBe("ephemeral");
  });

  it("should classify Retries exhausted as ephemeral", () => {
    expect(classifyFailure("Retries exhausted after 3 attempts")).toBe("ephemeral");
  });

  it("should classify ECONNREFUSED as ephemeral", () => {
    expect(classifyFailure("connect ECONNREFUSED 127.0.0.1:5432")).toBe("ephemeral");
  });

  it("should classify Connection refused as ephemeral", () => {
    expect(classifyFailure("Connection refused: localhost:3000")).toBe("ephemeral");
  });
});

describe("Flaky Analyzer — edge cases", () => {
  it("should return empty array when no failures are provided", () => {
    const { runs } = loadRuns();
    const result = analyzeFlaky(runs, []);
    expect(result).toEqual([]);
  });

  it("should not flag a failure that only appears on one branch by one actor", () => {
    const { runs } = loadRuns();
    const singleFailure: FailureRecord[] = [
      {
        runId: "run-001",
        repo: "bloomerang/test-repo",
        branch: "main",
        actor: "dev1",
        jobName: "unit-tests",
        failureMessage: "FAIL some/test.ts > some test",
        classification: "ephemeral",
        durationSec: 60,
      },
    ];
    const result = analyzeFlaky(runs, singleFailure);
    expect(result).toEqual([]);
  });

  it("should handle Python-style FAILED messages for test file extraction", () => {
    const { runs } = loadRuns();
    const pythonFailures: FailureRecord[] = [
      {
        runId: "run-001", repo: "bloomerang/event-processor", branch: "main", actor: "dev1",
        jobName: "integration-tests", failureMessage: "FAILED tests/test_app.py::test_main", classification: "ephemeral", durationSec: 30,
      },
      {
        runId: "run-002", repo: "bloomerang/event-processor", branch: "feat/x", actor: "dev2",
        jobName: "integration-tests", failureMessage: "FAILED tests/test_app.py::test_other", classification: "ephemeral", durationSec: 30,
      },
    ];
    const result = analyzeFlaky(runs, pythonFailures);
    expect(result.length).toBe(1);
    expect(result[0].testPattern).toBe("tests/test_app.py");
  });

  it("should handle messages without FAIL/FAILED prefix", () => {
    const { runs } = loadRuns();
    const oddFailures: FailureRecord[] = [
      {
        runId: "run-001", repo: "bloomerang/test-repo", branch: "main", actor: "dev1",
        jobName: "build", failureMessage: "Some unknown error format that is not the typical FAIL prefix at all",
        classification: "ephemeral", durationSec: 10,
      },
      {
        runId: "run-002", repo: "bloomerang/test-repo", branch: "feat/x", actor: "dev2",
        jobName: "build", failureMessage: "Some unknown error format that is not the typical FAIL prefix at all",
        classification: "ephemeral", durationSec: 10,
      },
    ];
    const result = analyzeFlaky(runs, oddFailures);
    expect(result.length).toBe(1);
    // Falls back to message.slice(0, 60)
    expect(result[0].testPattern.length).toBeLessThanOrEqual(60);
  });

  it("should produce detail with no retries when none found", () => {
    const minimalRuns: Run[] = [
      { id: "r1", repo: "x/y", branch: "a", trigger: "push", actor: "u1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "t", status: "failure", duration_sec: 10, failure_message: "FAIL f.ts > Timed out retrying after 5000ms" }] },
      { id: "r2", repo: "x/y", branch: "b", trigger: "push", actor: "u2", started_at: "2026-01-02T00:00:00Z", jobs: [{ name: "t", status: "failure", duration_sec: 10, failure_message: "FAIL f.ts > Timed out retrying after 5000ms" }] },
    ];
    const failures = analyzeFailures(minimalRuns);
    const flaky = analyzeFlaky(minimalRuns, failures);
    expect(flaky.length).toBe(1);
    expect(flaky[0].retriedRunIds).toEqual([]);
  });
});

describe("Health Analyzer — edge cases", () => {
  it("should handle empty runs for a repo gracefully", () => {
    const { workflows } = loadWorkflows();
    const result = analyzeHealth([], workflows);
    expect(result).toEqual([]);
  });

  it("should handle runs with no job durations", () => {
    const { workflows } = loadWorkflows();
    const runs: Run[] = [
      { id: "r1", repo: "bloomerang/giving-api", branch: "main", trigger: "push", actor: "dev1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "build", status: "success" }] },
    ];
    const result = analyzeHealth(runs, workflows);
    expect(result.length).toBe(1);
    expect(result[0].avgDurationSec).toBe(0);
    expect(result[0].minDurationSec).toBe(0);
    expect(result[0].maxDurationSec).toBe(0);
  });
});

describe("CI Minutes — edge cases", () => {
  it("should return 0% wasted for repos with no failures", () => {
    const runs: Run[] = [
      { id: "r1", repo: "x/y", branch: "main", trigger: "push", actor: "dev1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "build", status: "success", duration_sec: 120 }] },
    ];
    const result = analyzeCIMinutes(runs);
    expect(result.length).toBe(1);
    expect(result[0].wastedMinutes).toBe(0);
    expect(result[0].wastedPercent).toBe(0);
  });
});

describe("Feedback Correlation — edge cases", () => {
  it("should produce 'no direct match' evidence for unrelated feedback", () => {
    const feedback: FeedbackEntry[] = [
      { author: "testuser", team: "Test", comment: "Everything works great, no complaints." },
    ];
    const correlations = analyzeFeedback(feedback, [], []);
    expect(correlations.length).toBe(1);
    expect(correlations[0].evidence[0]).toContain("No direct match");
  });

  it("should match receipt-related feedback to receipt flaky test", () => {
    const feedback: FeedbackEntry[] = [
      { author: "testuser", team: "CRM", comment: "The receipt test keeps failing" },
    ];
    const flakyTests: FlakyTest[] = [
      { testPattern: "src/services/receipt.test.ts", repo: "bloomerang/donor-crm", jobName: "unit-tests", failureCount: 2, branches: ["a", "b"], actors: ["u1", "u2"], failedRunIds: ["r1", "r2"], retriedRunIds: [], estimatedWasteMin: 30 },
    ];
    const correlations = analyzeFeedback(feedback, [], flakyTests);
    expect(correlations[0].evidence.some((e) => e.includes("receipt"))).toBe(true);
  });
});

describe("Prioritize — edge cases", () => {
  it("should return empty array when given no data", () => {
    const result = prioritize([], [], [], { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, [], []);
    expect(result).toEqual([]);
  });

  it("should skip slow-pipeline issues for repos with fast bottlenecks (< 2 min)", () => {
    const health: RepoHealth[] = [
      { repo: "x/fast", totalRuns: 5, successCount: 5, failureCount: 0, successRate: 1, avgDurationSec: 60, minDurationSec: 50, maxDurationSec: 70, bottleneckJob: "lint", bottleneckAvgSec: 30 },
    ];
    const runs: Run[] = [
      { id: "r1", repo: "x/fast", branch: "main", trigger: "push", actor: "dev1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "lint", status: "success", duration_sec: 30 }] },
    ];
    const result = prioritize([], [], health, { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, runs, []);
    expect(result.filter((i) => i.category === "slow-pipeline")).toEqual([]);
  });

  it("should not add workflow issue when no matching feedback exists", () => {
    const health: RepoHealth[] = [
      { repo: "bloomerang/volunteer-portal", totalRuns: 5, successCount: 5, failureCount: 0, successRate: 1, avgDurationSec: 300, minDurationSec: 250, maxDurationSec: 350, bottleneckJob: "e2e-tests", bottleneckAvgSec: 200 },
    ];
    const runs: Run[] = [
      { id: "r1", repo: "bloomerang/volunteer-portal", branch: "main", trigger: "push", actor: "dev1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "e2e-tests", status: "success", duration_sec: 200 }] },
    ];
    const feedback: FeedbackEntry[] = [
      { author: "someone", team: "Platform", comment: "CI is great, no complaints" },
    ];
    const result = prioritize([], [], health, { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, runs, feedback);
    expect(result.filter((i) => i.category === "workflow")).toEqual([]);
  });

  it("should use fallback e2e duration when bottleneck is not e2e-tests", () => {
    const health: RepoHealth[] = [
      { repo: "bloomerang/volunteer-portal", totalRuns: 3, successCount: 3, failureCount: 0, successRate: 1, avgDurationSec: 300, minDurationSec: 250, maxDurationSec: 350, bottleneckJob: "build", bottleneckAvgSec: 200 },
    ];
    const runs: Run[] = [
      { id: "r1", repo: "bloomerang/volunteer-portal", branch: "main", trigger: "push", actor: "dev1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "build", status: "success", duration_sec: 200 }] },
    ];
    const feedback: FeedbackEntry[] = [
      { author: "tpatel", team: "Volunteer", comment: "I don't understand why we run the full e2e suite on every PR." },
    ];
    const result = prioritize([], [], health, { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, runs, feedback);
    const workflow = result.find((i) => i.category === "workflow");
    expect(workflow).toBeDefined();
    // Fallback = 180s / 60 * 3 runs = 9 min
    expect(workflow!.costRaw).toBe(9);
  });

  it("should skip workflow issue when feedback matches but volunteer-portal not in health", () => {
    const health: RepoHealth[] = [
      { repo: "bloomerang/giving-api", totalRuns: 5, successCount: 5, failureCount: 0, successRate: 1, avgDurationSec: 300, minDurationSec: 250, maxDurationSec: 350, bottleneckJob: "integration-tests", bottleneckAvgSec: 500 },
    ];
    const runs: Run[] = [
      { id: "r1", repo: "bloomerang/giving-api", branch: "main", trigger: "push", actor: "dev1", started_at: "2026-01-01T00:00:00Z", jobs: [{ name: "integration-tests", status: "success", duration_sec: 500 }] },
    ];
    const feedback: FeedbackEntry[] = [
      { author: "tpatel", team: "Volunteer", comment: "I don't understand why we run the full e2e suite on every PR." },
    ];
    const result = prioritize([], [], health, { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, runs, feedback);
    // Workflow issue should not be added since volunteer-portal is not in health data
    expect(result.filter((i) => i.category === "workflow")).toEqual([]);
  });

  it("should handle flaky test detail with successful retries", () => {
    const flakyTests: FlakyTest[] = [
      { testPattern: "test/a.ts", repo: "x/y", jobName: "tests", failureCount: 3, branches: ["main", "dev"], actors: ["u1", "u2"], failedRunIds: ["r1", "r2", "r3"], retriedRunIds: ["r4", "r5"], estimatedWasteMin: 60 },
    ];
    const result = prioritize(flakyTests, [], [], { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, [], []);
    expect(result.length).toBe(1);
    expect(result[0].detail).toContain("Successful retries: r4, r5");
  });

  it("should handle flaky test detail without successful retries", () => {
    const flakyTests: FlakyTest[] = [
      { testPattern: "test/a.ts", repo: "x/y", jobName: "tests", failureCount: 2, branches: ["main", "dev"], actors: ["u1", "u2"], failedRunIds: ["r1", "r2"], retriedRunIds: [], estimatedWasteMin: 30 },
    ];
    const result = prioritize(flakyTests, [], [], { retryChains: [], totalWastedMin: 0, totalContextSwitchMin: 0, totalCombinedWasteMin: 0, wasteByRepo: {} }, [], []);
    expect(result.length).toBe(1);
    expect(result[0].detail).not.toContain("Successful retries");
  });
});
