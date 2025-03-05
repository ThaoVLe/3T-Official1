import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface EntryCardProps {
  entry: DiaryEntry;
  onDelete?: () => void;
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest.delete(`/api/entries/${entry.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted successfully.",
      });
      if (onDelete) {
        onDelete();
      }
    },
  });

  // Extract first 3 lines for preview
  const textContent = entry.content || '';
  const lines = textContent.split('\n');
  const previewLines = lines.slice(0, 3);
  const previewText = previewLines.join('\n');
  const hasMoreText = lines.length > 3;

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex flex-col">
              <CardTitle className="text-xl font-bold">{entry.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>{format(new Date(entry.date), "MMMM d, yyyy")}</span>
                {entry.location && (
                  <>
                    <span className="mx-1">•</span>
                    <div className="inline-flex items-center">
                      <span>📍 {entry.location}</span>
                    </div>
                  </>
                )}
                {entry.emotion && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{entry.emotion}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href={`/edit/${entry.id}`}>Edit</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="fb-style-content">
          {/* Text content with "See more" functionality */}
          <div className="text-content mb-3">
            {isExpanded ? (
              <div className="whitespace-pre-wrap">{textContent}</div>
            ) : (
              <>
                <div className="whitespace-pre-wrap">{previewText}</div>
                {hasMoreText && (
                  <button 
                    className="text-primary font-semibold mt-1 hover:underline focus:outline-none"
                    onClick={() => setIsExpanded(true)}
                  >
                    See more
                  </button>
                )}
              </>
            )}
          </div>

          {/* Media content */}
          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
            <div className="media-content mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(isExpanded ? entry.mediaUrls : entry.mediaUrls.slice(0, 3)).map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm)$/i);
                  const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                  if (isVideo) {
                    return (
                      <video
                        key={i}
                        src={url}
                        controls
                        className="w-full h-auto rounded-md object-cover"
                        style={{ maxHeight: "200px" }}
                      />
                    );
                  } else if (isAudio) {
                    return (
                      <audio
                        key={i}
                        src={url}
                        controls
                        className="w-full rounded-md"
                      />
                    );
                  } else {
                    return (
                      <img
                        key={i}
                        src={url}
                        alt={`Media ${i + 1}`}
                        className="w-full h-auto rounded-md object-cover"
                        style={{ maxHeight: "200px" }}
                      />
                    );
                  }
                })}
              </div>

              {!isExpanded && entry.mediaUrls.length > 3 && (
                <button 
                  className="mt-2 text-primary font-semibold hover:underline focus:outline-none"
                  onClick={() => setIsExpanded(true)}
                >
                  +{entry.mediaUrls.length - 3} more media
                </button>
              )}

              {isExpanded && entry.mediaUrls.length > 3 && (
                <button 
                  className="mt-2 text-primary font-semibold hover:underline focus:outline-none"
                  onClick={() => setIsExpanded(false)}
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}