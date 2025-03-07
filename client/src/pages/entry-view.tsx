import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEntryById } from '@/hooks/useEntries';
import { Skeleton } from '@/components/ui/skeleton';
import DeleteEntryButton from '@/components/delete-entry-button';
import { formatDate } from '@/lib/utils';

export function EntryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoading, entry } = useEntryById(id || '');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

  // Handle back swipe gesture
  useEffect(() => {
    if (!id) return;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchEndX - touchStart.x;
      const verticalDistance = Math.abs(touchEndY - touchStart.y);
      const swipeTime = Date.now() - touchStart.time;

      // Only trigger for quick horizontal swipes without much vertical movement
      if (swipeDistance > 100 && swipeTime < 300 && verticalDistance < 50) {
        console.log('Detected back swipe gesture');

        // Navigate back with state to restore scroll position
        navigate('/', { 
          state: { 
            shouldRestoreScroll: true,
            lastViewedEntryId: id
          }
        });
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [id, navigate, touchStart]);

  if (isLoading || !entry) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // Navigate back with state to restore scroll position
              navigate('/', { 
                state: { 
                  shouldRestoreScroll: true,
                  lastViewedEntryId: id
                } 
              });
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <DeleteEntryButton id={entry.id} />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-1">{entry.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{formatDate(new Date())}</p>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>
    </div>
  );
}