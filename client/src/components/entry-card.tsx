
import { format } from "date-fns";
import Link from "next/link";
import { DiaryEntry } from "#/shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "#/lib/query";
import { apiRequest } from "#/lib/axios";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useToast } from "#/components/ui/use-toast";
import { Edit2, MapPin, Share, Trash2 } from "lucide-react";
import { useState } from "react";

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

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

  // Function to format time display
  const formatTimeAgo = (createdAt: string | Date) => {
    const now = new Date();
    const entryDate = new Date(createdAt);
    const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return format(entryDate, "MMMM d, yyyy");
    }
  };

  // Helper function to check if content is long
  const isLongContent = () => {
    // Create a temporary div to check content length
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = entry.content;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    return textContent.length > 150;
  };
  
  // Helper to determine if we should show media expansion
  const hasExcessMedia = entry.mediaUrls && entry.mediaUrls.length > 3;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-[15px] relative">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-semibold line-clamp-1">
            <span>{entry.title || "Untitled Entry"}</span>
          </CardTitle>
          <div className="flex items-center text-sm mt-1 w-full">
            <div className="flex items-center w-full">
              <span className="text-muted-foreground flex-grow">
                {formatTimeAgo(entry.createdAt)}
              </span>
              <span className="mx-1"></span> {/* 1 blank space */}
              {feeling && (
                <>
                  <span>-</span>
                  <div className="inline-flex items-center gap-1 ml-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {feeling.label.includes(',') ? (
                      <>
                        {feeling.label.split(',')[0].trim()} {feeling.emoji.split(' ')[0]}
                        {' - '}{feeling.label.split(',')[1].trim()} {feeling.emoji.split(' ')[1]}
                      </>
                    ) : (
                      <>
                        {feeling.label} {feeling.emoji}
                      </>
                    )}
                  </div>
                </>
              )}
              {entry.location && (
                <>
                  <span>-</span>
                  <div className="inline-flex items-center gap-1 ml-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="text-xs">{entry.location.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
          >
            <Share className="h-4 w-4"/>
            <span className="sr-only">Share</span>
          </Button>
          <Link href={`/edit/${entry.id}`}>
            <Button size="icon" variant="ghost" className="hover:bg-muted">
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Facebook-style content with See More/See Less */}
        <div className={`relative ${!expanded && isLongContent() ? 'max-h-[120px] overflow-hidden' : ''}`}>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
          
          {isLongContent() && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent"></div>
          )}
        </div>
        
        {isLongContent() && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-primary hover:underline text-sm font-medium mt-1"
          >
            {expanded ? 'See Less' : 'See More'}
          </button>
        )}
        
        {/* Facebook-style media display */}
        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
          <div className="mt-4">
            {/* Different layouts based on number of media */}
            <div className={`grid gap-1 ${
              entry.mediaUrls.length === 1 ? 'grid-cols-1' : 
              entry.mediaUrls.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {/* Show only first 3 images when not expanded, or all when expanded */}
              {(expanded ? entry.mediaUrls : entry.mediaUrls.slice(0, 3)).map((url, i) => {
                const isVideo = url.match(/\.(mp4|webm|mov|MOV)$/i);
                const isAudio = url.match(/\.(mp3|wav|ogg)$/i);
                
                if (isVideo) {
                  return (
                    <div key={i} className="relative aspect-video bg-muted rounded-md overflow-hidden">
                      <video
                        src={url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                } else if (isAudio) {
                  return (
                    <div key={i} className="relative bg-muted rounded-md p-4 flex items-center justify-center">
                      <audio
                        src={url}
                        controls
                        className="w-full"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={i} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                      <img
                        src={url}
                        alt={`Media ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                }
              })}
              
              {/* Show indicator for more media when not expanded */}
              {!expanded && hasExcessMedia && (
                <div 
                  className="aspect-square bg-muted/50 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  <span className="text-lg font-semibold">+{entry.mediaUrls.length - 3}</span>
                </div>
              )}
            </div>
            
            {/* See all media button when there are more than 3 */}
            {hasExcessMedia && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full mt-2 text-sm text-primary hover:underline font-medium"
              >
                {expanded ? 'Show Less' : `See All ${entry.mediaUrls.length} Media`}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
