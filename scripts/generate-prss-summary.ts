import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

interface DependencySummary {
  critical?: number;
  high?: number;
  moderate?: number;
  low?: number;
  info?: number;
}

interface PRSSSummary {
  date: string;
  dependency: DependencySummary;
  eslintIssues: number;
  tsIssues: number;
}

function parseDependencyReport(path: string): DependencySummary {
  const content = readFileSync(path, "utf8");
  const summary: DependencySummary = {};
  const tableRegex = /\|\s*(Critical|High|Moderate|Low|Info)\s*\|\s*(\d+)\s*\|/gi;
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const sev = match[1].toLowerCase() as keyof DependencySummary;
    summary[sev] = Number(match[2]);
  }
  return summary;
}

function parseStaticReport(path: string): { eslint: number; tsc: number } {
  const content = readFileSync(path, "utf8");
  // Count ESLint problems: we expect a summary line like "✖ 1272 problems (1244 errors, 28 warnings)"
  const eslintMatch = /✖\s+(\d+)\s+problems/?.exec(content);
  const eslintIssues = eslintMatch ? Number(eslintMatch[1]) : 0;

  // Count TypeScript errors: we capture lines like "Found 86 errors"
  const tsMatch = /Found\s+(\d+)\s+errors?/.exec(content);
  const tsIssues = tsMatch ? Number(tsMatch[1]) : 0;
  return { eslint: eslintIssues, tsc: tsIssues };
}

function getLatestReport(pattern: RegExp): string | null {
  const reportsDir = join(process.cwd(), "reports");
  // Node 18+ fs.readdirSync with { withFileTypes: true }
  const files = readdirSync(reportsDir);
  const matched = files.filter((f: string) => pattern.test(f));
  if (matched.length === 0) return null;
  // sort descending
  matched.sort().reverse();
  return join(reportsDir, matched[0]);
}

function main() {
  const staticPath = getLatestReport(/^static-analysis-\d+\.md$/);
  const depPath = getLatestReport(/^dependency-scan-\d+\.md$/);
  if (!staticPath || !depPath) {
    console.error("Missing report files. Ensure static analysis and dependency scan reports exist.");
    process.exit(1);
  }

  const date = basename(staticPath).match(/\d+/)?.[0] ?? new Date().toISOString().slice(0, 10);
  const depSummary = parseDependencyReport(depPath);
  const { eslint: eslintIssues, tsc: tsIssues } = parseStaticReport(staticPath);

  const summary: PRSSSummary = {
    date,
    dependency: depSummary,
    eslintIssues,
    tsIssues,
  };

  const summaryDir = join(process.cwd(), "reports");
  mkdirSync(summaryDir, { recursive: true });
  const summaryPath = join(summaryDir, `prss-summary-${date}.json`);
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`PRSS summary written to ${summaryPath}`);
}

main(); 