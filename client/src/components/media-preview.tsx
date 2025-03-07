import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MediaDialog from "./media-dialog";

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
  loading?: boolean;
  uploadProgress?: number;
}

export default function MediaPreview({ urls, onRemove, loading, uploadProgress = 0 }: MediaPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const videoRefs = useRef<{[key: number]: HTMLVideoElement}>({});
  const mediaUrls = urls || [];

  // Track loaded state of videos
  const [loadedVideos, setLoadedVideos] = useState<{[key: number]: boolean}>({});

  // Set up video playback for thumbnails
  useEffect(() => {
    mediaUrls.forEach((url, index) => {
      if (url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i) && videoRefs.current[index]) {
        const video = videoRefs.current[index];
        
        // Pre-load a frame at 0.1s to avoid initial white flash
        video.currentTime = 0.1;

        // Listen for when video can be played
        const handleCanPlay = () => {
          // Start playing the video in a loop
          video.play().catch(err => {
            console.log("Auto-play was prevented:", err);
            video.currentTime = 0.1;
          });
        };

        const handleLoadedData = () => {
          setLoadedVideos(prev => ({...prev, [index]: true}));
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleLoadedData);
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('loadeddata', handleLoadedData);
          video.pause();
        };
      }
    });
  }, [mediaUrls]);

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
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute -top-2 -right-2 bg-white shadow-sm rounded-full z-10"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            <div 
              className="w-full h-full overflow-hidden cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              {isVideo && (
                <div className="relative w-full h-full bg-neutral-100">
                  <video
                    ref={el => el && (videoRefs.current[index] = el)}
                    src={url}
                    className={`w-full h-full object-cover ${loadedVideos[index] ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                    muted
                    playsInline
                    loop
                    autoPlay
                    preload="auto"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              {!isVideo && (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
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