import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" });
  } catch (error: any) {
    // execSync throws on non-zero exit codes – capture output anyway
    return error.stdout?.toString() ?? error.message;
  }
}

function getDateStamp() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

function main() {
  const date = getDateStamp();
  const reportsDir = join(process.cwd(), "reports");
  mkdirSync(reportsDir, { recursive: true });

  console.log("Running ESLint…");
  const eslintOutput = runCommand("npm run lint --silent");

  console.log("Running TypeScript strict checks…");
  const tscOutput = runCommand("npm run type-check --silent");

  const reportLines: string[] = [];
  reportLines.push(`# Static Analysis Report – ${date}`);
  reportLines.push("\n## ESLint Output\n");
  reportLines.push("```\n" + (eslintOutput || "No issues found.") + "\n```");
  reportLines.push("\n## TypeScript Strict Output\n");
  reportLines.push("```\n" + (tscOutput || "No issues found.") + "\n```");

  const reportPath = join(reportsDir, `static-analysis-${date}.md`);
  writeFileSync(reportPath, reportLines.join("\n"), "utf8");
  console.log(`Static analysis report generated at ${reportPath}`);
}

main(); 