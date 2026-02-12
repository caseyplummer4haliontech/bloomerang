# Prioritization Milestone

## Goal

Replace the hand-crafted recommendations section with a data-driven, scored prioritization of CI issues for the Platform/DevEx team. Each issue is scored across three dimensions — frequency, cost, and blast radius — with tunable weights exposed as named constants.

## Architecture

### New Analyzer: `src/analyzers/prioritize.ts`

Consumes outputs from existing analyzers and produces a `PrioritizedIssue[]` ranked by composite score.

### Tunable Constants

```typescript
export const WEIGHT_FREQUENCY    = 0.35;
export const WEIGHT_COST         = 0.40;
export const WEIGHT_BLAST_RADIUS = 0.25;
export const CONTEXT_SWITCH_PENALTY_MIN = 15;
```

All weights and penalties are named constants at the top of the file — easy to adjust without touching logic.

## Issue Discovery

The prioritizer collects issues from prior analyzer outputs:

| Source | Issue Category | Example |
|--------|---------------|---------|
| `FlakyTest[]` | `flaky-test` | volunteer-signup e2e, payment_gateway |
| `RepoHealth` + `TimeWastedSummary` | `slow-pipeline` | giving-api integration tests (~8 min) |
| Feedback + workflow analysis | `workflow` | Full e2e on every PR for volunteer-portal |
| `FailureRecord[]` (hard only) | `hard-failure` | event-processor assertion — flagged "working as designed" |

## Scoring Dimensions

| Dimension | What It Measures | Normalization |
|-----------|-----------------|---------------|
| **Frequency** | Occurrence count (failure count for flaky tests, run count for slow pipelines) | `value / max(values)` → 0–1 |
| **Cost** | CI minutes wasted + developer context-switch penalty (15 min per occurrence) | `value / max(values)` → 0–1 |
| **Blast Radius** | Unique developers (actors) affected | `value / max(values)` → 0–1 |

**Composite**: `WEIGHT_FREQUENCY × freq + WEIGHT_COST × cost + WEIGHT_BLAST_RADIUS × blast`

Hard failures receive a `0` cost score and a flag: _"Pipeline working as intended — ownership: dev team"_.

## New Type

```typescript
export interface PrioritizedIssue {
  title: string;
  repo: string;
  category: "flaky-test" | "slow-pipeline" | "workflow" | "hard-failure";
  frequencyRaw: number;
  costRaw: number;
  blastRadiusRaw: number;
  frequencyScore: number;
  costScore: number;
  blastRadiusScore: number;
  priorityScore: number;
  detail: string;
  flag?: string;
}
```

## Recommendations Report Changes

The current `renderRecommendations()` with hand-crafted `if` checks for specific test names is **replaced** by:

1. **Priority Score Table** — all issues ranked by composite score, showing all 3 dimension scores
2. **Per-issue narrative** — auto-generated from issue data using category-specific templates

The Feedback Correlation section remains unchanged.

## Shared Constants

The `CONTEXT_SWITCH_PENALTY_MIN = 15` constant is extracted to `src/constants.ts` as a single source of truth. Both `prioritize.ts` and `time-wasted.ts` import from there.

## Test Plan

- Unit tests for `prioritize.ts`: normalization, weighting, hard-failure flagging, ordering
- Verify changing a weight constant changes the output ranking
- Existing analyzer tests remain unchanged
- Report structure tests updated for new recommendations format

## Files Touched

| File | Change |
|------|--------|
| `src/types.ts` | Add `PrioritizedIssue` interface |
| `src/constants.ts` | **New** — shared constants (context-switch penalty) |
| `src/analyzers/prioritize.ts` | **New** — scoring logic + weight constants |
| `src/analyzers/time-wasted.ts` | Import `CONTEXT_SWITCH_PENALTY_MIN` from constants |
| `src/analyzers/flaky.ts` | Import `CONTEXT_SWITCH_PENALTY_MIN` from constants |
| `src/index.ts` | Call `prioritize()`, replace `renderRecommendations()` |
| `src/report.test.ts` | Add prioritization tests, update recommendation tests |
