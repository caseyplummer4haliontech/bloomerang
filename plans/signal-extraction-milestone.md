# Plan: Signal Extraction Milestone

## Goal

Replace placeholder report sections with real analysis of CI run data, producing actionable insights backed by evidence.

## Architecture

`src/analyzers/` — one module per concern. Each exports a pure function that takes typed data and returns structured results. `src/index.ts` orchestrates them and renders the final markdown report.

## Modules

| Module | File | Input | Output |
|---|---|---|---|
| Per-repo health | `analyzers/health.ts` | runs, workflows | Success rate, avg/min/max duration, bottleneck job per repo |
| Failure extraction & classification | `analyzers/failures.ts` | runs | Every failure with job, message, classification (hard vs ephemeral), repo, branch, actor |
| Flaky test detection | `analyzers/flaky.ts` | runs | Tests that fail intermittently — same test across branches/authors, pass on retry. Ranked by frequency |
| Time wasted | `analyzers/time-wasted.ts` | runs, flaky results | Retry chains, minutes wasted per flaky test, per repo, total. Context-switch padding |
| CI minutes burned | `analyzers/ci-minutes.ts` | runs | Total job minutes per repo, successful vs. wasted (failed runs that were retried) |
| Feedback correlation | `analyzers/feedback.ts` | feedback, failure/flaky results | Each survey comment matched to supporting data evidence |

## Supporting Files

- `src/types.ts` — shared TypeScript interfaces (Run, Job, Workflow, Feedback, analysis result types)
- `src/data/loader.ts` — reads and parses the three JSON files from `src/data/`
- `src/report.test.ts` — updated tests validating real report content

## Failure Classification Logic

- **Ephemeral** — keywords: `Connection refused`, `Timed out retrying`, `TimeoutError`, `Retries exhausted`, `timed out after`
- **Hard** — type errors (`error TS`), real assertion failures not matching known flaky patterns, resource issues (`Too many open files`)

## Key Data Patterns to Detect

1. **stripe-mock flakiness** (giving-api) — `Connection refused: stripe-mock:12111` — runs 004, 005, 017, 024, 030, 031 (6 failures across 3 branches, 3 actors)
2. **volunteer-signup e2e flakiness** (volunteer-portal) — `step-3-submit` timeout — runs 007, 009, 010, 021, 028, 036, 037 (7 failures across 4 branches, 3 actors)  
3. **receipt dedup flakiness** (donor-crm) — `receipt.test.ts` timeout — runs 002, 034 (2 failures across 2 branches, 2 actors)
4. **Hard errors** — run-019 (TS type error), run-023 (deps upgrade breaking types), run-014 (resource leak / too many open files)

## Flaky Detection Algorithm

A failure is flaky when:
1. Same test file + same error pattern appears across **different branches or authors**
2. A subsequent run on the **same branch by same actor** succeeds (pass on retry)
3. The failure message matches ephemeral classification keywords

## Time Wasted Calculation

```
retry_chain = consecutive runs on same branch by same actor
wasted_minutes = sum of all job durations in failed runs within a retry chain
context_switch_penalty = 15 min per retry (conservative estimate)
total_waste = wasted_minutes + (retry_count × context_switch_penalty)
```

## Report Structure

Output is split into 3 markdown files in `reports/` at the project root (gitignored):

### `reports/pipeline-health.md`
- Pipeline Health Summary (table: repo, runs, success rate, avg/min/max duration, bottleneck job)
- Failure Analysis (table of all failures with classification)
- CI Minutes Burned (table: repo, total minutes, successful, wasted, % wasted)

### `reports/flaky-tests.md`
- Flaky Test Detection (ranked flaky tests with evidence: test name, repo, failure count, branches, actors, runs, time wasted)
- Time Wasted on Retries (retry chains, waste by repo, combined totals)

### `reports/recommendations.md`
- Improvement Recommendations (prioritized list based on quantified impact)
- Developer Feedback Correlation (each survey comment matched to data evidence)

### Changes from single-report approach
- `src/index.ts` exports `generateReports()` returning `{ pipelineHealth, flakyTests, recommendations }` strings
- `main()` writes 3 files to `reports/` directory
- `.gitignore` uses `reports/` instead of `report.md`
- GitHub Actions uploads `reports/` folder as artifact
- Tests validate all 3 files have their expected sections
