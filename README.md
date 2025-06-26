# 🧶 Hooked on Crochet

## About
This is a passion project I created to experiment with integrating AI code assistants into my development process. It brings together two of my favorite mediums as a maker (yarn and software) and I enjoy tinkering with it as time allows.

## Structure
The app allows for four main types of content:
1. Yarn
2. Projects
3. Plans
4. Swatches

### Projects & Plans
**Plans** allow you to collect sources of inspiration and ideas including images, links, yarn from your stash, or swatches from your library. You can also link to projects from a plan once you're ready to start creating a pattern.

**Projects** should really be called patterns, and one of my goals is to eventually refactor the code and database schema to make this change. For now, just know that projects = patterns. They have an "edit" and a "make" mode, so you can draft a pattern and then easily change to make mode to track progress on a completed pattern as you work. The system will save your progress.

## Tech Stack
- Database: Supabase
- Code: Next.js, TypeScript, Tailwind CSS

## Cursor
I've experimented with various AI code assistants throughout this process, but for now Cursor is my tool of choice. There's a Cursor rules folder in the main directory that includes Markdown files created by Ryan Carson that he graciously open sourced and [can be accessed here](https://github.com/snarktank/ai-dev-tasks). Watch his interview on the [How I AI podcast](https://www.youtube.com/watch?v=fD4ktSkNCw4) to lean how to use them in your process.

## Local Code Evaluation & Analysis

You can reproduce the same checks that run in CI:

```bash
# Install dependencies
npm ci

# 1. Static analysis (ESLint & TypeScript strict)
npm run analysis:static

# 2. Dependency vulnerability scan
npm run dep-scan

# 3. Summarize findings
npm run summary:prss

# 4. Convert the summary into a task checklist
npx tsx scripts/convert-summary-to-tasks.ts
```

All generated reports live in the `reports/` directory, and the remediation checklist is written to `tasks/TASKS.md`.
