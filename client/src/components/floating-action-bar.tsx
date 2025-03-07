import { Plus, Image, Video, Smile, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import MediaUploader from "@/components/media-uploader";
import { useState } from "react";

interface FloatingActionBarProps {
  onMediaUpload: (file: File) => Promise<void>;
  onFeelingSelect: (feeling: { emoji: string; label: string } | null) => void;
  onLocationSelect: (location: { lat: number; lng: number; address?: string; name?: string } | null) => void;
  selectedFeeling: { emoji: string; label: string } | null;
  selectedLocation: { lat: number; lng: number; address?: string; name?: string } | null;
}

export function FloatingActionBar({
  onMediaUpload,
  onFeelingSelect,
  onLocationSelect,
  selectedFeeling,
  selectedLocation
}: FloatingActionBarProps) {

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t z-50"
         style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
      <div className="p-2 flex items-center gap-2">
        <MediaUploader
          onUpload={onMediaUpload}
          triggerClassName="h-10 w-10 rounded-full"
          triggerContent={<Image className="h-5 w-5" />}
        />

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