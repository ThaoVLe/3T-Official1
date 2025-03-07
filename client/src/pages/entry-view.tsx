import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, MessageCircle, Share, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, mediaPreviewVariants } from "@/components/animations";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Comments } from "@/components/comments";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { toast } = useToast();

  // Check URL parameters for showComments
  useEffect(() => {
    const showCommentsParam = new URLSearchParams(window.location.search).get('showComments');
    if (showCommentsParam === 'true') {
      setShowComments(true);
      // Scroll to comments section after a short delay to ensure content is loaded
      setTimeout(() => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'instant', block: 'start' });
        } else {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'instant'
          });
        }
      }, 300); // Increased timeout to ensure DOM is fully loaded
    }
  }, []);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: "Entry deleted",
      });
      navigate("/");
    },
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
          sessionStorage.setItem('lastViewedEntryId', id);
          const container = document.querySelector('.diary-content');
          if (container) {
            sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
          }
          setIsExiting(true);
          setTimeout(() => navigate('/'), 100);
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
      setTimeout(() => {
        const mediaElement = mediaRefs.current[mediaIndex];
        if (mediaElement) {
          mediaElement.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, 100);
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

  // Update the comments button click handler
  const handleCommentsClick = () => {
    setShowComments(!showComments);
    const event = new CustomEvent('toggleComments', { 
      detail: { show: !showComments } 
    });
    window.dispatchEvent(event);

    if (!showComments) {
      // Update URL to reflect comments state without navigation
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('showComments', 'true');
      window.history.pushState({}, '', newUrl.toString());

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      // Remove showComments from URL when closing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('showComments');
      window.history.pushState({}, '', newUrl.toString());
    }
  };


  return (
    <PageTransition direction={1}>
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container px-4 py-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (id) {
                sessionStorage.setItem('lastViewedEntryId', id);
                setIsExiting(true);
                setTimeout(() => navigate('/'), 100);
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
          <AnimatePresence mode="wait">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
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

              {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                <div className="space-y-2 my-4">
                  {entry.mediaUrls.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                    return (
                      <motion.div 
                        key={index} 
                        className="rounded-lg overflow-hidden border"
                        ref={el => mediaRefs.current[index] = el}
                        variants={mediaPreviewVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ delay: index * 0.1 }}
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
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCommentsClick}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-medium">{commentCount > 0 ? `${commentCount} Comments` : "Comments"}</span>
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
                          url: window.location.href,
                        }).catch(err => console.log('Error sharing:', err));
                      } else {
                        navigator.clipboard.writeText(window.location.href)
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

              {/* Comments Section */}
              {showComments && (
                <div className="mt-4 pb-16">
                  <Comments 
                    entryId={entry.id} 
                    onCommentCountChange={setCommentCount}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
    </PageTransition>
  );
}