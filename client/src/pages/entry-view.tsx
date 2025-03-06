import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartTimeRef.current = Date.now();
      setSwipeProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentX = e.touches[0].clientX;
      const swipeDistance = touchCurrentX - touchStartXRef.current;

      // Only allow right swipe (positive distance)
      if (swipeDistance > 0) {
        // Calculate progress as percentage (0-100)
        const progress = Math.min((swipeDistance / window.innerWidth) * 100, 100);
        setSwipeProgress(progress);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartXRef.current;
      const swipeTime = Date.now() - touchStartTimeRef.current;
      const velocity = Math.abs(swipeDistance) / swipeTime;

      // Navigate back if:
      // 1. Swiped more than 25% of screen width OR
      // 2. Fast swipe (high velocity) with minimum distance
      if (
        swipeDistance > window.innerWidth * 0.25 || // Lower threshold for easier triggering
        (velocity > 0.5 && swipeDistance > window.innerWidth * 0.1) // Added velocity check
      ) {
        navigate('/');
      } else {
        // Reset progress if not navigating
        setSwipeProgress(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  if (!entry) return null;

  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col no-scrollbar bg-white"
      style={{
        transform: `translateX(${swipeProgress}px)`,
        opacity: 1 - (swipeProgress / 200), // Fade out as we swipe
        transition: swipeProgress === 0 ? 'all 0.2s ease-out' : 'none' // Smooth reset, instant follow
      }}
    >
      {/* Back arrow indicator */}
      <div 
        className="fixed left-4 top-1/2 -translate-y-1/2 transition-opacity"
        style={{ opacity: swipeProgress > 0 ? 1 : 0 }}
      >
        <ArrowLeft className="h-8 w-8 text-primary" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b flex-none">
        <div className="px-4 py-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Entry</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
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
                    <div key={i} className="w-full">
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
                    <div key={i} className="w-full bg-muted rounded-lg p-4">
                      <audio src={url} controls className="w-full" />
                    </div>
                  );
                }

                return (
                  <div key={i} className="w-full">
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
      </div>
    </div>
  );
}