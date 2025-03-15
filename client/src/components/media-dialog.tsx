
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProgressiveImage } from "@/components/progressive-image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';

interface MediaDialogProps {
  urls: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MediaDialog({ urls, initialIndex = 0, open, onOpenChange }: MediaDialogProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex });
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const canScrollPrev = emblaApi && emblaApi.canScrollPrev();
  const canScrollNext = emblaApi && emblaApi.canScrollNext();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });

    // Cleanup
    return () => {
      emblaApi.off('select');
    };
  }, [emblaApi]);

  useEffect(() => {
    // When dialog opens, set the initial index
    if (open && emblaApi) {
      emblaApi.scrollTo(initialIndex);
    }
  }, [open, initialIndex, emblaApi]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-lg w-screen h-screen sm:h-auto sm:max-h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
        <Button 
          className="absolute right-4 top-4 z-50" 
          size="icon" 
          variant="ghost"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="relative w-full h-full flex items-center justify-center">
          <div className="embla w-full h-full" ref={emblaRef}>
            <div className="embla__container h-full">
              {urls.map((url, index) => (
                <MediaSlide key={url + index} url={url} index={index} />
              ))}
            </div>
          </div>

          {canScrollPrev && (
            <Button 
              className="absolute left-4 z-40" 
              size="icon" 
              variant="ghost"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {canScrollNext && (
            <Button 
              className="absolute right-4 z-40" 
              size="icon" 
              variant="ghost"
              onClick={scrollNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaSlide({ url, index }: { url: string; index: number }) {
  const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i) || 
                url.includes('video') || 
                url.toLowerCase().includes('.mov');
  
  // Special handling for blob URLs
  const isBlob = url.startsWith('blob:');

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
          <img 
            src={url}
            alt={`Media ${index + 1}`}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
            onError={(e) => {
              if (url.startsWith('blob:')) {
                e.currentTarget.remove();
              } else {
                console.error(`Failed to load image: ${url}`);
                (e.target as HTMLImageElement).style.display = 'none';
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
