
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    setOptions(options: MapOptions): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    panBy(x: number, y: number): void;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getDiv(): Element;
    getZoom(): number;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    [key: string]: any;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    toString(): string;
    toUrlValue(precision?: number): string;
    toJSON(): LatLngLiteral;
    equals(other: LatLng): boolean;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    contains(latLng: LatLng | LatLngLiteral): boolean;
    equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
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

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setTitle(title: string): void;
    setLabel(label: string | MarkerLabel): void;
    setIcon(icon: string | Icon | Symbol): void;
    setDraggable(draggable: boolean): void;
    setVisible(visible: boolean): void;
    setAnimation(animation: any): void;
    getMap(): Map | null;
    getPosition(): LatLng | null;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    draggable?: boolean;
    clickable?: boolean;
    animation?: any;
    visible?: boolean;
    zIndex?: number;
    [key: string]: any;
  }

  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }

  interface Icon {
    url: string;
    size?: Size;
    origin?: Point;
    anchor?: Point;
    scaledSize?: Size;
    [key: string]: any;
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
    constructor(path: string, opts?: SymbolOptions);
    [key: string]: any;
  }

  interface SymbolOptions {
    path: string;
    fillColor?: string;
    fillOpacity?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    [key: string]: any;
  }

  interface MapsEventListener {
    remove(): void;
  }

  class Geocoder {
    constructor();
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: string) => void): void;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    region?: string;
    [key: string]: any;
  }

  interface GeocoderComponentRestrictions {
    country: string | string[];
    [key: string]: any;
  }

  interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: GeocoderGeometry;
    place_id: string;
    types: string[];
    [key: string]: any;
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
    [key: string]: any;
  }

  interface GeocoderGeometry {
    location: LatLng;
    location_type: string;
    viewport: LatLngBounds;
    bounds?: LatLngBounds;
    [key: string]: any;
  }

  interface MapMouseEvent {
    latLng?: LatLng;
    [key: string]: any;
  }
}

export {};
