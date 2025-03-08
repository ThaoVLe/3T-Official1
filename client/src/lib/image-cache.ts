// Simple in-memory cache for loaded images
const imageCache = new Map<string, string>();

export function getCachedImage(src: string): string | undefined {
  return imageCache.get(src);
}

export function setCachedImage(src: string, loadedSrc: string): void {
  imageCache.set(src, loadedSrc);
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      setCachedImage(src, src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}
