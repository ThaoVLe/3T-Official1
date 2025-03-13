import { useCallback } from 'react';

// Simple in-memory cache for images
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

  return { addToCache, getFromCache, clearCache };
}

// Helper to preload images
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Skip preloading if source is empty or blob URL
    if (!src || src.startsWith('blob:')) {
      const mockImg = new Image();
      resolve(mockImg);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
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
  return Promise.all(srcs.filter(Boolean).map(src => preloadImage(src)));
}

// Simple prefetch function for gallery images
export function prefetchGalleryImages(srcs: string[]): void {
  const validSrcs = srcs.filter(src => src && !src.startsWith('blob:'));

  setTimeout(() => {
    validSrcs.forEach(src => {
      if (!imageCache.has(src)) {
        const img = new Image();
        img.src = src;
      }
    });
  }, 500);
}