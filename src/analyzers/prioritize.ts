import type {
  FlakyTest,
  FailureRecord,
  RepoHealth,
  TimeWastedSummary,
  FeedbackEntry,
  Run,
  PrioritizedIssue,
} from "../types.js";
import { CONTEXT_SWITCH_PENALTY_MIN } from "../constants.js";

// ---- Tunable weights (edit these to adjust prioritization) ----

/** How heavily occurrence frequency influences priority. */
export const WEIGHT_FREQUENCY = 0.35;

/** How heavily total cost (CI minutes + context-switch) influences priority. */
export const WEIGHT_COST = 0.40;

/** How heavily the number of affected developers influences priority. */
export const WEIGHT_BLAST_RADIUS = 0.25;

// ---- Public API ----

/**
 * Build a scored, ranked list of CI issues for the Platform/DevEx team.
 *
 * Each issue gets three normalized (0–1) dimension scores and a weighted
 * composite priority score. Issues are returned sorted by priority descending.
 */
export function prioritize(
  flakyTests: FlakyTest[],
  failures: FailureRecord[],
  health: RepoHealth[],
  timeWasted: TimeWastedSummary,
  runs: Run[],
  feedback: FeedbackEntry[],
): PrioritizedIssue[] {
  const issues: PrioritizedIssue[] = [];

  // ---- Flaky tests ----
  for (const ft of flakyTests) {
    const costMin = ft.estimatedWasteMin; // already includes context-switch
    issues.push({
      title: `Flaky test: ${ft.testPattern}`,
      repo: ft.repo,
      category: "flaky-test",
      frequencyRaw: ft.failureCount,
      costRaw: costMin,
      blastRadiusRaw: ft.actors.length,
      frequencyScore: 0,
      costScore: 0,
      blastRadiusScore: 0,
      priorityScore: 0,
      detail: buildFlakyDetail(ft),
    });
  }

  // ---- Slow pipelines (bottleneck jobs) ----
  for (const h of health) {
    if (h.bottleneckAvgSec < 120) continue; // only flag ≥ 2 min bottlenecks
    const uniqueActors = new Set(
      runs.filter((r) => r.repo === h.repo).map((r) => r.actor),
    );
    // Cost = every run sits through the slow job; approximate context-switch
    // for runs that exceed a reasonable wait (say > 5 min)
    const runsOverThreshold = runs
      .filter((r) => r.repo === h.repo)
      .filter(
        (r) => r.jobs.reduce((s, j) => s + (j.duration_sec ?? 0), 0) > 300,
      );
    const costMin =
      (h.bottleneckAvgSec / 60) * h.totalRuns +
      runsOverThreshold.length * CONTEXT_SWITCH_PENALTY_MIN;

    issues.push({
      title: `Slow pipeline: ${shortRepo(h.repo)} / ${h.bottleneckJob}`,
      repo: h.repo,
      category: "slow-pipeline",
      frequencyRaw: h.totalRuns,
      costRaw: Math.round(costMin * 10) / 10,
      blastRadiusRaw: uniqueActors.size,
      frequencyScore: 0,
      costScore: 0,
      blastRadiusScore: 0,
      priorityScore: 0,
      detail: buildSlowPipelineDetail(h),
    });
  }

  // ---- Workflow issues (from feedback patterns) ----
  // Detect "runs full suite unnecessarily" from feedback
  const fullSuiteFeedback = feedback.filter((f) =>
    /full (e2e|test) suite|every PR/i.test(f.comment),
  );
  if (fullSuiteFeedback.length > 0) {
    // Find the repo this relates to (volunteer-portal from the comment)
    const vpHealth = health.find((h) =>
      h.repo.includes("volunteer-portal"),
    );
    if (vpHealth) {
      const vpActors = new Set(
        runs.filter((r) => r.repo === vpHealth.repo).map((r) => r.actor),
      );
      // Approximate cost: each run pays for the e2e suite that may be skippable
      const e2eDurationSec =
        vpHealth.bottleneckJob === "e2e-tests" ? vpHealth.bottleneckAvgSec : 180;
      const costMin = (e2eDurationSec / 60) * vpHealth.totalRuns;

      issues.push({
        title: "Workflow: unnecessary e2e runs on volunteer-portal",
        repo: vpHealth.repo,
        category: "workflow",
        frequencyRaw: vpHealth.totalRuns,
        costRaw: Math.round(costMin * 10) / 10,
        blastRadiusRaw: vpActors.size,
        frequencyScore: 0,
        costScore: 0,
        blastRadiusScore: 0,
        priorityScore: 0,
        detail:
          `Developer feedback indicates the full e2e suite runs on every PR, even for CSS-only changes. ` +
          `Use path filters in the GitHub Actions workflow to skip e2e when only style files changed. ` +
          `Run full e2e on merge to main.`,
      });
    }
  }

  // ---- Hard failures (flagged as "working as designed") ----
  const hardFailures = failures.filter((f) => f.classification === "hard");
  // Group hard failures by repo + jobName + failure pattern
  const hardGroups = new Map<string, FailureRecord[]>();
  for (const f of hardFailures) {
    const key = `${f.repo}::${f.jobName}`;
    const existing = hardGroups.get(key) ?? [];
    existing.push(f);
    hardGroups.set(key, existing);
  }
  for (const [, records] of hardGroups) {
    const actors = [...new Set(records.map((r) => r.actor))];
    issues.push({
      title: `Hard failure: ${shortRepo(records[0].repo)} / ${records[0].jobName}`,
      repo: records[0].repo,
      category: "hard-failure",
      frequencyRaw: records.length,
      costRaw: 0, // pipeline working as intended — no platform cost
      blastRadiusRaw: actors.length,
      frequencyScore: 0,
      costScore: 0,
      blastRadiusScore: 0,
      priorityScore: 0,
      detail: records
        .map((r) => `${r.runId}: ${truncate(r.failureMessage, 80)}`)
        .join("\n"),
      flag: "Pipeline working as intended — ownership: dev team",
    });
  }

  // ---- Normalize and score ----
  normalize(issues);

  // Sort by priority descending
  issues.sort((a, b) => b.priorityScore - a.priorityScore);
  return issues;
}

