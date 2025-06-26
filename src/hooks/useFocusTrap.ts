import * as React from "react";

/**
 * Stub for a focus-trap hook.
 *
 * @param enabled – Whether trapping is active.
 * @param containerRef – Ref to the element whose descendants should retain focus.
 *
 * NOTE: This is only a placeholder implementation for sub-task 1.4.
 * Proper focus management will be implemented in later subtasks.
 */
export function useFocusTrap(
  enabled: boolean,
  containerRef: React.RefObject<HTMLElement | null>
) {
  React.useEffect(() => {
    if (!enabled) return;

    // TODO: Implement focus trapping logic (e.g. using tabbable elements list).
    // For now, we simply log when the trap would be activated.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[useFocusTrap] Focus trap is enabled – implementation pending.");
    }

    // Cleanup placeholder.
    return () => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[useFocusTrap] Focus trap cleanup – implementation pending.");
      }
    };
  }, [enabled, containerRef]);
} 