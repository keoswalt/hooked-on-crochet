# Unified Modal Component – Product Requirements Document (PRD)

## 1. Introduction / Overview
Current modal implementations across the application are inconsistent in appearance, behaviour, and responsiveness. Users sometimes encounter modals whose buttons are ordered differently, styled with varying colours, or which fail to scale on mobile, making actions impossible to complete.  
The goal of this initiative is to introduce **one** reusable `Modal` component that enforces a single source of truth for styling, behaviour, and accessibility across desktop and mobile devices.

## 2. Goals
1. Deliver a single, reusable `Modal` component available throughout the codebase.  
2. Ensure visual and behavioural consistency (colours, typography, spacing, button order).  
3. Provide complete keyboard and screen-reader accessibility.  
4. Fully support responsive layouts for mobile (≤ 640 px), tablet, and desktop breakpoints.  
5. Reduce modal-related CSS / JS footprint by ≥ 25 %.  
6. Eliminate all known "unusable on mobile" modal bugs.

## 3. User Stories
* **As a pattern creator**, I want to quickly add content to my project plan in a modal so I can stay on the current page.  
* **As a crochet artist**, I want to update my yarn stash in a modal from any device so I don't have to navigate away.  
* **As a site maintainer**, I want a single modal API so future features adopt the same look-and-feel with minimal effort.

## 4. Functional Requirements
1. **Reusable Component** – Expose a `<Modal>` (or `<Dialog>`) React component written in TypeScript, exporting typed props.  
2. **Slots / Sections** – Provide dedicated regions for **header** (optional icon + title), **body** (custom JSX), and **footer** (action buttons).  
3. **Default Actions** – When `primaryAction`/`secondaryAction` props aren't supplied, render **Cancel** (secondary) on the left and **Save** (primary) on the right using the design-system `Button` component.  
4. **Responsive Layout** –   
   a. Desktop ≥ 768 px: centred fixed-width dialog (max-w-lg), backdrop behind.  
   b. Mobile < 768 px: full-width sheet sliding from bottom, occupying ≤ 90 vh with internal scroll for overflow.  
5. **Focus Management** – Trap focus within the modal; restore focus to invoker on close.  
6. **Dismissal Controls** – Support closing via **ESC** key, backdrop click (configurable), and explicit button clicks.  
7. **Scroll Locking** – Prevent body scrolling while modal is open.  
8. **Accessibility** –   
   • Use ARIA roles `role="dialog"` (or `alertdialog` when destructive).  
   • Provide `aria-labelledby` & `aria-describedby` hooks.  
   • Announce to screen readers when opened.  
9. **Async States** – Accept `isLoading` prop on primary button to show spinner / disable actions.  
10. **Size Variants** – Support `sm | md | lg | full` width presets via prop.  
11. **Animation** – Use a fade + slight scale-in for desktop, slide-up for mobile; respect `prefers-reduced-motion`.  
12. **Theming** – Colours, borders, and typography must consume existing Tailwind CSS custom tokens (e.g., `text-primary`, `bg-surface`, etc.).  
13. **Testing** – Provide unit tests (React Testing Library) for open/close logic, focus trapping, and responsive variants.

## 5. Non-Goals (Out of Scope)
* Nested or stacked modals.  
* Toasts, snackbars, popovers, or lightweight confirmation dialogs that don't require full focus trapping.  
* In-modal routing or multi-step wizards (can be future work).

## 6. Design Considerations
* Align with existing Tailwind utility classes and custom design tokens.  
* Maintain 8-pt spacing system already used in the UI library.  
* Button ordering: **secondary (Cancel)** left, **primary (Save/Confirm)** right for LTR languages.  
* Provide Figma spec or updated component token sheet for future reference.

## 7. Technical Considerations
* React 18 with TypeScript.  
* Leverage a headless utility (e.g., Radix UI `Dialog`) or build from scratch, ensuring tree-shakable output.  
* Export strongly-typed props and helpers (e.g., `useModal()` hook for imperative open/close).  
* Integrate with existing context for toasts or query invalidation callbacks.  
* Ensure compatibility with server-side rendering (Next.js) even if not currently used.

## 8. Success Metrics
* 100 % of legacy modals replaced within two sprints.  
* Lighthouse accessibility score ≥ 95 on pages containing the modal.  
* < 1 bug per sprint related to modal behaviour post-rollout (measured via issue tracker).  
* ~25 % reduction in bundled CSS/JS related to modal implementations.  
* Positive qualitative feedback from at least 3 internal stakeholders during UAT.

## 9. Open Questions
1. Should destructive actions use a different colour scheme (e.g., red primary button) by default?  
2. Do we need built-in support for form validation summaries inside the modal footer?  
3. What is the deprecation plan for pages that still rely on third-party modal libraries?  
4. Is analytics tracking required for modal open/close events? 