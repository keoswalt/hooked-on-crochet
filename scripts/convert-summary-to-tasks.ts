import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { pathToFileURL } from "node:url";

interface SeverityCounts {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  info: number;
}

interface PRSSSummary {
  date: string;
  dependency: {
    critical?: number;
    high?: number;
    moderate?: number;
    low?: number;
    info?: number;
  };
  eslintIssues: number;
  tsIssues: number;
  severitySummary: SeverityCounts;
}

function getLatestSummary(): { path: string; date: string } | null {
  const reportsDir = join(process.cwd(), "reports");
  const files = readdirSync(reportsDir);
  const matched = files.filter((f) => /^prss-summary-\d+\.json$/.test(f));
  if (matched.length === 0) return null;
  matched.sort().reverse();
  const latest = matched[0];
  const date = latest.match(/\d+/)?.[0] ?? "";
  return { path: join(reportsDir, latest), date };
}

function generateTasks(summary: PRSSSummary): string {
  const { severitySummary, dependency, eslintIssues, tsIssues, date } = summary;
  const lines: string[] = [];
  lines.push(`# Remediation Tasks – ${date}`);
  lines.push("");

  const order: (keyof SeverityCounts)[] = [
    "critical",
    "high",
    "moderate",
    "low",
    "info",
  ];

  const pushRemediation = (docUrl: string, cmd?: string) => {
    if (cmd) {
      lines.push("  ```bash");
      lines.push(`  ${cmd}`);
      lines.push("  ```");
    }
    lines.push(`  - Docs: ${docUrl}`);
  };

  order.forEach((sev) => {
    const count = severitySummary[sev] ?? 0;
    const label = sev.charAt(0).toUpperCase() + sev.slice(1);
    lines.push(`## ${label}`);
    lines.push("");

    if (sev === "high" && tsIssues > 0) {
      lines.push(`- [ ] Fix ${tsIssues} TypeScript strict error${tsIssues === 1 ? "" : "s"}`);
      pushRemediation(
        "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html#strict-checking",
        "npm run type-check"
      );
    }

    if (sev === "moderate" && eslintIssues > 0) {
      lines.push(`- [ ] Resolve ${eslintIssues} ESLint issue${eslintIssues === 1 ? "" : "s"}`);
      pushRemediation("https://eslint.org/docs/latest/use/getting-started", "npm run lint -- --fix");
    }

    const depCount = dependency[sev] ?? 0;
    if (depCount > 0) {
      lines.push(
        `- [ ] Address ${depCount} ${label} dependency vulnerabilit${depCount === 1 ? "y" : "ies"}`
      );
      pushRemediation("https://docs.npmjs.com/auditing-package-dependencies", "npm audit fix");
    }

    if (count === 0) {
      lines.push("- [ ] No issues at this level – review and close.");
    }
    lines.push("");
  });

  return lines.join("\n");
}

export { generateTasks };

// Call main only when this file is run directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

function main() {
  const latest = getLatestSummary();
  if (!latest) {
    console.error("No summary report found. Run summary:prss first.");
    process.exit(1);
  }
  const raw = readFileSync(latest.path, "utf8");
  const data = JSON.parse(raw) as PRSSSummary;

  const tasksContent = generateTasks(data);

  const tasksDir = join(process.cwd(), "tasks");
  mkdirSync(tasksDir, { recursive: true });
  const tasksPath = join(tasksDir, "TASKS.md");
  writeFileSync(tasksPath, tasksContent, "utf8");
  console.log(`TASKS written to ${tasksPath}`);
} 