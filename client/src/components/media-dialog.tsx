import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Music, X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaDialogProps {
  url?: string;
  urls: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MediaDialog({ url, urls, open, onOpenChange }: MediaDialogProps) {
  if (!url) return null;

  const currentIndex = urls.indexOf(url);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < urls.length - 1;

  const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
  const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);

  const navigateMedia = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < urls.length) {
      const nextUrl = urls[newIndex];
      onOpenChange(false);
      setTimeout(() => onOpenChange(true), 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 sm:inset-auto top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[80%] max-h-[90vh] p-0 bg-black/90 relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-50 text-white hover:bg-white/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation buttons */}
        {hasPrevious && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
            onClick={() => navigateMedia('prev')}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
            onClick={() => navigateMedia('next')}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center overflow-auto py-8">
          <div className="max-w-[90%] max-h-[80vh] flex items-center justify-center">
            {isVideo && (
              <video
                src={url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
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
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}