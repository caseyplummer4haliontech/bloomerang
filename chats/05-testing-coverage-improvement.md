# 05 — Testing Coverage Improvement

## Prompt 1

> I would like to do a testing review phase. I would first like to add any missing unit tests. What is the current code coverage?

**Response:** Installed `@vitest/coverage-v8` and ran `npx vitest run --coverage`. Initial coverage:

| Metric | Coverage |
|--------|----------|
| Statements | 96.58% |
| Branches | 79.22% |
| Functions | 100% |
| Lines | 98.06% |

Identified uncovered branches across 7 files:
- `index.ts` (61.11% branch) — empty flaky list and empty prioritized issues renderer paths
- `flaky.ts` (68%) — Python-style test file extraction, fallback message parsing
- `prioritize.ts` (63.63%) — empty issues, missing volunteer-portal health, detail builders
- `health.ts` (80%) — empty durations edge cases
- `ci-minutes.ts` (87.5%) — minor branch
- `failures.ts` (87.5%) — one ephemeral pattern not hit
- `feedback.ts` (93.02%) — one keyword match path

No files edited.

---

## Prompt 2

> Yes please improve coverage.

**Response:** Added 21 new tests across 6 new describe blocks in `src/report.test.ts`:

1. **Failure Classifier — all ephemeral patterns** (4 tests): TimeoutError, Retries exhausted, ECONNREFUSED, Connection refused
2. **Flaky Analyzer — edge cases** (5 tests): empty input, single-branch/actor filtering, Python `FAILED` format extraction, fallback message parsing (no FAIL/FAILED prefix), no-retry scenario with ephemeral failures
3. **Health Analyzer — edge cases** (2 tests): empty runs, runs with no job durations
4. **CI Minutes — edge cases** (1 test): repos with zero failures → 0% wasted
5. **Feedback Correlation — edge cases** (2 tests): unmatched feedback → "no direct match", receipt keyword → receipt flaky test match
6. **Prioritize — edge cases** (7 tests): empty data, fast-bottleneck filtering (< 2 min skip), no matching feedback → no workflow issue, fallback e2e duration when bottleneck is not e2e-tests, missing volunteer-portal in health data, flaky detail with retries, flaky detail without retries

Fixed one test failure: flaky detection edge case needed ephemeral-pattern failure messages (not hard-classified) to pass the `classification !== "ephemeral"` filter.

Final coverage:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Statements | 96.58% | 98.00% | +1.42 |
| Branches | 79.22% | 86.36% | +7.14 |
| Functions | 100% | 100% | — |
| Lines | 98.06% | 98.70% | +0.64 |

60/60 tests passing. Remaining uncovered branches are defensive guards in renderers (empty-list paths in `index.ts`) that only fire with synthetic data.

Files touched: `src/report.test.ts`, `package.json` (added `@vitest/coverage-v8` dev dependency)
