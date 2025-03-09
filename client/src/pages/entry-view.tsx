import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, MessageCircle, Share2, FileEdit, Trash2, Play, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, mediaPreviewVariants } from "@/components/animations";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Comments } from "@/components/comments";
import { PasswordDialog } from "@/components/password-dialog";
import { useSettings } from "@/lib/settings";

export default function EntryView() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();
  const settings = useSettings();

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

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: [`/api/entries/${id}/comments`],
    enabled: !!id,
  });

  const toggleSensitiveMutation = useMutation({
    mutationFn: async () => {
      if (!entry) return;
      await apiRequest("PATCH", `/api/entries/${id}`, {
        ...entry,
        sensitive: !entry.sensitive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${id}`] });
      toast({
        title: "Entry updated",
        description: `Entry marked as ${entry?.sensitive ? "not sensitive" : "sensitive"}`,
      });
    },
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

  const verifyPassword = async (password: string) => {
    try {
      await apiRequest("POST", "/api/verify-password", { password });
      setShowPasswordDialog(false);
      // Password verified, continue showing the entry
    } catch (error) {
      toast({
        title: "Invalid password",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

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
        }
        const container = document.querySelector('.diary-content');
        if (container) {
          sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
        }
        setIsExiting(true);
        setTimeout(() => navigate('/'), 100);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [id, navigate]);

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

  useEffect(() => {
    // Check if entry is sensitive and password protection is enabled
    if (entry?.sensitive && settings.isPasswordProtectionEnabled) {
      setShowPasswordDialog(true);
    }
  }, [entry?.sensitive, settings.isPasswordProtectionEnabled]);

  if (!entry) return null;

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
      <div className={`min-h-screen flex flex-col bg-background w-full ${isExiting ? 'pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="container px-4 py-2 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (id) {
                  sessionStorage.setItem('lastViewedEntryId', id);
                }
                setIsExiting(true);
                setTimeout(() => navigate('/'), 100);
              }}
              className="mr-2"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold truncate max-w-[75%] text-foreground">
                {entry.title || "Untitled Entry"}
              </h1>
              {entry.sensitive && settings.isPasswordProtectionEnabled && (
                <Lock className="h-5 w-5 text-amber-600" />
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-auto w-full bg-background">
          <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
            <AnimatePresence mode="wait">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
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
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />

                {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                  <div className="space-y-2 my-4">
                    {entry.mediaUrls.map((url, index) => {
                      const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                      return (
                        <motion.div 
                          key={index} 
                          className="rounded-lg overflow-hidden border relative"
                          ref={el => mediaRefs.current[index] = el}
                          variants={mediaPreviewVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ delay: index * 0.1 }}
                        >
                          {isVideo ? (
                            <div className="relative w-full">
                              <video
                                src={url}
                                controls
                                playsInline
                                preload="metadata"
                                poster={url + '#t=0.5'}
                                className="w-full aspect-video object-cover rounded-lg"
                                onLoadStart={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.currentTime = 0.5; // Set to 0.5 seconds for thumbnail
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                <div className="rounded-full bg-white/30 p-3">
                                  <Play className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
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
                      <Share2 className="h-4 w-4"/>
                    </Button>
                    {settings.isPasswordProtectionEnabled && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleSensitiveMutation.mutate()}
                        className={`h-8 w-8 ${entry.sensitive ? 'text-amber-600 hover:bg-amber-100' : 'hover:bg-muted'}`}
                      >
                        {entry.sensitive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/edit/${entry.id}`)}
                      className="h-8 w-8 hover:bg-muted"
                    >
                      <FileEdit className="h-4 w-4" />
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
                  <div className="mt-4 pb-16" id="comments-section">
                    <Comments 
                      entryId={entry.id} 
                      onCommentCountChange={(count) => {
                        queryClient.invalidateQueries({ queryKey: [`/api/entries/${id}/comments`] });
                      }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSubmit={verifyPassword}
        mode="verify"
        title="Protected Entry"
        description="This entry is password protected. Please enter your password to view it."
      />
    </PageTransition>
  );
}