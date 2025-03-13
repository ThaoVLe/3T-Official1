import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useImageCache } from '@/lib/image-cache';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loadingClassName?: string;
  width?: number | string;
  height?: number | string;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholder = '',
  loadingClassName = 'animate-pulse bg-muted',
  width,
  height,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { getFromCache, addToCache } = useImageCache();
  const cachedImage = src ? getFromCache(src) : null;

  // Check if it's a blob URL and make a direct image source
  const isBlob = src?.startsWith('blob:');
  const finalSrc = isBlob ? src : (src + (src.includes('?') ? '&' : '?') + 'q=80&maxSize=500');

  useEffect(() => {
    if (cachedImage) {
      setIsLoaded(true);
      return;
    }

    if (!src) {
      setError(true);
      return;
    }

    const img = new Image();
    img.src = finalSrc;

    img.onload = () => {
      setIsLoaded(true);
      setError(false);
      if (src) addToCache(src, img);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${finalSrc}`);
      setError(true);
      setIsLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, addToCache, finalSrc, cachedImage]);

  // If there's an error loading the image
  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted/50 rounded overflow-hidden", 
          className
        )}
        style={{width, height, minHeight: '80px'}}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{width, height}}>
      {!isLoaded && (
        <div
          className={cn("w-full h-full absolute inset-0", loadingClassName)}
          style={{
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{width, height}}
      />
    </div>
  );
}