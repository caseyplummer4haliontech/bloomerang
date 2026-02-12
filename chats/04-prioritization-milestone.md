# 04 — Prioritization Milestone

## Prompt 1

> I wish to focus on the prioritization a bit more and treat it as a milestone. There are 3 dimenions I'm thinking of: frequency, cost and blast radius.
>
> Frequency would be how often it occurs
> Cost is not just the pipeline minutes, but the developer's time, and context switching
> Blast radius is how many people it affects.
>
> For any arbitrary weighting of metrics or padding, I'd want an easy way to adjust that in code, such as a constant that could be edited. For example: developer context switching.
>
> The focus is prioritorization for the Platform/DevEx team, not for individual developers. Example: Real type errors are problems where the pipeline is working as intended.
>
> With this guidance in mind, I'd also like to review the recommendations report as well for any improvments.
>
> No edits. Only plan. Please ask me any questions.

**Response:** Reviewed the current recommendations report and all analyzer code, then asked 4 clarifying questions:

1. **Scope** — chose "Replace recommendations" (scored prioritization replaces the hand-crafted section entirely)
2. **Scoring display** — chose "Show all dimensions + composite" (table columns for each dimension score)
3. **Granularity** — chose "Per-issue" (each specific problem gets its own score)
4. **Hard failures** — chose "Include but flag" (show with zero cost, flagged as "Pipeline working as intended")

Presented the full plan covering:
- New analyzer `src/analyzers/prioritize.ts` with tunable weight constants
- Issue discovery from flaky tests, slow pipelines, workflow feedback, and hard failures
- Three normalized 0–1 dimension scores with weighted composite
- `PrioritizedIssue` type definition
- Replacement of `renderRecommendations()` with scored table + per-issue narratives
- Test plan and files to be touched

No files edited.

---

## Prompt 2

> Please write this plan for the prioritorization milestone to a new MD plan file in the plans folder. Then proceed with implementation.

**Response:** Wrote the plan and implemented the full prioritization milestone:

1. **Created** `plans/prioritization-milestone.md` — written plan with architecture, scoring dimensions, types, and file list
2. **Added** `PrioritizedIssue` interface and `IssueCategory` type to `src/types.ts`
3. **Created** `src/constants.ts` — extracted `CONTEXT_SWITCH_PENALTY_MIN = 15` as shared constant
4. **Updated** `src/analyzers/time-wasted.ts` — imports `CONTEXT_SWITCH_PENALTY_MIN` from shared constants
5. **Updated** `src/analyzers/flaky.ts` — imports `CONTEXT_SWITCH_PENALTY_MIN` from shared constants
6. **Created** `src/analyzers/prioritize.ts` — scoring engine with:
   - Tunable weights: `WEIGHT_FREQUENCY = 0.35`, `WEIGHT_COST = 0.40`, `WEIGHT_BLAST_RADIUS = 0.25`
   - Issue collection from flaky tests, slow pipelines (≥2 min bottleneck), workflow feedback, and hard failures
   - Max-normalization per dimension → weighted composite
   - Hard failures get `costScore = 0` and a flag
7. **Updated** `src/index.ts` — imported `prioritize()`, replaced `renderRecommendations()` with `renderPrioritizedIssues()` producing a scored table + per-issue detail sections
8. **Updated** `src/report.test.ts` — added 7 prioritization tests (normalization bounds, sort order, weighted composite verification, hard-failure flagging, category coverage, flaky > hard ranking). Updated recommendation section test for new heading
9. **Ran** `npm test` — 39/39 tests passing
10. **Ran** `npm run generate` — 3 reports generated. Recommendations now shows scored priority table (0.94 down to 0.09) with hard failures flagged at bottom

Key output rankings:
- #1 Slow pipeline: volunteer-portal / e2e-tests (0.94)
- #2 Slow pipeline: giving-api / integration-tests (0.90)
- #3 Workflow: unnecessary e2e runs (0.69)
- #4 Slow pipeline: donor-crm / integration-tests (0.64)
- #5 Flaky test: volunteer-signup e2e (0.63)
- #6 Flaky test: payment_gateway (0.55)
- #7–8 Lower-frequency issues (0.34, 0.23)
- #9–11 Hard failures flagged "Pipeline working as intended" (0.09)

Files touched: `plans/prioritization-milestone.md`, `src/types.ts`, `src/constants.ts`, `src/analyzers/prioritize.ts`, `src/analyzers/time-wasted.ts`, `src/analyzers/flaky.ts`, `src/index.ts`, `src/report.test.ts`
