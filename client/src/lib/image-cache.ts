
const imageCache = new Map<string, HTMLImageElement>();

export function useImageCache() {
  const getFromCache = (src: string) => {
    return imageCache.get(src);
  };

  const addToCache = (src: string, img: HTMLImageElement) => {
    if (!imageCache.has(src)) {
      imageCache.set(src, img);
    }
  };

  return { getFromCache, addToCache };
}

// Helper function to check if a URL is a blob URL
export const isBlobUrl = (url: string | undefined): boolean => {
  return !!url && url.startsWith('blob:');
};

// Helper function to safely handle image URLs
export const safeImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  // Don't modify blob URLs
  if (isBlobUrl(url)) return url;
  // Add quality parameter to non-blob URLs
  return `${url}${url.includes('?') ? '&' : '?'}q=85`;
};

// Helper to preload images
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = safeImageUrl(src);

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
        img.src = safeImageUrl(src);
      }
    });
  }, 500);
}
