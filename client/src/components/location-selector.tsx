import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from './ui/dialog';
import { Input } from './ui/input';
import { Loader2, MapPin, Search } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

interface LocationSelectorProps {
  onSelect: (location: Location | null) => void;
  selectedLocation: Location | null;
  triggerClassName?: string;
  triggerContent?: React.ReactNode;
}

export function LocationSelector({ onSelect, selectedLocation, triggerClassName, triggerContent }: LocationSelectorProps) {
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);


  // Function to hide keyboard on mobile devices
  const hideKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'absolute';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.fontSize = '16px';
    document.body.appendChild(temporaryInput);
    temporaryInput.focus();
    temporaryInput.blur();
    document.body.removeChild(temporaryInput);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google?.maps) {
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = () => {
        console.log('Google Maps initialized');
        if (showMap && mapRef.current && !mapInstanceRef.current) {
          initMap();
        }
      };
      script.onload = () => console.log('Google Maps script loaded');
      document.head.appendChild(script);
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      setMapError("Google Maps API not loaded yet");
      return;
    }

    if (mapInstanceRef.current) return; // Map already initialized

    try {
      setMapError(null);
      setLoading(true);
      const initialPosition = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

      const mapOptions: google.maps.MapOptions = {
        center: initialPosition,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Initialize marker
      markerRef.current = new google.maps.Marker({
        map,
        position: initialPosition,
        draggable: true,
      });

      // Initialize PlacesService
      placesServiceRef.current = new google.maps.places.PlacesService(map);

      // Set up search box (rest of search functionality remains from original)
      const input = document.getElementById('map-search-input') as HTMLInputElement;
      if (input && window.google.maps.places) {
        searchBoxRef.current = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        map.addListener('bounds_changed', () => {
          if (searchBoxRef.current) {
            searchBoxRef.current.setBounds(map.getBounds() as google.maps.LatLngBounds);
          }
        });

        searchBoxRef.current.addListener('places_changed', () => {
          if (!searchBoxRef.current) return;
          const places = searchBoxRef.current.getPlaces();
          if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry && place.geometry.location) {
              map.setCenter(place.geometry.location);
              if (markerRef.current) {
                markerRef.current.setPosition(place.geometry.location);
              }
              handlePlaceSelected(place);
            }
          }
        });
      }

      // Update location on marker drag
      if (markerRef.current) {
        markerRef.current.addListener('dragend', () => {
          if (markerRef.current && markerRef.current.getPosition()) {
            const position = markerRef.current.getPosition() as google.maps.LatLng;
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: position }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                setLocation({
                  lat: position.lat(),
                  lng: position.lng(),
                  address: results[0].formatted_address,
                });
              } else {
                setLocation({
                  lat: position.lat(),
                  lng: position.lng(),
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize Google Maps");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showMap) {
      setTimeout(initMap, 100); // Short delay to ensure DOM is ready
    }
  }, [showMap]);

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    setLocation({
      lat: place.geometry!.location!.lat(),
      lng: place.geometry!.location!.lng(),
      address: place.formatted_address,
      name: place.name
    });
  };


  const handleSelectLocation = () => {
    onSelect(location);
    setShowMap(false);
  };

  const [location, setLocation] = useState<Location | null>(selectedLocation || null);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setShowMap(true);
          hideKeyboard();
        }}
        className={triggerClassName || "h-10 px-3 rounded-full flex items-center gap-2"}
      >
        {triggerContent || (
          <>
            <MapPin className="h-4 w-4" />
            {selectedLocation ? (selectedLocation.name || selectedLocation.address || 'Selected location') : 'Add location'}
          </>
        )}
      </Button>

      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-4">
            <Input
              id="map-search-input"
              placeholder="Search for a location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={handleSearch} variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : mapError ? (
            <div className="h-[400px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-md border p-4">
              <div className="bg-gray-200 rounded-full p-3 mb-4">
                {/* AlertCircle component is missing, replace with appropriate icon */}
              </div>
              <h3 className="text-lg font-medium mb-2">Oops! Something went wrong.</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {mapError || "This page didn't load Google Maps correctly. See the JavaScript console for technical details."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setMapError(null);
                  setTimeout(initMap, 100);
                }}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div
              ref={mapRef}
              className="h-[400px] w-full rounded-md border"
            ></div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMap(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSelectLocation}
              disabled={!location}
            >
              Confirm Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);

    if (!window.google?.maps || !placesServiceRef.current) {
      console.error("Google Maps Places service is not available");
      setLoading(false);
      return;
    }

    placesServiceRef.current.findPlaceFromQuery({
      query: searchQuery,
      fields: ['name', 'geometry', 'formatted_address', 'place_id']
    }, (results, status) => {
      setLoading(false);

      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const place = results[0];
        const location = place.geometry?.location;

        if (location) {
          mapInstanceRef.current?.setCenter(location);
          mapInstanceRef.current?.setZoom(15);
          markerRef.current?.setPosition(location);

          setLocation({
            lat: location.lat(),
            lng: location.lng(),
            address: place.formatted_address || '',
            name: place.name || ''
          });
        }
      } else {
        console.error("Place search failed with status:", status);
      }
    });
  };