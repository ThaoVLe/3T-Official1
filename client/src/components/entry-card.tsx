import { useParams, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share, MessageCircle, Play, Lock } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ProgressiveImage } from './progressive-image';
import { useSettings } from "@/lib/settings";

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
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartTimeRef = useRef<number>(0);
  const settings = useSettings();

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

    touchStartTimeRef.current = Date.now();
    setIsSwiping(false);
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setScrollLeft(mediaScrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!mediaScrollRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;

    // Wait for a minimum movement before deciding direction
    const minMovement = 5;
    if (Math.abs(dx) < minMovement && Math.abs(dy) < minMovement) {
      return;
    }

    // Calculate the angle of the swipe
    const angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);

    // Only handle horizontal swipes and only prevent default for horizontal
    // If this is a horizontal swipe (angle < 30 degrees) and movement is significant
    if (angle < 30 && Math.abs(dx) > minMovement) {
      setIsSwiping(true);
      e.preventDefault(); // Prevent scroll only for confirmed horizontal swipes

      // Calculate velocity for smooth scrolling
      const time = Date.now() - touchStartTimeRef.current;
      const velocity = dx / time;

      // Apply immediate scroll response with velocity-based offset
      const scrollOffset = -dx * (1 + Math.abs(velocity) * 0.1);
      mediaScrollRef.current.scrollLeft = scrollLeft + scrollOffset;
    } else {
      // Let vertical swipes pass through without interference
      setIsSwiping(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!mediaScrollRef.current || !isSwiping) return;

    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTimeRef.current;
    const currentX = e.changedTouches[0].clientX;
    const totalSwipeDistance = currentX - startX;
    const swipeVelocity = Math.abs(totalSwipeDistance / touchDuration);

    // Calculate the current scroll position and container width
    const containerWidth = mediaScrollRef.current.offsetWidth;
    const currentScrollLeft = mediaScrollRef.current.scrollLeft;
    const itemWidth = containerWidth * 0.6667; // 66.67vw

    // Determine the target index based on swipe velocity and direction
    let targetIndex = Math.round(currentScrollLeft / itemWidth);
    if (swipeVelocity > 0.5) { // If swipe was fast enough
      targetIndex += totalSwipeDistance < 0 ? 1 : -1;
    }

    // Ensure target index is within bounds
    targetIndex = Math.max(0, Math.min(targetIndex, (entry.mediaUrls?.length || 1) - 1));

    // Smooth scroll to the target position with dynamic duration
    const targetScrollLeft = targetIndex * itemWidth;
    const scrollDistance = Math.abs(targetScrollLeft - currentScrollLeft);
    const duration = Math.min(scrollDistance / (swipeVelocity * 1000), 300); // Cap at 300ms

    mediaScrollRef.current.scrollTo({
      left: targetScrollLeft,
      behavior: scrollDistance < 50 ? 'smooth' : 'auto' // Use instant for small adjustments
    });

    setIsSwiping(false);
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

  const handleMediaClick = (mediaIndex: number) => {
    const container = document.querySelector('.diary-content');
    if (container) {
      sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
      sessionStorage.setItem('lastViewedEntryId', entry.id.toString());
    }

    if (setSelectedEntryId) {
      setSelectedEntryId(entry.id.toString());
    }

    sessionStorage.setItem('selectedMediaIndex', mediaIndex.toString());
    const cleanUrl = `/entry/${entry.id}?media=${mediaIndex}`;
    navigate(cleanUrl);
  };

  return (
    <Card className="group bg-card border-border shadow-none w-full mb-4">
      <CardHeader className="space-y-0 pb-2 pt-3 px-0">
        <div className="flex justify-between items-start px-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-[18px] font-semibold text-foreground">
                {entry.title || "Untitled Entry"}
              </CardTitle>
              {entry.sensitive && settings.isPasswordProtectionEnabled && (
                <Lock className="h-4 w-4 text-amber-600" />
              )}
            </div>

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
          className={`prose max-w-none text-foreground ${!isExpanded && needsExpansion(entry.content) ? 'line-clamp-3' : ''} ${needsExpansion(entry.content) ? 'cursor-pointer' : ''}`}
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        {needsExpansion(entry.content) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:text-primary/90 mt-1 font-medium"
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
              className="flex gap-2.5 px-2.5 pb-2.5 overflow-x-auto snap-x snap-mandatory"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                overscrollBehavior: 'auto'
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
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => !isSwiping && handleMediaClick(index)}
                    >
                      <motion.div 
                        className="h-full w-full relative rounded-xl overflow-hidden bg-muted"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        {!isVideo ? (
                          <ProgressiveImage
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            sizes="(max-width: 768px) 66.66vw, 512px"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={url}
                              className="h-full w-full object-cover"
                              playsInline
                              preload="metadata"
                              muted
                              ref={(el) => {
                                if (el) {
                                  const handleLoadedMetadata = () => {
                                    el.currentTime = 1;
                                    el.removeEventListener('loadedmetadata', handleLoadedMetadata);
                                  };
                                  el.addEventListener('loadedmetadata', handleLoadedMetadata);
                                }
                              }}
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
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
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