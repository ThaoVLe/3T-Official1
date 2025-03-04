
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@radix-ui/react-dialog";
import { MapIcon } from "lucide-react";
import { toast } from "sonner";

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
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = "AIzaSyBjXpXoG-mO_ewJ2He0jK-y0FUcJSOW-ic"; // Replace with your Google Maps API key
    
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps script loaded");
        setMapScriptLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapScriptLoaded(true);
    }
    
    return () => {
      // Cleanup code if needed
    };
  }, []);

  // Initialize map when dialog opens and script is loaded
  useEffect(() => {
    if (!isOpen || !mapScriptLoaded || !mapContainerRef.current) return;
    
    // Default position (can be overridden by geolocation)
    const defaultPosition = { lat: 40.7128, lng: -74.0060 }; // New York
    
    // Initialize the map
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: position || defaultPosition,
      zoom: 14,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      gestureHandling: "greedy",
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });
    
    mapRef.current = map;
    
    // Create a marker
    const marker = new window.google.maps.Marker({
      position: position || defaultPosition,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });
    
    markerRef.current = marker;
    
    // Handle marker drag end
    marker.addListener("dragend", () => {
      const newPosition = marker.getPosition();
      if (newPosition) {
        setPosition({
          lat: newPosition.lat(),
          lng: newPosition.lng()
        });
      }
    });
    
    // Handle map click to reposition marker
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && markerRef.current) {
        const newPosition = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        markerRef.current.setPosition(newPosition);
        setPosition(newPosition);
      }
    });
    
    // Initialize search box
    if (searchInputRef.current) {
      const searchBox = new google.maps.places.SearchBox(searchInputRef.current);
      searchBoxRef.current = searchBox;
      
      // Bias the SearchBox results towards current map's viewport
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
      });
      
      // Listen for the event fired when the user selects a prediction
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        
        if (!places || places.length === 0) {
          return;
        }
        
        // For each place, get the location and update the marker and map
        const bounds = new google.maps.LatLngBounds();
        
        places.forEach(place => {
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }
          
          const newPosition = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Update marker position
          if (markerRef.current) {
            markerRef.current.setPosition(newPosition);
          }
          
          // Update position state
          setPosition(newPosition);
          
          // Zoom to the selected location
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        
        map.fitBounds(bounds);
      });
    }
    
  }, [isOpen, mapScriptLoaded, position]);

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
          
          // Update map and marker if they exist
          if (mapRef.current && markerRef.current) {
            mapRef.current.setCenter(newPosition);
            markerRef.current.setPosition(newPosition);
          }
          
          setIsLoading(false);
          console.log("Got position:", newPosition);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get your location. Please try again or select manually.");
          // Default to a fallback position
          setPosition({ lat: 40.7128, lng: -74.0060 });
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
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

      <Dialog.Root open={isOpen} onOpenChange={handleCloseDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-md bg-white rounded-lg p-6 shadow-lg">
            <Dialog.Title className="font-medium text-lg mb-4">
              Select Location
            </Dialog.Title>

            <div className="space-y-4">
              {/* Search input styled like Google Maps */}
              <div className="relative shadow-md rounded-full bg-white">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <MapIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search here"
                  className="w-full pl-10 pr-4 py-3 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Map container */}
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
              
              {/* Location categories */}
              <div className="flex overflow-x-auto space-x-2 py-2">
                <Button variant="outline" className="whitespace-nowrap">
                  <span className="mr-1">🍽️</span> Restaurants
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  <span className="mr-1">🛍️</span> Shopping
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  <span className="mr-1">🛒</span> Groceries
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  <span className="mr-1">⛽</span> Gas
                </Button>
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
