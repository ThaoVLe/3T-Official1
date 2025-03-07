import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import EntryCard from "@/components/entry-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { Entry } from "@/types/entry";
import { format } from 'date-fns';

export default function HomePage() {
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRestoredRef = useRef(false);

  // Fetch entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to fetch entries');
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Handle scroll position restoration
  useEffect(() => {
    if (!entries.length || scrollRestoredRef.current) return;

    // Try to restore scroll position after entries are loaded
    const restoreScroll = () => {
      const savedPosition = sessionStorage.getItem('homeScrollPosition');
      const lastViewedEntryId = sessionStorage.getItem('lastViewedEntryId');

      if (!savedPosition) return;

      const scrollableElement = document.querySelector('.ScrollAreaViewport');
      if (!scrollableElement) {
        console.log('Scrollable element not found');
        return;
      }

      console.log('Found scrollable element:', scrollableElement);
      console.log('Attempting to scroll to position:', savedPosition);

      // Set scroll position
      scrollableElement.scrollTop = parseInt(savedPosition, 10);
      console.log('Set scroll position to:', scrollableElement.scrollTop);

      // If we have a lastViewedEntryId, try to scroll to that entry
      if (lastViewedEntryId) {
        const entryElement = document.getElementById(`entry-${lastViewedEntryId}`);
        if (entryElement) {
          console.log('Found entry element:', entryElement);
        }
      }

      // Mark as restored
      scrollRestoredRef.current = true;
    };

    // Try multiple times in case the DOM isn't fully rendered
    setTimeout(restoreScroll, 100);
    setTimeout(restoreScroll, 300);
    setTimeout(restoreScroll, 600);

  }, [entries]);

  // Save scroll position when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollableElement = document.querySelector('.ScrollAreaViewport');
      if (scrollableElement) {
        const scrollPosition = scrollableElement.scrollTop;
        console.log('Saving scroll position:', scrollPosition);
        sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Save position when component unmounts too
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <h1 className="text-xl font-semibold">My Diary</h1>
        <Button size="icon" onClick={() => navigate('/new')}>
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)] w-full">
        <div className="diary-content p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p>Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
              <p className="text-muted-foreground">No entries yet.</p>
              <Button onClick={() => navigate('/new')}>
                Create your first entry
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  id={`entry-${entry.id}`}
                  className="bg-white shadow rounded-lg overflow-hidden"
                  data-entry-id={entry.id}
                >
                  <EntryCard 
                    entry={entry} 
                    onClick={() => {
                      // Save scroll position before navigating
                      const scrollableElement = document.querySelector('.ScrollAreaViewport');
                      if (scrollableElement) {
                        const scrollPosition = scrollableElement.scrollTop;
                        console.log('Saving scroll position before navigation:', scrollPosition);
                        sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
                        sessionStorage.setItem('lastViewedEntryId', entry.id);
                      }
                      navigate(`/entry/${entry.id}`);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}