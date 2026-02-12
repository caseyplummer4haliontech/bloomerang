import type { Run, RetryChain, TimeWastedSummary } from "../types.js";
import { CONTEXT_SWITCH_PENALTY_MIN } from "../constants.js";

/**
 * Detect retry chains and calculate time wasted.
 *
 * A retry chain is a sequence of runs on the same repo + branch + actor,
 * ordered by time, where at least one run failed before a success.
 */
export function analyzeTimeWasted(runs: Run[]): TimeWastedSummary {
  const chains = detectRetryChains(runs);

  let totalWastedSec = 0;
  let totalRetries = 0;
  const wasteByRepo: Record<string, number> = {};

  for (const chain of chains) {
    totalWastedSec += chain.wastedDurationSec;
    totalRetries += chain.retryCount;
    wasteByRepo[chain.repo] =
      (wasteByRepo[chain.repo] ?? 0) + chain.wastedDurationSec / 60;
  }

  // Round repo waste values
  for (const repo of Object.keys(wasteByRepo)) {
    wasteByRepo[repo] = Math.round(wasteByRepo[repo] * 10) / 10;
  }

  const totalWastedMin = Math.round((totalWastedSec / 60) * 10) / 10;
  const totalContextSwitchMin = totalRetries * CONTEXT_SWITCH_PENALTY_MIN;

  return {
    retryChains: chains,
    totalWastedMin,
    totalContextSwitchMin,
    totalCombinedWasteMin: totalWastedMin + totalContextSwitchMin,
    wasteByRepo,
  };
}

function detectRetryChains(runs: Run[]): RetryChain[] {
  // Group runs by repo + branch + actor
  const groups = new Map<string, Run[]>();
  for (const run of runs) {
    const key = `${run.repo}::${run.branch}::${run.actor}`;
    const existing = groups.get(key) ?? [];
    existing.push(run);
    groups.set(key, existing);
  }

  const chains: RetryChain[] = [];

  for (const [, groupRuns] of groups) {
    if (groupRuns.length < 2) continue;

    // Sort by start time
    const sorted = [...groupRuns].sort(
      (a, b) =>
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
    );

    // Check if any run in the group failed
    const failedRuns = sorted.filter((r) =>
      r.jobs.some((j) => j.status === "failure"),
    );

    if (failedRuns.length === 0) continue;

    // Calculate wasted duration: sum of all job durations in failed runs
    const wastedDurationSec = failedRuns.reduce(
      (sum, r) =>
        sum + r.jobs.reduce((jSum, j) => jSum + (j.duration_sec ?? 0), 0),
      0,
    );

    chains.push({
      repo: sorted[0].repo,
      branch: sorted[0].branch,
      actor: sorted[0].actor,
      runIds: sorted.map((r) => r.id),
      failedRunIds: failedRuns.map((r) => r.id),
      wastedDurationSec,
      retryCount: failedRuns.length,
    });
  }

  // Sort by wasted time descending
  chains.sort((a, b) => b.wastedDurationSec - a.wastedDurationSec);
  return chains;
}
