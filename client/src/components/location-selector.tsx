
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
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Handle getting current location
  const getLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setIsOpen(true);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get your location. Please try again.");
          setIsLoading(false);
          // Set a default position if geolocation fails
          setPosition([51.505, -0.09]); // London as default
          setIsOpen(true);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLoading(false);
      // Set a default position if geolocation is not supported
      setPosition([51.505, -0.09]); // London as default
      setIsOpen(true);
    }
  };

  // Load Leaflet when dialog opens
  useEffect(() => {
    if (!isOpen || !position) return;
    
    const loadLeaflet = async () => {
      // Add CSS if not already added
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      
      // Add script if Leaflet is not already loaded
      if (!window.L) {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => {
            console.error("Failed to load Leaflet script");
            reject(new Error("Failed to load Leaflet"));
          };
          document.head.appendChild(script);
        });
      }
    };

    loadLeaflet()
      .then(() => {
        // Wait a moment to ensure DOM is ready
        setTimeout(initializeMap, 100);
      })
      .catch(error => {
        console.error("Error loading Leaflet:", error);
        toast.error("Failed to load map. Please try again.");
      });
      
    return () => {
      // Cleanup when dialog closes
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isOpen, position]);
  
  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !window.L || !position) return;
    
    // Clean up existing map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
    }
    
    try {
      console.log("Initializing map with position:", position);
      
      // Create map
      const map = window.L.map(mapRef.current).setView(position, 13);
      
      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add marker
      const marker = window.L.marker(position, { draggable: true }).addTo(map);
      
      // Update position when marker is dragged
      marker.on('dragend', () => {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
      });
      
      // Update position when map is clicked
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        marker.setLatLng([lat, lng]);
      });
      
      // Store references
      mapInstance.current = map;
      markerRef.current = marker;
      
      // Make sure map renders correctly by forcing a resize
      map.invalidateSize();
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to initialize map");
    }
  };

  const reverseGeocode = async () => {
    if (!position) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("Geocoding response:", data);
        
        if (data && data.display_name) {
          onSelect(data.display_name);
          setIsOpen(false);
        } else {
          toast.error("Could not find address for this location");
        }
      } else {
        toast.error("Failed to get address information");
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

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-4 w-[90vw] max-w-[500px] max-h-[85vh] overflow-hidden">
            <Dialog.Title className="text-lg font-semibold mb-2">Select your location</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              Click on the map to select a specific location, or drag the marker to adjust.
            </Dialog.Description>

            <div className="w-full h-[300px] mb-4 relative rounded overflow-hidden border border-gray-200">
              {/* Loading indicator */}
              {!window.L && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
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
