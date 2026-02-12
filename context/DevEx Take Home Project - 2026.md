**Take-Home Project: CI Pipeline Health**

**Analyzer**

# Background

Bloomerang's engineering org has grown to **8 teams** shipping across **12 repositories**. Our CI/CD runs on **GitHub Actions**, and while things mostly work, engineers are increasingly frustrated. Builds feel slow, flaky tests erode trust, and nobody has a clear picture of which pipelines need the most attention. When someone asks *"Why did the build take 22 minutes?"* or *"Is this test actually flaky or did I break something?"*, the answer requires manually clicking through dozens of GitHub Actions run logs.

As a Developer Experience engineer, your job is to turn raw CI data into actionable insight. Build a **working prototype** that helps an engineering team understand where their CI pipelines are hurting and what to fix first.

| **The Repositories**              |                     |                           |                                 |
|-----------------------------------|---------------------|---------------------------|---------------------------------|
| **Repository**                    | **Team**            | **Primary Stack**         | **Avg. Daily CI** <br>**Runs**  |
| bloomerang/donor-crm              | CRM Core            | Node.js / <br>TypeScript  | \~18                            |
| bloomerang/giving-api             | Payments            | Node.js / <br>TypeScript  | \~14                            |
| bloomerang/volunteer-portal       | Volunteer           | React / Next.js           | \~12                            |
| bloomerang/admin-console          | Internal <br>Tools  | React / TypeScript        | \~8                             |
| bloomerang/event-processor        | Platform            | Python                    | \~10                            |
| bloomerang/notification-se rvice  | Platform            | Python                    | \~6                             |

# The Workflows

Each repo has a ci.yml workflow triggered on pull requests. The workflows share a similar structure but differ in steps and duration.

# Mock Data

Use the data below to seed your tool. Store it however you like (JSON files, SQLite, in-memory, etc.).

## 1. Workflow Definitions

JSON

