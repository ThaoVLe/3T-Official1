import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Store scroll position when component is unmounted or before navigation
  useEffect(() => {
    const storeScrollPosition = () => {
      const container = document.querySelector('.diary-content');
      if (container) {
        // Use sessionStorage instead of localStorage for better session handling
        sessionStorage.setItem('homeScrollPosition', String(container.scrollTop));
        console.log('Stored scroll position before unload:', container.scrollTop);
      }
    };

    // Add event listener for page visibility change and beforeunload
    window.addEventListener('visibilitychange', storeScrollPosition);
    window.addEventListener('beforeunload', storeScrollPosition);

    return () => {
      storeScrollPosition(); // Store position when component unmounts
      window.removeEventListener('visibilitychange', storeScrollPosition);
      window.removeEventListener('beforeunload', storeScrollPosition);
    };
  }, []);

  // Handle scroll restoration
  useEffect(() => {
    if (!entries || entries.length === 0 || scrollRestoredRef.current) return;

    const restoreScroll = () => {
      const lastViewedEntryId = sessionStorage.getItem('lastViewedEntryId');
      const container = document.querySelector('.diary-content');

      if (container) {
        console.log('Attempting to scroll to entry:', lastViewedEntryId);

        // If we have a specific entry ID, prioritize scrolling to that element
        if (lastViewedEntryId) {
          // Create a temporary overlay to hide the scroll animation
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.inset = '0';
          overlay.style.backgroundColor = 'white';
          overlay.style.zIndex = '9999';
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 150ms ease';
          document.body.appendChild(overlay);

          // Flash the overlay to create a "blink" effect
          requestAnimationFrame(() => {
            overlay.style.opacity = '1';

            requestAnimationFrame(() => {
              const entryElement = document.getElementById(`entry-${lastViewedEntryId}`);
              if (entryElement) {
                // Instantly scroll to the position without animation
                console.log('Scrolled to entry card:', lastViewedEntryId);
                entryElement.scrollIntoView({ behavior: 'instant' });
                scrollRestoredRef.current = true;
              } else {
                // Fallback to position-based scrolling if entry not found
                const savedPosition = sessionStorage.getItem('homeScrollPosition');
                if (savedPosition) {
                  const position = parseInt(savedPosition, 10);
                  console.log('Falling back to position-based scroll:', position);
                  container.scrollTop = position;
                  console.log('Scroll position restored to:', position);
                  scrollRestoredRef.current = true;
                }
              }

              // Remove the overlay with a fade out
              setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                  document.body.removeChild(overlay);
                }, 150);
              }, 50);
            });
          });

          return;
        }

        // Fallback to position-based scrolling if entry not found
        const savedPosition = sessionStorage.getItem('homeScrollPosition');
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          console.log('Falling back to position-based scroll:', position);

          // Force reflow to ensure DOM is ready
          container.scrollTop = 0;
          setTimeout(() => {
            container.scrollTop = position;
            console.log('Scroll position restored to:', position);

            // Mark as restored
            scrollRestoredRef.current = true;
          }, 150);
        }
      }
    };

    // Try just once with a small delay to ensure DOM is ready
    const t1 = setTimeout(restoreScroll, 100);

    return () => {
      clearTimeout(t1);
    };
  }, [entries]); // Run when entries are loaded

  // Reset the restoration flag when unmounting
  useEffect(() => {
    return () => {
      scrollRestoredRef.current = false;
    };
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content mobile-scroll"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          touchAction: 'pan-y pinch-zoom',
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'none',
        }}
      >
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!entries?.length) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome to Your Diary
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Start capturing your memories with text, photos, videos, and audio recordings.
        </p>
        <Link href="/new">
          <Button size="lg" className="flex gap-2">
            <PlusCircle className="w-5 h-5" />
            Create Your First Entry
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content mobile-scroll"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        touchAction: 'pan-y pinch-zoom',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
      }}
    >
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Diary
          </h1>
          <Link href="/new">
            <Button className="flex gap-2">
              <PlusCircle className="w-4 h-4" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        <motion.div 
          className="space-y-2 mobile-scroll" 
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'none',
            touchAction: 'pan-y pinch-zoom',
          }}
        >
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              id={`entry-${entry.id}`}
              className="bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              data-entry-id={entry.id}
            >
              <EntryCard 
                entry={entry} 
                setSelectedEntryId={setSelectedEntryId} 
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}