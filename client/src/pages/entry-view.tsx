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
  const contentRef = useRef<HTMLDivElement>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    let touchStartX = 0;
    let currentX = 0;
    const minSwipeDistance = 20; // Minimum distance to trigger navigation
    const maxSwipeDistance = 150; // Maximum distance for full animation

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      currentX = touchStartX;
      setSwipeProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentX = e.touches[0].clientX;
      const swipeDistance = currentX - touchStartX;

      // Only allow right swipes (positive distance)
      if (swipeDistance > 0) {
        // Calculate progress percentage (0 to 100)
        const progress = Math.min((swipeDistance / maxSwipeDistance) * 100, 100);
        setSwipeProgress(progress);

        // Prevent default scrolling when swiping
        if (swipeDistance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      const swipeDistance = currentX - touchStartX;

      // Navigate back if swipe distance exceeds minimum threshold
      if (swipeDistance >= minSwipeDistance) {
        navigate('/');
      } else {
        // Reset progress if swipe was not far enough
        setSwipeProgress(0);
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('touchstart', handleTouchStart, { passive: false });
      content.addEventListener('touchmove', handleTouchMove, { passive: false });
      content.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (content) {
        content.removeEventListener('touchstart', handleTouchStart);
        content.removeEventListener('touchmove', handleTouchMove);
        content.removeEventListener('touchend', handleTouchEnd);
      }
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

  const swipeIndicatorStyle = {
    height: '4px',
    backgroundColor: 'lightgray',
    width: `${swipeProgress}%`,
    transition: 'width 0.3s ease-out'
  };

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden bg-white"
      style={{
        transform: `translateX(-${swipeProgress}px)`,
        transition: swipeProgress === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
      ref={contentRef}
    >
      {/* Swipe indicator bar */}
      <div style={swipeIndicatorStyle} />

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
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ touchAction: swipeProgress > 0 ? 'none' : 'auto' }}>
        <div className="px-4 py-6">
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
    </div>
  );
}