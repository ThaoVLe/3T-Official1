
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, MessageSquare, Share, Bookmark } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useEffect } from "react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/apiClient";

export default function CurrentEntry() {
  const { id } = useParams();
  
  // Fetch the specific entry
  const { data: entry, isLoading } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    // Update the document title when entry loads
    if (entry?.title) {
      document.title = `${entry.title} | My Diary`;
    } else {
      document.title = "Entry | My Diary";
    }
    
    return () => {
      document.title = "My Diary";
    };
  }, [entry]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 mt-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Entries
          </Button>
        </Link>
        <Card>
          <CardContent className="p-0">
            <div className="p-4">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-6" />
              <Skeleton className="h-64 w-full rounded-md mb-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 mt-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Entries
          </Button>
        </Link>
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Entry Not Found</h2>
          <p className="text-muted-foreground mb-4">The entry you're looking for doesn't exist or has been deleted.</p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Format the date in Facebook style
  const formattedDate = format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a");
  
  // Get feeling from entry and ensure it's properly typed
  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 mt-4">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Entries
        </Button>
      </Link>
      
      <Card className="mb-8 overflow-hidden">
        {/* Header section */}
        <div className="p-4 border-b">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {entry.title ? entry.title[0].toUpperCase() : "D"}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex flex-col">
                <h2 className="font-semibold text-lg">
                  {entry.title || "Untitled Entry"}
                </h2>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{formattedDate}</span>
                  
                  {feeling && (
                    <span className="ml-1">
                      {" · "}feeling {feeling.label} {feeling.emoji}
                    </span>
                  )}
                  
                  {entry.location && (
                    <span className="ml-1">
                      {" · "}at {entry.location} 📍
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          <div 
            className="prose prose-sm sm:prose dark:prose-invert max-w-none mb-4" 
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </div>
        
        {/* Media section */}
        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
          <div className={`
            ${entry.mediaUrls.length === 1 ? 'p-0' : 'grid p-0'}
            ${entry.mediaUrls.length === 2 ? 'grid-cols-2' : ''}
            ${entry.mediaUrls.length === 3 ? 'grid-cols-3' : ''}
            ${entry.mediaUrls.length >= 4 ? 'grid-cols-2' : ''}
            gap-1
          `}>
            {entry.mediaUrls.map((url, index) => {
              const isVideo = url.match(/\.(mp4|webm|mov|MOV)$/i);
              const isAudio = url.match(/\.(mp3|wav|ogg)$/i);
              
              if (isVideo) {
                return (
                  <div key={index} className="relative w-full h-full aspect-video">
                    <video 
                      src={url} 
                      controls 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                );
              } else if (isAudio) {
                return (
                  <div key={index} className="p-4 bg-muted rounded-md">
                    <audio src={url} controls className="w-full" />
                  </div>
                );
              } else {
                return (
                  <div key={index} className="relative w-full h-full">
                    <img 
                      src={url} 
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                );
              }
            })}
          </div>
        )}
        
        {/* Facebook-style action buttons */}
        <div className="p-2 border-t">
          <div className="flex justify-between">
            <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
              <ThumbsUp className="h-5 w-5" />
              <span>Like</span>
            </Button>
            <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
              <span>Comment</span>
            </Button>
            <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: entry.title || "My Diary Entry",
                  text: `Check out my diary entry: ${entry.title || "Untitled Entry"}`,
                  url: window.location.origin + `/entry/${entry.id}`,
                }).catch(err => console.log('Error sharing:', err));
              } else {
                navigator.clipboard.writeText(window.location.origin + `/entry/${entry.id}`)
                  .then(() => alert("Link copied to clipboard"))
                  .catch(err => console.error('Could not copy text:', err));
              }
            }}>
              <Share className="h-5 w-5" />
              <span>Share</span>
            </Button>
            <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
              <Bookmark className="h-5 w-5" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
