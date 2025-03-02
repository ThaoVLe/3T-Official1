import { Card } from "@/components/ui/card";

interface MediaPreviewProps {
  urls: string[];
}

export default function MediaPreview({ urls }: MediaPreviewProps) {
  // Ensure urls is always an array
  const mediaUrls = urls || [];

  if (!mediaUrls.length) return null;

  return (
    <Card className="p-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {mediaUrls.map((url, index) => {
          // Make sure url is defined and is a string before calling match
          if (!url || typeof url !== 'string') {
            console.warn("Invalid URL in MediaPreview:", url);
            return null;
          }

          try {
            const isVideo = url.match(/\.(mp4|webm)$/i);
            const isAudio = url.match(/\.(mp3|wav|ogg|webm)$/i);

            if (isVideo) {
              return (
                <video
                  key={index}
                  controls
                  className="w-full h-40 object-cover rounded-lg"
                  src={url}
                />
              );
            }

            if (isAudio) {
              return (
                <audio key={index} controls className="w-full" src={url} />
              );
            }

            return (
              <img
                key={index}
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            );
          } catch (error) {
            console.error("Error handling media URL:", url, error);
            return null;
          }
        })}
      </div>
    </Card>
  );
}