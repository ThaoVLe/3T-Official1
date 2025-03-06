import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    let touchStartX = 0;
    let touchStartTime = 0;
    let startScrollPosition = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      startScrollPosition = contentRef.current?.scrollTop || 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pageRef.current) return;

      const touchCurrentX = e.touches[0].clientX;
      const deltaX = touchCurrentX - touchStartX;

      // Only handle right swipes
      if (deltaX > 0) {
        // Prevent default only when swiping right and at top of content
        if (startScrollPosition <= 0) {
          e.preventDefault();

          // Calculate transform based on swipe distance
          const transform = Math.min(deltaX * 0.5, window.innerWidth);
          const opacity = 1 - (transform / window.innerWidth) * 0.5;

          pageRef.current.style.transform = `translateX(${transform}px)`;
          pageRef.current.style.opacity = opacity.toString();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!pageRef.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const swipeTime = touchEndTime - touchStartTime;
      const velocity = swipeDistance / swipeTime;

      // Navigate back if swipe is fast enough or far enough
      if ((swipeDistance > 100 && startScrollPosition <= 0) || (velocity > 0.5 && startScrollPosition <= 0)) {
        // Add transition for smooth exit
        pageRef.current.style.transition = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out';
        pageRef.current.style.transform = `translateX(${window.innerWidth}px)`;
        pageRef.current.style.opacity = '0';

        setTimeout(() => navigate('/'), 400);
      } else {
        // Reset position with transition
        pageRef.current.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
        pageRef.current.style.transform = '';
        pageRef.current.style.opacity = '1';
      }
    };

    const handleTransitionEnd = () => {
      if (pageRef.current) {
        pageRef.current.style.transition = '';
      }
    };

    const page = pageRef.current;
    if (page) {
      page.addEventListener('touchstart', handleTouchStart, { passive: false });
      page.addEventListener('touchmove', handleTouchMove, { passive: false });
      page.addEventListener('touchend', handleTouchEnd);
      page.addEventListener('transitionend', handleTransitionEnd);
    }

    return () => {
      if (page) {
        page.removeEventListener('touchstart', handleTouchStart);
        page.removeEventListener('touchmove', handleTouchMove);
        page.removeEventListener('touchend', handleTouchEnd);
        page.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [navigate]);

  useEffect(() => {
    // Scroll to selected media if specified in URL
    const params = new URLSearchParams(window.location.search);
    const mediaIndex = params.get('media');

    if (mediaIndex && contentRef.current) {
      const mediaElements = contentRef.current.querySelectorAll('.media-item');
      const targetElement = mediaElements[parseInt(mediaIndex)];

      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const swipeIndicatorStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 2,
    backgroundColor: 'lightgray',
    transform: 'scaleX(0)',
    transition: 'transform 0.3s ease-in-out',
  };


  return (
    <div ref={pageRef} className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Swipe progress indicator */}
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
      <div ref={contentRef} className="flex-1 overflow-y-auto no-scrollbar">
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
                      <div key={i} className="media-item w-full">
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
                      <div key={i} className="media-item w-full bg-muted rounded-lg p-4">
                        <audio src={url} controls className="w-full" />
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="media-item w-full">
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