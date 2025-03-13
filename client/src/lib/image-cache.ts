// Simple in-memory cache for image URLs
class ImageCacheManager {
  private cache: Map<string, string> = new Map();
  private readonly maxSize: number = 100;

  constructor() {
    // Initialize the cache
    this.cache = new Map();
  }

  public get(key: string): string | undefined {
    return this.cache.get(key);
  }

  public set(key: string, value: string): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const ImageCache = new ImageCacheManager();

export function getCachedImage(src: string): string | undefined {
  return ImageCache.get(src);
}

export function setCachedImage(src: string, loadedSrc: string): void {
  ImageCache.set(src, loadedSrc);
}

export function preloadImage(src: string, maxSize: number = 500): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already cached
    if (ImageCache.get(src)) {
      resolve();
      return;
    }

    const img = new Image();

    // Optimize the image if it's not a video
    const isVideo = src.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
    const optimizedSrc = !isVideo ? `${src}?w=1200&maxSize=${maxSize}` : src;

    img.onload = () => {
      ImageCache.set(src, optimizedSrc);
      resolve();
    };
    img.onerror = reject;
    img.src = optimizedSrc;
  });
}

export function preloadImages(srcs: string[], maxSize: number = 500): Promise<void[]> {
  return Promise.all(srcs.map(src => preloadImage(src, maxSize)));
}

export function prefetchGalleryImages(srcs: string[]): void {
  requestIdleCallback(() => {
    // Use a lower quality for prefetching to save bandwidth
    srcs.forEach(src => {
      const isVideo = src.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
      if (!isVideo && !ImageCache.get(src)) {
        const prefetchSrc = `${src}?w=800&q=70`;
        const img = new Image();
        img.src = prefetchSrc;
      }
    });
  });
}

// Helper function for requestIdleCallback with fallback
const requestIdleCallback =
  (typeof window !== 'undefined' && 'requestIdleCallback' in window)
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(callback, 1);