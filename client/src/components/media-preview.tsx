import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
}

export default function MediaPreview({ urls, onRemove }: MediaPreviewProps) {
  const mediaUrls = urls || [];

  if (!mediaUrls.length) return null;

  return (
    <div className="flex gap-3 flex-wrap">
      {mediaUrls.map((url, index) => {
        if (!url || typeof url !== 'string') {
          console.warn("Invalid URL in MediaPreview:", url);
          return null;
        }

        try {
          const isVideo = url.match(/\.(mp4|webm)$/i);
          const isAudio = url.match(/\.(mp3|wav|ogg|webm)$/i);

          return (
            <Card key={index} className="w-[70px] h-[70px] relative group">
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute -top-2 -right-2 bg-white shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="w-full h-full overflow-hidden">
                {isVideo && (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                  />
                )}
                {isAudio && (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <audio src={url} className="w-6 h-6" />
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