// ---- Normalization ----

function normalize(issues: PrioritizedIssue[]): void {
  if (issues.length === 0) return;

  const maxFreq = Math.max(...issues.map((i) => i.frequencyRaw), 1);
  const maxCost = Math.max(...issues.map((i) => i.costRaw), 1);
  const maxBlast = Math.max(...issues.map((i) => i.blastRadiusRaw), 1);

  for (const issue of issues) {
    issue.frequencyScore = round2(issue.frequencyRaw / maxFreq);
    issue.costScore = round2(issue.costRaw / maxCost);
    issue.blastRadiusScore = round2(issue.blastRadiusRaw / maxBlast);
    issue.priorityScore = round2(
      WEIGHT_FREQUENCY * issue.frequencyScore +
        WEIGHT_COST * issue.costScore +
        WEIGHT_BLAST_RADIUS * issue.blastRadiusScore,
    );
  }
}

// ---- Detail builders ----

function buildFlakyDetail(ft: FlakyTest): string {
  const lines = [
    `${ft.failureCount} failures across ${ft.branches.length} branches and ${ft.actors.length} authors — not caused by code changes.`,
    `Job: ${ft.jobName}. Affected branches: ${ft.branches.join(", ")}.`,
    `Estimated waste: ~${ft.estimatedWasteMin} min (CI time + developer context-switch).`,
  ];
  if (ft.retriedRunIds.length > 0) {
    lines.push(`Successful retries: ${ft.retriedRunIds.join(", ")}.`);
  }
  return lines.join("\n");
}

function buildSlowPipelineDetail(h: RepoHealth): string {
  return (
    `Bottleneck job "${h.bottleneckJob}" averages ${fmtDuration(h.bottleneckAvgSec)}. ` +
    `Developers context-switch during this wait, reducing productivity. ` +
    `Consider profiling the test suite, parallelizing tests, or splitting into fast/slow tiers.`
  );
}

// ---- Helpers ----

function shortRepo(repo: string): string {
  return repo.replace("bloomerang/", "");
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`;
  const min = Math.floor(sec / 60);
  const remSec = Math.round(sec % 60);
  return remSec > 0 ? `${min}m ${remSec}s` : `${min}m`;
}

function truncate(s: string, maxLen: number): string {
  const clean = s.replace(/\\n/g, " ").replace(/\n/g, " ");
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
