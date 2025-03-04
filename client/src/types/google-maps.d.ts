
declare namespace google.maps {
  export class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
  }

  export interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    [key: string]: any;
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  export class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
  }

  export class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng;
    setMap(map: Map | null): void;
  }

  export interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    draggable?: boolean;
    [key: string]: any;
  }

  export class MapMouseEvent {
    latLng?: LatLng;
  }

  export class Geocoder {
    constructor();
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[], status: GeocoderStatus) => void
    ): void;
  }

  export interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
    [key: string]: any;
  }

  export interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
    [key: string]: any;
  }

  export type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
}
