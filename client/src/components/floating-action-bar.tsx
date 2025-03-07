import { Plus, Image, Video, Smile, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { useState } from "react";

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
  const [showMediaOptions, setShowMediaOptions] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onMediaUpload(file);
    }
  };

  return (
    <div className="fixed bottom-[48px] left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-b z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="p-2 flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMediaOptions(!showMediaOptions)}
            className="h-10 w-10 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {showMediaOptions && (
            <div className="absolute bottom-full left-0 mb-2 bg-background rounded-lg shadow-lg border p-2 flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Image className="h-5 w-5" />
                </Button>
              </label>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Video className="h-5 w-5" />
                </Button>
              </label>
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