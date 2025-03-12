import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, cardVariants } from "@/components/animations";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
    enabled: !!auth.currentUser,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background overflow-auto diary-content">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
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

  return (
    <PageTransition direction={-1}>
      <div 
        ref={containerRef}
        className="min-h-screen bg-background overflow-auto diary-content"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Diary
            </h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  auth.signOut();
                  navigate("/auth");
                }}
              >
                Sign Out
              </Button>
              <Link href="/editor">
                <Button className="flex gap-2">
                  <FileEdit className="w-4 h-4" />
                  New Entry
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {!entries?.length ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">No entries yet</h2>
              <p className="text-muted-foreground mb-8">
                Start capturing your memories with text, photos, and more.
              </p>
              <Link href="/editor">
                <Button size="lg" className="flex gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Entry
                </Button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  id={`entry-${entry.id}`}
                  className="bg-card"
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
            </div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
}