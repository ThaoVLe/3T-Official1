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
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.diary-content');
      if (container) {
        if (container.scrollTop > 50) {
          setIsScrolled(true);
          container.classList.add('scrolled');
        } else {
          setIsScrolled(false);
          container.classList.remove('scrolled');
        }
      }
    };

    const container = document.querySelector('.diary-content');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

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
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Diary
              </h1>
            </div>

            {/* Floating bar with buttons removed */}

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