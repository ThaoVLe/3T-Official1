import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Video, Music } from "lucide-react";

interface MediaDialogProps {
  url?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MediaDialog({ url, open, onOpenChange }: MediaDialogProps) {
  if (!url) return null;

  const isVideo = url.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
  const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] sm:h-[80vh] p-0 bg-black/90">
        <div className="w-full h-full flex items-center justify-center">
          {isVideo && (
            <video
              src={url}
              controls
              autoPlay
              className="max-w-full max-h-[80vh] object-contain"
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
              className="max-w-full max-h-[80vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
