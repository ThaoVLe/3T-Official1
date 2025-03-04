
import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, X } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from '@radix-ui/react-dialog';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface LocationSelectorProps {
  onSelect: (location: string) => void;
  selectedLocation: string | null;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Get a proper API key from https://console.cloud.google.com/
const GOOGLE_MAPS_API_KEY = "AIzaSyCxV0vVB-klj97_MauL0xWjPRfcsdKJIJI";

export function LocationSelector({ onSelect, selectedLocation }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  
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
          setIsLoading(false);
          // Set a default position if geolocation fails
          setPosition({ lat: 40.7128, lng: -74.006 }); // New York as default
          setIsOpen(true);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLoading(false);
      // Set a default position if geolocation is not supported
      setPosition({ lat: 40.7128, lng: -74.006 }); // New York as default
      setIsOpen(true);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
    mapRef.current = map;
  }, []);

  const onMarkerLoad = useCallback((marker: google.maps.Marker) => {
    console.log("Marker loaded successfully");
    markerRef.current = marker;
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  }, []);

  const reverseGeocode = async () => {
    if (!position) return;

    setIsLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
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
              <Dialog.Title className="text-xl font-semibold mb-4">
                Select Location
              </Dialog.Title>

              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-4">
                  Click on the map to select a location or drag the marker to adjust the position.
                </p>

                <div className="w-full h-[400px] relative border rounded-md overflow-hidden">
                  {position && (
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} loadingElement={<div>Loading...</div>}>
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={position}
                        zoom={14}
                        onClick={onMapClick}
                        onLoad={onMapLoad}
                      >
                        <Marker
                          position={position}
                          draggable={true}
                          onLoad={onMarkerLoad}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              setPosition({
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng()
                              });
                            }
                          }}
                        />
                      </GoogleMap>
                    </LoadScript>
                  )}
                </div>
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
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm Location"}
                </Button>
              </div>

              <button 
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  );
}
