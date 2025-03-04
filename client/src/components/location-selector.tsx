
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

interface LocationSelectorProps {
  onSelect: (location: string) => void;
  selectedLocation: string | null;
}

export function LocationSelector({ onSelect, selectedLocation }: LocationSelectorProps) {
  const [open, setOpen] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          onSelect(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          onSelect("Location unavailable");
        }
      );
    } else {
      onSelect("Geolocation not supported");
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="h-10 px-3 rounded-full flex items-center"
      aria-label="Add location"
      onClick={getLocation}
    >
      <div className="flex items-center gap-1.5">
        <Map className="h-4 w-4" />
        <span className="text-sm font-medium">
          {selectedLocation ? "Location added" : "Add location"}
        </span>
      </div>
    </Button>
  );
}
