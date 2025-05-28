
import { useState, useRef, useEffect } from 'react';

export const useStickyHeader = () => {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Setting up intersection observer');
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection observer triggered:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          rootBounds: entry.rootBounds
        });
        
        const shouldBeSticky = !entry.isIntersecting;
        console.log('Setting isSticky to:', shouldBeSticky);
        setIsSticky(shouldBeSticky);
      },
      { 
        threshold: 0,
        rootMargin: '0px'
      }
    );

    if (sentinelRef.current) {
      console.log('Observer attached to sentinel element');
      observer.observe(sentinelRef.current);
    } else {
      console.log('Sentinel element not found');
    }

    return () => {
      console.log('Cleaning up intersection observer');
      observer.disconnect();
    };
  }, []);

  // Add effect to log when isSticky changes
  useEffect(() => {
    console.log('isSticky state changed to:', isSticky);
  }, [isSticky]);

  return { isSticky, sentinelRef };
};
