
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
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pageRef.current || isTransitioning) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;
      
      // Determine horizontal swipe early with a small threshold
      if (!isHorizontalSwipe && !isSwiping) {
        // Require a minimum movement to start detecting direction
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          // If movement is more horizontal than vertical
          isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
          
          if (isHorizontalSwipe && deltaX > 0 && startScrollPosition <= 5) {
            isSwiping = true;
            e.preventDefault(); // Prevent scrolling
          }
        }
      }

      // If we've determined this is a rightward swipe
      if (isSwiping && isHorizontalSwipe && deltaX > 0) {
        e.preventDefault(); // Prevent scrolling during swipe
        
        // Apply a resistance factor for natural feel
        const resistance = 0.8;
        const transformX = Math.min(deltaX * resistance, window.innerWidth);
        
        // Calculate progress as a percentage (0-1)
        const progress = Math.min(transformX / (window.innerWidth * 0.6), 1);
        
        // Apply transform with subtle scaling and rotation for natural feel
        const scale = 1 - (0.05 * progress);
        const rotate = 2 * progress; // Max 2 degrees rotation
        const opacity = 1 - (0.3 * progress);
        
        pageRef.current.style.transform = `translateX(${transformX}px) scale(${scale}) rotate(${rotate}deg)`;
        pageRef.current.style.opacity = opacity.toString();
        
        // Update visual indicator if present
        const indicator = pageRef.current.querySelector('[data-swipe-indicator]') as HTMLElement;
        if (indicator) {
          indicator.style.transform = `scaleX(${progress})`;
          indicator.style.opacity = progress.toString();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!pageRef.current || !isHorizontalSwipe || !isSwiping || isTransitioning) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const swipeTime = touchEndTime - touchStartTime;
      const velocity = swipeDistance / swipeTime;
      
      // Navigate back if swipe meets criteria:
      // 1. Swipe is at least 30% of screen width, OR
      // 2. Swipe velocity is fast enough (> 0.5 px/ms)
      const shouldNavigateBack = (swipeDistance > window.innerWidth * 0.3) || (velocity > 0.5);
      
      // Add visual feedback for swipe indicator
      const indicator = pageRef.current.querySelector('[data-swipe-indicator]') as HTMLElement;
      if (indicator) {
        indicator.style.transition = 'all 0.3s ease';
        indicator.style.transform = shouldNavigateBack ? 'scaleX(1)' : 'scaleX(0)';
        indicator.style.opacity = shouldNavigateBack ? '1' : '0';
      }
      
      if (shouldNavigateBack) {
        // Prevent multiple transitions
        setIsTransitioning(true);
        
        // Add smooth transition for exit animation
        pageRef.current.style.transition = 'all 0.35s cubic-bezier(0.32, 0.72, 0.2, 1)';
        pageRef.current.style.transform = `translateX(${window.innerWidth}px) scale(0.92) rotate(3deg)`;
        pageRef.current.style.opacity = '0';
        
        // Navigate after animation completes
        setTimeout(() => {
          navigate('/');
          setIsTransitioning(false);
        }, 350);
      } else {
        // Spring back to original position
        pageRef.current.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        pageRef.current.style.transform = 'translateX(0) scale(1) rotate(0deg)';
        pageRef.current.style.opacity = '1';
        
        // Reset after animation completes
        setTimeout(() => {
          pageRef.current?.style.removeProperty('transition');
        }, 400);
      }
      
      // Reset flags
      isSwiping = false;
      isHorizontalSwipe = false;
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
              {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
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
