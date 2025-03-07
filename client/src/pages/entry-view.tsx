import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

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

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      if (swipeDistance > 50 && swipeTime < 300 && verticalDistance < 30) {
        if (id) {
          // Save entry ID for restoration
          sessionStorage.setItem('lastViewedEntryId', id);

          // Save current scroll position
          const container = document.querySelector('.diary-content');
          if (container) {
            sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
          }

          setIsExiting(true);
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
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
    if (mediaParam !== null && entry?.mediaUrls) {
      const mediaIndex = parseInt(mediaParam);
      console.log('Entry view received media parameter:', mediaIndex);
      
      // Wait for DOM updates to complete
      setTimeout(() => {
        // Refresh references to make sure they're current
        if (mediaRefs.current[mediaIndex]) {
          console.log('Scrolling to media at index:', mediaIndex);
          mediaRefs.current[mediaIndex]?.scrollIntoView({ 
            behavior: 'auto', 
            block: 'center' 
          });
        } else {
          console.log('Media element reference not found for index:', mediaIndex);
        }
      }, 300); // Allow time for DOM to fully render
    }
  }, [entry?.mediaUrls]);

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
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ 
        type: "tween",
        duration: 0.2,
        ease: "easeInOut"
      }}
      className={`fixed inset-0 bg-white ${isExiting ? 'pointer-events-none' : ''}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        touchAction: 'pan-y pinch-zoom',
        zIndex: 50,
      }}
    >
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
                }, 100);
              }
            }}
            className="mr-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold truncate max-w-[75%]">
            {entry.title || "Untitled Entry"}
          </h1>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="container px-4 py-6 diary-content">
          <div className="space-y-4">

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

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />

            {/* Media gallery */}
            {entry.mediaUrls && entry.mediaUrls.length > 0 && (
              <div className="space-y-2 my-4">
                {entry.mediaUrls.map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                  return (
                    <div 
                      key={index} 
                      className="rounded-lg overflow-hidden border"
                      ref={el => mediaRefs.current[index] = el}
                    >
                      {isVideo ? (
                        <video
                          src={url}
                          controls
                          playsInline
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full rounded-lg"
                          loading="lazy"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}