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
  const pageRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (!pageRef.current || isTransitioning) return;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      startScrollPosition = contentRef.current?.scrollTop || 0;
      isHorizontalSwipe = false;
      isSwiping = false;

      // Reset any existing transforms
      if (pageRef.current) {
        pageRef.current.style.transition = 'none';
        pageRef.current.style.transform = 'translateX(0)';
        pageRef.current.style.opacity = '1';
        pageRef.current.style.boxShadow = 'none';
      }
      document.body.classList.add('swiping-active');
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pageRef.current || isTransitioning) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const deltaX = touchCurrentX - touchStartX;
      const deltaY = touchCurrentY - touchStartY;

      // Detect horizontal swipes with lower threshold (more like Facebook)
      if (!isHorizontalSwipe) {
        // More sensitive detection - only 10px threshold
        if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
          isHorizontalSwipe = true;
          // Prevent scrolling during swipe
          if (deltaX > 0) {
            e.preventDefault();
          }
        } else {
          return; // Let normal scrolling happen
        }
      }

      // Only process right swipes (going back) when near the top of content
      if (deltaX > 0 && isHorizontalSwipe && startScrollPosition <= 10) {
        e.preventDefault();
        isSwiping = true;

        // Smoother feel with cubic resistance (feels more like Facebook)
        const resistance = 0.8;
        const transform = deltaX * resistance;
        const percent = Math.min(transform / window.innerWidth, 1);

        // Visual effects more similar to Facebook's swipe
        const scale = 1 - (percent * 0.08);
        const rotate = percent * 2; // slight rotation
        const opacity = 1 - (percent * 0.4);

        pageRef.current.style.transform = `translateX(${transform}px) scale(${scale}) rotate(${rotate}deg)`;
        pageRef.current.style.opacity = opacity.toString();

        // Add a shadow effect during swipe
        pageRef.current.style.boxShadow = `0 0 ${20 * percent}px rgba(0,0,0,${0.2 * percent})`;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Remove active class regardless of outcome
      document.body.classList.remove('swiping-active');

      if (!pageRef.current || !isHorizontalSwipe || !isSwiping || isTransitioning) return;

      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      const touchDuration = Date.now() - touchStartTime;

      // More Facebook-like swipe detection:
      // 1. Quick swipe (velocity-based) - only needs 60px with short duration
      // 2. Distance-based swipe - 1/4 of screen is enough (Facebook is quite sensitive)
      const isQuickSwipe = touchDuration < 300 && deltaX > 60;
      const isLongSwipe = deltaX > window.innerWidth / 4;

      if ((isQuickSwipe || isLongSwipe) && deltaX > 0 && isHorizontalSwipe) {
        // Complete the swipe with smooth animation
        setIsTransitioning(true);
        pageRef.current.style.transition = 'all 0.35s cubic-bezier(0.32, 0.72, 0.2, 1.0)';
        pageRef.current.style.transform = `translateX(${window.innerWidth}px) scale(0.92) rotate(3deg)`;
        pageRef.current.style.opacity = '0.6';
        pageRef.current.style.boxShadow = '0 0 30px rgba(0,0,0,0.2)';

        // Navigate after animation completes with a slight delay for better visual effect
        setTimeout(() => {
          navigate('/');
          setIsTransitioning(false);
        }, 350);
      } else if (pageRef.current) {
        // Spring back with slight bounce effect (like Facebook)
        pageRef.current.style.transition = 'all 0.35s cubic-bezier(0.32, 0.72, 0.2, 1.2)';
        pageRef.current.style.transform = 'translateX(0) scale(1) rotate(0deg)';
        pageRef.current.style.opacity = '1';
        pageRef.current.style.boxShadow = 'none';
      }

      // Reset state
      isHorizontalSwipe = false;
      isSwiping = false;
    };

    const handleTransitionEnd = () => {
      if (pageRef.current) {
        pageRef.current.style.transition = '';
      }
    };

    // Add event listeners
    const page = pageRef.current;
    if (page) {
      // Use passive: false to allow preventDefault() on iOS
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
  }, [navigate, isTransitioning]);

  useEffect(() => {
    // Scroll to selected media if specified in URL
    const params = new URLSearchParams(window.location.search);
    const mediaIndex = params.get('media');

    if (mediaIndex && entry?.media && entry.media.length > 0) {
      const index = parseInt(mediaIndex, 10);

      // Find all media elements
      const mediaElements = document.querySelectorAll('.media-item');

      if (mediaElements.length > 0 && index < mediaElements.length) {
        setTimeout(() => {
          mediaElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [entry]);

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      ref={pageRef} 
      className="w-full h-full bg-white touch-manipulation"
    >
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
            className="mr-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-1">
            <div className="text-sm font-medium">
              {entry.date ? format(new Date(entry.date), 'EEEE, MMMM d, yyyy') : format(new Date(entry.createdAt || Date.now()), 'EEEE, MMMM d, yyyy')}
            </div>
            {entry.title && (
              <h1 className="text-xl font-semibold">{entry.title}</h1>
            )}
          </div>
        </div>
      </div>

      {/* Entry content */}
      <div 
        ref={contentRef}
        className="px-4 py-2 overflow-auto pb-20"
        style={{ 
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        {/* Feeling/Activity tags */}
        {(entry.feeling || entry.activity) && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {entry.feeling && (
              <div className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                {entry.feeling}
              </div>
            )}
            {entry.activity && (
              <div className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                {entry.activity}
              </div>
            )}
          </div>
        )}

        {/* Entry text content */}
        {entry.content && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        )}

        {/* Media content */}
        {entry.media && entry.media.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-sm font-medium text-gray-500">
              Media ({entry.media.length})
            </div>

            <div className="media-grid grid-cols-3 auto-rows-fr">
              {entry.media.map((media, index) => (
                <div 
                  key={index}
                  className="media-item relative bg-gray-100 rounded overflow-hidden"
                  style={{ aspectRatio: '1/1' }}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : media.type === 'video' ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : media.type === 'audio' ? (
                    <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                      <div className="text-center p-2">
                        <div className="text-xs">Audio</div>
                        <audio src={media.url} controls className="w-full mt-2" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}