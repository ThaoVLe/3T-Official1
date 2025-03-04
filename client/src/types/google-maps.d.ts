
// Google Maps type definitions
declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      getBounds(): LatLngBounds;
      fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
      toJSON(): LatLngLiteral;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      isEmpty(): boolean;
      union(other: LatLngBounds): LatLngBounds;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | null;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setVisible(visible: boolean): void;
      setAnimation(animation: Animation | null): void;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    class MapsEventListener {
      remove(): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      minZoom?: number;
      maxZoom?: number;
      disableDefaultUI?: boolean;
      draggable?: boolean;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      scrollwheel?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      fullscreenControl?: boolean;
      gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
      styles?: MapTypeStyle[];
      mapId?: string;
    }

    type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers: any[];
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface Padding {
      top: number;
      right: number;
      bottom: number;
      left: number;
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

    enum Animation {
      BOUNCE = 1,
      DROP = 2
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
      labelOrigin?: Point;
    }

    interface Symbol {
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

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      width: number;
      height: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    // Places API
    namespace places {
      class SearchBox {
        constructor(input: HTMLInputElement, options?: SearchBoxOptions);
        getBounds(): LatLngBounds;
        getPlaces(): PlaceResult[];
        setBounds(bounds: LatLngBounds): void;
        addListener(eventName: string, handler: Function): MapsEventListener;
      }

      interface SearchBoxOptions {
        bounds?: LatLngBounds;
      }

      interface PlaceResult {
        address_components?: GeocoderAddressComponent[];
        adr_address?: string;
        business_status?: string;
        formatted_address?: string;
        geometry?: {
          location: LatLng;
          viewport?: LatLngBounds;
        };
        icon?: string;
        name?: string;
        photos?: PlacePhoto[];
        place_id?: string;
        plus_code?: PlusCode;
        price_level?: number;
        rating?: number;
        types?: string[];
        user_ratings_total?: number;
        vicinity?: string;
      }

      interface PlacePhoto {
        height: number;
        width: number;
        html_attributions: string[];
        getUrl(opts: PhotoOptions): string;
      }

      interface PhotoOptions {
        maxWidth?: number;
        maxHeight?: number;
      }

      interface PlusCode {
        compound_code: string;
        global_code: string;
      }
    }
  }
}
