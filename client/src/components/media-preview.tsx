import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2, Grid2x2, LayoutList } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MediaDialog from "./media-dialog";

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
  loading?: boolean;
}

export default function MediaPreview({ urls, onRemove, loading }: MediaPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [isGridView, setIsGridView] = useState(false);
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

  const thumbnailSize = isGridView ? "w-[120px] h-[120px]" : "w-[70px] h-[70px]";

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsGridView(!isGridView)}
          className="h-8"
        >
          {isGridView ? (
            <LayoutList className="h-4 w-4 mr-2" />
          ) : (
            <Grid2x2 className="h-4 w-4 mr-2" />
          )}
          {isGridView ? "List View" : "Grid View"}
        </Button>
      </div>

      {/* Media grid */}
      <div className={`flex gap-3 flex-wrap ${isGridView ? 'justify-start' : ''}`}>
        <MediaDialog 
          urls={mediaUrls}
          initialIndex={selectedIndex}
          open={selectedIndex !== undefined}
          onOpenChange={(open) => !open && setSelectedIndex(undefined)}
        />

        {loading && (
          <Card className={`${thumbnailSize} relative flex items-center justify-center bg-slate-50`}>
            <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
          </Card>
        )}

        {mediaUrls.map((url, index) => {
          if (!url || typeof url !== 'string') {
            console.warn("Invalid URL in MediaPreview:", url);
            return null;
          }

          const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);

          return (
            <Card key={index} className={`${thumbnailSize} relative`}>
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
                {!isVideo && (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}