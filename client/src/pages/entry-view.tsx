import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MediaDialog from '@/components/media-dialog';

export default function EntryView() {
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Simulate fetching media URLs
    setMediaUrls([
      "/uploads/1740888734670-499828667.png",
      "/uploads/1740888745066-299718979.jpg",
      "/uploads/1740889516623-276984805.png",
      "/uploads/1740889526409-751943855.jpg",
    ]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="heading-1">Entry Title</h1>
              <Button variant="outline">Edit</Button>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p>
                This is the content of an entry. It can contain rich text formatting,
                links, and other elements supported by the editor. The user can write
                about their experiences, thoughts, or anything they want to document.
              </p>
              <p>
                Multiple paragraphs and formatting can be used to structure the content.
                This is just an example of what the content might look like.
              </p>
            </div>

            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {mediaUrls.map((url, i) => {
                  const fileExtension = url.split('.').pop()?.toLowerCase();
                  const isVideo = ['mp4', 'webm', 'mov'].includes(fileExtension || '');
                  const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension || '');

                  if (isVideo) {
                    return (
                      <div 
                        key={i} 
                        className="w-full bg-muted rounded-lg p-4"
                        ref={el => (mediaRefs.current[i] = el)}
                      >
                        <video src={url} controls className="w-full" />
                      </div>
                    );
                  }

                  if (isAudio) {
                    return (
                      <div 
                        key={i} 
                        className="w-full bg-muted rounded-lg p-4"
                        ref={el => (mediaRefs.current[i] = el)}
                      >
                        <audio src={url} controls className="w-full" />
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      className="w-full cursor-pointer"
                      ref={el => (mediaRefs.current[i] = el)}
                      onClick={() => setSelectedMediaIndex(i)}
                    >
                      <img
                        src={url}
                        alt={`Media ${i + 1}`}
                        className="w-full rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {selectedMediaIndex !== null && (
        <MediaDialog
          urls={mediaUrls}
          initialIndex={selectedMediaIndex}
          open={selectedMediaIndex !== null}
          onOpenChange={() => setSelectedMediaIndex(null)}
        />
      )}
    </div>
  );
}