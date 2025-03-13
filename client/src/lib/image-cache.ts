import { useState, useCallback, useEffect } from 'react';

// In-memory cache for images
const imageCache = new Map<string, HTMLImageElement>();

export function useImageCache() {
  // Add a new image to the cache
  const addToCache = useCallback((src: string, img: HTMLImageElement) => {
    if (!imageCache.has(src)) {
      imageCache.set(src, img);
    }
  }, []);

  // Get an image from the cache
  const getFromCache = useCallback((src: string) => {
    return imageCache.get(src);
  }, []);

  // Clear the cache
  const clearCache = useCallback(() => {
    imageCache.clear();
  }, []);

  // Handle cache cleanup on component unmount
  useEffect(() => {
    // Limit cache size to prevent memory issues
    const cleanupCache = () => {
      if (imageCache.size > 100) {
        // Remove oldest entries when cache gets too large
        const keysToDelete = Array.from(imageCache.keys()).slice(0, 20);
        keysToDelete.forEach(key => imageCache.delete(key));
      }
    };

    // Run cleanup every 5 minutes
    const interval = setInterval(cleanupCache, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { addToCache, getFromCache, clearCache };
}

// Helper to preload images
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const cachedImage = imageCache.get(src);
    if (cachedImage) {
      resolve(cachedImage);
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