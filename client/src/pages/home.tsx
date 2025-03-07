import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    // Only try to restore scroll if we have entries and haven't restored yet
    if (entries && !scrollRestoredRef.current) {
      const savedScrollPosition = localStorage.getItem('homeScrollPosition');
      const lastViewedEntryId = localStorage.getItem('lastViewedEntryId');
      const entryElement = lastViewedEntryId 
        ? document.querySelector(`#entry-${lastViewedEntryId}`)
        : null;

      if (savedScrollPosition && containerRef.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (containerRef.current && entryElement) {
            // Get the entry's position relative to the viewport
            const entryRect = entryElement.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const relativeTop = entryRect.top - containerRect.top;

            // Scroll to the entry's position
            containerRef.current.scrollTo({
              top: parseInt(savedScrollPosition),
              behavior: 'instant'
            });

            // Mark as restored and clear saved data
            scrollRestoredRef.current = true;
            localStorage.removeItem('homeScrollPosition');
            localStorage.removeItem('lastViewedEntryId');
            setSelectedEntryId(null);
          }
        });
      }
    }
  }, [entries]); // Run when entries are loaded

  // Reset the restoration flag when unmounting
  useEffect(() => {
    return () => {
      scrollRestoredRef.current = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content mobile-scroll" style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        touchAction: 'pan-y pinch-zoom',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
      }}>
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
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
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
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

      <div className="space-y-2 mobile-scroll" style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        touchAction: 'pan-y pinch-zoom',
      }}>
        {entries.map((entry) => (
          <div key={entry.id} id={`entry-${entry.id}`} className="bg-white">
            <EntryCard entry={entry} setSelectedEntryId={setSelectedEntryId} />
          </div>
        ))}
      </div>
    </div>
  );
}