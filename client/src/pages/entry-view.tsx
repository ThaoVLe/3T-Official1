
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
  const [swipeTranslate, setSwipeTranslate] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isTransitioning) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isHorizontalSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;
      
      // Determine if this is a horizontal swipe (used on first move)
      if (!isHorizontalSwipe && Math.abs(deltaX) > 10) {
        // If we've moved at least 10px horizontally, check if horizontal movement dominates
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY * 1.5);
      }
      
      // Only handle right swipes
      if (isHorizontalSwipe && deltaX > 0) {
        e.preventDefault(); // Prevent page scrolling
        setSwipeTranslate(deltaX);
        
        // Calculate opacity based on swipe distance (max 100px for full effect)
        const newOpacity = Math.max(1 - (deltaX / 250), 0.3);
        setOpacity(newOpacity);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning) return;
      
      const threshold = window.innerWidth * 0.3; // 30% of screen width
      
      if (swipeTranslate > threshold) {
        // Complete the swipe animation
        setIsTransitioning(true);
        setSwipeTranslate(window.innerWidth);
        setOpacity(0);
        
        // Navigate after animation
        setTimeout(() => {
          navigate('/');
        }, 300);
      } else {
        // Reset position with animation
        setIsTransitioning(true);
        setSwipeTranslate(0);
        setOpacity(1);
        
        // Clear transitioning state after animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('touchstart', handleTouchStart, { passive: false });
      content.addEventListener('touchmove', handleTouchMove, { passive: false });
      content.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (content) {
        content.removeEventListener('touchstart', handleTouchStart);
        content.removeEventListener('touchmove', handleTouchMove);
        content.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [navigate, swipeTranslate, isTransitioning]);

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
      className="flex flex-col h-screen overflow-hidden bg-white"
      style={{
        transform: `translateX(${swipeTranslate}px)`,
        opacity: opacity,
        transition: isTransitioning ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none'
      }}
      ref={contentRef}
    >
      {/* Visual swipe indicator */}
      <div className="absolute top-0 left-0 h-full w-16 flex items-center justify-center pointer-events-none">
        <div 
          className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
          style={{
            opacity: swipeTranslate > 0 ? Math.min(swipeTranslate / 100, 0.8) : 0
          }}
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </div>
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
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-4 py-6">
          <div className="space-y-4">
            <h1 className="text-[24px] font-semibold">
              {entry.title || "Untitled Entry"}
            </h1>

            <div className="text-sm text-muted-foreground">
              {formatDate(entry.createdAt)}
            </div>

            {/* Feelings and emotions */}
            {feeling && (
              <div className="py-2">
                {feeling.label.includes(',') ? (
                  <div className="text-muted-foreground">
                    feeling {feeling.label.split(',')[0].trim()} {feeling.emoji.split(' ')[0]}{' '}
                    while {feeling.label.split(',')[1].trim()} {feeling.emoji.split(' ')[1]}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    feeling {feeling.label} {feeling.emoji}
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {entry.location && (
              <div className="py-2 text-muted-foreground">
                at {entry.location} 📍
              </div>
            )}

            {/* Activity */}
            {entry.activity && (
              <div className="py-2 text-muted-foreground">
                {entry.activity.emoji} {entry.activity.label}
              </div>
            )}

            {/* Entry content */}
            <div
              className="prose prose-sm max-w-none prose-img:rounded-md"
              dangerouslySetInnerHTML={{ __html: entry.content || "" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
