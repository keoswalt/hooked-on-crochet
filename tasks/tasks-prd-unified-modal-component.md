## Relevant Files

- `src/ui/modal.tsx` – New unified Modal component implementing the core API, styling, and behaviour.
- `src/ui/dialog.tsx` – Existing dialog implementation; will be reviewed/refactored or deprecated once the new modal is in place.
- `src/ui/alert-dialog.tsx` – Alert-style dialog that may leverage the new modal for consistent styling.
- `src/ui/custom-confirmation-dialog.tsx` – Confirmation dialog to migrate to the new modal component.
- `src/ui/delete-confirmation-dialog.tsx` – Delete-confirmation dialog to migrate to the new modal component.
- `src/ui/modal.test.tsx` – Unit tests for the new modal component.
- `src/pages/ModalPlayground.tsx` – Development playground page to manually test the unified Modal component.

### Notes

- Unit tests should live alongside the components they test (e.g., `modal.tsx` and `modal.test.tsx`).
- Use `npx jest` to run the full test suite or target individual test files as needed.

## Tasks

- [ ] 1.0 Scaffold Unified Modal Component
  - [x] 1.1 Create `src/ui/modal.tsx` with basic React component and typed props (`isOpen`, `onClose`, `title`, `children`, etc.).
  - [x] 1.2 Render modal content inside a React portal (`<div id="modal-root">`) to avoid z-index conflicts.
  - [x] 1.3 Add structural elements: backdrop, container, header, body, footer slots.
  - [x] 1.4 Stub utility helpers for focus trap and scroll lock (to be implemented later).
  - [x] 1.5 Add Storybook/Playground entry or temporary route for manual review.

- [ ] 2.0 Implement Styling & Responsive Design
  - [x] 2.1 Apply Tailwind classes for desktop layout (centered, `max-w-lg`, rounded corners, shadow).
  - [x] 2.2 Add mobile sheet variant: full-width panel sliding up, height ≤ 90vh with internal scroll area.
  - [x] 2.3 Implement animation using Tailwind transitions; respect `prefers-reduced-motion`.
  - [x] 2.4 Wire up size variants (`sm`, `md`, `lg`, `full`) via `size` prop.
  - [x] 2.5 Integrate design tokens for colours, spacing, typography.
  - [x] 2.6 Provide default action buttons (**Cancel** left, **Save/Confirm** right) using existing `Button` component.
  - [x] 2.7 Document theming and variant usage in component JSDoc and Storybook.

- [ ] 3.0 Add Accessibility & Core Behaviours (focus, dismissal, scroll-lock)
  - [ ] 3.1 Implement focus trap to keep focus within modal while open.
  - [ ] 3.2 Restore focus to triggering element on close.
  - [ ] 3.3 Close modal on **ESC** key press.
  - [ ] 3.4 Optional backdrop click to close (configurable via prop).
  - [ ] 3.5 Lock body scroll while modal is open; restore on close.
  - [ ] 3.6 Add ARIA roles (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and ensure header/body IDs link correctly.
  - [ ] 3.7 Ensure colour contrast meets WCAG AA.
  - [ ] 3.8 Add `isLoading` prop handling (disable buttons, show spinner).

- [ ] 4.0 Create Test Suite (unit & integration)
  - [ ] 4.1 Write tests for open/close logic via prop changes.
  - [ ] 4.2 Test focus trapping and restoration using `@testing-library/user-event`.
  - [ ] 4.3 Verify ESC and backdrop dismissal paths.
  - [ ] 4.4 Snapshots/visual tests for responsive variants (desktop vs. mobile).
  - [ ] 4.5 Accessibility audit with `jest-axe`.
  - [ ] 4.6 Achieve ≥ 90 % line coverage for `modal.tsx`.

- [ ] 5.0 Migrate Existing Modals & Update Documentation
  - [ ] 5.1 Refactor `src/ui/alert-dialog.tsx` to wrap new `Modal`.
  - [ ] 5.2 Refactor `src/ui/confirmation-dialog.tsx`, `custom-confirmation-dialog.tsx`, and `delete-confirmation-dialog.tsx`.
  - [ ] 5.3 Search codebase for legacy `<Dialog>` usages and replace with new component.
  - [ ] 5.4 Delete deprecated modal code and styles after successful migration.
  - [ ] 5.5 Update README / contributor docs with usage examples and guidelines.
  - [ ] 5.6 Perform manual QA on key pages (Planner, Projects, Stash) on desktop and mobile.
  - [ ] 5.7 Monitor production logs/analytics for modal-related errors post-deployment. 