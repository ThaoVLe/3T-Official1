import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
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

  return (
    <Card className="group bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardHeader className="space-y-0 pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-[18px] font-semibold">
              {entry.title || "Untitled Entry"}
            </CardTitle>

            {/* Combined timestamp, feeling, and location line */}
            <div className="text-sm text-muted-foreground flex items-center gap-2 overflow-hidden">
              <span className="whitespace-nowrap">{formatTimeAgo(entry.createdAt)}</span>
              
              {/* Add dash if feeling or location exists */}
              {(feeling || entry.location) && <span className="whitespace-nowrap"> – </span>}
              
              <div className="flex flex-wrap items-center gap-2">
                {feeling && (
                  <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                    {feeling.label.includes(',') ? (
                      <>
                        <span>{feeling.label.split(',')[0].trim()} {feeling.emoji.split(' ')[0]}</span>
                        <span className="mx-1">while</span>
                        <span>{feeling.label.split(',')[1].trim()} {feeling.emoji.split(' ')[1]}</span>
                      </>
                    ) : (
                      <>
                        <span>feeling {feeling.label}</span>
                        <span>{feeling.emoji}</span>
                      </>
                    )}
                  </div>
                )}
                
                {entry.location && (
                  <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                    <span>at {entry.location}</span>
                    <span>📍</span>
                  </div>
                )}
              </div>
            </div>
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
          className={`prose max-w-none ${!isExpanded && needsExpansion(entry.content) ? 'line-clamp-3' : ''}`}
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
          <div className="mt-4 -mx-4">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {entry.mediaUrls.map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm)$/i);
                  const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                  if (isVideo) {
                    return (
                      <div key={i} className="embla__slide">
                        <video
                          src={url}
                          controls
                          playsInline
                          className="w-full aspect-video object-cover rounded-none"
                        />
                      </div>
                    );
                  }

                  if (isAudio) {
                    return (
                      <div key={i} className="embla__slide">
                        <div className="flex items-center justify-center h-24 bg-muted p-4">
                          <audio src={url} controls className="w-full" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="embla__slide">
                      <img
                        src={url}
                        alt={`Media ${i + 1}`}
                        className="w-full aspect-video object-cover rounded-none"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}