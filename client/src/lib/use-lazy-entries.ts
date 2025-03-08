
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

  // Update visible entries when scrolling or on mount
  useEffect(() => {
    // Initial load - first 10 entries
    if (allEntries.length > 0 && visibleEntries.length === 0) {
      setVisibleEntries(allEntries.slice(0, 10));
      return;
    }

    const handleScroll = () => {
      // Determine scroll direction
      const scrollPosition = window.scrollY;
      const scrollingDown = scrollPosition > lastScrollPosition.current;
      lastScrollPosition.current = scrollPosition;
      
      // Find approximate position in entries list based on scroll position
      const scrollPercentage = scrollPosition / (document.body.scrollHeight - window.innerHeight);
      const approximateIndex = Math.floor(scrollPercentage * allEntries.length);
      
      // Prevent unnecessary updates
      if (Math.abs(approximateIndex - currentIndex) < 3) return;
      
      setCurrentIndex(approximateIndex);
      
      // Get 10 entries around current position
      const startIndex = Math.max(0, approximateIndex - (scrollingDown ? 3 : 6));
      const endIndex = Math.min(allEntries.length, startIndex + 10);
      
      setVisibleEntries(allEntries.slice(startIndex, endIndex));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allEntries, currentIndex]);

  return { visibleEntries, loadingRef: ref, isLoading: inView };
}
