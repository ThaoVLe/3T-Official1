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
  const [isRestoring, setIsRestoring] = useState(false);

  // Store scroll position when component is unmounted or before navigation
  useEffect(() => {
    const storeScrollPosition = () => {
      const container = document.querySelector('.diary-content');
      if (container) {
        sessionStorage.setItem('homeScrollPosition', String(container.scrollTop));
        console.log('Stored scroll position before unload:', container.scrollTop);
      }
    };

    window.addEventListener('visibilitychange', storeScrollPosition);
    window.addEventListener('beforeunload', storeScrollPosition);

    return () => {
      storeScrollPosition(); 
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
          const entryElement = document.getElementById(`entry-${lastViewedEntryId}`);
          if (entryElement) {
            // Start fade out
            setIsRestoring(true);

            // After fade out, perform instant scroll
            setTimeout(() => {
              container.scrollTop = 0;
              entryElement.scrollIntoView({ behavior: 'instant', block: 'center' });
              console.log('Scrolled to entry card:', lastViewedEntryId);

              // Start fade in
              setTimeout(() => {
                setIsRestoring(false);
                scrollRestoredRef.current = true;
              }, 50);
            }, 150);
            return;
          }
        }

        // Fallback to position-based scrolling if entry not found
        const savedPosition = sessionStorage.getItem('homeScrollPosition');
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          console.log('Falling back to position-based scroll:', position);

          // Start fade out
          setIsRestoring(true);

          // After fade out, perform instant scroll
          setTimeout(() => {
            container.scrollTop = position;
            console.log('Scroll position restored to:', position);

            // Start fade in
            setTimeout(() => {
              setIsRestoring(false);
              scrollRestoredRef.current = true;
            }, 50);
          }, 150);
        }
      }
    };

    // Single attempt with proper timing
    setTimeout(restoreScroll, 100);
  }, [entries]);

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
          animate={{
            opacity: isRestoring ? 0 : 1,
            scale: isRestoring ? 0.98 : 1,
          }}
          transition={{
            duration: 0.15,
            ease: "easeInOut"
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