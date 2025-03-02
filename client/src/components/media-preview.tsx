import { Card } from "@/components/ui/card";

interface MediaPreviewProps {
  urls: string[];
}

export default function MediaPreview({ urls }: MediaPreviewProps) {
  if (!urls?.length) return null;

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {urls.map((url, index) => {
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
        })}
      </div>
    </Card>
  );
}