{

"workflows": [

{

"repo": "bloomerang/donor-crm",

"workflow": "ci.yml",

"jobs": [

{ "name": "lint", "avg_duration_sec": 45 },

{ "name": "typecheck", "avg_duration_sec": 62 },

{ "name": "unit-tests", "avg_duration_sec": 195 },

{ "name": "integration-tests", "avg_duration_sec": 310 }, { "name": "build", "avg_duration_sec": 120 }

]

},

{

"repo": "bloomerang/giving-api",

"workflow": "ci.yml",

"jobs": [

{ "name": "lint", "avg_duration_sec": 38 },

{ "name": "typecheck", "avg_duration_sec": 55 },

{ "name": "unit-tests", "avg_duration_sec": 140 },

{ "name": "integration-tests", "avg_duration_sec": 480 }, { "name": "build", "avg_duration_sec": 95 } ]

},

{

"repo": "bloomerang/volunteer-portal",

"workflow": "ci.yml",

"jobs": [

{ "name": "lint", "avg_duration_sec": 30 },

{ "name": "typecheck", "avg_duration_sec": 48 },

{ "name": "unit-tests", "avg_duration_sec": 110 },

{ "name": "e2e-tests", "avg_duration_sec": 540 },

{ "name": "build", "avg_duration_sec": 150 }

]

},

{

"repo": "bloomerang/admin-console",

"workflow": "ci.yml",

"jobs": [

{ "name": "lint", "avg_duration_sec": 28 },

{ "name": "typecheck", "avg_duration_sec": 40 },

{ "name": "unit-tests", "avg_duration_sec": 85 }, { "name": "build", "avg_duration_sec": 70 }

]

},

{

"repo": "bloomerang/event-processor",

"workflow": "ci.yml",

"jobs": [

{ "name": "lint", "avg_duration_sec": 22 },

{ "name": "unit-tests", "avg_duration_sec": 95 }, { "name": "integration-tests", "avg_duration_sec": 260 }, { "name": "build", "avg_duration_sec": 55 }

]

},

{

"repo": "bloomerang/notification-service",

"workflow": "ci.yml",

"jobs": [

## 2. CI Run History (last 30 days)

Each run includes per-job results. Status is success, failure, or cancelled.

JSON

{

"runs": [

{

"id": "run-001", "repo": "bloomerang/donor-crm", "branch":

"feat/donor-merge-ui",

"trigger": "pull_request", "actor": "schen", "started_at":

"2026-01-08T09:12:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 42

},

{ "name": "typecheck", "status": "success",

"duration_sec": 58 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 188 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 305 },

{ "name": "build", "status": "success", "duration_sec":

115 }

]

},

{

"id": "run-002", "repo": "bloomerang/donor-crm", "branch":

"fix/duplicate-receipt",

"trigger": "pull_request", "actor": "mjohnson",

"started_at": "2026-01-08T10:45:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 48

},

{ "name": "typecheck", "status": "success",

"duration_sec": 65 },

{ "name": "unit-tests", "status": "failure",

"duration_sec": 102, "failure_message": "FAIL src/services/receipt.test.ts \> ReceiptService \> should deduplicate receipts for same transaction\\\\n\\\\nAssertionError: expected 1 to be 2\\\\n\\\\nTest timed out after 5000ms" },

{ "name": "integration-tests", "status": "skipped" }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-003", "repo": "bloomerang/donor-crm", "branch":

"fix/duplicate-receipt",

"trigger": "pull_request", "actor": "mjohnson",

"started_at": "2026-01-08T11:20:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 44

},

{ "name": "typecheck", "status": "success",

"duration_sec": 60 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 201 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 298 },

{ "name": "build", "status": "success", "duration_sec":

122 }

]

},

{

"id": "run-004", "repo": "bloomerang/giving-api", "branch":

"feat/recurring-gifts",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-08T14:05:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 40

},

{ "name": "typecheck", "status": "success",

"duration_sec": 52 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 145 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 495, "failure_message": "FAIL tests/integration/payment_gateway.test.ts \> PaymentGateway \> should process recurring charge\\\\n\\\\nError: Connection refused:

stripe-mock:12111\\\\nRetries exhausted after 3 attempts" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-005", "repo": "bloomerang/giving-api", "branch":

"feat/recurring-gifts",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-08T14:55:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 36

},

{ "name": "typecheck", "status": "success",

"duration_sec": 58 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 138 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 502, "failure_message": "FAIL tests/integration/payment_gateway.test.ts \> PaymentGateway \> should process recurring charge\\\\n\\\\nError: Connection refused:

stripe-mock:12111\\\\nRetries exhausted after 3 attempts" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-006", "repo": "bloomerang/giving-api", "branch":

"feat/recurring-gifts",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-08T16:10:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 39

},

{ "name": "typecheck", "status": "success",

"duration_sec": 54 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 142 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 465 },

{ "name": "build", "status": "success", "duration_sec":

98 }

]

},

{

"id": "run-007", "repo": "bloomerang/volunteer-portal",

"branch": "feat/shift-calendar",

"trigger": "pull_request", "actor": "klee", "started_at":

"2026-01-09T08:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 32

},

{ "name": "typecheck", "status": "success",

"duration_sec": 50 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 108 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 612, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-008", "repo": "bloomerang/volunteer-portal",

"branch": "feat/shift-calendar",

"trigger": "pull_request", "actor": "klee", "started_at":

"2026-01-09T09:15:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 29

},

{ "name": "typecheck", "status": "success",

"duration_sec": 46 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 115 },

{ "name": "e2e-tests", "status": "success",

"duration_sec": 558 },

{ "name": "build", "status": "success", "duration_sec":

145 }

]

},

{

"id": "run-009", "repo": "bloomerang/volunteer-portal",

"branch": "fix/timezone-display",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-09T13:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 31 },

{ "name": "typecheck", "status": "success",

"duration_sec": 52 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 105 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 590, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-010", "repo": "bloomerang/volunteer-portal",

"branch": "fix/timezone-display",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-09T14:22:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 28

},

{ "name": "typecheck", "status": "success",

"duration_sec": 49 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 112 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 605, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-011", "repo": "bloomerang/volunteer-portal",

"branch": "fix/timezone-display",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-09T15:40:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 33

},

