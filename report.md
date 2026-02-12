# CI Pipeline Health Report

> Generated: 2026-02-12T18:10:44.499Z

## Pipeline Health Summary

| Repo | Runs | Success Rate | Avg Duration | Min | Max | Bottleneck Job |
|------|------|-------------|-------------|-----|-----|---------------|
| donor-crm | 8 | 63% | 8m 58s | 1m 56s | 12m 48s | integration-tests (5m 12s) |
| giving-api | 11 | 36% | 11m 42s | 1m 39s | 13m 27s | integration-tests (8m 8s) |
| volunteer-portal | 12 | 42% | 13m 43s | 12m 40s | 14m 53s | e2e-tests (9m 39s) |
| admin-console | 3 | 100% | 3m 40s | 3m 33s | 3m 49s | unit-tests (1m 25s) |
| event-processor | 4 | 75% | 6m 57s | 6m 29s | 7m 16s | integration-tests (4m 20s) |
| notification-service | 2 | 100% | 2m 10s | 2m 9s | 2m 10s | unit-tests (1m 10s) |

## Failure Analysis

**18 total failures**: 15 ephemeral, 3 hard.

| Run | Repo | Job | Type | Failure Message |
|-----|------|-----|------|-----------------|
| run-002 | donor-crm | unit-tests | ephemeral | FAIL src/services/receipt.test.ts > ReceiptService > should deduplicat… |
| run-004 | giving-api | integration-tests | ephemeral | FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > shou… |
| run-005 | giving-api | integration-tests | ephemeral | FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > shou… |
| run-007 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |
| run-009 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |
| run-010 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |
| run-014 | event-processor | integration-tests | hard | FAILED tests/integration/test_event_batch.py::test_large_batch_process… |
| run-017 | giving-api | integration-tests | ephemeral | FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > shou… |
| run-019 | donor-crm | typecheck | hard | src/components/DonorMerge.tsx(42,5): error TS2322: Type 'string | unde… |
| run-021 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |
| run-023 | giving-api | typecheck | hard | src/services/payment.ts(118,22): error TS2345: Argument of type 'Strip… |
| run-024 | giving-api | integration-tests | ephemeral | FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > shou… |
| run-028 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |
| run-030 | giving-api | integration-tests | ephemeral | FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > shou… |
| run-031 | giving-api | integration-tests | ephemeral | FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > shou… |
| run-034 | donor-crm | unit-tests | ephemeral | FAIL src/services/receipt.test.ts > ReceiptService > should deduplicat… |
| run-036 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |
| run-037 | volunteer-portal | e2e-tests | ephemeral | FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should co… |

## Flaky Test Detection

**3 flaky test(s) detected**, ranked by failure frequency:

### 1. cypress/e2e/volunteer-signup.cy.ts

- **Repo**: bloomerang/volunteer-portal
- **Job**: e2e-tests
- **Failures**: 7 across 4 branches, 3 actors
- **Branches affected**: feat/shift-calendar, fix/timezone-display, fix/accessibility-nav, chore/vitest-migration
- **Authors affected**: klee, tpatel, mjohnson
- **Failed runs**: run-007, run-009, run-010, run-021, run-028, run-036, run-037
- **Successful retries**: run-008, run-011, run-011, run-022, run-029, run-038, run-038
- **Estimated time wasted**: 175.7 min

### 2. tests/integration/payment_gateway.test.ts

- **Repo**: bloomerang/giving-api
- **Job**: integration-tests
- **Failures**: 6 across 4 branches, 3 actors
- **Branches affected**: feat/recurring-gifts, fix/currency-rounding, feat/pledge-tracking, fix/webhook-idempotency
- **Authors affected**: agarcia, schen, rdavis
- **Failed runs**: run-004, run-005, run-017, run-024, run-030, run-031
- **Successful retries**: run-006, run-006, run-018, run-025, run-032, run-032
- **Estimated time wasted**: 140 min

### 3. src/services/receipt.test.ts

