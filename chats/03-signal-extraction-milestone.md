# 03 — Signal Extraction Milestone

## Prompt 1

> I've created some notes. Please read them and then let's discuss the approach for the signal extraction modules.
>
> Do not edit. Plan only. Please ask me any questions.
>
> Attached: casey notes.txt

**Response:** Read the notes covering observations about the data (retry storms, flaky tests, CI waste patterns) and proposed analysis modules. Asked which of the 6 candidate analyzers to include:

1. Per-repo health summary
2. Failure extraction & classification
3. Flaky test detection
4. Time wasted (retry chains + context-switch cost)
5. CI minutes burned
6. Feedback correlation

Decisions:
- **All 6 modules selected**
- **Architecture:** One analyzer module per concern in `src/analyzers/`, each exporting pure functions
- Types centralized in `src/types.ts`, data loading in `src/data/loader.ts`

No files edited.

---

## Prompt 2

> Please update the plan and proceed with implementation.

**Response:** Updated `plans/signal-extraction-milestone.md` with full architecture, then implemented all modules:

1. **Created** `src/types.ts` — shared interfaces: `Run`, `Job`, `RunData`, `Workflow`, `WorkflowData`, `FeedbackEntry`, `FeedbackData`, `RepoHealth`, `FailureRecord`, `FailureClass`, `FlakyTest`, `RetryChain`, `TimeWastedSummary`, `RepoMinutes`, `FeedbackCorrelation`
2. **Created** `src/data/loader.ts` — `loadRuns()`, `loadWorkflows()`, `loadFeedback()` using `fs` + `path` + `import.meta.url`
3. **Created** `src/analyzers/health.ts` — `analyzeHealth(runs, workflows)` → `RepoHealth[]` with success rate, avg/min/max duration, bottleneck job identification
4. **Created** `src/analyzers/failures.ts` — `analyzeFailures(runs)` → `FailureRecord[]`, `classifyFailure(message)` → `"ephemeral" | "hard"`. Ephemeral patterns: connection refused, timeout, retries exhausted, ECONNREFUSED
5. **Created** `src/analyzers/flaky.ts` — `analyzeFlaky(runs, failures)` → `FlakyTest[]`. Groups ephemeral failures by repo+test, requires multiple branches/actors, finds successful retries. Sorted by failure count desc
6. **Created** `src/analyzers/time-wasted.ts` — `analyzeTimeWasted(runs)` → `TimeWastedSummary` with retry chains, wasted duration, 15-min context-switch penalty per retry
7. **Created** `src/analyzers/ci-minutes.ts` — `analyzeCIMinutes(runs)` → `RepoMinutes[]` with total, successful, and wasted minutes per repo
8. **Created** `src/analyzers/feedback.ts` — `analyzeFeedback(feedback, failures, flakyTests)` → `FeedbackCorrelation[]` using keyword matching (stripe↔payment_gateway, volunteer-signup↔e2e, receipt↔receipt.test.ts)
9. **Rewrote** `src/index.ts` — orchestrates all 6 analyzers, renders full markdown report with sections for each analysis area
10. **Rewrote** `src/report.test.ts` — expanded from 7 to 31 tests across 8 describe blocks (report structure, data loader, health, failures, flaky, time wasted, CI minutes, feedback correlation)
11. **Ran** `npm test` — 31/31 tests passing
12. **Ran** `npm run generate` — confirmed `report.md` generated with real analysis data

Key findings from the data:
- 18 total failures: 15 ephemeral, 3 hard
- 3 flaky tests: volunteer-signup e2e (7 failures), stripe-mock/payment_gateway (6), receipt dedup (2)
- 437.6 min total waste (182.6 CI + 255 context-switch)
- giving-api: 58.6% wasted, volunteer-portal: 55.8% wasted
- admin-console and notification-service: 100% success, 0% waste

Files touched: `plans/signal-extraction-milestone.md`, `src/types.ts`, `src/data/loader.ts`, `src/analyzers/health.ts`, `src/analyzers/failures.ts`, `src/analyzers/flaky.ts`, `src/analyzers/time-wasted.ts`, `src/analyzers/ci-minutes.ts`, `src/analyzers/feedback.ts`, `src/index.ts`, `src/report.test.ts`

---

## Prompt 3

> I am thinking about splitting the report up into separate files. Let me think about how to group them. Please ask questions.
>
> Do not edit. Plan only.

**Response:** Asked clarifying questions about the report split:

1. **Number of files** — chose 3 files
2. **Naming** — chose descriptive names (e.g., `pipeline-health.md`)
3. **Output location** — chose `reports/` subfolder
4. **Old report.md** — chose to replace (no longer generate single file)

Proposed grouping:
- `pipeline-health.md` — repo health table, CI minutes, failure breakdown
- `flaky-tests.md` — flaky test detection, retry chains, time wasted
- `recommendations.md` — improvement recommendations, feedback correlation

No files edited.

---

## Prompt 4

> Proceed with implementation.

**Response:** Implemented the 3-report split:

1. **Updated** `plans/signal-extraction-milestone.md` — added report structure section documenting the 3-file split
2. **Rewrote** `src/index.ts` — `generateReport()` → `generateReports()` returning `{ pipelineHealth, flakyTests, recommendations }`. Added per-report header renderers. `main()` now writes 3 files to `reports/` directory via `mkdirSync`
3. **Updated** `.gitignore` — `report.md` → `reports/`
4. **Updated** `.github/workflows/ci.yml` — upload `reports/` folder instead of single `report.md`
5. **Rewrote** `src/report.test.ts` — updated report structure tests for 3 files (mkdirSync, writeFileSync ×3, rmSync cleanup). Total: 32 tests
6. **Ran** `npm test` — 32/32 tests passing
7. **Ran** `npm run generate` — confirmed 3 files created in `reports/`: `pipeline-health.md`, `flaky-tests.md`, `recommendations.md`

Files touched: `plans/signal-extraction-milestone.md`, `src/index.ts`, `.gitignore`, `.github/workflows/ci.yml`, `src/report.test.ts`