{ "name": "typecheck", "status": "success",

"duration_sec": 51 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 118 },

{ "name": "e2e-tests", "status": "success",

"duration_sec": 530 },

{ "name": "build", "status": "success", "duration_sec":

148 }

]

},

{

"id": "run-012", "repo": "bloomerang/admin-console",

"branch": "feat/audit-log-viewer",

"trigger": "pull_request", "actor": "mjohnson",

"started_at": "2026-01-10T10:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 25

},

{ "name": "typecheck", "status": "success",

"duration_sec": 38 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 82 },

{ "name": "build", "status": "success", "duration_sec":

68 }

]

},

{

"id": "run-013", "repo": "bloomerang/admin-console",

"branch": "feat/audit-log-viewer",

"trigger": "pull_request", "actor": "mjohnson",

"started_at": "2026-01-10T14:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 27

},

{ "name": "typecheck", "status": "success",

"duration_sec": 42 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 88 },

{ "name": "build", "status": "success", "duration_sec":

72 }

]

},

{

"id": "run-014", "repo": "bloomerang/event-processor",

"branch": "feat/batch-events",

"trigger": "pull_request", "actor": "rdavis", "started_at":

"2026-01-10T11:15:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 24

},

{ "name": "unit-tests", "status": "success",

"duration_sec": 90 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 275, "failure_message": "FAILED

tests/integration/test_event_batch.py::test_large_batch_processin g\\\\n\\\\nassert len(results) == 1000\\\\nAssertionError: assert 998 == 1000\\\\n\\\\nDuring handling: OSError: [Errno 24] Too many open files" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-015", "repo": "bloomerang/event-processor",

"branch": "feat/batch-events",

"trigger": "pull_request", "actor": "rdavis", "started_at":

"2026-01-10T13:45:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 20

},

{ "name": "unit-tests", "status": "success",

"duration_sec": 98 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 252 },

{ "name": "build", "status": "success", "duration_sec":

58 }

]

},

{

"id": "run-016", "repo": "bloomerang/notification-service",

"branch": "feat/sms-templates",

"trigger": "pull_request", "actor": "klee", "started_at":

"2026-01-10T16:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 19

},

{ "name": "unit-tests", "status": "success",

"duration_sec": 72 },

{ "name": "build", "status": "success", "duration_sec":

38 }

]

},

{

"id": "run-017", "repo": "bloomerang/giving-api", "branch":

"fix/currency-rounding",

"trigger": "pull_request", "actor": "schen", "started_at":

"2026-01-13T09:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 41 },

{ "name": "typecheck", "status": "success",

"duration_sec": 57 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 148 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 488, "failure_message": "FAIL tests/integration/payment_gateway.test.ts \> PaymentGateway \> should handle multi-currency conversion\\\\n\\\\nError: Connection refused: stripe-mock:12111\\\\nRetries exhausted after 3 attempts"

},

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-018", "repo": "bloomerang/giving-api", "branch":

"fix/currency-rounding",

"trigger": "pull_request", "actor": "schen", "started_at":

"2026-01-13T10:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 37

},

{ "name": "typecheck", "status": "success",

"duration_sec": 53 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 135 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 472 },

{ "name": "build", "status": "success", "duration_sec":

92 }

]

},

{

"id": "run-019", "repo": "bloomerang/donor-crm", "branch":

"feat/donor-merge-ui",

"trigger": "pull_request", "actor": "schen", "started_at":

"2026-01-13T11:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 46

},

{ "name": "typecheck", "status": "failure",

"duration_sec": 70, "failure_message":

"src/components/DonorMerge.tsx(42,5): error TS2322: Type 'string \| undefined' is not assignable to type 'string'." },

{ "name": "unit-tests", "status": "skipped" }, { "name": "integration-tests", "status": "skipped" }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-020", "repo": "bloomerang/donor-crm", "branch":

"feat/donor-merge-ui",

"trigger": "pull_request", "actor": "schen", "started_at":

"2026-01-13T11:35:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 43

},

{ "name": "typecheck", "status": "success",

"duration_sec": 64 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 192 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 318 },

