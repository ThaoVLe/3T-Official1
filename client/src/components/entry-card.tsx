
import { useState } from "react";
import { Link } from "wouter";
import { Trash2, Edit2, Share } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { DiaryEntry } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Get feeling from entry and ensure it's properly typed
  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  // Function to truncate text content for preview
  const truncateContent = (content: string) => {
    const lines = content.split('\n').slice(0, 3);
    return lines.join('\n');
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{entry.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>{format(new Date(entry.date), "MMM d, yyyy")}</span>
              {entry.location && (
                <>
                  <span>-</span>
                  <div className="inline-flex items-center gap-1 ml-1">
                    <span className="text-xs">{entry.location}</span>
                    <span className="text-xs">📍</span>
                  </div>
                </>
              )}
              {feeling && (
                <>
                  <span>-</span>
                  <div className="inline-flex items-center gap-1 ml-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    <span>{feeling.emoji}</span>
                    <span>{feeling.label}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1.5">
            <Link href={`/edit/${entry.id}`}>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          {/* Facebook-style post content with expand/collapse */}
          <div className="entry-content">
            {entry.content && (
              <div className="text-content">
                {isExpanded ? (
                  <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                ) : (
                  <>
                    <div 
                      className="truncated-content" 
                      dangerouslySetInnerHTML={{ 
                        __html: truncateContent(entry.content.replace(/<[^>]*>/g, ''))
                      }} 
                    />
                    {entry.content.length > 200 && (
                      <button 
                        className="text-primary text-sm font-medium mt-1 hover:underline"
                        onClick={() => setIsExpanded(true)}
                      >
                        See more
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Media Gallery */}
          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
            <div className="media-gallery">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {(isExpanded ? entry.mediaUrls : entry.mediaUrls.slice(0, 3)).map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm|mov|MOV)$/i);
                  const isAudio = url.match(/\.(mp3|wav|ogg)$/i);
                  
                  if (isVideo) {
                    return (
                      <video
                        key={i}
                        src={url}
                        controls
                        className="rounded-md w-full h-auto object-cover aspect-square"
                      />
                    );
                  }
                  
                  if (isAudio) {
                    return (
                      <audio
                        key={i}
                        src={url}
                        controls
                        className="rounded-md w-full"
                      />
                    );
                  }
                  
                  return (
                    <img
                      key={i}
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="rounded-md w-full h-auto object-cover aspect-square"
                    />
                  );
                })}
              </div>
              
              {/* Show "See more" for media when collapsed */}
              {!isExpanded && entry.mediaUrls.length > 3 && (
                <div 
                  className="relative mt-2 rounded-md bg-muted cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      +{entry.mediaUrls.length - 3} more
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Toggle expand/collapse button */}
          {isExpanded && (
            <button 
              className="text-primary text-sm font-medium mt-2 hover:underline"
              onClick={() => setIsExpanded(false)}
            >
              See less
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
