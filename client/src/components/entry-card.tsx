import React, { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface EntryCardProps {
  entry: DiaryEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // Function to handle delete
  const { mutate: deleteEntry } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    },
  });

  // Function to truncate text
  const truncateText = (text: string, maxLines: number) => {
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  // Extract the first 3 lines for preview
  const previewText = !isExpanded && entry.content 
    ? truncateText(entry.content, 3) 
    : entry.content;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">
              {format(new Date(entry.createdAt), "MMMM d, yyyy")}
            </CardTitle>
            <div className="text-sm text-muted-foreground flex">
              <span>{format(new Date(entry.createdAt), "h:mm a")}</span>
              {entry.location && (
                <>
                  <span>-</span>
                  <div className="inline-flex items-center gap-1 ml-1">
                    <span className="ml-1">at</span>
                    <span className="ml-1">{entry.location}</span>
                    <span className="ml-1">📍</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/editor/${entry.id}`}>Edit</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => deleteEntry()}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          {/* Content with "See more" functionality */}
          <div className="whitespace-pre-wrap mb-4">
            {previewText}
            {entry.content && entry.content.split('\n').length > 3 && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-primary font-medium block mt-2"
              >
                See more
              </button>
            )}
            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-primary font-medium block mt-2"
              >
                See less
              </button>
            )}
          </div>

          {/* Media display (Facebook-style) */}
          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
            <div className="media-container mt-4">
              {/* Show only first 3 media items when collapsed */}
              {(isExpanded ? entry.mediaUrls : entry.mediaUrls.slice(0, 3)).map((url, i) => {
                const isVideo = url.match(/\.(mp4|webm)$/i);
                const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                if (isVideo) {
                  return (
                    <video
                      key={i}
                      src={url}
                      controls
                      className="rounded-md max-h-96 mb-2 w-full object-cover"
                    />
                  );
                } else if (isAudio) {
                  return (
                    <audio
                      key={i}
                      src={url}
                      controls
                      className="rounded-md mb-2 w-full"
                    />
                  );
                } else {
                  return (
                    <img
                      key={i}
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="rounded-md max-h-96 mb-2 w-full object-cover"
                    />
                  );
                }
              })}

              {/* Show indicator for additional media when collapsed */}
              {!isExpanded && entry.mediaUrls.length > 3 && (
                <div 
                  className="relative rounded-md bg-muted/50 flex items-center justify-center h-48 cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                >
                  <span className="text-lg font-medium">
                    +{entry.mediaUrls.length - 3} more
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}