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

  // Get feeling from entry and ensure it's properly typed
  const feeling = entry.feeling ? {
    emoji: entry.feeling.emoji || "",
    label: entry.feeling.label || ""
  } : null;

  // Debug log to check feeling data
  console.log(`Entry ${entry.id} feeling:`, feeling);


  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-semibold line-clamp-1">
            {entry.title || "Untitled Entry"}
          </CardTitle>
          {feeling && (
            <div className="text-sm mt-1 flex items-center gap-1.5">
              <span className="text-muted-foreground">is feeling</span>
              <span>{feeling.label}</span>
              <span>{feeling.emoji}</span>
            </div>
          )}
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