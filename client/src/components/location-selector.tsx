
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
        async (position) => {
          try {
            // Try to reverse geocode the coordinates to get a human-readable location
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              // Get a simplified location like "City, Country" or fallback to coordinates
              let locationText = "Unknown location";
              
              if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
                const country = data.address.country;
                
                if (city && country) {
                  locationText = `${city}, ${country}`;
                } else if (city) {
                  locationText = city;
                } else if (country) {
                  locationText = country;
                }
              }
              
              onSelect(locationText);
            } else {
              // Fallback to coordinates if reverse geocoding fails
              const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
              onSelect(location);
            }
          } catch (error) {
            console.error("Error reverse geocoding location:", error);
            // Fallback to coordinates
            const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
            onSelect(location);
          }
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