- **Repo**: bloomerang/donor-crm
- **Job**: unit-tests
- **Failures**: 2 across 2 branches, 2 actors
- **Branches affected**: fix/duplicate-receipt, feat/custom-fields
- **Authors affected**: mjohnson, agarcia
- **Failed runs**: run-002, run-034
- **Successful retries**: run-003, run-035
- **Estimated time wasted**: 34.7 min

## Time Wasted on Retries

**Summary**: 182.6 min of CI time wasted + ~255 min of developer context-switching = **437.6 min total waste**.

### Retry Chains

| Repo | Branch | Actor | Runs | Retries | Wasted Duration |
|------|--------|-------|------|---------|----------------|
| volunteer-portal | feat/shift-calendar | klee | run-007, run-008, run-021, run-022 | 2 | 26m 45s |
| volunteer-portal | fix/timezone-display | tpatel | run-009, run-010, run-011 | 2 | 26m 12s |
| volunteer-portal | chore/vitest-migration | tpatel | run-036, run-037, run-038 | 2 | 25m 35s |
| giving-api | fix/webhook-idempotency | rdavis | run-030, run-031, run-032 | 2 | 24m 29s |
| giving-api | feat/recurring-gifts | agarcia | run-004, run-005, run-006 | 2 | 24m 26s |
| volunteer-portal | fix/accessibility-nav | mjohnson | run-028, run-029 | 1 | 13m 14s |
| giving-api | feat/pledge-tracking | agarcia | run-024, run-025 | 1 | 12m 40s |
| giving-api | fix/currency-rounding | schen | run-017, run-018 | 1 | 12m 14s |
| event-processor | feat/batch-events | rdavis | run-014, run-015 | 1 | 6m 29s |
| donor-crm | feat/custom-fields | agarcia | run-034, run-035 | 1 | 4m 58s |
| donor-crm | fix/duplicate-receipt | mjohnson | run-002, run-003 | 1 | 3m 35s |
| donor-crm | feat/donor-merge-ui | schen | run-001, run-019, run-020 | 1 | 1m 56s |

### Waste by Repo

| Repo | Wasted Minutes |
|------|---------------|
| volunteer-portal | 91.8 min |
| giving-api | 73.8 min |
| donor-crm | 10.5 min |
| event-processor | 6.5 min |

## CI Minutes Burned

**Total**: 408 min across all repos, **184.3 min wasted** (45.2%).

| Repo | Total Min | Successful | Wasted | % Wasted |
|------|-----------|-----------|--------|----------|
| volunteer-portal | 164.5 | 72.8 | 91.8 | 55.8% |
| giving-api | 128.7 | 53.2 | 75.5 | 58.6% |
| donor-crm | 71.7 | 61.2 | 10.5 | 14.6% |
| event-processor | 27.8 | 21.3 | 6.5 | 23.3% |
| admin-console | 11 | 11 | 0 | 0% |
| notification-service | 4.3 | 4.3 | 0 | 0% |

## Developer Feedback Correlation

- **schen** (CRM Core): _"I re-ran giving-api CI 3 times last week because of that stripe-mock thing. Total waste of time."_
  - Flaky test "tests/integration/payment_gateway.test.ts" in bloomerang/giving-api: 6 failures across 4 branches. Estimated 140 min wasted.
  - bloomerang/giving-api integration-tests failure in run-004: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should process…" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-005: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should process…" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-017: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should handle …" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-024: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should create …" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-030: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should dedupli…" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-031: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should dedupli…" [ephemeral]

- **klee** (Volunteer): _"The volunteer-signup e2e test fails on basically every PR and it's never actually broken. We just re-run and pray."_
  - Flaky test "cypress/e2e/volunteer-signup.cy.ts" in bloomerang/volunteer-portal: 7 failures across 4 branches. Estimated 175.7 min wasted.
  - bloomerang/volunteer-portal e2e-tests failure in run-007: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-009: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-010: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-021: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-028: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-036: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-037: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]

