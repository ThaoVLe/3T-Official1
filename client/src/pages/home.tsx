import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit, Camera, MapPin, SmilePlus } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, cardVariants } from "@/components/animations";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
  });
  const [, navigate] = useLocation();

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
      <div className="min-h-screen bg-background overflow-auto diary-content">
        <div className="sticky top-0 z-10 bg-background border-b p-6">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4 p-4">
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
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Diary
              </h1>
            </div>

            <div className="flex items-start gap-4 pb-4" onClick={() => navigate('/new')}>
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <button 
                  className="w-full text-left px-5 py-3.5 rounded-full bg-muted/50 hover:bg-muted/70 text-muted-foreground/80 transition-colors text-[15px]"
                  onClick={() => navigate('/new')}
                >
                  What's on your mind?
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 py-5"
                onClick={() => navigate('/new')}
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">Photo/Video</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 py-5"
                onClick={() => navigate('/new')}
              >
                <SmilePlus className="w-5 h-5" />
                <span className="hidden sm:inline">Feeling</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 py-5"
                onClick={() => navigate('/new')}
              >
                <MapPin className="w-5 h-5" />
                <span className="hidden sm:inline">Location</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="container px-4 py-4 mx-auto">
          <AnimatePresence>
            <div className="space-y-4">
              {entries?.map((entry, index) => (
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
        </div>
      </div>
    </PageTransition>
  );
}