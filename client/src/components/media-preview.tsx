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
  const [frameIndices, setFrameIndices] = useState<{[key: number]: number}>({});
  const [videoKeyFrames, setVideoKeyFrames] = useState<{[key: number]: number[]}>({});
  const mediaUrls = urls || [];

  // Generate random key frames for each video
  useEffect(() => {
    mediaUrls.forEach((url, index) => {
      if (url.match(/\.(mp4|webm|mov|MOV)$/i)) {
        // Generate 3 random frames between 0 and 10 seconds for each video
        const randomFrames = Array(3).fill(0).map(() => Math.random() * 10);
        setVideoKeyFrames(prev => ({
          ...prev,
          [index]: randomFrames
        }));
      }
    });
  }, [mediaUrls]);

  // Load video thumbnails and prepare to show key frames
  useEffect(() => {
    mediaUrls.forEach((url, index) => {
      if (url.match(/\.(mp4|webm|mov|MOV)$/i) && videoRefs.current[index]) {
        const video = videoRefs.current[index];

        // Listen for metadata to load before seeking
        const handleLoadedMetadata = () => {
          // Set to first key frame or 0 if no key frames yet
          const frames = videoKeyFrames[index] || [0];
          video.currentTime = frames[0];
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    });
  }, [mediaUrls, videoKeyFrames]);

  // Rotate through the random key frames every second
  useEffect(() => {
    // Only proceed if we have videos with key frames
    if (Object.keys(videoKeyFrames).length === 0) return;

    const interval = setInterval(() => {
      setFrameIndices(prev => {
        const newIndices = { ...prev };
        Object.keys(videoRefs.current).forEach(indexStr => {
          const index = Number(indexStr);
          const video = videoRefs.current[index];
          const frames = videoKeyFrames[index];

          if (video && frames) {
            const currentFrameIndex = prev[index] || 0;
            const nextFrameIndex = (currentFrameIndex + 1) % frames.length;
            video.currentTime = frames[nextFrameIndex];
            newIndices[index] = nextFrameIndex;
          }
        });
        return newIndices;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [videoKeyFrames]);

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

        const isVideo = url.match(/\.(mp4|webm|mov|MOV)$/i);
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
              {isVideo ? (
                <video
                  ref={el => el && (videoRefs.current[index] = el)}
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
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