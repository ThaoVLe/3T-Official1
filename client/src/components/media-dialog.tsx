
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProgressiveImage } from "@/components/progressive-image";
import { isBlobUrl } from '@/lib/image-cache';
import { cn } from '@/lib/utils';
import { useEmblaCarousel } from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: string[];
  initialIndex?: number;
}

export function MediaDialog({
  open,
  onOpenChange,
  media,
  initialIndex = 0,
}: MediaDialogProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex });

  React.useEffect(() => {
    if (emblaApi && initialIndex !== undefined && open) {
      emblaApi.scrollTo(initialIndex);
    }
  }, [emblaApi, initialIndex, open]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // No media to display
  if (!media || media.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-background/95 backdrop-blur-sm sm:rounded-lg overflow-hidden">
        <div className="relative w-full h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <div className="embla w-full h-full" ref={emblaRef}>
              <div className="embla__container h-full flex">
                {media.map((url, index) => (
                  <MediaSlide key={`${url}-${index}`} url={url} index={index} />
                ))}
              </div>
            </div>
          </div>
          
          {media.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-4">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Separate component for each slide
function MediaSlide({ url, index }: { url: string; index: number }) {
  const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i) || 
                url.includes('video') || 
                url.toLowerCase().includes('.mov');
  
  // Special handling for blob URLs
  const isBlob = isBlobUrl(url);

  return (
    <div className="embla__slide relative w-full flex items-center justify-center min-w-0">
      {isVideo ? (
        <video
          controls
          playsInline
          className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
          src={url}
          key={url}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          {isBlob ? (
            // Direct image display for blob URLs
            <img 
              src={url}
              alt={`Media ${index + 1}`}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
              onError={(e) => {
                console.error(`Failed to load blob image: ${url}`);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            // Use ProgressiveImage for non-blob URLs
            <ProgressiveImage
              src={url}
              alt={`Media ${index + 1}`}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
              priority={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
