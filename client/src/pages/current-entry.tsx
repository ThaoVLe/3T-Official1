
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/apiClient';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { DiaryEntry } from "@shared/schema";

export default function CurrentEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        if (id) {
          const data = await apiRequest.get(`/entries/${id}`);
          setEntry(data);
        }
      } catch (error) {
        console.error("Error fetching entry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!entry) {
    return <div className="flex justify-center items-center h-screen">Entry not found</div>;
  }

  return (
    <div className="entry-full-page">
      <div className="entry-container max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarFallback>
              {entry.author?.substring(0, 2) || "US"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{entry.author || "Anonymous"}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(entry.createdAt), 'MMMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">{entry.title}</h1>
        
        {entry.location && (
          <div className="text-sm text-muted-foreground mb-2">
            📍 {entry.location}
          </div>
        )}
        
        {entry.mood && (
          <div className="text-sm text-muted-foreground mb-4">
            Feeling: {entry.mood}
          </div>
        )}
        
        <div className="entry-content my-4">
          <p className="whitespace-pre-wrap">{entry.content}</p>
        </div>
        
        {entry.image && (
          <div className="my-4">
            <img 
              src={entry.image} 
              alt="Entry image" 
              className="rounded-md max-h-96 w-auto object-contain"
            />
          </div>
        )}
        
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Back to entries
          </Link>
        </div>
      </div>
    </div>
  );
}
