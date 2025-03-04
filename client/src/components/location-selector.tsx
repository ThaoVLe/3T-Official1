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
  onLocationSelect: (location: Location) => void;
  defaultLocation?: Location;
}

export function LocationSelector({ onLocationSelect, defaultLocation }: LocationSelectorProps) {
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<Location | null>(defaultLocation || null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`; // Replace YOUR_API_KEY with your actual key.  This removes reliance on process.env
      script.async = true;
      script.defer = true;
      script.onload = () => console.log('Google Maps script loaded');
      document.head.appendChild(script);
    }
  }, []);

  // Function to initialize the map
  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current || !window.google?.maps) return;

    // Default to a central location if none provided
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

    // Update location on marker drag
    if (markerRef.current) {
      markerRef.current.addListener('dragend', () => {
        if (markerRef.current && markerRef.current.getPosition()) {
          const position = markerRef.current.getPosition() as google.maps.LatLng;

          // Reverse geocode to get address for the new position
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
  };

  // Initialize the map when it becomes visible
  useEffect(() => {
    if (showMap) {
      setTimeout(initMap, 100); // Short delay to ensure DOM is ready
    }
  }, [showMap]);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  };

  const updateLocationFromLatLng = async (lat: number, lng: number) => {
    const newLocation: Location = { lat, lng };

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results && result.results.length > 0) {
        const addressComponents = result.results[0];
        newLocation.address = addressComponents.formatted_address;
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }

    setLocation(newLocation);
  };

  const updateLocationFromPlace = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const newLocation: Location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
        name: place.name
      };
      setLocation(newLocation);
    }
  };

  const handleSearch = () => {
    if (!placesServiceRef.current || !searchQuery) return;

    setLoading(true);

    const request = {
      query: searchQuery,
      fields: ['name', 'geometry', 'formatted_address']
    };

    placesServiceRef.current.textSearch({ query: searchQuery }, (results, status) => {
      setLoading(false);

      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results);

        if (results.length > 0 && results[0].geometry?.location) {
          const location = results[0].geometry.location;
          mapInstanceRef.current?.setCenter(location);
          markerRef.current?.setPosition(location);

          setLocation({
            lat: location.lat(),
            lng: location.lng(),
            address: results[0].formatted_address,
            name: results[0].name
          });
        }
      }
    });
  };

  const handleSelectLocation = () => {
    if (location) {
      onLocationSelect(location);
      setShowMap(false);
    }
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setShowMap(true)}
        className="flex items-center gap-2"
      >
        <MapPin className="h-4 w-4" />
        {location ? (location.name || location.address || 'Selected location') : 'Select location'}
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