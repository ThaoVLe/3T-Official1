
// Simple replacement for next/dynamic for client-side only components
export default function dynamic(importFunc: () => Promise<any>, options?: { ssr: boolean }) {
  return React.lazy(importFunc);
}
