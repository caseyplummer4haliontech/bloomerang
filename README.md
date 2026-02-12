# CI Pipeline Health Analyzer

A CLI tool that analyzes CI run data and produces a Markdown report with actionable insights — pipeline health summaries, flaky test detection, and prioritized improvement recommendations.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- npm

## Setup

```bash
npm install
```

## Usage

### Generate the report

```bash
npm run generate
```

Writes `report.md` to the project root.

### Run tests

```bash
npm test
```

Runs the Vitest suite that validates the report structure and output.

## Available Scripts

| Script             | Command              | Description                                      |
|--------------------|----------------------|--------------------------------------------------|
| `npm run generate` | `tsx src/index.ts`   | Generate `report.md` from CI data in `src/data/` |
| `npm test`         | `vitest run`         | Run all tests                                    |

## Project Structure

```
├── .github/workflows/ci.yml   # GitHub Actions workflow
├── context/                    # Project brief & reference docs
├── src/
│   ├── data/                   # CI run history, workflow defs, developer feedback (JSON)
│   ├── index.ts                # CLI entry point — generates report.md
│   └── report.test.ts          # Vitest tests for report structure
├── package.json
└── tsconfig.json
```
