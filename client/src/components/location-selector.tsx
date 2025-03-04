
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapIcon, X } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from '@radix-ui/react-dialog';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyCxV0vVB-klj97_MauL0xWjPRfcsdKJIJI";

interface LocationSelectorProps {
  onSelect: (location: string) => void;
  selectedLocation: string | null;
}

export function LocationSelector({ onSelect, selectedLocation }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (isOpen && !mapScriptLoaded) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Maps script loaded");
        setMapScriptLoaded(true);
      };
      
      script.onerror = () => {
        console.error("Error loading Google Maps script");
        toast.error("Failed to load map. Please try again later.");
        setIsOpen(false);
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        // Cleanup function to remove script if component unmounts before script loads
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isOpen, mapScriptLoaded]);
  
  // Initialize map when position is available and script is loaded
  useEffect(() => {
    if (isOpen && mapScriptLoaded && position && mapContainerRef.current) {
      console.log("Initializing map with position:", position);
      
      try {
        // Create map instance
        const mapOptions: google.maps.MapOptions = {
          center: position,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        };
        
        const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
        mapRef.current = map;
        
        // Add marker at the current position
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });
        markerRef.current = marker;
        
        // Update position when marker is dragged
        marker.addListener("dragend", () => {
          if (marker.getPosition()) {
            const newPos = marker.getPosition();
            if (newPos) {
              setPosition({
                lat: newPos.lat(),
                lng: newPos.lng()
              });
            }
          }
        });
        
        // Click on map to update marker position
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng && markerRef.current) {
            markerRef.current.setPosition(e.latLng);
            setPosition({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        toast.error("Failed to initialize map. Please try again.");
      }
    }
  }, [isOpen, position, mapScriptLoaded]);

  // Handle Get Location button click
  const getLocation = useCallback(() => {
    setIsLoading(true);
    setIsOpen(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setPosition(newPosition);
          console.log("Got position:", newPosition);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get your location. Please try again or select manually.");
          // Default to a random position (New York) if geolocation fails
          setPosition({ lat: 40.7128, lng: -74.0060 });
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      // Default to a fallback position
      setPosition({ lat: 40.7128, lng: -74.0060 });
      setIsLoading(false);
    }
  }, []);

  // Reverse geocode to get address from location
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

  // Close dialog and clean up
  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      // Don't reset map and marker references here, they'll be recreated when needed
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

      {/* Modal dialog for map */}
      <Dialog.Root open={isOpen} onOpenChange={handleCloseDialog}>
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
                style={{ background: "#f0f0f0" }}
              >
                {!mapScriptLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
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
    </>
  );
}
