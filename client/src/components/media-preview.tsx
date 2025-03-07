import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/date";

interface MediaPreviewProps {
  urls: string[];
  onRemove: (index: number) => void;
  loading?: boolean;
  uploadProgress?: number;
}

export function MediaPreview({ urls, onRemove, loading = false, uploadProgress = 0 }: MediaPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mediaRefs = useRef<(HTMLImageElement | HTMLVideoElement)[]>([]);

  // Create a timestamp for each media
  const [timestamps] = useState<Date[]>(() => 
    urls.map(() => new Date())
  );

  // Focus the last added media when urls change
  useEffect(() => {
    if (urls.length > 0) {
      const lastIndex = urls.length - 1;
      const lastMedia = mediaRefs.current[lastIndex];
      if (lastMedia) {
        lastMedia.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [urls.length]);

  if (urls.length === 0 && !loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {urls.map((url, index) => {
          const isVideo = url.match(/\.(mp4|webm|mov|MOV)$/i);
          const currentTime = timestamps[index] || new Date();

          return (
            <div
              key={url}
              className="relative rounded-md overflow-hidden group"
              style={{ width: 'calc(50% - 10px)', aspectRatio: '1/1' }}
            >
              {isVideo ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el) mediaRefs.current[index] = el;
                  }}
                  playsInline
                />
              ) : (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el) mediaRefs.current[index] = el;
                  }}
                  loading="lazy"
                />
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <span className="text-white text-xs">
                  {formatTimeAgo(currentTime)}
                </span>
              </div>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}

        {loading && (
          <div
            className="relative rounded-md overflow-hidden bg-muted animate-pulse"
            style={{ width: 'calc(50% - 10px)', aspectRatio: '1/1' }}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 bg-primary h-1" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}