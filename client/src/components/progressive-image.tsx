
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useImageCache } from '@/lib/image-cache';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loadingClassName?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholder = '',
  loadingClassName = 'animate-pulse bg-muted',
  sizes = '100vw',
  width,
  height,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { getFromCache, addToCache } = useImageCache();
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Determine if it's a blob URL
  const isBlob = src?.startsWith('blob:');
  
  // Only use cache for non-blob URLs
  const cachedImage = !isBlob && src ? getFromCache(src) : null;
  
  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    
    if (cachedImage) {
      setIsLoaded(true);
      return;
    }

    if (!src) {
      setError(true);
      return;
    }

    // Don't create a new Image() if we're already using an img element
    if (imgRef.current) {
      // Let the img element handle loading directly
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      // Only cache non-blob images
      if (src && !isBlob) {
        addToCache(src, img);
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setError(true);
    };

    // Simple URL handling - don't modify blob URLs at all
    img.src = isBlob ? src : `${src}${src.includes('?') ? '&' : '?'}q=85`;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, addToCache, cachedImage, isBlob]);

  // If there's an error loading the image
  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted/50 rounded overflow-hidden", 
          className
        )}
        style={{width, height}}
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
            backgroundPosition: 'center',
          }}
        />
      )}
      <img
        ref={imgRef}
        src={src} // Use the original src without modification
        alt={alt}
        sizes={sizes}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{width, height}}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
