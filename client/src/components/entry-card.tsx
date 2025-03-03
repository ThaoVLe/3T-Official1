import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from 'react'; // Added import for useState

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { toast } = useToast();

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

  // Added state for feeling display
  const [feeling, setFeeling] = useState(entry.feeling || null);


  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {feeling && <span className="text-xl" title={feeling.label}>{feeling.emoji}</span>}
          <CardTitle className="text-xl font-semibold line-clamp-1">
            {entry.title || "Untitled Entry"}
          </CardTitle>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="text-sm text-muted-foreground mb-2">
          {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
        </div>
        <div
          className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 mb-4"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {entry.mediaUrls.map((url, i) => {
              const isVideo = url.match(/\.(mp4|webm)$/i);
              const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

              if (isVideo) {
                return (
                  <video
                    key={i}
                    src={url}
                    controls
                    className="rounded-md w-full h-32 object-cover bg-black"
                  />
                );
              }

              if (isAudio) {
                return (
                  <div key={i} className="flex items-center justify-center h-32 bg-muted rounded-md p-4">
                    <audio src={url} controls className="w-full" />
                  </div>
                );
              }

              return (
                <img
                  key={i}
                  src={url}
                  alt={`Media ${i + 1}`}
                  className="rounded-md w-full h-32 object-cover"
                  loading="lazy"
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import type { DiaryEntry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const hasMedia = entry.mediaUrls && entry.mediaUrls.length > 0;
  
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      {hasMedia && (
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={entry.mediaUrls[0]}
              alt={entry.title}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
      )}
      <CardContent className={`flex-grow p-4 ${hasMedia ? 'pt-4' : 'pt-5'}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg line-clamp-1">{entry.title}</h3>
            {entry.feeling && (
              <span className="text-xl">{entry.feeling.emoji}</span>
            )}
          </div>
          <div 
            className="text-muted-foreground text-sm line-clamp-3 h-[4.5em] overflow-hidden"
            dangerouslySetInnerHTML={{ 
              __html: entry.content.replace(/<[^>]*>/g, ' ').substring(0, 120) + '...' 
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
        </span>
        <Link href={`/entry/${entry.id}`}>
          <Button variant="outline" size="sm">View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
