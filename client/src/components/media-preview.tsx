import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MediaDialog from "./media-dialog";
import { ProgressiveImage } from './progressive-image'; // Added import for ProgressiveImage

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
  loading?: boolean;
  uploadProgress?: number;
}

export default function MediaPreview({ urls, onRemove, loading, uploadProgress = 0 }: MediaPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const videoRefs = useRef<{[key: number]: HTMLVideoElement}>({});
  const [frameIndices, setFrameIndices] = useState<{[key: number]: number}>({});
  const mediaUrls = urls || [];

  // Load video thumbnails and set up for frame rotation
  useEffect(() => {
    mediaUrls.forEach((url, index) => {
      if (url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i) && videoRefs.current[index]) {
        const video = videoRefs.current[index];

        // Listen for metadata to load before seeking
        const handleLoadedMetadata = () => {
          // Start with second 1 (not 0) to show a better initial thumbnail
          video.currentTime = 1;
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    });
  }, [mediaUrls]);

  // Rotate through frames every second (1 keyframe per second)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndices(prev => {
        const newIndices = { ...prev };
        Object.keys(videoRefs.current).forEach(index => {
          const video = videoRefs.current[Number(index)];
          if (video) {
            // Get duration of video to determine max frames
            const duration = video.duration || 10; // Default to 10 seconds if duration not available
            const currentFrame = prev[Number(index)] || 0;
            // Move to next second, loop back to start if reached end
            const nextFrame = (currentFrame + 1) % Math.floor(duration);
            video.currentTime = nextFrame;
            newIndices[Number(index)] = nextFrame;
          }
        });
        return newIndices;
      });
    }, 1000); // Change every second

    return () => clearInterval(interval);
  }, []);

  if (!mediaUrls.length && !loading) return null;

  return (
    <div className="flex gap-3 flex-wrap">
      <MediaDialog 
        urls={mediaUrls}
        initialIndex={selectedIndex}
        open={selectedIndex !== undefined}
        onOpenChange={(open) => !open && setSelectedIndex(undefined)}
      />

      {/* Display media thumbnails */}
      {mediaUrls.map((url, index) => {
        if (!url || typeof url !== 'string') {
          console.warn("Invalid URL in MediaPreview:", url);
          return null;
        }

        const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
        const isLastItem = index === mediaUrls.length - 1;
        const isUploading = loading && isLastItem;

        return (
          <Card key={url} className="w-[70px] h-[70px] relative">
            {onRemove && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6 absolute -top-2 -right-2 bg-background border border-border shadow-sm rounded-full z-10"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4 text-foreground" />
              </Button>
            )}

            <div 
              className="w-full h-full overflow-hidden cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              {isVideo && (
                <video
                  ref={el => el && (videoRefs.current[index] = el)}
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
              {!isVideo && (
                <ProgressiveImage // Replaced <img> with <ProgressiveImage>
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                  previewSize="small"
                  maxSize={100}
                />
              )}

              {/* Upload progress overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={Math.PI * 28}
                      strokeDashoffset={(1 - uploadProgress / 100) * Math.PI * 28}
                      className="text-primary transition-all duration-300"
                      transform="rotate(-90 16 16)"
                    />
                  </svg>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}