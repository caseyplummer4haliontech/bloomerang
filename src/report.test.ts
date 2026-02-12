import { describe, it, expect, afterAll } from "vitest";
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateReports } from "./index.js";
import { loadRuns, loadWorkflows, loadFeedback } from "./data/loader.js";
import { analyzeHealth } from "./analyzers/health.js";
import { analyzeFailures, classifyFailure } from "./analyzers/failures.js";
import { analyzeFlaky } from "./analyzers/flaky.js";
import { analyzeTimeWasted } from "./analyzers/time-wasted.js";
import { analyzeCIMinutes } from "./analyzers/ci-minutes.js";
import { analyzeFeedback } from "./analyzers/feedback.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const REPORTS_DIR = join(PROJECT_ROOT, "reports");

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
    expect(reports.recommendations).toContain("## Improvement Recommendations");
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
