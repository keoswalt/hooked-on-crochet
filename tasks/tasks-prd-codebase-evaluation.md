## Relevant Files

- `.github/workflows/code-evaluation.yml` - CI workflow to run static analysis and dependency scanning on every push and pull request.
- `scripts/run-static-analysis.ts` - Executes ESLint and TypeScript strict checks, outputs Markdown report.
- `scripts/run-dependency-scan.ts` - Runs chosen dependency vulnerability scanner and outputs Markdown report.
- `scripts/generate-prss-summary.ts` - Aggregates analysis outputs and categorizes findings by severity.
- `scripts/convert-summary-to-tasks.ts` - Converts the PRSS summary report into a prioritized TASKS.md checklist.
- `scripts/__tests__/convert-summary-to-tasks.test.ts` - Unit tests for the summary-to-tasks transformation logic.
- `eslint.config.js` - Extended to include recommended, TypeScript, React, and security rule sets.
- `tsconfig.json` - Updated to enable strict compiler options.
- `package.json` - Adds NPM scripts and devDependencies for analysis tooling and CI integration.

### Notes

- Unit tests live beside the scripts they cover (e.g., `scripts/convert-summary-to-tasks.ts` and `scripts/__tests__/convert-summary-to-tasks.test.ts`).
- Use `npm run lint`, `npm run type-check`, and `npm run dep-scan` to run analyses locally.
- Run all tests with `npm test` (powered by Jest).

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