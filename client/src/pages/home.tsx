import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, cardVariants } from "@/components/animations";
import { useLazyEntries } from "@/lib/use-lazy-entries";

// Type definition for entries
type Entry = DiaryEntry;


export default function Home() {
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const { visibleEntries: entries, loadingRef, isLoading } = useLazyEntries(allEntries);

  const { data: initialEntries, isLoading: initialLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
    onSuccess: data => setAllEntries(data)
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    const storeScrollPosition = () => {
      const container = document.querySelector('.diary-content');
      if (container) {
        sessionStorage.setItem('homeScrollPosition', String(container.scrollTop));
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

  useEffect(() => {
    if (!initialEntries || initialEntries.length === 0 || scrollRestoredRef.current) return;

    const restoreScroll = () => {
      const lastViewedEntryId = sessionStorage.getItem('lastViewedEntryId');
      const container = document.querySelector('.diary-content');

      if (container) {
        if (lastViewedEntryId) {
          const entryElement = document.getElementById(`entry-${lastViewedEntryId}`);
          if (entryElement) {
            container.scrollTop = 0;
            entryElement.scrollIntoView({ behavior: 'instant', block: 'center' });
            scrollRestoredRef.current = true;
            return;
          }
        }

        const savedPosition = sessionStorage.getItem('homeScrollPosition');
        if (savedPosition) {
          container.scrollTop = parseInt(savedPosition);
          scrollRestoredRef.current = true;
        }
      }
    };

    setTimeout(restoreScroll, 50);
  }, [initialEntries]);

  useEffect(() => {
    return () => {
      scrollRestoredRef.current = false;
    };
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!allEntries?.length) {
    return (
      <PageTransition direction={-1}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition direction={-1}>
      <div 
        ref={containerRef}
        className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          touchAction: 'pan-y pinch-zoom',
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
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                id={`entry-${entry.id}`}
                className="bg-white"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                whileHover="hover"
              >
                <EntryCard 
                  entry={entry} 
                  setSelectedEntryId={setSelectedEntryId} 
                />
              </motion.div>
            ))}
            {isLoading && allEntries.length > entries.length && (
              <div className="flex justify-center py-4">
                <div className="animate-pulse">Loading more entries...</div>
              </div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}