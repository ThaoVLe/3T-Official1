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

  // Function to format time display
  const formatTimeAgo = (date: string | number | Date) => {
    const now = new Date();
    const entryDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays > 30) {
      return format(entryDate, "MMMM d, yyyy");
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

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-[15px] relative">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-semibold line-clamp-1">
            <span>{entry.title || "Untitled Entry"}</span>
          </CardTitle>
          <div className="flex items-center text-sm mt-1 w-full">
            <div className="flex items-center">
              <span className="text-muted-foreground">{formatTimeAgo(entry.createdAt)}</span>
              <span className="mx-4"></span> {/* 4 blank spaces */}
              {feeling && (
                <>
                  <span>-</span>
                  <span className="ml-1">feeling</span>
                  {feeling.emoji.includes(' ') ? (
                    // Combined emotion and activity
                    <>
                      <span className="ml-1">{feeling.label.split(',')[0]}</span>
                      <span className="ml-1">{feeling.emoji.split(' ')[0]}</span>
                      <span>,</span>
                      <span className="ml-1">{feeling.label.split(',')[1].trim()}</span>
                      <span className="ml-1">{feeling.emoji.split(' ')[1]}</span>
                    </>
                  ) : (
                    // Just emotion
                    <>
                      <span className="ml-1">{feeling.label}</span>
                      <span className="ml-1">{feeling.emoji}</span>
                    </>
                  )}
                </>
              )}
              {entry.location && (
                <>
                  <span className="mx-4"></span> {/* 4 blank spaces */}
                  <span>-</span>
                  <span className="ml-1">at</span>
                  <span className="ml-1">{entry.location}</span>
                  <span className="ml-1">📍</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-[4px] right-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              // Share functionality can be expanded later
              if (navigator.share) {
                navigator.share({
                  title: entry.title || "My Diary Entry",
                  text: `Check out my diary entry: ${entry.title || "Untitled Entry"}`,
                  url: window.location.origin + `/entry/${entry.id}`,
                }).catch(err => console.log('Error sharing:', err));
              } else {
                // Fallback for browsers that don't support navigator.share
                navigator.clipboard.writeText(window.location.origin + `/entry/${entry.id}`)
                  .then(() => toast({
                    title: "Link copied",
                    description: "Entry link copied to clipboard"
                  }))
                  .catch(err => console.error('Could not copy text:', err));
              }
            }}
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