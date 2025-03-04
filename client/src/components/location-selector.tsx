
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, X } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from '@radix-ui/react-dialog';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyCxV0vVB-klj97_MauL0xWjPRfcsdKJIJI";

interface LocationSelectorProps {
  onSelect: (location: string) => void;
  selectedLocation: string | null;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

export function LocationSelector({ onSelect, selectedLocation }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapsLoaded = useRef(false);
  
  // Load Google Maps script
  useEffect(() => {
    if (isOpen && !googleMapsLoaded.current) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleMapsLoaded.current = true;
        initializeMap();
      };
      document.body.appendChild(script);
      
      return () => {
        // Clean up script if component unmounts before script loads
        if (!googleMapsLoaded.current) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isOpen]);
  
  // Initialize map when position is available and Google Maps is loaded
  useEffect(() => {
    if (isOpen && position && googleMapsLoaded.current) {
      initializeMap();
    }
  }, [position, isOpen]);

  const initializeMap = () => {
    if (!position || !mapContainerRef.current || !window.google) return;
    
    // Create map
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: position,
      zoom: 14,
    });
    
    // Create marker
    const marker = new window.google.maps.Marker({
      position: position,
      map: map,
      draggable: true,
    });
    
    // Set refs
    mapRef.current = map;
    markerRef.current = marker;
    
    // Add event listeners
    map.addListener('click', (e: any) => {
      if (e.latLng) {
        const newPos = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        setPosition(newPos);
        marker.setPosition(newPos);
      }
    });
    
    marker.addListener('dragend', () => {
      if (marker.getPosition()) {
        setPosition({
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng()
        });
      }
    });
  };
  
  // Handle getting current location
  const getLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          setIsOpen(true);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get your location. Using default location.");
          // Set a default position if geolocation fails
          setPosition({ lat: 40.7128, lng: -74.006 }); // New York as default
          setIsOpen(true);
          setIsLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      // Set a default position if geolocation is not supported
      setPosition({ lat: 40.7128, lng: -74.006 }); // New York as default
      setIsOpen(true);
      setIsLoading(false);
    }
  };

  const reverseGeocode = async () => {
    if (!position || !window.google) return;

    setIsLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (result && result[0] && result[0].formatted_address) {
        onSelect(result[0].formatted_address);
        setIsOpen(false);
        toast.success("Location added successfully");
      } else {
        toast.error("Could not find address for this location");
      }
    } catch (error) {
      console.error("Error getting address:", error);
      toast.error("Failed to get address information");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLocation = () => {
    if (position) {
      reverseGeocode();
    } else {
      toast.error("Please select a location first");
    }
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

      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-xl font-semibold">
                  Select Location
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="rounded-full p-1 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-4">
                  Click on the map to select a location or drag the marker to adjust the position.
                </p>

                <div 
                  ref={mapContainerRef}
                  className="w-full h-[400px] relative border rounded-md overflow-hidden"
                ></div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmLocation}
                  disabled={isLoading || !position}
                >
                  {isLoading ? "Confirming..." : "Confirm Location"}
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  );
}
