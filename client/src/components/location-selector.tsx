
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Load Google Maps script
  useEffect(() => {
    // Only load the script once, and only when needed
    if (!window.google && !document.getElementById('google-maps-script') && isOpen) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
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
    } else if (window.google && isOpen) {
      // If already loaded, just set the flag
      setMapScriptLoaded(true);
    }
  }, [isOpen]);
  
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
        
        // Create a new map
        const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
        mapRef.current = map;
        
        // Create a marker for the current position
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          draggable: true,
          title: "Your location"
        });
        markerRef.current = marker;
        
        // Add event listener for marker drag
        marker.addListener('dragend', () => {
          const newPos = marker.getPosition();
          if (newPos) {
            setPosition({
              lat: newPos.lat(),
              lng: newPos.lng()
            });
          }
        });
        
        // Add event listener for map click
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const clickPos = e.latLng;
            marker.setPosition(clickPos);
            setPosition({
              lat: clickPos.lat(),
              lng: clickPos.lng()
            });
          }
        });
        
        // Setup search box
        if (searchInputRef.current) {
          const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current);
          
          // Bias the SearchBox results towards current map's viewport
          map.addListener('bounds_changed', () => {
            searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
          });
          
          // Listen for the event fired when the user selects a prediction
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            
            if (!places || places.length === 0) {
              return;
            }
            
            // For each place, get the icon, name and location.
            const bounds = new window.google.maps.LatLngBounds();
            
            places.forEach((place) => {
              if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
              }
              
              // Update marker position
              marker.setPosition(place.geometry.location);
              setPosition({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              });
              
              if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(place.geometry.location);
              }
            });
            
            map.fitBounds(bounds);
          });
        }
        
      } catch (error) {
        console.error("Error initializing map:", error);
        toast.error("Failed to initialize map");
      }
    }
    
    // Cleanup function to remove map when dialog closes
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [isOpen, mapScriptLoaded, position]);

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
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
              <p className="text-gray-600 text-sm mb-2">
                Search for a location or click on the map to select a point
              </p>
              
              {/* Search box */}
              <div className="relative mb-4">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for restaurants, addresses, or places..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

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
              
              {/* Instructions */}
              <p className="text-gray-500 text-xs mt-2">
                Click on the map to select a location or drag the marker to adjust the position.
              </p>
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
