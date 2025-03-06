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
    let touchStartY = 0;
    let touchStartTime = 0;
    let startScrollPosition = 0;
    let isHorizontalSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      startScrollPosition = contentRef.current?.scrollTop || 0;
      isHorizontalSwipe = false;

      // Reset any existing transitions
      if (pageRef.current) {
        pageRef.current.style.transition = 'none';
        pageRef.current.style.transform = 'translateX(0) scale(1) rotate(0deg)';
        pageRef.current.style.opacity = '1';
        pageRef.current.classList.remove('swiping'); //remove swiping class
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pageRef.current) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;

      // Determine if this is a horizontal swipe early in the gesture
      // And make the detection more sensitive (reduced threshold from 10 to 5)
      if (!isHorizontalSwipe && Math.abs(deltaX) > 5) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

        // If we're in a horizontal swipe at the top of content, set a class to indicate this
        if (isHorizontalSwipe && startScrollPosition <= 5) {
          pageRef.current.classList.add('swiping');
        }
      }

      // Only handle horizontal swipes for back navigation when at the top
      if (isHorizontalSwipe && startScrollPosition <= 5) {
        e.preventDefault(); // Prevent scrolling when swiping horizontally

        // Calculate swipe progress
        const progress = Math.max(0, Math.min(1, deltaX / (window.innerWidth * 0.6)));

        // Use transforms for smooth animation
        const transform = deltaX;
        const scale = 1 - 0.08 * progress;
        const rotate = 3 * progress;
        const opacity = 1 - 0.5 * progress;

        pageRef.current.style.transform = `translateX(${transform}px) scale(${scale}) rotate(${rotate}deg)`;
        pageRef.current.style.opacity = opacity.toString();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!pageRef.current || !isHorizontalSwipe) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const swipeTime = touchEndTime - touchStartTime;
      const velocity = swipeDistance / swipeTime;

      // Navigate back if swipe is fast enough or far enough
      const shouldNavigateBack = (swipeDistance > window.innerWidth * 0.3 && startScrollPosition <= 0) || 
                                (velocity > 0.5 && startScrollPosition <= 0);

      // Update swipe indicator
      const indicator = pageRef.current.querySelector('[data-swipe-indicator]') as HTMLElement;
      if (indicator) {
        indicator.style.transition = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out';
        indicator.style.transform = shouldNavigateBack ? 'scaleX(1)' : 'scaleX(0)';
        indicator.style.opacity = shouldNavigateBack ? '1' : '0';
      }

      if (shouldNavigateBack) {
        // Add transition for smooth exit
        pageRef.current.style.transition = 'all 0.35s cubic-bezier(0.32, 0.72, 0.2, 1)';
        pageRef.current.style.transform = `translateX(${window.innerWidth}px) scale(0.92) rotate(3deg)`;
        pageRef.current.style.opacity = '0';

        setTimeout(() => navigate('/'), 350);
      } else {
        // Reset position with spring-like transition
        pageRef.current.style.transition = 'all 0.5s cubic-bezier(0.32, 0.72, 0.2, 1.2)';
        pageRef.current.style.transform = 'translateX(0) scale(1) rotate(0deg)';
        pageRef.current.style.opacity = '1';
        pageRef.current.classList.remove('swiping'); //remove swiping class
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

  return (
    <div ref={pageRef} className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Swipe indicator */}
      <div 
        data-swipe-indicator 
        className="absolute top-0 left-0 w-full h-1 bg-primary z-20 origin-left"
        style={{ transform: 'scaleX(0)', opacity: 0 }}
      />

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