{ "name": "build", "status": "success", "duration_sec":

118 }

]

},

{

"id": "run-021", "repo": "bloomerang/volunteer-portal",

"branch": "feat/shift-calendar",

"trigger": "pull_request", "actor": "klee", "started_at":

"2026-01-14T09:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 30

},

{ "name": "typecheck", "status": "success",

"duration_sec": 47 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 106 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 620, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-022", "repo": "bloomerang/volunteer-portal",

"branch": "feat/shift-calendar",

"trigger": "pull_request", "actor": "klee", "started_at":

"2026-01-14T10:20:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 31

},

{ "name": "typecheck", "status": "success",

"duration_sec": 49 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 112 },

{ "name": "e2e-tests", "status": "success",

"duration_sec": 545 },

{ "name": "build", "status": "success", "duration_sec":

152 }

]

},

{

"id": "run-023", "repo": "bloomerang/giving-api", "branch":

"chore/deps-upgrade",

"trigger": "pull_request", "actor": "ci-bot", "started_at":

"2026-01-15T06:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 38

},

{ "name": "typecheck", "status": "failure",

"duration_sec": 61, "failure_message":

"src/services/payment.ts(118,22): error TS2345: Argument of type 'StripeEvent' is not assignable to parameter of type 'StripeEventV2'.\\\\n Property 'api_version' is missing in type

'StripeEvent'." },

{ "name": "unit-tests", "status": "skipped" }, { "name": "integration-tests", "status": "skipped" }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-024", "repo": "bloomerang/giving-api", "branch":

"feat/pledge-tracking",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-15T10:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 42

},

{ "name": "typecheck", "status": "success",

"duration_sec": 56 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 152 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 510, "failure_message": "FAIL tests/integration/payment_gateway.test.ts \> PaymentGateway \> should create pledge schedule\\\\n\\\\nError: Connection refused: stripe-mock:12111\\\\nRetries exhausted after 3 attempts" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-025", "repo": "bloomerang/giving-api", "branch":

"feat/pledge-tracking",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-15T11:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 39

},

{ "name": "typecheck", "status": "success",

"duration_sec": 54 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 140 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 478 },

{ "name": "build", "status": "success", "duration_sec":

96 }

]

},

{

"id": "run-026", "repo": "bloomerang/donor-crm", "branch":

"fix/search-performance",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-16T09:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 47

},

{ "name": "typecheck", "status": "success",

"duration_sec": 63 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 205 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 325 },

{ "name": "build", "status": "success", "duration_sec":

128 }

]

},

{

"id": "run-027", "repo": "bloomerang/event-processor",

"branch": "fix/dead-letter-retry",

"trigger": "pull_request", "actor": "rdavis", "started_at":

"2026-01-16T14:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 23

},

{ "name": "unit-tests", "status": "success",

"duration_sec": 92 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 248 },

{ "name": "build", "status": "success", "duration_sec":

52 }

]

},

{

"id": "run-028", "repo": "bloomerang/volunteer-portal",

"branch": "fix/accessibility-nav",

"trigger": "pull_request", "actor": "mjohnson",

"started_at": "2026-01-17T10:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 34

},

{ "name": "typecheck", "status": "success",

"duration_sec": 53 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 109 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 598, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" } ]

},

{

"id": "run-029", "repo": "bloomerang/volunteer-portal",

"branch": "fix/accessibility-nav",

"trigger": "pull_request", "actor": "mjohnson",

"started_at": "2026-01-17T11:15:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 30

},

{ "name": "typecheck", "status": "success",

"duration_sec": 48 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 114 },

{ "name": "e2e-tests", "status": "success",

"duration_sec": 535 },

{ "name": "build", "status": "success", "duration_sec":

140 }

]

},

{

"id": "run-030", "repo": "bloomerang/giving-api", "branch":

"fix/webhook-idempotency",

"trigger": "pull_request", "actor": "rdavis", "started_at":

"2026-01-20T09:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 40

},

