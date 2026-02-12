# Patterns
The patterns I saw (which were covered partially in my initial notes):

Some of the tests are flaky:
* The stripe-mock service used in the giving-api integration tests is unreliable. 
* The signup test fails intermittently. Fails, no code changes, passes on re-run.
* The receipt dedupe test times out sporadically. Affects other developers who never touched that code.

These 3 flaky patterns were corroborated by the developer feedback.

Some of the tests had hard failures which represented real bugs that developers need to fix. Pipeline working as expected:
* Compiler errors like TS2322 and TS2345

The most problematic are the integration tests for giving-api. It runs 8 minutes into the pipeline. Every retry wastes the full run duration, plus developer focus. Multiply by frequency and affected developers and it's bad.

# What I'd do first
Fix the stripe-mock setup. It might be missing a health check or readiness wait on the service container. Depends on how mock or integrated it needs to be.

Find a way to quarantine volunteer portal e2e flaky test until it can be fixed properly. Maybe skip it or move it to a nightly run that's "out of band" with the regular pipeline. Skipping could be flags to skip all e2e, or perhaps paths to include or exclude certain tests on the pipeline run. This would also solve the issue where certain developers want more control over what gets tested.

Both of these seem like small fixes, not big projects.

# Live Data

Instead of using the static .json files... I'd use the GitHub Actions REST API. Do a GET for the run history and job details. Or if you don't want to do polling, attach a webhook to when the workflow/run is completed. Store the data in a database, perhaps Postgres or SQLite. Update the analyzers to use configuration and retrieve data from the database.

Schedule another GitHub Action to run the report(s) weekly and post them somewhere like GH Pages, or adds it to the job summary. I'd probably prefer to track the stats and DORA metrics over the long term for trending analysis. The issues to fix can be expired sooner, perhaps a month at most.
