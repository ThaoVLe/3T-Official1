import { useParams, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share, MessageCircle } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState, useRef, useEffect } from 'react';

// Component for video thumbnails with rotating key frames
const VideoThumbnail = ({ url, className }: { url: string; className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [keyFrames, setKeyFrames] = useState<number[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Generate 3 random key frames when component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (!video) return;

      // Generate 3 random positions within the video duration
      const duration = video.duration;
      if (isNaN(duration) || duration <= 0) return;

      const frames = [
        Math.random() * 0.3 * duration, // First third
        0.3 * duration + Math.random() * 0.3 * duration, // Middle third
        0.6 * duration + Math.random() * 0.4 * duration // Last third
      ];

      setKeyFrames(frames);

      // Set initial frame
      if (frames.length > 0) {
        video.currentTime = frames[0];
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Rotate through key frames every second
  useEffect(() => {
    if (keyFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % keyFrames.length;
        const video = videoRef.current;
        if (video) {
          video.currentTime = keyFrames[nextIndex];
        }
        return nextIndex;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [keyFrames]);

  return (
    <video
      ref={videoRef}
      src={url}
      className={className}
      playsInline
      muted
      preload="auto"
      crossOrigin="anonymous"
      poster={`${url}#t=0.1`}
    />
  );
};

interface EntryCardProps {
  entry: DiaryEntry;
  setSelectedEntryId?: (id: string) => void;
}

export default function EntryCard({ entry, setSelectedEntryId }: EntryCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();

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
          <div className="mt-3 -mx-4">
            {entry.mediaUrls[0] && (
              <div className="aspect-[16/9] w-full cursor-pointer overflow-hidden">
                {entry.mediaUrls[0].match(/\.(mp4|webm|MOV|mov)$/i) ? (
                  <VideoThumbnail url={entry.mediaUrls[0]} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={entry.mediaUrls[0]}
                    alt="Media 1"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            )}

            {entry.mediaUrls.length > 1 && (
              <div className="grid grid-cols-2 gap-[1px] mt-[1px]">
                {entry.mediaUrls.slice(1, 3).map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                  const isLastVisible = i === 1 && entry.mediaUrls && entry.mediaUrls.length > 3;
                  const mediaIndex = i + 1;

                  return (
                    <div 
                      key={i} 
                      className="aspect-square relative cursor-pointer overflow-hidden"
                      onClick={() => handleMediaClick(mediaIndex)}
                    >
                      {isVideo ? (
                        <VideoThumbnail url={url} className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${mediaIndex + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {isLastVisible && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white text-xl font-semibold">
                            +{entry.mediaUrls.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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