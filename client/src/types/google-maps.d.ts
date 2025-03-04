
// Type definitions for Google Maps
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      addListener(eventName: string, handler: Function): MapsEventListener;
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getCenter(): LatLng;
      getZoom(): number;
      getBounds(): LatLngBounds | undefined;
      fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: Function): MapsEventListener;
      getPosition(): LatLng | null;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
      setTitle(title: string): void;
      setDraggable(draggable: boolean): void;
    }

    class Geocoder {
      constructor();
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      draggable?: boolean;
      scrollwheel?: boolean;
      disableDoubleClickZoom?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      draggable?: boolean;
      animation?: Animation;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      bounds?: LatLngBounds;
      componentRestrictions?: GeocoderComponentRestrictions;
      region?: string;
    }

    interface GeocoderResult {
      types: string[];
      formatted_address: string;
      address_components: GeocoderAddressComponent[];
      geometry: GeocoderGeometry;
      partial_match: boolean;
      place_id: string;
    }

    interface GeocoderAddressComponent {
      short_name: string;
      long_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    }

    type GeocoderLocationType = 'APPROXIMATE' | 'GEOMETRIC_CENTER' | 'RANGE_INTERPOLATED' | 'ROOFTOP';

    type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';

    interface GeocoderComponentRestrictions {
      route?: string;
      locality?: string;
      administrativeArea?: string;
      postalCode?: string;
      country?: string;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): LatLngLiteral;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBounds {
      contains(latLng: LatLng | LatLngLiteral): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface Padding {
      bottom: number;
      left: number;
      right: number;
      top: number;
    }

    interface MapsEventListener {
      remove(): void;
    }

    type MapMouseEvent = {
      latLng?: LatLng;
    };

    interface Icon {
      url: string;
      scaledSize?: Size;
      size?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface Size {
      width: number;
      height: number;
    }

    interface Point {
      x: number;
      y: number;
    }

    enum Animation {
      BOUNCE,
      DROP,
    }

    namespace places {
      class SearchBox {
        constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions);
        getBounds(): LatLngBounds | undefined;
        getPlaces(): PlaceResult[] | undefined;
        setBounds(bounds: LatLngBounds): void;
        addListener(eventName: string, handler: Function): MapsEventListener;
      }

      interface SearchBoxOptions {
        bounds?: LatLngBounds;
      }

      interface PlaceResult {
        address_components?: GeocoderAddressComponent[];
        formatted_address?: string;
        geometry?: {
          location: LatLng;
          viewport?: LatLngBounds;
        };
        icon?: string;
        name?: string;
        place_id?: string;
        types?: string[];
        vicinity?: string;
      }
    }
  }
}
