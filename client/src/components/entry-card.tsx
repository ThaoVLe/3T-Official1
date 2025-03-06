import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share, X } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [emblaRef] = useEmblaCarousel({ 
    dragFree: true,
    containScroll: "trimSnaps"
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

  const getMediaGrid = () => {
    if (!entry.mediaUrls?.length) return null;

    const mediaCount = entry.mediaUrls.length;

    if (mediaCount === 1) {
      return "grid-cols-1";
    } else if (mediaCount === 2) {
      return "grid-cols-2";
    } else if (mediaCount === 3) {
      return "grid-cols-2";
    } else if (mediaCount === 4) {
      return "grid-cols-2";
    } else {
      return "grid-cols-2";
    }
  };

  return (
    <>
      <Card className="group bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardHeader className="space-y-0 pb-2 pt-4 px-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-[18px] font-semibold">
                {entry.title || "Untitled Entry"}
              </CardTitle>

              {/* Timestamp line */}
              <div className="text-sm text-muted-foreground">
                {formatTimeAgo(entry.createdAt)}
              </div>

              {/* Emotions and location line - will wrap if needed */}
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

            {/* Action buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <Link href={`/edit/${entry.id}`}>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </Link>
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
        </CardHeader>

        <CardContent className="px-4 pt-0 pb-4">
          {/* Text content with expansion */}
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

          {/* Media gallery */}
          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
            <div className={`mt-4 -mx-4 grid ${getMediaGrid()} gap-1`}>
              {entry.mediaUrls.map((url, i) => {
                const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                // Special layout for 3 or more images
                const isFirstInThree = entry.mediaUrls.length === 3 && i === 0;
                const isFirstInFive = entry.mediaUrls.length >= 5 && i === 0;

                const containerClasses = `
                  relative overflow-hidden cursor-pointer
                  ${isFirstInThree || isFirstInFive ? 'col-span-2 row-span-2' : ''}
                  ${entry.mediaUrls.length >= 5 && i >= 4 ? 'hidden' : ''}
                `;

                if (isVideo) {
                  return (
                    <div
                      key={i}
                      className={containerClasses}
                      onClick={() => setSelectedMedia(url)}
                    >
                      <video
                        src={url}
                        className="w-full h-full object-cover aspect-square"
                        playsInline
                      />
                    </div>
                  );
                }

                if (isAudio) {
                  return (
                    <div
                      key={i}
                      className="col-span-2 flex items-center justify-center h-24 bg-muted p-4"
                    >
                      <audio src={url} controls className="w-full" />
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className={containerClasses}
                    onClick={() => setSelectedMedia(url)}
                  >
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover aspect-square"
                      loading="lazy"
                    />
                    {entry.mediaUrls.length >= 5 && i === 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          +{entry.mediaUrls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-screen media dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedMedia(null)}
              className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
            {selectedMedia?.match(/\.(mp4|webm|MOV|mov)$/i) ? (
              <video
                src={selectedMedia}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={selectedMedia!}
                alt="Full size media"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}