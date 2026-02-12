# Deferred & Future Work

Ideas explored during planning that were intentionally deferred — either out of scope for the take-home, not supported by the mock data, or better suited to a production evolution of the tool.

## Out of Scope (not asked for)

### Per-Developer Reports
- Which developers are doing the most commits, having the most failures, blocking others, or showing signs of frustration (cancellations, churn).
- Deferred because the project focus is Platform/DevEx team priorities, not individual developer metrics.

### DORA Metrics
- Deployment frequency, lead time, change failure rate, mean time to recovery.
- Would require deployment data beyond CI runs. Could be a natural extension.

### Branching Strategy Analysis
- Trunk-based vs. feature-branch patterns, whether multiple commits restart pipelines, developer stomping.
- Not observable from the mock data (no merge/deploy events).

### Pre-Commit Hook Detection
- Whether teams run checks locally before pushing.
- Not observable from CI data alone — would need developer environment telemetry.

## Feasible with Current Data (deferred for time)

### Time-of-Day Failure Analysis
- Group failures by hour using `started_at` timestamps to detect patterns (e.g., failures correlating with high-load periods).
- Low effort, could reveal infrastructure-related flakiness.

### Job Parallelism Opportunities
- Identify sequential jobs in `workflows.json` that could run in parallel.
- Would require understanding job dependency graphs, which the mock data partially supports.

### Large Timeout Detection
- Flag tests with suspiciously high timeout values (5s, 10s) that suggest a test is papering over a race condition rather than fixing it.
- Could be extracted from failure messages that mention specific timeout values.

### Scan Scope Review
- Check whether CI jobs are inadvertently scanning `node_modules` or third-party code.
- Not observable from the current data shape — would need workflow YAML content.

### Per-Repo Detailed Reports
- Generate a focused report for each repository with its own health, failures, and recommendations.
- Architecture supports this (analyzers already group by repo), just needs a renderer.

## Production Evolution

### Live GitHub Actions Integration
- Replace static JSON files with `@octokit/rest` API calls:
  - `GET /repos/{owner}/{repo}/actions/runs` for run history
  - `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` for job details
- Paginate and cache results to respect rate limits.

### Trending & Before/After Comparison
- Store historical analysis results in SQLite or a time-series store.
- Compare week-over-week: is flakiness improving? Are CI minutes trending down?
- Enables DORA-style metrics over time.

### Scheduled Execution
- Run on a cron schedule (daily/weekly) via GitHub Actions.
- Post summary to Slack or create a GitHub issue with the priority table.

### Environment-Aware Testing
- Vary test depth by deployment target — run full e2e for production, fast suite for dev.
- Requires workflow configuration changes, not just analysis.

### Continue-on-Failure Workflow Optimization
- Configure CI to run all checks even when an earlier one fails, so developers get all errors in one pass.
- Detectable from the data (runs where only the first failing job is visible), actionable via workflow `continue-on-error` settings.
