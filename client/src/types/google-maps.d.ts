/* eslint-disable @typescript-eslint/no-explicit-any */
// This makes TypeScript recognize the global google object
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    setZoom(zoom: number): void;
    getZoom(): number;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng | null;
    setMap(map: Map | null): void;
    getMap(): Map | null;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    toString(): string;
    toUrlValue(precision?: number): string;
    toJSON(): LatLngLiteral;
  }

  class Geocoder {
    geocode(request: GeocoderRequest): Promise<GeocoderResponse>;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    region?: string;
  }

  interface GeocoderResponse {
    results: GeocoderResult[];
    status: GeocoderStatus;
  }

  interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: GeocoderGeometry;
    place_id: string;
    types: string[];
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface GeocoderGeometry {
    location: LatLng;
    location_type: GeocoderLocationType;
    viewport: LatLngBounds;
    bounds?: LatLngBounds;
  }

  enum GeocoderStatus {
    OK = "OK",
    ZERO_RESULTS = "ZERO_RESULTS",
    OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
    REQUEST_DENIED = "REQUEST_DENIED",
    INVALID_REQUEST = "INVALID_REQUEST",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
  }

  enum GeocoderLocationType {
    ROOFTOP = "ROOFTOP",
    RANGE_INTERPOLATED = "RANGE_INTERPOLATED",
    GEOMETRIC_CENTER = "GEOMETRIC_CENTER",
    APPROXIMATE = "APPROXIMATE"
  }

  interface GeocoderComponentRestrictions {
    country: string | string[];
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
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

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    disableDefaultUI?: boolean;
    disableDoubleClickZoom?: boolean;
    draggable?: boolean;
    fullscreenControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    zoomControl?: boolean;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    draggable?: boolean;
    animation?: Animation;
  }

  enum Animation {
    BOUNCE = 1,
    DROP = 2
  }

  interface Icon {
    url: string;
    anchor?: Point;
    labelOrigin?: Point;
    origin?: Point;
    scaledSize?: Size;
    size?: Size;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    equals(other: Point): boolean;
    toString(): string;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
    equals(other: Size): boolean;
    toString(): string;
  }

  class Symbol {
    constructor(opts: SymbolOptions);
  }

  interface SymbolOptions {
    path: SymbolPath | string;
    fillColor?: string;
    fillOpacity?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  enum SymbolPath {
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2
  }

  interface MapsEventListener {
    remove(): void;
  }

  namespace places {
    class SearchBox {
      constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions);
      getBounds(): LatLngBounds | undefined;
      getPlaces(): PlaceResult[];
      setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
    }

    interface SearchBoxOptions {
      bounds?: LatLngBounds | LatLngBoundsLiteral;
    }

    class PlacesService {
      constructor(attrContainer: HTMLDivElement | Map);
      findPlaceFromQuery(request: FindPlaceFromQueryRequest, callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void): void;
      getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void): void;
      nearbySearch(request: NearbySearchRequest, callback: (results: PlaceResult[] | null, status: PlacesServiceStatus, pagination: PlaceSearchPagination | null) => void): void;
      textSearch(request: TextSearchRequest, callback: (results: PlaceResult[] | null, status: PlacesServiceStatus, pagination: PlaceSearchPagination | null) => void): void;
    }

    interface FindPlaceFromQueryRequest {
      query: string;
      fields: string[];
      locationBias?: LocationBias;
    }

    interface PlaceDetailsRequest {
      placeId: string;
      fields?: string[];
      sessionToken?: AutocompleteSessionToken;
    }

    interface NearbySearchRequest {
      location: LatLng | LatLngLiteral;
      radius?: number;
      rankBy?: RankBy;
      keyword?: string;
      type?: string;
    }

    interface TextSearchRequest {
      query: string;
      location?: LatLng | LatLngLiteral;
      radius?: number;
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      type?: string;
    }

    enum RankBy {
      DISTANCE = 0,
      PROMINENCE = 1
    }

    enum PlacesServiceStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      INVALID_REQUEST = "INVALID_REQUEST",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
      NOT_FOUND = "NOT_FOUND"
    }

    type LocationBias = LatLng | LatLngLiteral | LatLngBounds | LatLngBoundsLiteral | Circle | CircleLiteral;

    interface PlaceSearchPagination {
      hasNextPage: boolean;
      nextPage(): void;
    }

    interface PlaceResult {
      formatted_address?: string;
      geometry?: PlaceGeometry;
      icon?: string;
      name?: string;
      place_id?: string;
      types?: string[];
      vicinity?: string;
    }

    interface PlaceGeometry {
      location: LatLng;
      viewport?: LatLngBounds;
    }

    class AutocompleteSessionToken {
      constructor();
    }

    interface Circle {
      center: LatLng | LatLngLiteral;
      radius: number;
    }

    interface CircleLiteral {
      center: LatLng | LatLngLiteral;
      radius: number;
    }
  }
}

declare global {
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
  }
}

export {};