
// Global interface extensions
interface Window {
  google: typeof google;
  initMap: () => void; // Required for Google Maps callback
}

// Allow importing env variables with typechecking
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
