import { useParams, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share, MessageCircle, Play } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

interface EntryCardProps {
  entry: DiaryEntry;
  setSelectedEntryId?: (id: string) => void;
}

export default function EntryCard({ entry, setSelectedEntryId }: EntryCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();
  const mediaScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTouchX, setLastTouchX] = useState(0);
  const [touchVelocity, setTouchVelocity] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [touchIntent, setTouchIntent] = useState<'scroll' | 'tap' | null>(null);

  useEffect(() => {
    const container = mediaScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      setActiveMediaIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!mediaScrollRef.current) return;

    setIsDragging(false);
    setTouchIntent(null);
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setScrollLeft(mediaScrollRef.current.scrollLeft);
    setTouchStartTime(Date.now());
    setLastTouchX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!mediaScrollRef.current || !touchStartTime) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = startX - currentX;
    const deltaY = startY - currentY;
    const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const currentTime = Date.now();
    const timeDiff = currentTime - touchStartTime;

    // If we haven't determined the touch intent yet and the user has moved enough
    if (!touchIntent && moveDistance > 5) {
      setTouchIntent(Math.abs(deltaX) > Math.abs(deltaY) ? 'scroll' : 'tap');
    }

    // Calculate velocity for momentum scrolling
    if (timeDiff > 0) {
      const velocity = (currentX - lastTouchX) / timeDiff;
      setTouchVelocity(velocity);
      setLastTouchX(currentX);
    }

    // Only handle horizontal scrolling if that's the determined intent
    if (touchIntent === 'scroll') {
      e.preventDefault();
      setIsDragging(true);
      mediaScrollRef.current.scrollLeft = scrollLeft + deltaX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!mediaScrollRef.current) return;

    const container = mediaScrollRef.current;
    const timeDiff = Date.now() - touchStartTime;
    const isQuickTouch = timeDiff < 300 && !isDragging;

    // Handle tap
    if (isQuickTouch || touchIntent === 'tap') {
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      handleMediaClick(index);
      return;
    }

    // Handle scroll end with momentum
    if (touchIntent === 'scroll') {
      const itemWidth = container.offsetWidth;
      const currentScroll = container.scrollLeft;
      let targetIndex = Math.round(currentScroll / itemWidth);

      // Apply momentum effect
      const momentum = touchVelocity * 300; // Increased for more pronounced effect
      if (Math.abs(momentum) > itemWidth * 0.1) { // Threshold for momentum to trigger
        targetIndex += momentum > 0 ? 1 : -1;
      }

      // Clamp target index
      targetIndex = Math.max(0, Math.min(targetIndex, entry.mediaUrls?.length - 1 || 0));

      // Smooth scroll to target
      container.scrollTo({
        left: targetIndex * itemWidth,
        behavior: 'smooth'
      });
    }

    // Reset states
    setIsDragging(false);
    setTouchIntent(null);
    setTouchVelocity(0);
  };

  const handleMediaClick = (index: number) => {
    if (isDragging) return;

    // Save scroll position
    const container = document.querySelector('.diary-content');
    if (container) {
      sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
      sessionStorage.setItem('lastViewedEntryId', entry.id.toString());
    }

    // Navigate to entry view with media index
    navigate(`/entry/${entry.id}?media=${index}`);
  };

  // Fetch comment count
  const { data: comments = [] } = useQuery({
    queryKey: [`/api/entries/${entry.id}/comments`],
    enabled: !!entry.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/entries/${entry.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: "Entry deleted",
      });
    },
  });

  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  const formatTimeAgo = (createdAt: string | Date) => {
    const now = new Date();
    const entryDate = new Date(createdAt);
    const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays > 30) {
      return format(entryDate, "MMM dd, yyyy");
    } else if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      const diffInHours = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60));
      if (diffInHours > 0) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const diffInMinutes = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60));
        return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
    }
  };

  const needsExpansion = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || '';
    return textContent.length > 200;
  };


  return (
    <Card className="group bg-white shadow-none border-0 w-full mb-4">
      <CardHeader className="space-y-0 pb-2 pt-3 px-0">
        <div className="flex justify-between items-start px-4">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-[18px] font-semibold">
              {entry.title || "Untitled Entry"}
            </CardTitle>

            <div className="text-sm text-muted-foreground">
              {formatTimeAgo(entry.createdAt)}
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-0 pb-3">
        <div 
          onClick={() => needsExpansion(entry.content) && setIsExpanded(!isExpanded)}
          className={`prose max-w-none ${!isExpanded && needsExpansion(entry.content) ? 'line-clamp-3' : ''} ${needsExpansion(entry.content) ? 'cursor-pointer' : ''}`}
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        {needsExpansion(entry.content) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1 font-medium"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}

        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
          <motion.div 
            className="mt-3 -mx-4 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              ref={mediaScrollRef}
              className="flex gap-2.5 px-2.5 pb-2.5 overflow-x-auto snap-x snap-mandatory touch-pan-x scrollbar-none"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                overscrollBehavior: 'none',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="popLayout">
                {entry.mediaUrls.map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);

                  return (
                    <motion.div
                      key={index}
                      className="flex-none first:ml-2.5 last:mr-2.5 snap-center"
                      style={{
                        width: 'auto',
                        maxWidth: '66.666667vw',
                        height: '300px',
                        minWidth: '200px'
                      }}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        transition: { duration: 0.2 }
                      }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div 
                        className="h-full w-full relative rounded-xl overflow-hidden bg-muted"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isVideo ? (
                          <div className="h-full w-full relative">
                            <video
                              src={url}
                              className="h-full w-full object-cover"
                              playsInline
                              preload="metadata"
                              muted
                              poster={url + '#t=0.5'}
                            />
                            <motion.div 
                              className="absolute inset-0 bg-black/20 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div 
                                className="rounded-full bg-white/30 p-3"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                              >
                                <Play className="h-6 w-6 text-white" />
                              </motion.div>
                            </motion.div>
                          </div>
                        ) : (
                          <motion.img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            sizes="(max-width: 768px) 66.66vw, 512px"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (entry.id) {
                sessionStorage.setItem('lastViewedEntryId', entry.id.toString());
              }
              const container = document.querySelector('.diary-content');
              if (container) {
                sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
              }
              navigate(`/entry/${entry.id}?showComments=true`);
            }}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {comments.length > 0 ? (
              <span className="font-medium">{comments.length} Comments</span>
            ) : (
              <span>Comments</span>
            )}
          </Button>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: entry.title || "My Diary Entry",
                    text: `Check out my diary entry: ${entry.title || "Untitled Entry"}`,
                    url: window.location.origin + `/entry/${entry.id}`,
                  }).catch(err => console.log('Error sharing:', err));
                } else {
                  navigator.clipboard.writeText(window.location.origin + `/entry/${entry.id}`)
                    .then(() => toast({
                      title: "Link copied",
                      description: "Entry link copied to clipboard"
                    }))
                    .catch(err => console.error('Could not copy text:', err));
                }
              }}
              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
            >
              <Share className="h-4 w-4"/>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/edit/${entry.id}`)}
              className="h-8 w-8 hover:bg-muted"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}