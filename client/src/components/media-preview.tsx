import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Music, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MediaDialog from "./media-dialog";

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
  loading?: boolean;
}

export default function MediaPreview({ urls, onRemove, loading }: MediaPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const videoRefs = useRef<{[key: number]: HTMLVideoElement}>({});
  const [frameIndices, setFrameIndices] = useState<{[key: number]: number}>({});
  const mediaUrls = urls || [];

  // Load video thumbnails and rotate frames
  useEffect(() => {
    mediaUrls.forEach((url, index) => {
      if (url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i) && videoRefs.current[index]) {
        const video = videoRefs.current[index];

        // Listen for metadata to load before seeking
        const handleLoadedMetadata = () => {
          video.currentTime = 0; // Start with first frame
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    });
  }, [mediaUrls]);

  // Rotate through frames every 2 seconds
  useEffect(() => {
    const frames = [0, 1, 2]; // The three keyframe timestamps
    const interval = setInterval(() => {
      setFrameIndices(prev => {
        const newIndices = { ...prev };
        Object.keys(videoRefs.current).forEach(index => {
          const video = videoRefs.current[Number(index)];
          if (video) {
            const currentFrame = prev[Number(index)] || 0;
            const nextFrame = (currentFrame + 1) % frames.length;
            video.currentTime = frames[nextFrame];
            newIndices[Number(index)] = nextFrame;
          }
        });
        return newIndices;
      });
    }, 2000);

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

      {loading && (
        <Card className="w-[70px] h-[70px] relative flex items-center justify-center bg-slate-50">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </Card>
      )}

      {mediaUrls.map((url, index) => {
        if (!url || typeof url !== 'string') {
          console.warn("Invalid URL in MediaPreview:", url);
          return null;
        }

        try {
          const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
          const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);

          return (
            <Card key={index} className="w-[70px] h-[70px] relative">
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
                  <video
                    ref={el => el && (videoRefs.current[index] = el)}
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                {isAudio && (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <Music className="h-6 w-6 text-slate-500" />
                  </div>
                )}
                {!isVideo && !isAudio && (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Card>
          );
        } catch (error) {
          console.error("Error handling media URL:", url, error);
          return null;
        }
      })}
    </div>
  );
}