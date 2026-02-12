import { describe, it, expect, afterAll } from "vitest";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateReport } from "./index.js";
import { writeFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const REPORT_PATH = join(PROJECT_ROOT, "report.md");

describe("CI Health Report", () => {
  // Generate the report once for all tests
  const report = generateReport();

  // Write it so we can also verify file output
  writeFileSync(REPORT_PATH, report, "utf-8");

  afterAll(() => {
    // Clean up generated file after tests
    if (existsSync(REPORT_PATH)) {
      unlinkSync(REPORT_PATH);
    }
  });

  it("should produce a non-empty string", () => {
    expect(report.length).toBeGreaterThan(0);
  });

  it("should contain the report title", () => {
    expect(report).toContain("# CI Pipeline Health Report");
  });

  it("should contain the Pipeline Health Summary section", () => {
    expect(report).toContain("## Pipeline Health Summary");
  });

  it("should contain the Flaky Test Detection section", () => {
    expect(report).toContain("## Flaky Test Detection");
  });

  it("should contain the Improvement Recommendations section", () => {
    expect(report).toContain("## Improvement Recommendations");
  });

  it("should write a valid file to disk", () => {
    expect(existsSync(REPORT_PATH)).toBe(true);
    const contents = readFileSync(REPORT_PATH, "utf-8");
    expect(contents).toBe(report);
  });

  it("should include a generated timestamp", () => {
    expect(report).toMatch(/Generated: \d{4}-\d{2}-\d{2}T/);
  });
});
