
// Advanced image cache with size awareness
const MAX_CACHE_SIZE = 50; // Maximum number of images to keep in cache
const imageCache = new Map<string, string>();
const loadTimes = new Map<string, number>(); // Track when images were loaded

export function getCachedImage(src: string): string | undefined {
  const cached = imageCache.get(src);
  if (cached) {
    // Update timestamp when accessed (LRU strategy)
    loadTimes.set(src, Date.now());
  }
  return cached;
}

export function setCachedImage(src: string, loadedSrc: string): void {
  // If cache is full, remove least recently used item
  if (imageCache.size >= MAX_CACHE_SIZE) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    loadTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      imageCache.delete(oldestKey);
      loadTimes.delete(oldestKey);
    }
  }
  
  // Add to cache with current timestamp
  imageCache.set(src, loadedSrc);
  loadTimes.set(src, Date.now());
}

export function preloadImage(src: string, maxSize: number = 500): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already cached
    if (imageCache.has(src)) {
      resolve();
      return;
    }
    
    const img = new Image();
    
    // Optimize the image if it's not a video
    const isVideo = src.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
    const optimizedSrc = !isVideo ? `${src}?w=1200&maxSize=${maxSize}` : src;
    
    img.onload = () => {
      setCachedImage(src, optimizedSrc);
      resolve();
    };
    img.onerror = reject;
    img.src = optimizedSrc;
  });
}

export function preloadImages(srcs: string[], maxSize: number = 500): Promise<void[]> {
  return Promise.all(srcs.map(src => preloadImage(src, maxSize)));
}

// Prefetch images that might be needed soon
export function prefetchGalleryImages(srcs: string[]): void {
  requestIdleCallback(() => {
    // Use a lower quality for prefetching to save bandwidth
    srcs.forEach(src => {
      const isVideo = src.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
      if (!isVideo && !imageCache.has(src)) {
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
