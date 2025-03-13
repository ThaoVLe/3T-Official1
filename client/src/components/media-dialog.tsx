
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface MediaDialogProps {
  urls: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MediaDialog({ urls, initialIndex = 0, open, onOpenChange }: MediaDialogProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex });

  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(initialIndex);
    }
  }, [emblaApi, initialIndex]);

  const renderMedia = useCallback((url: string, index: number) => {
    const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i) || 
                    url.includes('video') || 
                    url.toLowerCase().includes('.mov');

    return (
      <div className="embla__slide relative w-full flex items-center justify-center min-w-0">
        {isVideo ? (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] w-auto h-auto"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <img 
              src={url}
              alt={`Media ${index + 1}`}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
              onError={(e) => {
                console.error(`Failed to load image: ${url}`);
                // Set a fallback source or placeholder
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = "text-white text-sm p-4 bg-black/50 rounded";
                  errorDiv.innerText = "Image failed to load";
                  parent.appendChild(errorDiv);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }, []);

  if (!urls?.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[85%] sm:h-[85vh] p-0 border-0 bg-transparent backdrop-blur-sm">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 bg-white/10 hover:bg-white/20 text-white"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="embla w-full h-full" ref={emblaRef}>
          <div className="embla__container h-full flex touch-pan-y">
            {urls.map((url, index) => (
              <div key={index} className="relative flex-grow-0 flex-shrink-0 basis-full">
                {renderMedia(url, index)}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
