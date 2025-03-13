import { useCallback } from 'react';

// Simple in-memory cache
const imageCache: Map<string, HTMLImageElement> = new Map();

export function useImageCache() {
  const getFromCache = useCallback((src: string) => {
    return imageCache.get(src);
  }, []);

  const addToCache = useCallback((src: string, img: HTMLImageElement) => {
    if (!imageCache.has(src)) {
      imageCache.set(src, img);

      // Optional: Limit cache size
      if (imageCache.size > 100) {
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }
    }
  }, []);

  return { getFromCache, addToCache };
}

// Helper to preload images
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
  });
}

export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

export function prefetchGalleryImages(srcs: string[]): void {
  requestIdleCallback(() => {
    // Use a lower quality for prefetching to save bandwidth
    srcs.forEach(src => {
      if (!imageCache.has(src)) {
        const img = new Image();
        img.src = src;
      }
    });
  });
}

// Helper function for requestIdleCallback with fallback
const requestIdleCallback =
  (typeof window !== 'undefined' && 'requestIdleCallback' in window)
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(callback, 1);