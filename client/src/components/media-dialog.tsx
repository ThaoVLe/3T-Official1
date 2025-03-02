import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Video, Music } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect } from 'react';

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

  const renderMedia = useCallback((url: string) => {
    if (!url) return null;

    const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
    const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);

    return (
      <div className="embla__slide relative w-full flex items-center justify-center min-w-0">
        {isVideo && (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] w-auto h-auto"
          />
        )}
        {isAudio && (
          <div className="flex flex-col items-center gap-4 p-8">
            <Music className="h-20 w-20 text-white" />
            <audio src={url} controls className="w-80" />
          </div>
        )}
        {!isVideo && !isAudio && (
          <img
            src={url}
            alt="Media preview"
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
          />
        )}
      </div>
    );
  }, []);

  if (!urls?.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[85%] sm:h-[85vh] p-0 border-0 bg-black/95">
        <div className="embla w-full h-full" ref={emblaRef}>
          <div className="embla__container h-full flex touch-pan-y">
            {urls.map((url, index) => (
              <div key={index} className="relative flex-grow-0 flex-shrink-0 basis-full">
                {renderMedia(url)}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}