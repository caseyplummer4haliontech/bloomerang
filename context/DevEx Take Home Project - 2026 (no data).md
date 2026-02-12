**Take-Home Project: CI Pipeline Health**

**Analyzer**

# Background

Bloomerang's engineering org has grown to **8 teams** shipping across **12 repositories**. Our CI/CD runs on **GitHub Actions**, and while things mostly work, engineers are increasingly frustrated. Builds feel slow, flaky tests erode trust, and nobody has a clear picture of which pipelines need the most attention. When someone asks *"Why did the build take 22 minutes?"* or *"Is this test actually flaky or did I break something?"*, the answer requires manually clicking through dozens of GitHub Actions run logs.

As a Developer Experience engineer, your job is to turn raw CI data into actionable insight. Build a **working prototype** that helps an engineering team understand where their CI pipelines are hurting and what to fix first.

# The Workflows

Each repo has a ci.yml workflow triggered on pull requests. The workflows share a similar structure but differ in steps and duration.

# Mock Data

Use the data below to seed your tool. Store it however you like (JSON files, SQLite, in-memory, etc.).

## 1. Workflow Definitions

See workflows.json

## 2. CI Run History (last 30 days)

Each run includes per-job results. Status is success, failure, or cancelled.

See ci-run-history.json

## 3. Developer Feedback (collected from a recent internal survey)

See developer-feedback.json

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
