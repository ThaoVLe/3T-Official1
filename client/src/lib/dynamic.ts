import React from 'react';

// Simple replacement for next/dynamic for client-side only components
export default function dynamic<T>(importFunc: () => Promise<{ default: T }>, options?: { ssr: boolean }): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}