import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartScroll = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      touchStartScroll = window.scrollY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;
      const scrollDelta = Math.abs(window.scrollY - touchStartScroll);

      // Only trigger for quick horizontal swipes with minimal vertical movement
      // and no significant scrolling
      if (swipeDistance > 100 && swipeTime < 300 && verticalDistance < 50 && scrollDelta < 10) {
        // Save scroll position before navigation
        const container = document.querySelector('.diary-content');
        if (container) {
          sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
        }

        // Save the current entry ID before navigation
        if (id) {
          sessionStorage.setItem('lastViewedEntryId', id);
        }

        // Trigger exit animation
        setIsExiting(true);

        // Navigate after animation
        setTimeout(() => {
          navigate('/');
        }, 200);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, id]);

  useEffect(() => {
    const mediaParam = new URLSearchParams(window.location.search).get('media');
    if (mediaParam !== null) {
      const mediaIndex = parseInt(mediaParam);
      const mediaElement = mediaRefs.current[mediaIndex];
      if (mediaElement) {
        // Use requestAnimationFrame for smooth scrolling
        requestAnimationFrame(() => {
          mediaElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
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
    <motion.div 
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        scale: {
          duration: 0.2
        }
      }}
      className={`min-h-screen bg-white overflow-auto ${isExiting ? 'pointer-events-none' : ''}`}
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container px-4 py-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (id) {
                sessionStorage.setItem('lastViewedEntryId', id);
                setIsExiting(true);
                setTimeout(() => {
                  navigate('/');
                }, 200);
              }
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
        <ScrollArea className="h-[calc(100vh-80px)]">
          <motion.div 
            className="space-y-4 diary-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
            <motion.div
              className="prose max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />

            {/* Media */}
            {entry.mediaUrls && entry.mediaUrls.length > 0 && (
              <motion.div 
                className="space-y-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AnimatePresence>
                  {entry.mediaUrls.map((url, i) => {
                    const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                    const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                    return (
                      <motion.div
                        key={i}
                        ref={el => mediaRefs.current[i] = el}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          delay: i * 0.1,
                          duration: 0.2
                        }}
                      >
                        {isVideo ? (
                          <video
                            src={url}
                            controls
                            playsInline
                            className="w-full aspect-video object-cover rounded-lg"
                          />
                        ) : isAudio ? (
                          <div className="w-full bg-muted rounded-lg p-4">
                            <audio src={url} controls className="w-full" />
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt={`Media ${i + 1}`}
                            className="w-full rounded-lg"
                            loading="lazy"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}