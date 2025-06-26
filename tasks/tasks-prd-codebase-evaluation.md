## Relevant Files

- `.github/workflows/code-evaluation.yml` - CI workflow that installs dependencies, runs analysis tools, and publishes report artifacts.
- `scripts/run-static-analysis.ts` - Executes ESLint & TypeScript strict checks, outputs Markdown report.
- `scripts/run-dependency-scan.ts` - Runs npm audit and outputs Markdown report.
- `scripts/generate-prss-summary.ts` - Aggregates analysis outputs and summarizes findings by severity.
- `scripts/convert-summary-to-tasks.ts` - Converts the PRSS summary report into a prioritized TASKS.md checklist.
- `eslint.config.js` - Extended ESLint configuration with TypeScript, React, security, and Prettier rule sets.
- `tsconfig.json` - Strict compiler options enabled for TypeScript.
- `package.json` - NPM scripts & devDependencies for analysis tooling and CI integration.

### Notes

- Unit tests should live beside the scripts they cover (e.g., `scripts/convert-summary-to-tasks.test.ts`).
- Run analysis locally with `npm run lint`, `npm run type-check`, and `npm run dep-scan`.
- All reports live in the `/reports/` directory for easy access.

## Tasks

- [x] 1.0 Configure and run static code analysis across the repository (ESLint, TypeScript strict checks, security plugins)
  - [x] 1.1 Review existing `eslint.config.js` and `tsconfig.json` for current settings
  - [x] 1.2 Install/upgrade ESLint, TypeScript, `@typescript-eslint/*`, `eslint-plugin-security`, and Prettier as dev dependencies
  - [x] 1.3 Extend ESLint configuration to include recommended, TypeScript, React, and security rule sets
  - [x] 1.4 Enable `strict` and related compiler options in `tsconfig.json`
  - [x] 1.5 Add `lint` and `type-check` scripts to `package.json`
  - [x] 1.6 Run analysis and export results to `/reports/static-analysis-YYYYMMDD.md`

- [x] 2.0 Configure and run dependency vulnerability scanning (npm audit or Snyk CLI)
  - [x] 2.1 Evaluate Snyk vs `npm audit` and choose the preferred tool (Decision: use built-in `npm audit` for simplicity, no external account required)
  - [x] 2.2 Install and configure the chosen scanner (added `scripts/run-dependency-scan.ts` using npm audit)
  - [x] 2.3 Add `dep-scan` script to `package.json`
  - [x] 2.4 Execute scan and export results to `/reports/dependency-scan-YYYYMMDD.md`

- [ ] 3.0 Generate a Markdown report summarizing and categorizing findings by severity
  - [x] 3.1 Implement `generate-prss-summary.ts` to parse static and dependency reports
  - [x] 3.2 Map each finding to a severity level (Critical, High, Moderate, Low, Informational)
  - [x] 3.3 Compile combined report `/reports/prss-summary-YYYYMMDD.md`
  - [x] 3.4 Verify summary report formatting with Prettier

- [x] 4.0 Transform findings into a prioritized Markdown task list grouped by category
  - [x] 4.1 Implement `convert-summary-to-tasks.ts` to convert the summary report into `TASKS.md`
  - [x] 4.2 Sort tasks by severity (Critical → Informational) and add checkboxes
  - [x] 4.3 Attach remediation links or code examples for each task
  - [x] 4.4 Save generated `TASKS.md` into the `/tasks/` directory
  - [x] 4.5 Write unit tests for the transformation logic (`convert-summary-to-tasks.test.ts`)

- [x] 5.0 Integrate analysis and reporting into the GitHub Actions CI workflow
  - [x] 5.1 Create `.github/workflows/code-evaluation.yml`
  - [x] 5.2 Set up Node environment, install dependencies, and run `npm run lint && npm run type-check && npm run dep-scan`
  - [x] 5.3 Run summary and task-generation scripts as CI steps
  - [x] 5.4 Upload all report artifacts for pull-request visibility
  - [x] 5.5 Fail CI if Critical vulnerabilities or type errors are detected
  - [x] 5.6 Update `README.md` with instructions to run analysis locally 