{ "name": "typecheck", "status": "success",

"duration_sec": 55 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 144 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 498, "failure_message": "FAIL tests/integration/payment_gateway.test.ts \> PaymentGateway \> should deduplicate webhook events\\\\n\\\\nError: Connection refused:

stripe-mock:12111\\\\nRetries exhausted after 3 attempts" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-031", "repo": "bloomerang/giving-api", "branch":

"fix/webhook-idempotency",

"trigger": "pull_request", "actor": "rdavis", "started_at":

"2026-01-20T10:15:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 37

},

{ "name": "typecheck", "status": "success",

"duration_sec": 52 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 138 },

{ "name": "integration-tests", "status": "failure",

"duration_sec": 505, "failure_message": "FAIL tests/integration/payment_gateway.test.ts \> PaymentGateway \> should deduplicate webhook events\\\\n\\\\nError: Connection refused:

stripe-mock:12111\\\\nRetries exhausted after 3 attempts" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-032", "repo": "bloomerang/giving-api", "branch":

"fix/webhook-idempotency",

"trigger": "pull_request", "actor": "rdavis", "started_at":

"2026-01-20T13:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 38

},

{ "name": "typecheck", "status": "success",

"duration_sec": 56 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 141 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 470 },

{ "name": "build", "status": "success", "duration_sec":

94 }

]

},

{

"id": "run-033", "repo": "bloomerang/notification-service",

"branch": "feat/email-batching",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-21T09:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 20

},

{ "name": "unit-tests", "status": "success",

"duration_sec": 68 },

{ "name": "build", "status": "success", "duration_sec":

42 }

]

},

{

"id": "run-034", "repo": "bloomerang/donor-crm", "branch":

"feat/custom-fields",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-21T10:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 50

},

{ "name": "typecheck", "status": "success",

"duration_sec": 68 },

{ "name": "unit-tests", "status": "failure",

"duration_sec": 180, "failure_message": "FAIL src/services/receipt.test.ts \> ReceiptService \> should deduplicate receipts for same transaction\\\\n\\\\nAssertionError: expected 1 to be 2\\\\n\\\\nTest timed out after 5000ms" },

{ "name": "integration-tests", "status": "skipped" },

{ "name": "build", "status": "skipped" }

]

},

{

"id": "run-035", "repo": "bloomerang/donor-crm", "branch":

"feat/custom-fields",

"trigger": "pull_request", "actor": "agarcia",

"started_at": "2026-01-21T10:45:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 44

},

{ "name": "typecheck", "status": "success",

"duration_sec": 62 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 198 },

{ "name": "integration-tests", "status": "success",

"duration_sec": 312 },

{ "name": "build", "status": "success", "duration_sec":

120 }

]

},

{

"id": "run-036", "repo": "bloomerang/volunteer-portal",

"branch": "chore/vitest-migration",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-22T09:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 32

},

{ "name": "typecheck", "status": "success",

"duration_sec": 50 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 78 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 615, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-037", "repo": "bloomerang/volunteer-portal",

"branch": "chore/vitest-migration",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-22T10:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 29

},

{ "name": "typecheck", "status": "success",

"duration_sec": 47 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 82 },

{ "name": "e2e-tests", "status": "failure",

"duration_sec": 602, "failure_message": "FAIL

cypress/e2e/volunteer-signup.cy.ts \> Volunteer Signup \> should complete multi-step registration\\\\n\\\\nTimeoutError: Timed out retrying after 10000ms: Expected to find element:

[data-testid=\\\\"step-3-submit\\\\"], but never found it." }, { "name": "build", "status": "skipped" }

]

},

{

"id": "run-038", "repo": "bloomerang/volunteer-portal",

"branch": "chore/vitest-migration",

"trigger": "pull_request", "actor": "tpatel", "started_at":

"2026-01-22T14:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 30 },

{ "name": "typecheck", "status": "success",

"duration_sec": 48 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 80 },

{ "name": "e2e-tests", "status": "success",

"duration_sec": 540 },

{ "name": "build", "status": "success", "duration_sec":

138 }

]

},

{

"id": "run-039", "repo": "bloomerang/admin-console",

"branch": "feat/role-management",

"trigger": "pull_request", "actor": "schen", "started_at":

"2026-01-23T10:00:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 26

},

