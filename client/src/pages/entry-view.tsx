import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      // If swiped right more than 100px, go back
      if (swipeDistance > 100) {
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

  if (!entry) return null;

  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
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