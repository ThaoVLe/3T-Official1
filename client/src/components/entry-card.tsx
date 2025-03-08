import { useParams, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share, MessageCircle, Play } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";

interface EntryCardProps {
  entry: DiaryEntry;
  setSelectedEntryId?: (id: string) => void;
}

export default function EntryCard({ entry, setSelectedEntryId }: EntryCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const mediaScrollRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setHasScrolled(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !mediaScrollRef.current) return;

    const deltaX = startX - e.touches[0].clientX;
    const deltaY = Math.abs(startY - e.touches[0].clientY);

    // Only handle horizontal scrolling if the movement is more horizontal than vertical
    // and we haven't started vertical scrolling
    if (Math.abs(deltaX) > deltaY && !hasScrolled) {
      e.preventDefault();
      mediaScrollRef.current.scrollLeft += deltaX;
      setStartX(e.touches[0].clientX);
    } else {
      setHasScrolled(true);
    }
  };

  const handleMediaClick = (mediaIndex: number) => {
    if (isDragging) return;

    const container = document.querySelector('.diary-content');
    if (container) {
      sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
      sessionStorage.setItem('lastViewedEntryId', entry.id.toString());
    }

    if (setSelectedEntryId) {
      setSelectedEntryId(entry.id.toString());
    }

    navigate(`/entry/${entry.id}?media=${mediaIndex}`);
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
                    {feeling.label}
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
        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
          <motion.div 
            className="mt-3 -mx-4 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              ref={mediaScrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x scrollbar-none"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              <AnimatePresence mode="popLayout">
                {entry.mediaUrls.map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);

                  return (
                    <motion.div
                      key={index}
                      className="flex-none w-full snap-center px-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleMediaClick(index)}
                    >
                      <motion.div 
                        className="w-full aspect-[4/3] relative rounded-xl overflow-hidden bg-muted"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ 
                          duration: 0.2,
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
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
                                whileHover={{ 
                                  scale: 1.1,
                                  backgroundColor: 'rgba(255, 255, 255, 0.4)'
                                }}
                              >
                                <Play className="h-6 w-6 text-white" />
                              </motion.div>
                            </motion.div>
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 768px"
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