- **agarcia** (Payments): _"Our integration tests take 8 minutes. That's 8 minutes of context-switching every push. I end up batching changes which makes reviews harder."_
  - bloomerang/giving-api integration-tests failure in run-004: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should process…" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-005: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should process…" [ephemeral]
  - bloomerang/event-processor integration-tests failure in run-014: "FAILED tests/integration/test_event_batch.py::test_large_batch_processing  asser…" [hard]
  - bloomerang/giving-api integration-tests failure in run-017: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should handle …" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-024: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should create …" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-030: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should dedupli…" [ephemeral]
  - bloomerang/giving-api integration-tests failure in run-031: "FAIL tests/integration/payment_gateway.test.ts > PaymentGateway > should dedupli…" [ephemeral]

- **tpatel** (Volunteer): _"I don't understand why we run the full e2e suite on every PR. Most of my changes are CSS fixes."_
  - bloomerang/volunteer-portal e2e-tests failure in run-007: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-009: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-010: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-021: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-028: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-036: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]
  - bloomerang/volunteer-portal e2e-tests failure in run-037: "FAIL cypress/e2e/volunteer-signup.cy.ts > Volunteer Signup > should complete mul…" [ephemeral]

- **mjohnson** (CRM Core): _"The receipt dedup test in donor-crm has failed on two of my PRs and I've never touched that code. Feels flaky."_
  - Flaky test "src/services/receipt.test.ts" in bloomerang/donor-crm: 2 failures across 2 branches. Estimated 34.7 min wasted.
  - bloomerang/donor-crm unit-tests failure in run-002: "FAIL src/services/receipt.test.ts > ReceiptService > should deduplicate receipts…" [ephemeral]
  - bloomerang/donor-crm unit-tests failure in run-034: "FAIL src/services/receipt.test.ts > ReceiptService > should deduplicate receipts…" [ephemeral]

- **rdavis** (Platform): _"I'd love to know which repos are burning the most CI minutes. Feels like we're paying for a lot of reruns."_
  - No direct match to failure data — qualitative feedback.

## Improvement Recommendations

1. **Fix or quarantine the volunteer-signup e2e test** (bloomerang/volunteer-portal)
   - 7 failures across 4 branches and 3 authors — this is not caused by code changes.
   - The Cypress test times out waiting for `[data-testid="step-3-submit"]`. Likely a race condition in the multi-step form or a missing wait.
   - **Impact**: ~175.7 min of developer + CI time wasted. Every PR to volunteer-portal risks a false-red build.
   - **Action**: Add a retry or increase the Cypress command timeout for this step. Long-term, investigate why step 3 renders late.

2. **Stabilize the stripe-mock service container** (bloomerang/giving-api)
   - 6 integration test failures due to `Connection refused: stripe-mock:12111`.
   - The service container is intermittently failing to start before tests run.
   - **Impact**: ~140 min wasted. Developers report re-running CI 3+ times for a single PR.
   - **Action**: Add a health-check wait step before integration tests. Consider using `services.<id>.options: --health-cmd` in the workflow, or a startup retry script.

3. **Fix the receipt dedup test timeout** (bloomerang/donor-crm)
   - 2 failures across different branches/authors — the test times out after 5000ms.
   - This is likely a test isolation issue (shared state or slow teardown).
   - **Action**: Increase timeout or investigate why the test hangs intermittently. Consider running it in isolation to reproduce.

4. **Reduce giving-api integration test duration** (currently ~8m 8s avg)
   - Integration tests are the bottleneck at ~8 min. Developers report context-switching during this wait.
   - **Action**: Profile the test suite to find slow tests. Consider parallelizing tests or splitting into fast/slow tiers with conditional execution.

5. **Run e2e tests selectively on volunteer-portal**
   - Developer feedback: "I don't understand why we run the full e2e suite on every PR. Most of my changes are CSS fixes."
   - **Action**: Use path filters in the GitHub Actions workflow to skip e2e tests when only CSS/style files changed. Run full e2e on merge to main.


---

_Report generated by bloomerang-ci-health_
