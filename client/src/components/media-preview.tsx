import { Card } from "@/components/ui/card";

interface MediaPreviewProps {
  urls: string[];
}

export default function MediaPreview({ urls }: MediaPreviewProps) {
  const mediaUrls = urls || [];

  if (!mediaUrls.length) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {mediaUrls.map((url, index) => {
        if (!url || typeof url !== 'string') {
          console.warn("Invalid URL in MediaPreview:", url);
          return null;
        }

        try {
          const isVideo = url.match(/\.(mp4|webm)$/i);
          const isAudio = url.match(/\.(mp3|wav|ogg|webm)$/i);

          if (isVideo) {
            return (
              <Card key={index} className="w-[50px] h-[50px] overflow-hidden flex items-center justify-center">
                <video
                  src={url}
                  className="w-full h-full object-cover"
                />
              </Card>
            );
          }

          if (isAudio) {
            return (
              <Card key={index} className="w-[50px] h-[50px] overflow-hidden flex items-center justify-center bg-slate-100">
                <audio src={url} className="w-6 h-6" />
              </Card>
            );
          }

          return (
            <Card key={index} className="w-[50px] h-[50px] overflow-hidden">
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover"
              />
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