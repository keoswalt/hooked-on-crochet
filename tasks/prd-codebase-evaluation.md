# Codebase Evaluation & Refactor Initiative (PRSS)

## 1. Introduction / Overview
The purpose of this initiative is to perform a comprehensive evaluation of the *Hooked-on-Crochet* codebase with an emphasis on **P**erformance, **R**eliability, **S**ecurity, and **S**calability (PRSS). The outcome will be a set of actionable recommendations—delivered as a Markdown task list—that the solo developer can follow to remediate vulnerabilities, refactor poor implementation practices, and generally improve code quality. No database schema changes are in scope for this effort.

## 2. Goals
1. Identify and document all critical, high, and moderate vulnerabilities or code smells in the repository.
2. Provide a prioritized, easy-to-follow Markdown task list of remediation items.
3. Achieve a consistent, maintainable codebase structure that enables future issues to be identified and resolved quickly.
4. Integrate static analysis and dependency-checking tools into the development workflow to prevent regressions.

## 3. User Stories
| ID | User Story |
|----|------------|
| US-1 | **As the solo developer**, I want an automated report of code vulnerabilities so that I can remediate them efficiently. |
| US-2 | **As the solo developer**, I want a prioritized Markdown task list so that I know which issues to tackle first. |
| US-3 | **As the solo developer**, I want the evaluation to run in CI so that new pull requests do not introduce additional issues. |

## 4. Functional Requirements
1. The system **MUST** run static code analysis (e.g., ESLint, TypeScript compiler, security linters) across the entire repository.
2. The system **MUST** perform dependency vulnerability scanning (e.g., `npm audit`, Snyk, or similar).
3. The system **MUST** generate a Markdown report summarizing findings, categorized by severity (Critical, High, Moderate, Low, Informational).
4. The system **MUST** transform the findings into a Markdown task list file (`TASKS.md`) grouped by category and prioritized by severity.
5. The system **MUST** integrate with the existing CI workflow (GitHub Actions or equivalent) to run on every push and pull request.
6. The system **MUST** exclude database schema migrations and config files located in `/supabase/migrations` from automated refactors.
7. The system **SHOULD** include recommendations for code structure improvements (e.g., modularization, dead-code removal, consistent hooks usage).
8. The system **SHOULD** include documentation links or examples for each recommended remediation.

## 5. Non-Goals (Out of Scope)
- Altering database schemas or migration files.
- Implementing a user-facing UI or dashboard.
- Live penetration testing or runtime fuzzing.

## 6. Design Considerations (Optional)
- Reports and task lists will be stored in the repository root (e.g., `/reports/` and `/tasks/` directories) for easy access.
- Use existing linting configurations (`eslint.config.js`, `tsconfig.json`, etc.) as a starting point and extend as necessary.

## 7. Technical Considerations (Optional)
- **Static Analysis Tools:** ESLint (with security plugins), TypeScript compiler strict options.
- **Dependency Scanning:** `npm audit`, Snyk CLI, or OWASP Dependency-Check.
- **CI Integration:** GitHub Actions workflow that installs dependencies, runs analyses, and publishes artifacts.
- **Formatting:** Use Prettier to ensure consistent Markdown and code formatting.

## 8. Success Metrics
| Metric | Target |
|--------|--------|
| Critical vulnerabilities after remediation | 0 |
| High vulnerabilities after remediation | ≤ 2 (with mitigation plan) |
| CI build step "Code Evaluation" pass rate | ≥ 95 % over 30 days |
| Average turnaround time on new issues | ≤ 2 days |

## 9. Open Questions
1. Which specific security ESLint rules or plugins should we enable (e.g., `eslint-plugin-security`, `eslint-plugin-react`, etc.)?
2. Which dependency-scanner (Snyk vs. npm audit) fits best with project constraints (cost, licensing)?
3. Should we include performance profiling in scope (e.g., bundle size analysis) during this initiative, or defer to a later phase? 