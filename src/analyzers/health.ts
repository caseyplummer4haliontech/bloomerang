import type { Run, Workflow, RepoHealth } from "../types.js";

/**
 * Compute health metrics for each repository.
 *
 * A run is "successful" if every non-skipped job has status "success".
 * Duration of a run = sum of all non-skipped job durations.
 */
export function analyzeHealth(
  runs: Run[],
  workflows: Workflow[],
): RepoHealth[] {
  const byRepo = groupByRepo(runs);
  const workflowMap = new Map(workflows.map((w) => [w.repo, w]));

  return Object.entries(byRepo).map(([repo, repoRuns]) => {
    const durations = repoRuns.map(runDuration);
    const successCount = repoRuns.filter(isRunSuccessful).length;
    const failureCount = repoRuns.length - successCount;

    // Bottleneck: job with the highest average duration across runs
    const jobDurations = new Map<string, number[]>();
    for (const run of repoRuns) {
      for (const job of run.jobs) {
        if (job.status !== "skipped" && job.duration_sec != null) {
          const existing = jobDurations.get(job.name) ?? [];
          existing.push(job.duration_sec);
          jobDurations.set(job.name, existing);
        }
      }
    }

    let bottleneckJob = "N/A";
    let bottleneckAvgSec = 0;
    for (const [name, durs] of jobDurations) {
      const avg = durs.reduce((a, b) => a + b, 0) / durs.length;
      if (avg > bottleneckAvgSec) {
        bottleneckAvgSec = avg;
        bottleneckJob = name;
      }
    }

    return {
      repo,
      totalRuns: repoRuns.length,
      successCount,
      failureCount,
      successRate: repoRuns.length > 0 ? successCount / repoRuns.length : 0,
      avgDurationSec:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
      minDurationSec: durations.length > 0 ? Math.min(...durations) : 0,
      maxDurationSec: durations.length > 0 ? Math.max(...durations) : 0,
      bottleneckJob,
      bottleneckAvgSec: Math.round(bottleneckAvgSec),
    };
  });
}

function groupByRepo(runs: Run[]): Record<string, Run[]> {
  const groups: Record<string, Run[]> = {};
  for (const run of runs) {
    (groups[run.repo] ??= []).push(run);
  }
  return groups;
}

function runDuration(run: Run): number {
  return run.jobs.reduce((sum, j) => sum + (j.duration_sec ?? 0), 0);
}

function isRunSuccessful(run: Run): boolean {
  return run.jobs.every(
    (j) => j.status === "success" || j.status === "skipped",
  );
}
