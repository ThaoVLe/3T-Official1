import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    let touchStartX = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const swipeTime = touchEndTime - touchStartTime;

      // Only trigger for quick swipes (less than 300ms) and sufficient distance
      if (swipeDistance > 100 && swipeTime < 300) {
        // Save scroll position before navigation
        const container = document.querySelector('.diary-content');
        if (container) {
          localStorage.setItem('homeScrollPosition', container.scrollTop.toString());
        }
        navigate('/');
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  useEffect(() => {
    const mediaParam = new URLSearchParams(window.location.search).get('media');
    if (mediaParam !== null) {
      const mediaIndex = parseInt(mediaParam);
      const mediaElement = mediaRefs.current[mediaIndex];
      if (mediaElement) {
        setTimeout(() => {
          mediaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [entry]);

  if (!entry) return null;

  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="min-h-screen bg-white overflow-auto" style={{
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      touchAction: 'pan-y pinch-zoom',
      WebkitTapHighlightColor: 'transparent',
      WebkitUserSelect: 'none',
    }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container px-4 py-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // Save scroll position before navigation
              const container = document.querySelector('.diary-content');
              if (container) {
                localStorage.setItem('homeScrollPosition', container.scrollTop.toString());
              }
              // Save the current entry ID to find it later
              localStorage.setItem('lastViewedEntryId', params.id || '');
              navigate('/');
            }}
            className="mr-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Entry</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6">
        <ScrollArea className="h-[calc(100vh-80px)]" style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          touchAction: 'pan-y pinch-zoom',
        }}>
          <div className="space-y-4 diary-content"> {/* Added diary-content class here */}
            <h1 className="text-[24px] font-semibold">
              {entry.title || "Untitled Entry"}
            </h1>

            <div className="text-sm text-muted-foreground">
              {formatDate(entry.createdAt)}
            </div>

            {(feeling || entry.location) && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {feeling && (
                  <div className="flex items-center">
                    {feeling.label.includes(',') ? (
                      <span>
                        feeling {feeling.label.split(',')[0].trim()} {feeling.emoji.split(' ')[0]}{' '}
                        while {feeling.label.split(',')[1].trim()} {feeling.emoji.split(' ')[1]}
                      </span>
                    ) : (
                      <span>
                        feeling {feeling.label} {feeling.emoji}
                      </span>
                    )}
                  </div>
                )}
                {entry.location && (
                  <div className="flex items-center">
                    <span>at {entry.location} 📍</span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />

            {/* Media */}
            {entry.mediaUrls && entry.mediaUrls.length > 0 && (
              <div className="space-y-4 mt-6">
                {entry.mediaUrls.map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                  const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

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
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}