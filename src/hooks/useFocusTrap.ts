import * as React from "react";

/**
 * Trap keyboard focus inside a given container element while `enabled` is true.
 *
 * This implementation:
 *  • Automatically moves focus into the container when it becomes active.
 *  • Cycles focus with Tab / Shift+Tab between focusable descendants.
 *  • Ignores elements that are disabled or not displayed (offsetParent === null).
 *
 * NOTE: Restoring focus to the triggering element when the trap is disabled
 * will be handled in a later sub-task (3.2).
 */
export function useFocusTrap(
  enabled: boolean,
  containerRef: React.RefObject<HTMLElement | null>
) {
  React.useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    // Selector based on https://www.w3.org/TR/html-aria/#docconformance
    const focusableSelector = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    /** Utility to return only visible, focusable elements */
    const getFocusableElements = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled') && (el.offsetParent !== null || getComputedStyle(el).position === 'fixed')
      );

    // Move initial focus inside the modal if focus is outside.
    const focusableEls = getFocusableElements();
    if (focusableEls.length) {
      if (!container.contains(document.activeElement)) {
        focusableEls[0].focus();
      }
    } else {
      // Fallback: focus the container itself if focusable children are absent.
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (!elements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const isShift = event.shiftKey;
      const activeElement = document.activeElement as HTMLElement | null;

      if (isShift) {
        if (activeElement === firstElement || !container.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[useFocusTrap] Focus trap active.');
    }

    // Cleanup on disable/unmount.
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[useFocusTrap] Focus trap deactivated.');
      }
    };
  }, [enabled, containerRef]);
} 