import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Entry } from "@/types/entry";
import { format } from 'date-fns';

export default function EntryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/entries/${id}`);
        if (!response.ok) throw new Error('Failed to fetch entry');
        const data = await response.json();
        setEntry(data);
      } catch (error) {
        console.error('Error fetching entry:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEntry();
    }
  }, [id]);

  // Handle swipe back gesture
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;
      const swipeDistance = endX - startX;
      const verticalDistance = Math.abs(endY - touchStartRef.current.y);
      const swipeTime = Date.now() - touchStartRef.current.time;

      // Only trigger for swipes that are more horizontal than vertical
      if (swipeDistance > 100 && swipeTime < 300 && verticalDistance < 100) {
        console.log('Saving last viewed entry ID:', id);
        sessionStorage.setItem('lastViewedEntryId', id || '');
        navigate('/');
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, id]);

  const handleBack = () => {
    // Save the current entry ID before navigating back
    if (id) {
      console.log('Saving last viewed entry ID from back button:', id);
      sessionStorage.setItem('lastViewedEntryId', id);
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading entry...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Entry not found</p>
      </div>
    );
  }

  const renderMediaContent = () => {
    if (!entry.media || entry.media.length === 0) return null;

    return (
      <div className="flex flex-col gap-4 mt-6">
        {entry.media.map((url, i) => {
          const fileExt = url.split('.').pop()?.toLowerCase() || '';
          const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt);
          const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt);

          if (isVideo) {
            return (
              <div key={i} className="w-full" ref={el => mediaRefs.current[i] = el}>
                <video
                  src={url}
                  controls
                  playsInline
                  className="w-full aspect-video object-cover rounded-lg"
                />
              </div>
            );
          }

          if (isAudio) {
            return (
              <div key={i} className="w-full bg-muted rounded-lg p-4" ref={el => mediaRefs.current[i] = el}>
                <audio src={url} controls className="w-full" />
              </div>
            );
          }

          return (
            <div key={i} className="w-full" ref={el => mediaRefs.current[i] = el}>
              <img
                src={url}
                alt={`Media ${i + 1}`}
                className="w-full rounded-lg"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="sticky top-0 z-10 flex items-center border-b bg-background px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <h1 className="ml-2 text-lg font-medium">
          {format(new Date(entry.created_at), 'PPP')}
        </h1>
      </div>
      <div className="h-[calc(100vh-56px)] w-full">
        <ScrollArea className="h-full w-full">
          <div className="p-4">
            <h2 className="text-xl font-semibold">{entry.title}</h2>
            <p className="mt-4 whitespace-pre-wrap">{entry.content}</p>
            {renderMediaContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}