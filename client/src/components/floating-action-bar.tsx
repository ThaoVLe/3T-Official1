import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Smile } from "lucide-react";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { MediaUploader } from "@/components/media-uploader";

interface FloatingActionBarProps {
  onMediaUpload: (file: File) => Promise<void>;
  onFeelingSelect: (feeling: { emoji: string; label: string } | null) => void;
  onLocationSelect: (location: string | null) => void;
  selectedFeeling: { emoji: string; label: string } | null;
  selectedLocation: string | null;
}

export function FloatingActionBar({
  onMediaUpload,
  onFeelingSelect,
  onLocationSelect,
  selectedFeeling,
  selectedLocation
}: FloatingActionBarProps) {
  const [showAttachOptions, setShowAttachOptions] = useState(false);

  const handleMediaUpload = (url: string) => {
    // The MediaUploader component returns the URL directly after upload
    // We need to convert this back to simulate the old direct file handling
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], url.split('/').pop() || 'file', { type: blob.type });
        onMediaUpload(file);
      })
      .catch(error => {
        console.error("Error converting URL to file:", error);
      });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t z-50"
         style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
      <div className="p-2 flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachOptions(!showAttachOptions)}
            className="h-10 w-10 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {showAttachOptions && (
            <div className="absolute bottom-full left-0 mb-2 bg-background rounded-lg shadow-lg border p-2">
              <MediaUploader onUpload={handleMediaUpload} />
            </div>
          )}
        </div>

        <FeelingSelector
          selectedFeeling={selectedFeeling}
          onSelect={onFeelingSelect}
          triggerClassName="h-10 w-10 rounded-full p-0"
          triggerContent={<Smile className="h-5 w-5" />}
        />

        <LocationSelector
          selectedLocation={selectedLocation}
          onSelect={onLocationSelect}
          triggerClassName="h-10 w-10 rounded-full p-0"
          triggerContent={<MapPin className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}