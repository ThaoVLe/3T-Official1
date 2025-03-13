import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  previewSize?: 'small' | 'medium' | 'large';
  priority?: boolean;
  maxSize?: number; // In KB, defaults to 500KB
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className = '', 
  sizes = '(max-width: 768px) 100vw, 50vw', 
  previewSize = 'medium',
  priority = false,
  maxSize = 500
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Check if this is a video to skip optimization for video files
  const isVideo = src.match(/\.(mp4|webm|mov|m4v|3gp|mkv)$/i);
  
  // Only optimize if it's not a video
  const shouldOptimize = !isVideo;
  
  // Get the exact width for preview based on previewSize
  const previewWidth = {
    small: 100,
    medium: 300,
    large: 600
  }[previewSize];
  
  // Generate optimized URLs
  const optimizedFullSrc = shouldOptimize ? `${src}?w=1200&maxSize=${maxSize}` : src;
  const placeholderUrl = shouldOptimize ? `${src}?w=${previewWidth}&q=30` : src;
  
  // Use intersection observer for lazy loading
  useEffect(() => {
    if (imageRef.current && !priority) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadImages();
          observer.disconnect();
        }
      }, {
        rootMargin: '200px', // Start loading 200px before it's visible
      });
      
      observer.observe(imageRef.current);
      return () => observer.disconnect();
    } else if (priority) {
      // If priority is true, load immediately without intersection observer
      loadImages();
    }
  }, [src]);
  
  // Function to handle image loading sequence
  const loadImages = () => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
    
    // If it's a video, just set it directly
    if (isVideo) {
      setCurrentSrc(src);
      setIsLoaded(true);
      return;
    }

    // Start with low quality placeholder
    const placeholderImage = new Image();
    placeholderImage.src = placeholderUrl;
    placeholderImage.onload = () => {
      setCurrentSrc(placeholderUrl);
    };
    placeholderImage.onerror = () => {
      setError(true);
    };

    // Load optimized high quality image
    const highQualityImage = new Image();
    highQualityImage.src = optimizedFullSrc;
    highQualityImage.onload = () => {
      // Check if component is still mounted
      if (imageRef.current) {
        setCurrentSrc(optimizedFullSrc);
        setIsLoaded(true);
        
        // Cache the image for future use
        if (typeof window !== 'undefined') {
          try {
            const { setCachedImage } = require('@/lib/image-cache');
            setCachedImage(src, optimizedFullSrc);
          } catch (e) {
            // Silently fail if image cache module is not available
          }
        }
      }
    };
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!isLoaded && !error && (
          <motion.div
            key="placeholder"
            className="absolute inset-0 bg-muted animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        
        {error && (
          <motion.div
            key="error"
            className="absolute inset-0 flex items-center justify-center bg-muted/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-sm text-muted-foreground">
              Failed to load image
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!error && (
        <motion.img
          ref={imageRef}
          src={currentSrc}
          alt={alt}
          className={`${className} ${!isLoaded ? 'blur-sm scale-105' : ''}`}
          style={{ 
            transition: 'filter 0.3s ease-out, transform 0.3s ease-out',
          }}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