{ "name": "typecheck", "status": "success",

"duration_sec": 40 },

{ "name": "unit-tests", "status": "success",

"duration_sec": 86 },

{ "name": "build", "status": "success", "duration_sec":

65 }

]

},

{

"id": "run-040", "repo": "bloomerang/event-processor",

"branch": "feat/event-schema-v2",

"trigger": "pull_request", "actor": "klee", "started_at":

"2026-01-23T11:30:00Z",

"jobs": [

{ "name": "lint", "status": "success", "duration_sec": 21

},

{ "name": "unit-tests", "status": "success",

"duration_sec": 94 },

## 3. Developer Feedback (collected from a recent internal survey)

JSON

{

"feedback": [

{ "author": "schen", "team": "CRM Core", "comment": "I re-ran giving-api CI 3 times last week because of that stripe-mock

thing. Total waste of time." },

{ "author": "klee", "team": "Volunteer", "comment": "The volunteer-signup e2e test fails on basically every PR and it's

never actually broken. We just re-run and pray." },

{ "author": "agarcia", "team": "Payments", "comment": "Our integration tests take 8 minutes. That's 8 minutes of context-switching every push. I end up batching changes which

makes reviews harder." },

{ "author": "tpatel", "team": "Volunteer", "comment": "I don't understand why we run the full e2e suite on every PR. Most

of my changes are CSS fixes." },

{ "author": "mjohnson", "team": "CRM Core", "comment": "The receipt dedup test in donor-crm has failed on two of my PRs and

I've never touched that code. Feels flaky." },

{ "author": "rdavis", "team": "Platform", "comment": "I'd love to know which repos are burning the most CI minutes. Feels

like we're paying for a lot of reruns." }

]

}

# Your Task

Build a **working prototype** (CLI, web tool, script — whatever you think fits) that analyzes this CI data and produces actionable insights. Your tool should support the following:

1.  **Pipeline health summary**: For each repo, show success rate, average run duration, and the slowest job (bottleneck). An engineer should be able to glance at this and know which repos need attention.
2.  **Flaky test detection**: Identify tests that fail intermittently — same test, same error, across different branches/authors, but passes on retry. Surface the top offenders with evidence (which runs, how often, estimated developer time wasted).
3.  **Improvement recommendations**: Based on your analysis, produce a prioritized list of concrete recommendations. For example, if a service container is unreliable, say so. If an e2e test is flaky, quantify the impact. Think like a DevEx engineer writing a proposal to your team lead.

# Deliverables

1.  **Working code** in a GitHub repo (or zip file).
2.  **A README** covering how to set up and run the tool, with example output or screenshots.
3.  **A brief write-up** (can be in the README or a separate doc) covering:

    ○ Your analysis of the data — what patterns did you find?

    ○ What would you do first if you joined Bloomerang's Platform Engineering team on Monday?

○ How would you evolve this tool to work with live GitHub Actions data via the API?

# Evaluation Criteria

We're not looking for production polish — we're looking for:

-   **Signal extraction**: Can you find the real problems in noisy data? (The data has deliberate patterns — we want to see if you find them.)
-   **Prioritization**: DevEx teams can't fix everything at once. How do you decide what matters most?
-   **Practical recommendations**: Vague advice like "improve CI" doesn't help. We want specifics — the kind of thing you'd put in a Slack message to a team lead.
-   **Code quality**: Is it readable, organized, and does what it claims?
-   **Communication**: Can you explain your findings clearly to someone who hasn't stared at the data?

# Time Expectation

We expect this to take roughly **90 minutes**. Please don't spend significantly more than that. A focused analysis with clear recommendations is better than a polished solution with no insight.

# A Note on Using LLMs

Using an LLM (ChatGPT, Claude, Copilot, etc.) is perfectly acceptable. If you do, please be prepared to:

-   Share the prompts you used
-   Walk through the generated code and explain what it does
-   Discuss what you changed or decided not to use from the LLM output
-   Identify any issues in the generated code you caught (or missed)

    We care about your judgment and understanding, not whether you typed every character.

*Questions? Reach out to your recruiting contact — we're happy to clarify.*
