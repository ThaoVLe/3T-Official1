
declare namespace L {
  function map(element: HTMLElement | string): L.Map;
  function tileLayer(urlTemplate: string, options?: any): L.TileLayer;
  function marker(latlng: L.LatLngExpression, options?: any): L.Marker;
  
  interface Map {
    setView(center: L.LatLngExpression, zoom: number): this;
    on(type: string, fn: any): this;
    remove(): void;
  }
  
  interface TileLayer {
    addTo(map: L.Map): this;
  }
  
  interface Marker {
    addTo(map: L.Map): this;
    bindPopup(content: string): this;
    openPopup(): this;
    setLatLng(latlng: L.LatLngExpression): this;
    getLatLng(): { lat: number; lng: number };
    on(type: string, fn: any): this;
  }
  
  type LatLngExpression = [number, number] | { lat: number; lng: number };
}
