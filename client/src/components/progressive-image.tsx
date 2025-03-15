
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressiveImageProps {
  src?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProgressiveImage({
  src,
  alt = '',
  className,
  sizes,
  priority = false,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Early return if no src
  if (!src) {
    return (
      <div className={cn("relative bg-muted", className)}>
        <Skeleton className="w-full h-full absolute inset-0" />
      </div>
    );
  }

  // Check if it's a blob URL
  const isBlob = src.startsWith('blob:');

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    
    // Create a new image element
    const img = new Image();
    
    // Set up load handlers
    img.onload = () => {
      setIsLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setError(true);
      setIsLoaded(false);
    };

    // Set the src - for blob URLs use directly, for others add quality
    img.src = isBlob ? src : `${src}${src.includes('?') ? '&' : '?'}q=85`;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isBlob]);

  useEffect(() => {
    return () => {
      if (src?.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  if (error || !src || (src.startsWith('blob:') && !isLoaded)) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      {!isLoaded && !priority && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      <img
        src={isBlob ? src : `${src}${src.includes('?') ? '&' : '?'}q=85`}
        alt={alt}
        sizes={sizes}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          "max-h-[600px] mx-auto", // Limit height for desktop view
          className
        )}
        loading={priority ? "eager" : "lazy"}
        onError={(e) => {
          console.error(`Error loading image: ${src}`);
          setError(true);
        }}
      />
    </div>
  );
}
