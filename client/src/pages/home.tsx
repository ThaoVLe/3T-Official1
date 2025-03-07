import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntries } from '@/hooks/useEntries';
import EntryCard from '@/components/entry-card';

export function Home() {
  const { isLoading, entries } = useEntries();
  const location = useLocation();

  // Create references
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const lastViewedEntryIdRef = useRef<string | null>(null);
  const hasRestoredRef = useRef(false);

  // Save scroll position when navigating away
  useEffect(() => {
    const saveScrollPosition = () => {
      if (containerRef.current) {
        scrollPositionRef.current = containerRef.current.scrollTop;
        console.log('Saved scroll position:', scrollPositionRef.current);
      }
    };

    // Save scroll position before unmounting
    return () => {
      saveScrollPosition();
    };
  }, []);

  // Try to restore scroll position when returning or when entries load
  useEffect(() => {
    if (!entries || entries.length === 0 || hasRestoredRef.current) return;

    // Get the last viewed entry ID from URL state or sessionStorage
    lastViewedEntryIdRef.current = location.state?.lastViewedEntryId || 
                                 sessionStorage.getItem('lastViewedEntryId');

    // Check if we need to restore scroll
    const needsRestore = location.state?.shouldRestoreScroll || 
                        sessionStorage.getItem('shouldRestoreScroll') === 'true';

    if (needsRestore && !hasRestoredRef.current) {
      // Try multiple times with increasing delays to ensure DOM is ready
      const attemptRestore = (delay: number) => {
        setTimeout(() => {
          if (containerRef.current) {
            const savedPosition = location.state?.scrollPosition || 
                                scrollPositionRef.current ||
                                parseInt(sessionStorage.getItem('scrollPosition') || '0');

            console.log('Attempting to restore scroll to:', savedPosition);

            // Force a reflow first
            containerRef.current.scrollTop = 0;

            // Then set to saved position
            containerRef.current.scrollTop = savedPosition;

            // If we have a specific entry to scroll to
            if (lastViewedEntryIdRef.current) {
              const targetEntry = document.getElementById(`entry-${lastViewedEntryIdRef.current}`);
              if (targetEntry) {
                targetEntry.scrollIntoView({ behavior: 'auto', block: 'start' });
                console.log('Scrolled to entry:', lastViewedEntryIdRef.current);
              }
            }

            hasRestoredRef.current = true;
            sessionStorage.removeItem('shouldRestoreScroll');
            sessionStorage.removeItem('lastViewedEntryId');
          }
        }, delay);
      };

      // Try multiple times with increasing delays
      attemptRestore(50);
      attemptRestore(150);
      attemptRestore(300);
      attemptRestore(600);
    }
  }, [entries, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content" 
           style={{
             WebkitOverflowScrolling: 'touch',
             overscrollBehavior: 'none',
             touchAction: 'pan-y pinch-zoom',
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#f0f2f5] overflow-auto diary-content"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        touchAction: 'pan-y pinch-zoom',
      }}>
      <div className="relative">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Daily Journal</h1>
          <Link to="/new">
            <Button variant="outline" size="icon">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="p-4 space-y-2 pb-24">
          {entries.map((entry) => (
            <div key={entry.id} id={`entry-${entry.id}`} data-entry-id={entry.id}>
              <EntryCard
                entry={entry}
                onEntryClick={() => {
                  // Save the current scroll position for when we return
                  if (containerRef.current) {
                    const currentPosition = containerRef.current.scrollTop;
                    console.log('Saving scroll position before navigation:', currentPosition);
                    scrollPositionRef.current = currentPosition;
                    sessionStorage.setItem('scrollPosition', currentPosition.toString());
                    sessionStorage.setItem('lastViewedEntryId', entry.id);
                    sessionStorage.setItem('shouldRestoreScroll', 'true');
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}