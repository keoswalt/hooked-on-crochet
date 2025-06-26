import * as React from "react";

/**
 * Temporarily locks body scroll while `enabled` is true.
 * This is a minimal implementation that may be revisited for
 * iOS compatibility and nested modals in later subtasks.
 */
export function useScrollLock(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [enabled]);
} 