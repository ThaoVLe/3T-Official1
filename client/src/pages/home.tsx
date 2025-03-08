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

export default function Home() {
  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const entryIndex = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            // Update visible range when entries come into view
            setVisibleRange(prev => ({
              start: Math.max(0, Math.min(entryIndex - 5, (entries?.length || 0) - 10)),
              end: Math.min(entryIndex + 5, entries?.length || 0)
            }));
          }
        });
      },
      {
        root: null,
        rootMargin: '100px 0px',
        threshold: 0.1
      }
    );

    // Observe all entry elements
    const entryElements = document.querySelectorAll('.entry-card');
    entryElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [entries?.length]);

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
    if (!entries || entries.length === 0 || scrollRestoredRef.current) return;

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
  }, [entries]);

  useEffect(() => {
    return () => {
      scrollRestoredRef.current = false;
    };
  }, []);

  if (isLoading) {
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

  if (!entries?.length) {
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
            {entries.slice(visibleRange.start, visibleRange.end).map((entry, index) => (
              <motion.div
                key={entry.id}
                id={`entry-${entry.id}`}
                className="entry-card bg-white"
                data-index={visibleRange.start + index}
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
                  previewQuality={50}
                  videoQuality={360}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}