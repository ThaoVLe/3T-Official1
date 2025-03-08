
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export function useLazyEntries(allEntries: any[]) {
  const [visibleEntries, setVisibleEntries] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastScrollPosition = useRef(0);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initial load - get first set of entries
  useEffect(() => {
    if (allEntries.length > 0 && visibleEntries.length === 0) {
      const initialCount = Math.min(10, allEntries.length);
      setVisibleEntries(allEntries.slice(0, initialCount));
    }
  }, [allEntries]);

  // Update visible entries based on scroll position
  useEffect(() => {
    if (!allEntries.length) return;

    const handleScroll = () => {
      // Determine scroll direction
      const scrollPosition = window.scrollY;
      const scrollingDown = scrollPosition > lastScrollPosition.current;
      lastScrollPosition.current = scrollPosition;
      
      // Find approximate position in entries list based on scroll position
      const scrollPercentage = scrollPosition / (document.body.scrollHeight - window.innerHeight);
      const approximateIndex = Math.floor(scrollPercentage * allEntries.length);
      
      // Prevent unnecessary updates - only update if significant scroll
      if (Math.abs(approximateIndex - currentIndex) < 3) return;
      
      setCurrentIndex(approximateIndex);
      setIsLoading(true);
      
      // Get entries centered around the current position (10 entries total)
      // Show more entries ahead of user when scrolling down, more behind when scrolling up
      const offset = scrollingDown ? 3 : 6;
      const startIndex = Math.max(0, approximateIndex - offset);
      const endIndex = Math.min(allEntries.length, startIndex + 10);
      
      // Small timeout to simulate network request and prevent jank
      setTimeout(() => {
        setVisibleEntries(allEntries.slice(startIndex, endIndex));
        setIsLoading(false);
      }, 50);
    };

    // Throttle scroll events for performance
    let throttleTimeout: number | null = null;
    const throttledScroll = () => {
      if (!throttleTimeout) {
        throttleTimeout = window.setTimeout(() => {
          handleScroll();
          throttleTimeout = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (throttleTimeout) window.clearTimeout(throttleTimeout);
    };
  }, [allEntries, currentIndex]);

  // Create a loadingRef function for compatibility
  const loadingRef = (node: HTMLDivElement) => {
    if (node) {
      ref(node);
    }
  };

  return { visibleEntries, loadingRef, isLoading };
}
