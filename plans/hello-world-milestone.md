# Plan: CI Pipeline Health Analyzer — Hello World Milestone

## Goal

Prove a working toolchain end-to-end: TypeScript CLI → Markdown report → Vitest validation → GitHub Actions CI.

## Tech Stack

| Choice           | Decision                          |
|------------------|-----------------------------------|
| Language         | TypeScript (Node.js)              |
| Module system    | ESM (`"type": "module"`)          |
| Runner           | `tsx` — runs `.ts` directly       |
| Test framework   | Vitest                            |
| Output           | Markdown file (`report.md`)       |
| Data location    | `src/data/` (moved from context/) |

## File Structure

```
bloomerang/
├── .github/workflows/ci.yml    # GitHub Actions: install, test, generate, upload artifact
├── context/                    # Reference docs (project brief, repositories.md)
├── plans/                      # This file
├── src/
│   ├── data/                   # JSON data files (moved from context/)
│   │   ├── ci-run-history.json
│   │   ├── workflows.json
│   │   └── developer-feedback.json
│   ├── index.ts                # CLI entry point — generates report.md
│   └── report.test.ts          # Vitest tests validating report structure
├── package.json                # Scripts: generate, test
├── tsconfig.json               # ESM + strict TS config
└── report.md                   # Generated output (gitignored)
```

## Hello World Scope

### `src/index.ts`
- Writes a `report.md` file to the project root
- Contains placeholder sections that match the final report structure:
  - `# CI Pipeline Health Report`
  - `## Pipeline Health Summary`
  - `## Flaky Test Detection`
  - `## Improvement Recommendations`
- Each section has a brief placeholder paragraph
- Prints confirmation to stdout

### `src/report.test.ts`
- Runs the report generator
- Asserts `report.md` was created
- Asserts all expected section headers are present
- Cleans up generated file after tests

### `.github/workflows/ci.yml`
- Triggers on push and pull_request
- Steps: checkout → install Node 20 → `npm ci` → `npm test` → `npm run generate` → upload `report.md` as artifact

## Next Milestone (not in scope now)

Wire up `src/data/*.json` → real analysis → populate the three report sections with actual insights.
