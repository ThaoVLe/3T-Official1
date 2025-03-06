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
    <Card className="group bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative">
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

              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                {feeling && (
                  <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                    {feeling.label.includes(',') ? (
                      <span className="whitespace-nowrap">
                        {feeling.label.split(',')[0].trim()} {feeling.emoji.split(' ')[0]} while {feeling.label.split(',')[1].trim()} {feeling.emoji.split(' ')[1]}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap">
                        feeling {feeling.label} {feeling.emoji}
                      </span>
                    )}
                  </div>
                )}

                {entry.location && (
                  <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs whitespace-nowrap">
                    <span>at {entry.location}</span>
                    <span>📍</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
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
        {/* Text content with expansion - now clickable */}
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

        {/* Media gallery - Facebook-style */}
        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
          <div className="mt-4 -mx-4 border-t border-b border-gray-200">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {entry.mediaUrls.map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
                  const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                  if (isVideo) {
                    return (
                      <div key={i} className="embla__slide p-0 overflow-hidden">
                        <video
                          src={url}
                          controls
                          playsInline
                          className="w-full h-full object-contain max-h-[500px] bg-black"
                        />
                      </div>
                    );
                  }

                  if (isAudio) {
                    return (
                      <div key={i} className="embla__slide">
                        <div className="flex items-center justify-center h-24 bg-gray-100 p-4 border-t border-b border-gray-200">
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
                        className="w-full h-full object-contain max-h-[500px] bg-black"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {entry.mediaUrls.length > 1 && (
              <div className="flex justify-center gap-1 py-2">
                {entry.mediaUrls.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}