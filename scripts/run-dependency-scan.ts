import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function runAudit(): any {
  try {
    const json = execSync("npm audit --json", { encoding: "utf8" });
    return JSON.parse(json);
  } catch (error: any) {
    // npm audit exits with code 1 when vulnerabilities are found but still outputs JSON
    if (error.stdout) {
      return JSON.parse(error.stdout.toString());
    }
    throw error;
  }
}

function getDateStamp() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

function generateMarkdown(auditData: any, date: string): string {
  const counts = auditData.metadata?.vulnerabilities ?? {};
  const severities = ["critical", "high", "moderate", "low", "info"] as const;

  const lines: string[] = [];
  lines.push(`# Dependency Scan Report – ${date}`);
  lines.push("\n## Summary\n");
  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  severities.forEach((sev) => {
    if (counts[sev] !== undefined) {
      lines.push(`| ${sev[0].toUpperCase() + sev.slice(1)} | ${counts[sev]} |`);
    }
  });

  lines.push("\n## Raw npm audit JSON (truncated)\n");
  const raw = JSON.stringify(auditData, null, 2);
  lines.push("```json\n" + raw.slice(0, 5000) + (raw.length > 5000 ? "\n ... (truncated) ..." : "") + "\n```\n");
  return lines.join("\n");
}

function main() {
  const date = getDateStamp();
  const reportsDir = join(process.cwd(), "reports");
  mkdirSync(reportsDir, { recursive: true });

  console.log("Running npm audit…");
  const auditData = runAudit();
  const markdown = generateMarkdown(auditData, date);

  const reportPath = join(reportsDir, `dependency-scan-${date}.md`);
  writeFileSync(reportPath, markdown, "utf8");
  console.log(`Dependency scan report generated at ${reportPath}`);
}

main(); 