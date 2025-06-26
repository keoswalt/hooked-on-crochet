import { strict as assert } from "assert";
import { generateTasks } from "./convert-summary-to-tasks";

const mockSummary = {
  date: "20250626",
  dependency: {
    critical: 1,
    high: 0,
    moderate: 2,
    low: 0,
    info: 0,
  },
  eslintIssues: 5,
  tsIssues: 3,
  severitySummary: {
    critical: 1,
    high: 3, // includes tsIssues
    moderate: 7, // includes eslintIssues
    low: 0,
    info: 0,
  },
};

const output = generateTasks(mockSummary as any);

assert.ok(output.includes("## Critical"), "Should include Critical heading");
assert.ok(
  output.includes("- [ ] Address 1 Critical dependency vulnerability"),
  "Should include critical dependency task"
);
assert.ok(
  output.includes("- [ ] Fix 3 TypeScript strict errors"),
  "Should include TS errors task"
);
assert.ok(
  output.includes("- [ ] Resolve 5 ESLint issues"),
  "Should include ESLint issues task"
);

console.log("convert-summary-to-tasks tests passed."); 