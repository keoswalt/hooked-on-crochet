
import { useCallback } from 'react';

export const useDebounce = (callback: (value: string) => void, delay: number) => {
  const debouncedCallback = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          callback(value);
        }, delay);
      };
    })(),
    [callback, delay]
  );

  return debouncedCallback;
};
