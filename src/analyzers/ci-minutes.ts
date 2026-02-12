import type { Run, RepoMinutes } from "../types.js";

/**
 * Calculate total CI minutes consumed per repo, broken out by
 * successful vs. wasted (runs that contained a failure).
 */
export function analyzeCIMinutes(runs: Run[]): RepoMinutes[] {
  const byRepo = new Map<
    string,
    { total: number; successful: number; wasted: number }
  >();

  for (const run of runs) {
    const durationSec = run.jobs.reduce(
      (sum, j) => sum + (j.duration_sec ?? 0),
      0,
    );
    const durationMin = durationSec / 60;

    const existing = byRepo.get(run.repo) ?? {
      total: 0,
      successful: 0,
      wasted: 0,
    };

    existing.total += durationMin;

    const hasFailed = run.jobs.some((j) => j.status === "failure");
    if (hasFailed) {
      existing.wasted += durationMin;
    } else {
      existing.successful += durationMin;
    }

    byRepo.set(run.repo, existing);
  }

  const results: RepoMinutes[] = [];

  for (const [repo, data] of byRepo) {
    results.push({
      repo,
      totalMinutes: round1(data.total),
      successfulMinutes: round1(data.successful),
      wastedMinutes: round1(data.wasted),
      wastedPercent:
        data.total > 0 ? round1((data.wasted / data.total) * 100) : 0,
    });
  }

  // Sort by wasted minutes descending
  results.sort((a, b) => b.wastedMinutes - a.wastedMinutes);
  return results;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
