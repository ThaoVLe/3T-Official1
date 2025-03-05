
// Simple replacement for next/dynamic for client-side only components
import * as React from "react";

export default function dynamic(importFunc: () => Promise<any>, options?: { ssr: boolean }) {
  return React.lazy(importFunc);
}
