
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, X } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from '@radix-ui/react-dialog';

interface LocationSelectorProps {
  onSelect: (location: string) => void;
  selectedLocation: string | null;
}

export function LocationSelector({ onSelect, selectedLocation }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize map when dialog opens
  useEffect(() => {
    if (isOpen && position && mapRef.current) {
      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const loadLeaflet = async () => {
        if (window.L) return window.L;
        
        return new Promise<any>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = () => resolve(window.L);
          document.head.appendChild(script);
        });
      };

      // Initialize map
      const initMap = async () => {
        const L = await loadLeaflet();
        
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }
        
        // Create map
        leafletMapRef.current = L.map(mapRef.current).setView(position, 13);
        
        // Add tile layer (map image source)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapRef.current);
        
        // Add marker
        markerRef.current = L.marker(position, { draggable: true })
          .addTo(leafletMapRef.current)
          .bindPopup('Your selected location')
          .openPopup();
        
        // Update position when marker is dragged
        markerRef.current.on('dragend', function() {
          const newPos = markerRef.current.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
        });
        
        // Add click handler to map
        leafletMapRef.current.on('click', function(e: any) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        });
      };
      
      initMap();
      
      // Cleanup
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      };
    }
  }, [isOpen, position]);

  const getLocation = () => {
    setIsLoading(true);
    toast.info("Fetching your location...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
          setIsOpen(true);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting user's location:", error);
          // If we can't get user location, still open the map at a default location
          setPosition([40.7128, -74.0060]); // Default to NYC
          setIsOpen(true);
          setIsLoading(false);
          toast.error(`Could not get your location: ${error.message}`);
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

  const confirmLocation = async () => {
    if (!position) {
      toast.error("Please select a location on the map");
      return;
    }

    try {
      toast.info("Getting location name...");
      // Try to reverse geocode the coordinates to get a human-readable location
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
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
        const location = `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`;
        onSelect(location);
        toast.success(`Location added: ${location}`);
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      const location = `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`;
      onSelect(location);
      toast.success(`Location added: ${location}`);
    }
    
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        className="h-10 px-3 rounded-full flex items-center"
        aria-label="Add location"
        onClick={getLocation}
        disabled={isLoading}
      >
        <div className="flex items-center gap-1.5">
          <MapIcon className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium">
            {isLoading ? "Getting location..." : 
             selectedLocation ? "Location added" : "Add location"}
          </span>
        </div>
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-4 w-[90vw] max-w-[500px] max-h-[85vh] overflow-hidden">
            <Dialog.Title className="text-lg font-semibold mb-2">Select your location</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              Click on the map to select a specific location, or drag the marker to adjust.
            </Dialog.Description>

            <div className="w-full h-[300px] mb-4 relative rounded overflow-hidden border border-gray-200">
              <div ref={mapRef} className="w-full h-full"></div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setIsOpen(false)} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmLocation}
              >
                Confirm Location
              </Button>
            </div>
            
            <Dialog.Close asChild>
              <button 
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

// Add this to the window global to fix typescript error
declare global {
  interface Window {
    L: any;
  }
}
