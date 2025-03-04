
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { toast } from "sonner";

interface LocationSelectorProps {
  onSelect: (location: string) => void;
  selectedLocation: string | null;
}

export function LocationSelector({ onSelect, selectedLocation }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = () => {
    setIsLoading(true);
    toast.info("Fetching your location...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            toast.info("Location obtained, retrieving place name...");
            console.log("Got coordinates:", position.coords.latitude, position.coords.longitude);
            
            // Try to reverse geocode the coordinates to get a human-readable location
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
            );

            if (response.ok) {
              const data = await response.json();
              console.log("Geocoding response:", data);
              
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
              toast.success(`Location added: ${locationText}`);
            } else {
              console.error("Error response from geocoding service:", await response.text());
              // Fallback to coordinates if reverse geocoding fails
              const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
              onSelect(location);
              toast.success(`Location added: ${location}`);
            }
          } catch (error) {
            console.error("Error in reverse geocoding:", error);
            const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
            onSelect(location);
            toast.success(`Location added: ${location}`);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting user's location:", error);
          // Show the error to the user
          toast.error(`Could not get your location: ${error.message}`);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="h-10 px-3 rounded-full flex items-center"
      aria-label="Add location"
      onClick={getLocation}
      disabled={isLoading}
    >
      <div className="flex items-center gap-1.5">
        <Map className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">
          {isLoading ? "Getting location..." : 
           selectedLocation ? "Location added" : "Add location"}
        </span>
      </div>
    </Button>
  );
}
